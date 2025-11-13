-- =============================================================================
-- Créer la fonction insert_attachment SANS TEST
-- =============================================================================

-- 1. Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.conversation_attachments TO anon, authenticated, service_role;

-- 2. Créer la fonction SECURITY DEFINER
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
DECLARE
  v_new_id UUID;
BEGIN
  -- Insérer directement dans la table
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
  RETURNING * INTO id, conversation_id, message_id, user_id, file_name, file_type,
            file_size, storage_path, extracted_text, thumbnail_path, metadata,
            created_at, updated_at;

  RETURN NEXT;
END;
$$;

-- 3. Donner les droits d'exécution
GRANT EXECUTE ON FUNCTION public.insert_attachment TO anon, authenticated, service_role;

-- 4. Rafraîchir PostgREST
NOTIFY pgrst, 'reload schema';

-- 5. Vérification
SELECT
  'RÉSULTAT: ' ||
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'insert_attachment'
    ) THEN '✅✅✅ FONCTION CRÉÉE AVEC SUCCÈS ✅✅✅'
    ELSE '❌ ERREUR'
  END as status;
