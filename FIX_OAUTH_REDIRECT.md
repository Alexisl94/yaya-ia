# 🔧 Corriger la Redirection OAuth vers Localhost

## ❌ PROBLÈME

Votre app est déployée sur Vercel mais lors de la connexion Google, vous êtes redirigé vers `localhost:3000` au lieu de votre URL de production.

## 🎯 CAUSE

La variable `NEXT_PUBLIC_APP_URL` n'est pas configurée avec l'URL de production, et Supabase n'a pas les bonnes URLs de redirection.

## ✅ SOLUTION (5 MINUTES)

### Étape 1 : Récupérer votre URL Vercel

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur votre projet "yaya-ia"
3. Copier l'URL de production (ex: `https://yaya-ia-abc123.vercel.app`)

**Notez cette URL, vous en aurez besoin !**

---

### Étape 2 : Configurer Supabase

1. **Aller sur Supabase Dashboard**
   → https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz

2. **Aller dans Authentication**
   → Dans le menu de gauche, cliquer sur "Authentication"

3. **Aller dans URL Configuration**
   → Onglet "URL Configuration"

4. **Ajouter l'URL de production**

   **Site URL:**
   ```
   https://votre-app.vercel.app
   ```
   (Remplacez par votre vraie URL Vercel)

5. **Ajouter les Redirect URLs**

   Cliquer sur "Add redirect URL" et ajouter:
   ```
   https://votre-app.vercel.app/auth/callback
   ```

   **IMPORTANT:** Gardez aussi `http://localhost:3000/*` pour le développement local

6. **Sauvegarder**

---

### Étape 3 : Configurer la variable d'environnement dans Vercel

1. **Aller sur Vercel Dashboard**
   → https://vercel.com/dashboard
   → Sélectionner votre projet "yaya-ia"

2. **Aller dans Settings**
   → Onglet "Settings" en haut

3. **Aller dans Environment Variables**
   → Dans le menu de gauche, "Environment Variables"

4. **Ajouter la variable NEXT_PUBLIC_APP_URL**

   Cliquer sur "Add" et remplir:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://votre-app.vercel.app` (votre vraie URL)
   - **Environment:** Cocher "Production", "Preview", "Development"

5. **Sauvegarder**

---

### Étape 4 : Redéployer l'application

1. **Aller dans l'onglet "Deployments"**

2. **Trouver le dernier déploiement**
   → Cliquer sur les trois points (...)

3. **Cliquer sur "Redeploy"**

4. **Attendre 2-3 minutes**

5. ✅ **C'est fait !**

---

### Étape 5 : Tester

1. **Ouvrir votre URL de production**
   → https://votre-app.vercel.app

2. **Cliquer sur "Connexion"**

3. **Choisir "Connexion avec Google"**

4. ✅ **Vous devez maintenant rester sur votre domaine de production !**

---

## 🔍 VÉRIFICATION

Après avoir suivi ces étapes :

✅ L'URL dans la barre d'adresse doit rester `https://votre-app.vercel.app/*`
✅ Pas de redirection vers `localhost`
✅ La connexion Google fonctionne
✅ Vous êtes connecté et redirigé vers le dashboard

---

## 🆘 SI ÇA NE FONCTIONNE TOUJOURS PAS

### Vérifier que NEXT_PUBLIC_APP_URL est bien définie

Dans Vercel, la variable doit être **EXACTEMENT** :
```
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

**Sans trailing slash (pas de `/` à la fin) !**

### Vérifier les Redirect URLs Supabase

Dans Supabase → Authentication → URL Configuration :

**Site URL:**
```
https://votre-app.vercel.app
```

**Redirect URLs (vous devez avoir les 2):**
```
http://localhost:3000/*
https://votre-app.vercel.app/auth/callback
```

### Vider le cache

1. Ouvrir votre app en navigation privée
2. Ou vider le cache du navigateur (Ctrl+Shift+Delete)
3. Réessayer

### Vérifier les logs

Dans Vercel Dashboard → votre projet → Runtime Logs

Chercher des erreurs liées à `NEXT_PUBLIC_APP_URL`

---

## 📋 RÉSUMÉ DES URLs À CONFIGURER

| Service | Paramètre | Valeur |
|---------|-----------|--------|
| Supabase | Site URL | `https://votre-app.vercel.app` |
| Supabase | Redirect URL | `https://votre-app.vercel.app/auth/callback` |
| Supabase | Redirect URL (dev) | `http://localhost:3000/*` |
| Vercel | NEXT_PUBLIC_APP_URL | `https://votre-app.vercel.app` |

---

## 🎯 CHECKLIST

- [ ] URL de production Vercel récupérée
- [ ] Site URL configurée dans Supabase
- [ ] Redirect URL ajoutée dans Supabase (`/auth/callback`)
- [ ] Variable NEXT_PUBLIC_APP_URL ajoutée dans Vercel
- [ ] Application redéployée
- [ ] Cache du navigateur vidé
- [ ] Test de connexion effectué
- [ ] ✅ Ça fonctionne !

---

## 💡 POURQUOI CE PROBLÈME ?

Quand vous avez déployé, la variable `NEXT_PUBLIC_APP_URL` n'était pas encore définie avec l'URL de production. Par défaut, elle pointait vers `localhost:3000`.

Cette variable est utilisée par Supabase pour savoir où rediriger l'utilisateur après l'authentification OAuth.

Maintenant que vous avez l'URL de production, vous pouvez la configurer correctement !

---

## 🚀 C'EST PARTI !

Suivez les 5 étapes ci-dessus et votre authentification fonctionnera parfaitement en production !
