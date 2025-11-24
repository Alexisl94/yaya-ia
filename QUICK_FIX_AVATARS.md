# ⚡ Fix Rapide - Upload d'Avatars

## 🚨 Problème
Erreur `Error loading profile: {}` dans la page Settings

## ✅ Solution en 3 étapes

### Étape 1 : Va sur Supabase
👉 https://supabase.com/dashboard → Ton projet

### Étape 2 : Exécute le script SQL
1. Clique sur **SQL Editor** (menu gauche)
2. Clique sur **New query**
3. Copie-colle le contenu ENTIER du fichier : `supabase/setup-complete-avatars.sql`
4. Clique sur **Run** (ou `Ctrl+Enter`)

### Étape 3 : Vérifie que ça marche
Tu devrais voir dans les résultats :
```
✅ CONFIGURATION COMPLÈTE - 4/4 policies
```

## 🎯 C'est tout !

Maintenant va sur http://localhost:3000/settings et teste l'upload d'avatar.

---

## 🔧 Alternative Manuelle (si le script ne marche pas)

### A. Créer le bucket
1. **Storage** → **New bucket**
2. Nom : `avatars`
3. ✅ Coche **Public bucket**
4. **Create**

### B. Créer les policies
Va dans **Storage** → **avatars** → **Policies** → **New policy**

Crée ces 4 policies :

**Policy 1 - Upload**
- Name: `Users can upload their own avatar`
- Command: INSERT
- Target: authenticated
- WITH CHECK: `bucket_id = 'avatars'`

**Policy 2 - Update**
- Name: `Users can update their own avatar`
- Command: UPDATE
- Target: authenticated
- USING: `bucket_id = 'avatars'`

**Policy 3 - Delete**
- Name: `Users can delete their own avatar`
- Command: DELETE
- Target: authenticated
- USING: `bucket_id = 'avatars'`

**Policy 4 - View**
- Name: `Anyone can view avatars`
- Command: SELECT
- Target: **public**
- USING: `bucket_id = 'avatars'`

---

## 📞 Toujours des erreurs ?

Envoie-moi :
1. Le message d'erreur dans la console (F12)
2. Une capture d'écran de **Storage** → **avatars** → **Policies**

Je t'aiderai ! 💪
