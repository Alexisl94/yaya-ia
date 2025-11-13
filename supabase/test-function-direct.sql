-- Test the function directly with a valid UUID to see if it works in PostgreSQL
-- This bypasses PostgREST entirely

-- First, let's see what functions exist with 'attachment' in the name
SELECT
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%attachment%';

-- Now try to call the function with valid test data
DO $$
DECLARE
  test_user_id uuid;
  test_conv_id uuid;
  result_record RECORD;
BEGIN
  -- Generate test UUIDs
  test_user_id := gen_random_uuid();
  test_conv_id := gen_random_uuid();

  -- Try calling the function
  SELECT * INTO result_record
  FROM public.insert_attachment(
    test_conv_id::text,
    NULL,
    test_user_id::text,
    'test-direct.pdf',
    'application/pdf',
    1024,
    'test/direct.pdf',
    NULL,
    NULL,
    '{}'::jsonb
  );

  -- Show the result
  RAISE NOTICE 'Function call succeeded! ID: %', result_record.id;

  -- Clean up test data
  DELETE FROM public.conversation_attachments WHERE id = result_record.id;

  RAISE NOTICE '✅ FONCTION FONCTIONNE EN SQL DIRECT';

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
END $$;
