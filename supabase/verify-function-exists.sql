-- Vérifier que la fonction insert_attachment existe
SELECT
  'Fonction insert_attachment: ' ||
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'insert_attachment'
    ) THEN '✅ EXISTE ET PRÊTE À UTILISER'
    ELSE '❌ N''EXISTE PAS'
  END as status;

-- Lister ses paramètres
SELECT
  p.proname as fonction,
  pg_get_function_arguments(p.oid) as parametres
FROM pg_proc p
WHERE p.proname = 'insert_attachment';
