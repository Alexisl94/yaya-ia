-- =============================================================================
-- VÉRIFICATION : La table existe-t-elle vraiment ?
-- =============================================================================

-- 1. Vérifier l'existence de la table
SELECT
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'conversation_attachments'
    ) THEN '✓ La table existe dans la base de données'
    ELSE '✗ La table N''EXISTE PAS - Exécutez fix-create-table.sql'
  END as status;

-- 2. Compter les colonnes
SELECT COUNT(*) as nombre_colonnes
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'conversation_attachments';

-- 3. Lister toutes les colonnes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'conversation_attachments'
ORDER BY ordinal_position;

-- 4. Vérifier les policies RLS
SELECT COUNT(*) as nombre_policies
FROM pg_policies
WHERE tablename = 'conversation_attachments';

-- 5. RAFRAÎCHIR LE CACHE POSTGREST (CRUCIAL!)
NOTIFY pgrst, 'reload schema';

SELECT '✓ Cache PostgREST rafraîchi - Réessayez l''upload maintenant!' as action;
