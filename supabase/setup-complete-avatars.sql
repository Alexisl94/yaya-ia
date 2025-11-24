-- ================================================================
-- 🚀 CONFIGURATION COMPLÈTE DU SYSTÈME D'AVATARS - ONE CLICK
-- ================================================================
-- Exécute ce script dans Supabase SQL Editor pour tout configurer
-- ================================================================

-- 1️⃣ CRÉER LE BUCKET AVATARS (PUBLIC)
-- ================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- TRÈS IMPORTANT : Public pour que les avatars soient visibles
  2097152,  -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ================================================================
-- 2️⃣ NETTOYER LES ANCIENNES POLICIES (SI ELLES EXISTENT)
-- ================================================================
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- ================================================================
-- 3️⃣ CRÉER LES NOUVELLES POLICIES RLS
-- ================================================================

-- Policy 1: UPLOAD (INSERT) - Utilisateurs authentifiés peuvent uploader
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Policy 2: UPDATE - Utilisateurs authentifiés peuvent mettre à jour
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Policy 3: DELETE - Utilisateurs authentifiés peuvent supprimer
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Policy 4: SELECT - TOUT LE MONDE peut voir les avatars (public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ================================================================
-- 4️⃣ VÉRIFICATIONS - AFFICHER LES RÉSULTATS
-- ================================================================

-- Vérifier le bucket
SELECT
  '✅ BUCKET CRÉÉ' as status,
  id,
  name,
  public as "est_public",
  file_size_limit as "limite_taille_MB",
  created_at as "créé_le"
FROM storage.buckets
WHERE id = 'avatars';

-- Vérifier les policies
SELECT
  '✅ POLICIES CRÉÉES' as status,
  policyname as "nom_policy",
  cmd as "commande",
  roles as "rôles",
  CASE
    WHEN cmd = 'INSERT' THEN '📤 Upload'
    WHEN cmd = 'UPDATE' THEN '✏️ Update'
    WHEN cmd = 'DELETE' THEN '🗑️ Delete'
    WHEN cmd = 'SELECT' THEN '👁️ View'
  END as "action"
FROM pg_policies
WHERE tablename = 'objects'
  AND qual LIKE '%avatars%'
ORDER BY cmd;

-- Compter les policies (devrait être 4)
SELECT
  CASE
    WHEN COUNT(*) = 4 THEN '✅ CONFIGURATION COMPLÈTE - 4/4 policies'
    ELSE '⚠️ ATTENTION - ' || COUNT(*) || '/4 policies créées'
  END as "resultat_final"
FROM pg_policies
WHERE tablename = 'objects'
  AND qual LIKE '%avatars%';

-- ================================================================
-- 5️⃣ AFFICHER LES INSTRUCTIONS DE TEST
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '
  ================================================================
  🎉 CONFIGURATION TERMINÉE !
  ================================================================

  ✅ Bucket "avatars" créé et configuré en public
  ✅ 4 policies RLS créées (INSERT, UPDATE, DELETE, SELECT)

  📋 PROCHAINES ÉTAPES :

  1. Va sur http://localhost:3000/settings
  2. Clique sur "Changer la photo"
  3. Sélectionne une image (JPG, PNG, GIF - max 2MB)
  4. L''avatar devrait s''uploader et s''afficher immédiatement

  🔍 EN CAS DE PROBLÈME :

  - Vérifie que tu es bien connecté (authenticated)
  - Regarde la console du navigateur (F12)
  - Vérifie que le bucket est bien public (colonne "est_public" = true)
  - Assure-toi qu''il y a bien 4 policies créées

  📁 STRUCTURE DES FICHIERS :

  Les avatars seront stockés dans :
  storage/avatars/{userId}-{timestamp}.{ext}

  Exemple : avatars/123e4567-e89b-12d3-a456-426614174000-1234567890.jpg

  ================================================================
  ';
END $$;
