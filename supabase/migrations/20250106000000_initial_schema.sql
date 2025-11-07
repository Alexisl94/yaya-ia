-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SECTORS TABLE (secteurs d'activité)
-- =============================================
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Nom de l'icône lucide-react
  color TEXT DEFAULT '#6366f1', -- Couleur hex pour l'UI
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- AGENT TEMPLATES (templates pré-configurés)
-- =============================================
CREATE TABLE IF NOT EXISTS public.agent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  suggested_tasks TEXT[], -- Array de tâches suggérées
  default_model TEXT NOT NULL DEFAULT 'claude' CHECK (default_model IN ('claude', 'gpt')),
  icon TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  required_tier TEXT NOT NULL DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sector_id, name)
);

-- =============================================
-- AGENTS TABLE (agents IA créés par les users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE RESTRICT,
  template_id UUID REFERENCES public.agent_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'claude' CHECK (model IN ('claude', 'gpt')),
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}', -- Paramètres additionnels (ex: tone, style, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_sector_id ON public.agents(sector_id);
CREATE INDEX idx_agents_is_active ON public.agents(is_active);

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT, -- Résumé auto-généré de la conversation
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  metadata JSONB DEFAULT '{}', -- Données additionnelles (ex: tags, priority, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at DESC);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model_used TEXT, -- Modèle utilisé pour cette réponse (si assistant)
  tokens_used INTEGER, -- Nombre de tokens consommés
  latency_ms INTEGER, -- Latence de la réponse en ms
  metadata JSONB DEFAULT '{}', -- Données additionnelles (ex: sources, citations, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_role ON public.messages(role);

-- =============================================
-- USAGE LOGS TABLE (pour tracking et billing)
-- =============================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('message', 'agent_created', 'conversation_started')),
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6), -- Coût en USD
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour analytics et billing
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_event_type ON public.usage_logs(event_type);

-- =============================================
-- AGENT SUGGESTIONS TABLE (suggestions d'agents)
-- =============================================
CREATE TABLE IF NOT EXISTS public.agent_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('template', 'custom', 'ai_generated')),
  name TEXT NOT NULL,
  description TEXT,
  reason TEXT, -- Raison de la suggestion
  system_prompt TEXT,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_agent_suggestions_user_id ON public.agent_suggestions(user_id);
CREATE INDEX idx_agent_suggestions_is_dismissed ON public.agent_suggestions(is_dismissed);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_suggestions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Agents policies
CREATE POLICY "Users can view own agents"
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON public.agents FOR DELETE
  USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Usage logs policies
CREATE POLICY "Users can view own usage logs"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Agent suggestions policies
CREATE POLICY "Users can view own suggestions"
  ON public.agent_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON public.agent_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.sectors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agent_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED DATA (secteurs de base)
-- =============================================

INSERT INTO public.sectors (name, slug, description, icon, color) VALUES
  ('Événementiel', 'evenementiel', 'Gestion d''événements, mariages, conférences', 'Calendar', '#ec4899'),
  ('Immobilier', 'immobilier', 'Gestion immobilière, ventes, locations', 'Home', '#3b82f6'),
  ('Comptabilité', 'comptabilite', 'Comptabilité, fiscalité, finances', 'Calculator', '#10b981'),
  ('Marketing', 'marketing', 'Marketing digital, communication, branding', 'TrendingUp', '#f59e0b'),
  ('Juridique', 'juridique', 'Services juridiques, contrats, conseil', 'Scale', '#6366f1'),
  ('Ressources Humaines', 'rh', 'Recrutement, formation, gestion RH', 'Users', '#8b5cf6'),
  ('Santé & Bien-être', 'sante', 'Services de santé, coaching, thérapie', 'Heart', '#ef4444'),
  ('Éducation', 'education', 'Formation, enseignement, coaching', 'GraduationCap', '#14b8a6')
ON CONFLICT (slug) DO NOTHING;

-- Sample agent templates
INSERT INTO public.agent_templates (sector_id, name, description, system_prompt, suggested_tasks, default_model, is_featured) 
SELECT 
  s.id,
  'Assistant Événementiel',
  'Aide à la planification et gestion d''événements',
  'Tu es un assistant spécialisé en organisation d''événements. Tu aides les professionnels à planifier, gérer et coordonner tous types d''événements (mariages, conférences, séminaires, etc.). Tu es efficace, organisé et créatif.',
  ARRAY['Créer un planning d''événement', 'Gérer la liste des invités', 'Rédiger des emails de suivi', 'Créer un budget prévisionnel'],
  'claude',
  true
FROM public.sectors s WHERE s.slug = 'evenementiel'
ON CONFLICT DO NOTHING;

INSERT INTO public.agent_templates (sector_id, name, description, system_prompt, suggested_tasks, default_model, is_featured)
SELECT 
  s.id,
  'Agent Immobilier',
  'Assistant pour la gestion immobilière',
  'Tu es un assistant spécialisé en immobilier. Tu aides les professionnels dans la gestion de biens, la rédaction d''annonces, le suivi client et les démarches administratives. Tu es précis, professionnel et orienté service.',
  ARRAY['Rédiger une annonce immobilière', 'Créer un dossier de visite', 'Suivre les prospects', 'Préparer un mandat de vente'],
  'claude',
  true
FROM public.sectors s WHERE s.slug = 'immobilier'
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Vue pour les statistiques d'utilisation par user
CREATE OR REPLACE VIEW public.user_usage_stats AS
SELECT 
  u.id AS user_id,
  u.email,
  u.subscription_tier,
  COUNT(DISTINCT a.id) AS total_agents,
  COUNT(DISTINCT c.id) AS total_conversations,
  COUNT(DISTINCT m.id) AS total_messages,
  COALESCE(SUM(ul.tokens_used), 0) AS total_tokens_used,
  COALESCE(SUM(ul.cost_usd), 0) AS total_cost_usd,
  MAX(c.created_at) AS last_conversation_at
FROM public.users u
LEFT JOIN public.agents a ON u.id = a.user_id
LEFT JOIN public.conversations c ON u.id = c.user_id
LEFT JOIN public.messages m ON c.id = m.conversation_id
LEFT JOIN public.usage_logs ul ON u.id = ul.user_id
GROUP BY u.id, u.email, u.subscription_tier;

COMMENT ON TABLE public.users IS 'Extended user profiles linked to Supabase Auth';
COMMENT ON TABLE public.sectors IS 'Business sectors for agent categorization';
COMMENT ON TABLE public.agent_templates IS 'Pre-configured agent templates by sector';
COMMENT ON TABLE public.agents IS 'User-created AI agents';
COMMENT ON TABLE public.conversations IS 'Conversation threads between users and agents';
COMMENT ON TABLE public.messages IS 'Individual messages in conversations';
COMMENT ON TABLE public.usage_logs IS 'Usage tracking for billing and analytics';
COMMENT ON TABLE public.agent_suggestions IS 'AI-generated agent suggestions for users';
