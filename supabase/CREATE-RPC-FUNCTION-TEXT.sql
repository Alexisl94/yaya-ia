-- =============================================================================
-- Créer une fonction RPC qui accepte TEXT et contourne le cache PostgREST
-- =============================================================================

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.insert_attachment_text CASCADE;

-- Créer la nouvelle fonction avec TEXT
CREATE OR REPLACE FUNCTION public.insert_attachment_text(
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
  conversation_id TEXT,
  message_id TEXT,
  user_id TEXT,
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
    p_conversation_id,
    CASE WHEN p_message_id IS NULL OR p_message_id = '' THEN NULL ELSE p_message_id END,
    p_user_id,
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

-- Donner les droits
GRANT EXECUTE ON FUNCTION public.insert_attachment_text TO anon, authenticated, service_role;

-- Rafraîchir PostgREST
NOTIFY pgrst, 'reload schema';

-- Test
SELECT '✅ FONCTION RPC insert_attachment_text CRÉÉE' as result;
