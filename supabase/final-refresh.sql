-- =============================================================================
-- RAFRAÎCHIR LE CACHE - VERSION FINALE
-- =============================================================================

-- 1. Vérifier que la fonction existe
SELECT 'Fonction create_attachment_rpc: ✓ EXISTE' as status
FROM pg_proc
WHERE proname = 'create_attachment_rpc';

-- 2. RAFRAÎCHIR LE CACHE
NOTIFY pgrst, 'reload schema';

-- 3. Attendre
SELECT pg_sleep(2);

-- 4. RAFRAÎCHIR ENCORE (pour être sûr)
NOTIFY pgrst, 'reload schema';

-- 5. Message final
SELECT '✓✓✓ CACHE RAFRAÎCHI - RÉESSAYEZ L''UPLOAD MAINTENANT ✓✓✓' as action;
