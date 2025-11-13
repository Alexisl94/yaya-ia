-- =============================================================================
-- RAFRAÎCHIR LE CACHE POSTGREST
-- =============================================================================

-- 1. Vérifier que la fonction existe
SELECT
  'Fonction create_attachment_rpc existe: ' ||
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'create_attachment_rpc'
    ) THEN '✓ OUI'
    ELSE '✗ NON'
  END as status;

-- 2. Lister les paramètres de la fonction
SELECT
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as parameters
FROM pg_proc p
WHERE p.proname = 'create_attachment_rpc';

-- 3. RAFRAÎCHIR LE CACHE (CRITIQUE!)
NOTIFY pgrst, 'reload schema';

-- 4. Attendre 2 secondes (PostgreSQL)
SELECT pg_sleep(2);

-- 5. Tester l'appel de la fonction directement
SELECT public.create_attachment_rpc(
  'conv-test-123'::text::uuid,  -- p_conversation_id (cast en UUID)
  NULL,                           -- p_message_id
  'test.pdf',                     -- p_file_name
  'application/pdf',              -- p_file_type
  1024,                          -- p_file_size
  'test/path.pdf',               -- p_storage_path
  NULL,                          -- p_extracted_text
  NULL,                          -- p_thumbnail_path
  '{}'::jsonb                    -- p_metadata
) as test_result;

-- 6. Message final
SELECT '✓ Cache rafraîchi! Réessayez l''upload dans l''application maintenant!' as action;
