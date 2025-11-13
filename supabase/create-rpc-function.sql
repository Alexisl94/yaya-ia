-- =============================================================================
-- SOLUTION DÉFINITIVE : Contourner PostgREST avec une fonction RPC
-- =============================================================================
-- Cette fonction SQL va contourner le cache PostgREST
-- =============================================================================

-- 1. D'abord, supprimer et recréer la table proprement
DROP TABLE IF EXISTS public.conversation_attachments CASCADE;

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 10485760)
);

-- 2. Index
CREATE INDEX idx_attachments_conversation_id ON public.conversation_attachments(conversation_id);
CREATE INDEX idx_attachments_message_id ON public.conversation_attachments(message_id);
CREATE INDEX idx_attachments_user_id ON public.conversation_attachments(user_id);
CREATE INDEX idx_attachments_created_at ON public.conversation_attachments(created_at DESC);

-- 3. RLS
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attachments"
  ON public.conversation_attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attachments"
  ON public.conversation_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attachments"
  ON public.conversation_attachments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments"
  ON public.conversation_attachments FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Trigger updated_at
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

-- =============================================================================
-- 5. FONCTION RPC POUR CRÉER UN ATTACHMENT (CONTOURNE POSTGREST)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_attachment_rpc(
  p_conversation_id UUID,
  p_message_id UUID,
  p_file_name TEXT,
  p_file_type TEXT,
  p_file_size BIGINT,
  p_storage_path TEXT,
  p_extracted_text TEXT DEFAULT NULL,
  p_thumbnail_path TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_attachment_id UUID;
  v_result JSON;
BEGIN
  -- Récupérer l'utilisateur authentifié
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'code', 'UNAUTHORIZED',
        'message', 'User not authenticated'
      )
    );
  END IF;

  -- Insérer l'attachment
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
    p_message_id,
    v_user_id,
    p_file_name,
    p_file_type,
    p_file_size,
    p_storage_path,
    p_extracted_text,
    p_thumbnail_path,
    p_metadata
  )
  RETURNING id INTO v_attachment_id;

  -- Récupérer l'attachment créé
  SELECT json_build_object(
    'success', true,
    'data', row_to_json(ca.*)
  ) INTO v_result
  FROM public.conversation_attachments ca
  WHERE ca.id = v_attachment_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'code', SQLSTATE,
        'message', SQLERRM
      )
    );
END;
$$;

-- 6. Rafraîchir le cache PostgREST
NOTIFY pgrst, 'reload schema';

-- 7. Vérification
SELECT
  '✓ Table créée, fonction RPC créée, cache rafraîchi!' as status,
  COUNT(*) || ' colonnes dans la table' as details
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'conversation_attachments';

-- 8. Tester la fonction RPC
SELECT public.create_attachment_rpc(
  gen_random_uuid(), -- conversation_id
  NULL, -- message_id
  'test.pdf', -- file_name
  'application/pdf', -- file_type
  1024, -- file_size
  'test/path.pdf', -- storage_path
  NULL, -- extracted_text
  NULL, -- thumbnail_path
  '{}'::jsonb -- metadata
) as test_result;

SELECT '✓ Si vous voyez success:true ci-dessus, la fonction RPC fonctionne!' as instructions;
