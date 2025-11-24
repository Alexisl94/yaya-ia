-- ================================================================
-- FIX COMPLET : AUTO-CRÉATION DES UTILISATEURS
-- ================================================================
-- Ce script corrige le problème où les utilisateurs ne sont pas
-- automatiquement créés dans public.users lors de l'inscription
-- ================================================================

-- 1️⃣ CRÉER LA FONCTION DE GESTION DES NOUVEAUX UTILISATEURS
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans public.users quand un nouvel utilisateur s'inscrit
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2️⃣ CRÉER LE TRIGGER
-- ================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3️⃣ MIGRER LES UTILISATEURS EXISTANTS
-- ================================================================
-- Copier tous les utilisateurs de auth.users vers public.users s'ils n'existent pas
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- 4️⃣ VÉRIFICATIONS
-- ================================================================

-- Vérifier le trigger
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Vérifier que tous les utilisateurs auth sont dans public.users
SELECT
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM public.users) as total_public_users,
  CASE
    WHEN COUNT(*) = (SELECT COUNT(*) FROM public.users)
    THEN '✅ Tous les utilisateurs sont synchronisés'
    ELSE '⚠️ Certains utilisateurs manquent dans public.users'
  END as status
FROM auth.users;

-- Afficher les utilisateurs migrés
SELECT
  id,
  email,
  full_name,
  avatar_url,
  created_at
FROM public.users
ORDER BY created_at DESC;
