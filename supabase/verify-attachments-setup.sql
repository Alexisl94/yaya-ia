-- =============================================================================
-- SCRIPT DE VÉRIFICATION : Système d'Attachments
-- =============================================================================
-- Exécutez ce script pour diagnostiquer les problèmes d'upload
-- =============================================================================

-- =============================================================================
-- 1. Vérifier que la table conversation_attachments existe
-- =============================================================================
SELECT
  'Table conversation_attachments' as check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'conversation_attachments'
    ) THEN '✓ Existe'
    ELSE '✗ N''existe pas - EXÉCUTEZ le script setup-attachments.sql'
  END as status;

-- =============================================================================
-- 2. Vérifier que le bucket existe
-- =============================================================================
SELECT
  'Bucket conversation-attachments' as check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM storage.buckets
      WHERE id = 'conversation-attachments'
    ) THEN '✓ Existe'
    ELSE '✗ N''existe pas - EXÉCUTEZ le script setup-attachments.sql'
  END as status;

-- =============================================================================
-- 3. Lister les policies RLS sur conversation_attachments
-- =============================================================================
SELECT
  'RLS Policies (conversation_attachments)' as check_name,
  COUNT(*)::text || ' policies configurées' as status
FROM pg_policies
WHERE tablename = 'conversation_attachments';

-- Détail des policies
SELECT
  policyname as policy_name,
  cmd as command,
  qual::text as using_expression
FROM pg_policies
WHERE tablename = 'conversation_attachments'
ORDER BY policyname;

-- =============================================================================
-- 4. Lister les policies RLS sur storage.objects
-- =============================================================================
SELECT
  'Storage RLS Policies' as check_name,
  COUNT(*)::text || ' policies configurées' as status
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%attachment%';

-- Détail des policies storage
SELECT
  policyname as policy_name,
  cmd as command
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%attachment%'
ORDER BY policyname;

-- =============================================================================
-- 5. Vérifier les conversations existantes pour l'utilisateur connecté
-- =============================================================================
SELECT
  'Conversations de l''utilisateur' as check_name,
  COUNT(*)::text || ' conversations' as status
FROM conversations
WHERE user_id = auth.uid();

-- Lister les conversations (max 5)
SELECT
  id as conversation_id,
  agent_id,
  title,
  status,
  created_at
FROM conversations
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- =============================================================================
-- 6. Tester l'insertion d'un attachment (DRY RUN - rollback automatique)
-- =============================================================================
DO $$
DECLARE
  test_conversation_id UUID;
  test_user_id UUID;
BEGIN
  -- Récupérer l'ID utilisateur
  SELECT auth.uid() INTO test_user_id;

  IF test_user_id IS NULL THEN
    RAISE NOTICE '✗ ERREUR: Utilisateur non authentifié';
    RETURN;
  END IF;

  RAISE NOTICE '✓ Utilisateur authentifié: %', test_user_id;

  -- Récupérer la première conversation de l'utilisateur
  SELECT id INTO test_conversation_id
  FROM conversations
  WHERE user_id = test_user_id
  LIMIT 1;

  IF test_conversation_id IS NULL THEN
    RAISE NOTICE '✗ ERREUR: Aucune conversation trouvée pour cet utilisateur';
    RAISE NOTICE '   Créez d''abord une conversation dans l''interface avant d''uploader un fichier';
    RETURN;
  END IF;

  RAISE NOTICE '✓ Conversation trouvée: %', test_conversation_id;

  -- Tester l'insertion (sera rollback à la fin du bloc)
  BEGIN
    INSERT INTO conversation_attachments (
      conversation_id,
      user_id,
      file_name,
      file_type,
      file_size,
      storage_path
    ) VALUES (
      test_conversation_id,
      test_user_id,
      'test.jpg',
      'image/jpeg',
      1024,
      test_user_id::text || '/' || test_conversation_id::text || '/test.jpg'
    );

    RAISE NOTICE '✓ Test d''insertion réussi - Les permissions RLS fonctionnent';

    -- Rollback l'insertion de test
    RAISE EXCEPTION 'ROLLBACK_TEST';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM = 'ROLLBACK_TEST' THEN
        RAISE NOTICE '✓ Test terminé avec succès (insertion rollback)';
      ELSE
        RAISE NOTICE '✗ ERREUR lors de l''insertion de test: %', SQLERRM;
      END IF;
  END;

END $$;

-- =============================================================================
-- 7. Résumé des vérifications
-- =============================================================================
SELECT '
=============================================================================
RÉSUMÉ DES VÉRIFICATIONS
=============================================================================

Si vous voyez des ✗ ci-dessus:
1. Exécutez le script setup-attachments.sql
2. Assurez-vous d''avoir au moins une conversation créée
3. Réessayez l''upload

Si tout est ✓ mais l''upload échoue toujours:
1. Vérifiez les logs du serveur Next.js
2. Vérifiez les logs détaillés dans le terminal
3. Partagez l''erreur exacte avec les logs

=============================================================================
' as instructions;
