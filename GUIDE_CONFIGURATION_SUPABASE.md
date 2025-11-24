# 🚀 Guide Complet - Configuration Supabase pour yaya.ia

## 📋 Table des Matières
1. [Vérifier la table users](#1-vérifier-la-table-users)
2. [Créer le bucket avatars](#2-créer-le-bucket-avatars)
3. [Configurer les politiques RLS](#3-configurer-les-politiques-rls)
4. [Tester la configuration](#4-tester-la-configuration)

---

## 1️⃣ Vérifier la table `users`

### Étape 1.1 : Ouvrir SQL Editor

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet **yaya-ia**
3. Clique sur **SQL Editor** dans le menu de gauche
4. Clique sur **New query**

### Étape 1.2 : Vérifier que la table existe

Colle et exécute ce SQL :

```sql
-- Vérifier la structure de la table users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;
```

✅ **Résultat attendu :** Tu devrais voir les colonnes `id`, `email`, `full_name`, `avatar_url`, etc.

### Étape 1.3 : Vérifier que ton utilisateur existe

```sql
-- Voir ton utilisateur actuel
SELECT id, email, full_name, avatar_url, created_at
FROM public.users
WHERE email = 'TON_EMAIL@example.com';  -- Remplace par ton email
```

❌ **Si vide :** Pas de panique ! On va créer l'entrée automatiquement.

✅ **Si tu vois une ligne :** Parfait ! Tu peux passer à l'étape 2.

### Étape 1.4 : Créer une entrée utilisateur (si nécessaire)

Si l'étape 1.3 était vide, exécute ceci :

```sql
-- Récupérer ton user_id depuis auth.users
SELECT id, email FROM auth.users WHERE email = 'TON_EMAIL@example.com';

-- Créer l'entrée dans public.users (remplace les valeurs)
INSERT INTO public.users (id, email, full_name)
VALUES (
  'TON_USER_ID_ICI',  -- Copie l'ID de la requête précédente
  'TON_EMAIL@example.com',
  'Ton Nom Complet'
)
ON CONFLICT (id) DO NOTHING;
```

---

## 2️⃣ Créer le bucket `avatars`

### Étape 2.1 : Aller dans Storage

1. Clique sur **Storage** dans le menu de gauche
2. Clique sur **New bucket**

### Étape 2.2 : Créer le bucket

Remplis le formulaire :
- **Name:** `avatars`
- **Public bucket:** ✅ **COCHÉ** (très important !)
- **File size limit:** 2 MB (optionnel)
- **Allowed MIME types:** `image/*` (optionnel)

Clique sur **Create bucket**

✅ **Vérification :** Le bucket `avatars` apparaît dans la liste avec une icône de globe 🌐 (indiquant qu'il est public)

---

## 3️⃣ Configurer les politiques RLS

### Étape 3.1 : Aller dans Policies

1. Clique sur le bucket **avatars**
2. Va dans l'onglet **Policies**
3. Clique sur **New policy**

### Étape 3.2 : Créer les 4 politiques

#### Policy 1 : Permettre l'upload (INSERT)

**Via l'interface :**
- Policy name: `Users can upload their own avatar`
- Policy command: **INSERT**
- Target roles: **authenticated**
- USING expression: (laisse vide)
- WITH CHECK expression:
  ```sql
  bucket_id = 'avatars'
  ```

**OU via SQL Editor :**

```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

---

#### Policy 2 : Permettre la mise à jour (UPDATE)

**Via l'interface :**
- Policy name: `Users can update their own avatar`
- Policy command: **UPDATE**
- Target roles: **authenticated**
- USING expression:
  ```sql
  bucket_id = 'avatars'
  ```

**OU via SQL Editor :**

```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');
```

---

#### Policy 3 : Permettre la suppression (DELETE)

**Via l'interface :**
- Policy name: `Users can delete their own avatar`
- Policy command: **DELETE**
- Target roles: **authenticated**
- USING expression:
  ```sql
  bucket_id = 'avatars'
  ```

**OU via SQL Editor :**

```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

---

#### Policy 4 : Permettre la lecture publique (SELECT)

**Via l'interface :**
- Policy name: `Anyone can view avatars`
- Policy command: **SELECT**
- Target roles: **public**
- USING expression:
  ```sql
  bucket_id = 'avatars'
  ```

**OU via SQL Editor :**

```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

### 🎯 Script SQL Complet (Méthode Rapide)

Si tu préfères tout faire en une fois via SQL Editor :

```sql
-- ====================================
-- CONFIGURATION COMPLÈTE DU STORAGE
-- ====================================

-- 1. Créer le bucket (si pas fait via UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Supprimer les anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 3. Créer les nouvelles policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 4. Vérifier que tout est OK
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
  AND qual LIKE '%avatars%';
```

✅ **Exécute ce script** et tu devrais voir 4 policies dans les résultats !

---

## 4️⃣ Tester la configuration

### Test 1 : Vérifier le bucket

```sql
-- Vérifier que le bucket existe et est public
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id = 'avatars';
```

✅ **Attendu :** Une ligne avec `public = true`

---

### Test 2 : Vérifier les policies

```sql
-- Lister toutes les policies du bucket avatars
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND qual LIKE '%avatars%';
```

✅ **Attendu :** 4 lignes (INSERT, UPDATE, DELETE, SELECT)

---

### Test 3 : Tester l'upload depuis l'app

1. Va sur http://localhost:3000/settings
2. Recharge la page avec `Ctrl+R`
3. Ouvre la console (F12)
4. Clique sur **"Changer la photo"**
5. Sélectionne une image (JPG, PNG, max 2MB)

✅ **Succès si :**
- L'image s'upload sans erreur
- Tu vois un toast vert "Photo de profil mise à jour"
- L'avatar s'affiche immédiatement

❌ **Échec si :**
- Erreur dans la console
- Toast rouge avec un message d'erreur
- → Regarde le message d'erreur et vérifie les policies

---

## 🔍 Troubleshooting

### Erreur : "new row violates row-level security policy"

**Cause :** Les policies RLS ne sont pas créées ou incorrectes

**Solution :**
1. Vérifie que les 4 policies existent (Test 2)
2. Re-exécute le script SQL complet
3. Vérifie que le bucket est bien **public**

---

### Erreur : "Bucket not found"

**Cause :** Le bucket `avatars` n'existe pas

**Solution :**
1. Va dans **Storage**
2. Vérifie que le bucket `avatars` existe
3. Si non, crée-le manuellement (étape 2.2)

---

### Erreur : "User not found in users table"

**Cause :** Ton compte auth existe mais pas dans `public.users`

**Solution :**
Exécute le script de l'étape 1.4 pour créer l'entrée

---

### L'image s'upload mais ne s'affiche pas

**Cause :** Le bucket n'est pas public OU la policy SELECT manque

**Solution :**
```sql
-- Rendre le bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';

-- Vérifier la policy SELECT
SELECT * FROM pg_policies
WHERE tablename = 'objects'
  AND policyname = 'Anyone can view avatars';
```

---

## ✅ Checklist Finale

Avant de tester, vérifie que :

- [ ] La table `users` existe
- [ ] Ton utilisateur existe dans `public.users`
- [ ] Le bucket `avatars` existe
- [ ] Le bucket `avatars` est **public** (🌐)
- [ ] Les 4 policies RLS existent (INSERT, UPDATE, DELETE, SELECT)
- [ ] Policy SELECT est pour **public** (pas authenticated)
- [ ] L'app tourne sur http://localhost:3000

---

## 🎉 Configuration Réussie !

Si tout fonctionne :
1. Va sur http://localhost:3000/settings
2. Upload une photo
3. Ton avatar devrait apparaître immédiatement
4. Vérifie dans **Storage > avatars** que le fichier est là

**Bravo ! 🚀 Le système de profil est opérationnel !**

---

## 📞 Support

Si tu as encore des erreurs :
1. Envoie-moi le message d'erreur exact de la console
2. Envoie le résultat du Test 1 et Test 2
3. Dis-moi à quelle étape ça bloque

Je t'aiderai à déboguer ! 💪
