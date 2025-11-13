-- =============================================================================
-- FIX: Créer la table conversation_attachments
-- =============================================================================
-- Ce script crée SEULEMENT la table sans les dépendances complexes
-- Exécutez ce script dans le SQL Editor de Supabase
-- =============================================================================

-- 1. Supprimer la table si elle existe déjà (pour repartir de zéro)
DROP TABLE IF EXISTS public.conversation_attachments CASCADE;

-- 2. Créer la table conversation_attachments
CREATE TABLE public.conversation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  message_id UUID,
  user_id UUID NOT NULL,

  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,

  -- Processing results
  extracted_text TEXT,
  thumbnail_path TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 10485760)
);

-- 3. Créer les index
CREATE INDEX idx_attachments_conversation_id ON public.conversation_attachments(conversation_id);
CREATE INDEX idx_attachments_message_id ON public.conversation_attachments(message_id);
CREATE INDEX idx_attachments_user_id ON public.conversation_attachments(user_id);
CREATE INDEX idx_attachments_created_at ON public.conversation_attachments(created_at DESC);

-- 4. Activer RLS
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

-- 5. Créer les policies RLS
CREATE POLICY "Users can view their own attachments"
  ON public.conversation_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attachments"
  ON public.conversation_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attachments"
  ON public.conversation_attachments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments"
  ON public.conversation_attachments
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Créer le trigger updated_at
CREATE OR REPLACE FUNCTION public.update_conversation_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_attachments_updated_at
  BEFORE UPDATE ON public.conversation_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_attachments_updated_at();

-- 7. Vérifier que la table a été créée
SELECT
  'Table conversation_attachments créée avec succès ✓' as status,
  COUNT(*) || ' colonnes' as columns
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'conversation_attachments';

-- =============================================================================
-- IMPORTANT : Après l'exécution, RAFRAÎCHISSEZ le schéma PostgREST
-- =============================================================================
-- Allez dans Supabase Dashboard > Settings > API > Schema Cache
-- Cliquez sur "Reload schema cache" OU exécutez cette requête :

NOTIFY pgrst, 'reload schema';

-- =============================================================================
