-- =============================================
-- Migration: Ajout des modèles LLM et type fonctionnel
-- =============================================

-- 1. Modifier la contrainte du champ model pour supporter tous les modèles
ALTER TABLE public.agents
DROP CONSTRAINT IF EXISTS agents_model_check;

ALTER TABLE public.agents
ADD CONSTRAINT agents_model_check
CHECK (model IN (
  'haiku',           -- Claude Haiku (rapide et économique)
  'gpt-4o-mini',     -- GPT-4o Mini (rapide et économique)
  'gpt-4o',          -- GPT-4o (performant)
  'sonnet',          -- Claude Sonnet (équilibré)
  'opus',            -- Claude Opus (ultra-premium)
  'claude',          -- Legacy support
  'gpt'              -- Legacy support
));

-- 2. Ajouter un nouveau champ pour le type fonctionnel de l'agent
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS functional_type TEXT DEFAULT 'general'
CHECK (functional_type IN ('creative', 'analytical', 'support', 'code', 'general'));

-- 4. Ajouter des colonnes pour le tracking d'usage
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS total_conversations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost_usd DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- 5. Créer un index pour les requêtes d'optimisation
CREATE INDEX IF NOT EXISTS idx_agents_functional_type ON public.agents(functional_type);
CREATE INDEX IF NOT EXISTS idx_agents_total_cost ON public.agents(total_cost_usd DESC);
CREATE INDEX IF NOT EXISTS idx_agents_last_used ON public.agents(last_used_at DESC);

-- 6. Créer une fonction pour mettre à jour les stats d'un agent
CREATE OR REPLACE FUNCTION public.update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un nouveau message assistant avec des tokens
  IF NEW.role = 'assistant' AND NEW.tokens_used IS NOT NULL THEN
    -- Récupérer l'agent_id depuis la conversation
    UPDATE public.agents a
    SET
      total_conversations = CASE
        WHEN NOT EXISTS (
          SELECT 1 FROM public.messages m2
          WHERE m2.conversation_id = NEW.conversation_id
          AND m2.role = 'assistant'
          AND m2.id != NEW.id
        ) THEN a.total_conversations + 1
        ELSE a.total_conversations
      END,
      total_tokens_used = a.total_tokens_used + NEW.tokens_used,
      total_cost_usd = a.total_cost_usd + COALESCE(
        CASE
          WHEN a.model = 'gpt-4o' THEN NEW.tokens_used * 0.000032
          WHEN a.model = 'gpt-4o-mini' THEN NEW.tokens_used * 0.000002
          WHEN a.model = 'haiku' THEN NEW.tokens_used * 0.000004
          WHEN a.model = 'sonnet' THEN NEW.tokens_used * 0.000048
          WHEN a.model = 'opus' THEN NEW.tokens_used * 0.000075
          WHEN a.model = 'claude' THEN NEW.tokens_used * 0.000004  -- Assume Haiku for legacy
          WHEN a.model = 'gpt' THEN NEW.tokens_used * 0.000002     -- Assume Mini for legacy
          ELSE 0
        END,
        0
      ),
      last_used_at = NEW.created_at
    FROM public.conversations c
    WHERE c.id = NEW.conversation_id
    AND a.id = c.agent_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer un trigger pour auto-update des stats
DROP TRIGGER IF EXISTS update_agent_stats_trigger ON public.messages;
CREATE TRIGGER update_agent_stats_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_stats();

-- 8. Ne PAS migrer automatiquement les modèles legacy
-- Les utilisateurs pourront choisir manuellement via le modal d'optimisation
-- UPDATE public.agents
-- SET model = CASE
--   WHEN model = 'claude' THEN 'haiku'
--   WHEN model = 'gpt' THEN 'gpt-4o-mini'
--   ELSE model
-- END
-- WHERE model IN ('claude', 'gpt');

-- 9. Créer une vue pour les recommandations d'optimisation
CREATE OR REPLACE VIEW public.agent_optimization_recommendations AS
SELECT
  a.id,
  a.user_id,
  a.name,
  a.functional_type,
  a.model as current_model,
  a.total_conversations,
  a.total_cost_usd,
  CASE
    WHEN a.total_conversations > 0
    THEN ROUND(a.total_cost_usd / a.total_conversations, 4)
    ELSE 0
  END as avg_cost_per_conversation,

  -- Recommandation de modèle
  CASE
    -- Support avec modèle cher → recommander Mini
    WHEN a.functional_type = 'support' AND a.model IN ('gpt-4o', 'sonnet', 'opus')
      THEN 'gpt-4o-mini'

    -- Créatif avec modèle trop cheap → suggérer upgrade
    WHEN a.functional_type = 'creative' AND a.model IN ('haiku', 'gpt-4o-mini')
      THEN 'gpt-4o'

    -- Analytique sans Opus → suggérer Opus
    WHEN a.functional_type = 'analytical' AND a.model NOT IN ('opus', 'gpt-4o')
      THEN 'opus'

    -- Code sans GPT-4o → suggérer GPT-4o
    WHEN a.functional_type = 'code' AND a.model NOT IN ('gpt-4o')
      THEN 'gpt-4o'

    ELSE NULL
  END as recommended_model,

  -- Économie potentielle
  CASE
    WHEN a.functional_type = 'support' AND a.model = 'gpt-4o'
      THEN ROUND(a.total_cost_usd * 0.70, 2) -- 70% économie
    WHEN a.functional_type = 'support' AND a.model = 'sonnet'
      THEN ROUND(a.total_cost_usd * 0.50, 2)
    ELSE 0
  END as potential_monthly_savings,

  -- Niveau de priorité
  CASE
    WHEN a.total_cost_usd > 30 AND a.functional_type = 'support'
      THEN 'high'
    WHEN a.total_cost_usd > 20 AND a.functional_type IN ('support', 'general')
      THEN 'medium'
    ELSE 'low'
  END as optimization_priority

FROM public.agents a
WHERE a.is_active = true;

COMMENT ON VIEW public.agent_optimization_recommendations IS
'Vue pour les recommandations d''optimisation des modèles par agent';

-- 10. Créer une fonction pour calculer le budget mensuel utilisé
CREATE OR REPLACE FUNCTION public.get_user_monthly_budget(p_user_id UUID)
RETURNS TABLE (
  total_cost_usd DECIMAL(10,4),
  total_tokens BIGINT,
  total_conversations INTEGER,
  budget_limit_usd DECIMAL(10,2),
  budget_used_percent DECIMAL(5,2)
) AS $$
DECLARE
  v_tier TEXT;
  v_budget_limit DECIMAL(10,2);
BEGIN
  -- Récupérer le tier de l'utilisateur
  SELECT subscription_tier INTO v_tier
  FROM public.users
  WHERE id = p_user_id;

  -- Déterminer le budget selon le tier
  v_budget_limit := CASE
    WHEN v_tier = 'free' THEN 0
    WHEN v_tier = 'pro' THEN 10.50  -- 10€ ~= $10.50
    WHEN v_tier = 'enterprise' THEN 31.50  -- 30€ ~= $31.50
    ELSE 0
  END;

  RETURN QUERY
  SELECT
    COALESCE(SUM(a.total_cost_usd), 0)::DECIMAL(10,4) as total_cost_usd,
    COALESCE(SUM(a.total_tokens_used), 0)::BIGINT as total_tokens,
    COALESCE(SUM(a.total_conversations), 0)::INTEGER as total_conversations,
    v_budget_limit as budget_limit_usd,
    CASE
      WHEN v_budget_limit > 0
      THEN ROUND((COALESCE(SUM(a.total_cost_usd), 0) / v_budget_limit * 100), 2)
      ELSE 0
    END::DECIMAL(5,2) as budget_used_percent
  FROM public.agents a
  WHERE a.user_id = p_user_id
  AND a.is_active = true
  AND a.last_used_at >= date_trunc('month', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_user_monthly_budget IS
'Calcule le budget mensuel utilisé par un utilisateur';
