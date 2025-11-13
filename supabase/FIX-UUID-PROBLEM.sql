-- =============================================================================
-- FIX: Modifier la table pour accepter TEXT au lieu de UUID
-- Le problème: L'app génère des IDs comme "conv-1763045887401" qui ne sont pas des UUIDs
-- =============================================================================

-- 1. Supprimer la table existante
DROP TABLE IF EXISTS public.conversation_attachments CASCADE;

-- 2. Recréer la table avec TEXT pour les foreign keys
CREATE TABLE public.conversation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,           -- TEXT au lieu de UUID
  message_id TEXT,                         -- TEXT au lieu de UUID
  user_id TEXT NOT NULL,                   -- TEXT au lieu de UUID (pour compatibilité)
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

-- 3. Créer les index
CREATE INDEX idx_conversation_attachments_conversation_id
  ON public.conversation_attachments(conversation_id);
CREATE INDEX idx_conversation_attachments_message_id
  ON public.conversation_attachments(message_id);
CREATE INDEX idx_conversation_attachments_user_id
  ON public.conversation_attachments(user_id);

-- 4. Activer RLS
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

-- 5. Créer les policies RLS
CREATE POLICY "Users can view their own attachments"
  ON public.conversation_attachments
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own attachments"
  ON public.conversation_attachments
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own attachments"
  ON public.conversation_attachments
  FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own attachments"
  ON public.conversation_attachments
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- 6. Service role a tous les droits
CREATE POLICY "Service role has full access"
  ON public.conversation_attachments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Donner les permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON public.conversation_attachments TO service_role, postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_attachments TO authenticated;

-- 8. Rafraîchir PostgREST
NOTIFY pgrst, 'reload schema';

-- 9. Vérification
SELECT '✅ TABLE RECRÉÉE AVEC TEXT IDs - PRÊT À UTILISER' as result;

-- 10. Test avec un ID non-UUID
DO $$
DECLARE
  test_result RECORD;
BEGIN
  -- Insérer un test avec des IDs non-UUID
  INSERT INTO public.conversation_attachments (
    conversation_id,
    message_id,
    user_id,
    file_name,
    file_type,
    file_size,
    storage_path
  ) VALUES (
    'conv-test-123',
    'msg-test-456',
    'user-test-789',
    'test.pdf',
    'application/pdf',
    1024,
    'test/path.pdf'
  )
  RETURNING * INTO test_result;

  RAISE NOTICE '✅ TEST INSERT RÉUSSI avec ID: %', test_result.id;

  -- Nettoyer
  DELETE FROM public.conversation_attachments WHERE conversation_id = 'conv-test-123';

  RAISE NOTICE '✅ TOUT FONCTIONNE - IDs non-UUID acceptés !';
END $$;
