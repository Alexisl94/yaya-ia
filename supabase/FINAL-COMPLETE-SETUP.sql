-- =============================================================================
-- SCRIPT COMPLET FINAL - Créer table + fonction
-- À exécuter dans le bon projet Supabase : mzolqvxmdgbwonigsdoz
-- =============================================================================

-- 1. Vérifier qu'on est dans le bon projet
SELECT 'Vous êtes dans le projet: ' || current_database() as info;

-- 2. Supprimer la table si elle existe déjà (pour repartir proprement)
DROP TABLE IF EXISTS public.conversation_attachments CASCADE;

-- 3. Créer la table conversation_attachments
CREATE TABLE public.conversation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  message_id UUID,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  thumbnail_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Créer les index pour les performances
CREATE INDEX idx_conversation_attachments_conversation_id
  ON public.conversation_attachments(conversation_id);
CREATE INDEX idx_conversation_attachments_message_id
  ON public.conversation_attachments(message_id);
CREATE INDEX idx_conversation_attachments_user_id
  ON public.conversation_attachments(user_id);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

-- 6. Créer les policies RLS
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

-- 7. Service role peut tout faire (pour notre connexion directe PostgreSQL)
CREATE POLICY "Service role has full access"
  ON public.conversation_attachments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON public.conversation_attachments TO service_role, postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_attachments TO authenticated;

-- 9. Créer la fonction insert_attachment (au cas où on en aurait besoin plus tard)
CREATE OR REPLACE FUNCTION public.insert_attachment(
  p_conversation_id TEXT,
  p_message_id TEXT,
  p_user_id TEXT,
  p_file_name TEXT,
  p_file_type TEXT,
  p_file_size BIGINT,
  p_storage_path TEXT,
  p_extracted_text TEXT DEFAULT NULL,
  p_thumbnail_path TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  message_id UUID,
  user_id UUID,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  extracted_text TEXT,
  thumbnail_path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.conversation_attachments (
    conversation_id,
    message_id,
    user_id,
    file_name,
    file_type,
    file_size,
    storage_path,
    extracted_text,
    thumbnail_path,
    metadata
  ) VALUES (
    p_conversation_id::uuid,
    CASE WHEN p_message_id IS NULL OR p_message_id = '' THEN NULL ELSE p_message_id::uuid END,
    p_user_id::uuid,
    p_file_name,
    p_file_type,
    p_file_size,
    p_storage_path,
    p_extracted_text,
    p_thumbnail_path,
    p_metadata
  )
  RETURNING *;
END;
$$;

-- 10. Donner les droits d'exécution sur la fonction
GRANT EXECUTE ON FUNCTION public.insert_attachment TO anon, authenticated, service_role;

-- 11. Rafraîchir PostgREST
NOTIFY pgrst, 'reload schema';

-- 12. Vérification finale
SELECT
  '✅ TABLE CRÉÉE: ' || tablename as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'conversation_attachments';

SELECT
  '✅ FONCTION CRÉÉE: ' || proname as status
FROM pg_proc
WHERE proname = 'insert_attachment';

SELECT '✅ SETUP COMPLET - PRÊT À UTILISER' as result;
