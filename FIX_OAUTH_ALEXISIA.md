# 🔧 Configuration OAuth pour alexisia.vercel.app

## 📋 VOTRE URL DE PRODUCTION
```
https://alexisia.vercel.app
```

---

## ✅ ÉTAPE 1 : CONFIGURER SUPABASE (2 minutes)

### 1. Ouvrir Supabase Dashboard
→ https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz

### 2. Aller dans Authentication
→ Menu de gauche : cliquer sur "Authentication"

### 3. Aller dans URL Configuration
→ Cliquer sur l'onglet "URL Configuration"

### 4. Configurer le Site URL

Trouver le champ **"Site URL"** et remplacer par :
```
https://alexisia.vercel.app
```

### 5. Ajouter les Redirect URLs

Dans la section **"Redirect URLs"**, vous devez avoir :

**Redirect URL 1 (PRODUCTION) - À AJOUTER :**
```
https://alexisia.vercel.app/auth/callback
```

**Redirect URL 2 (LOCAL) - À GARDER :**
```
http://localhost:3000/*
```

Cliquer sur "+ Add another URL" si nécessaire.

### 6. Sauvegarder
Cliquer sur **"Save"** en bas de la page

✅ **Supabase configuré !**

---

## ✅ ÉTAPE 2 : CONFIGURER VERCEL (2 minutes)

### 1. Ouvrir Vercel Dashboard
→ https://vercel.com/dashboard

### 2. Sélectionner votre projet
→ Cliquer sur "alexisia" (ou "yaya-ia")

### 3. Aller dans Settings
→ Cliquer sur l'onglet "Settings" en haut

### 4. Aller dans Environment Variables
→ Menu de gauche : "Environment Variables"

### 5. Ajouter NEXT_PUBLIC_APP_URL

**Vérifier si la variable existe déjà :**
- Si elle existe avec `localhost`, cliquer sur "Edit"
- Si elle n'existe pas, cliquer sur "Add New"

**Remplir :**
- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://alexisia.vercel.app`
- **Environment:** Cocher les 3 cases (Production, Preview, Development)

### 6. Sauvegarder
Cliquer sur **"Save"**

✅ **Variable configurée !**

---

## ✅ ÉTAPE 3 : REDÉPLOYER (1 minute)

### 1. Aller dans Deployments
→ Cliquer sur l'onglet "Deployments" en haut

### 2. Redéployer le dernier build
→ Sur le dernier déploiement, cliquer sur les **3 points** (...)
→ Cliquer sur **"Redeploy"**
→ Confirmer en cliquant sur **"Redeploy"**

### 3. Attendre le build
⏱️ Attendre 2-3 minutes que le build se termine

✅ **Application redéployée !**

---

## ✅ ÉTAPE 4 : TESTER (1 minute)

### 1. Vider le cache du navigateur
**Option A - Navigation privée (RECOMMANDÉ) :**
- Ouvrir une fenêtre de navigation privée (Ctrl+Shift+N)

**Option B - Vider le cache :**
- Appuyer sur Ctrl+Shift+Delete
- Sélectionner "Cookies" et "Cache"
- Vider

### 2. Tester la connexion
1. Ouvrir https://alexisia.vercel.app
2. Cliquer sur "Connexion"
3. Cliquer sur "Connexion avec Google"
4. Sélectionner votre compte Google

### 3. Vérifier le résultat

✅ **SUCCÈS si :**
- Vous restez sur `https://alexisia.vercel.app/*`
- Pas de redirection vers localhost
- Vous êtes connecté et redirigé vers le dashboard

❌ **ÉCHEC si :**
- Vous êtes redirigé vers `localhost:3000`
→ Voir section "Troubleshooting" ci-dessous

---

## 🔍 VÉRIFICATION RAPIDE

### Dans Supabase
✅ Site URL = `https://alexisia.vercel.app`
✅ Redirect URL = `https://alexisia.vercel.app/auth/callback`
✅ Redirect URL = `http://localhost:3000/*` (pour le dev)

### Dans Vercel
✅ Variable `NEXT_PUBLIC_APP_URL` = `https://alexisia.vercel.app`
✅ Application redéployée après l'ajout de la variable

---

## 🆘 TROUBLESHOOTING

### Si ça redirige toujours vers localhost

1. **Vérifier que la variable est bien définie dans Vercel**
   - Aller dans Settings > Environment Variables
   - Vérifier que `NEXT_PUBLIC_APP_URL=https://alexisia.vercel.app`
   - **ATTENTION:** Pas de `/` à la fin !

2. **Vérifier que l'application a été redéployée**
   - Aller dans Deployments
   - Le dernier déploiement doit être après l'ajout de la variable
   - Si non, redéployer à nouveau

3. **Forcer le rechargement de la page**
   - Appuyer sur Ctrl+Shift+R (rechargement forcé)
   - Ou utiliser la navigation privée

4. **Vérifier les Redirect URLs Supabase**
   - Aller dans Supabase > Authentication > URL Configuration
   - S'assurer que `https://alexisia.vercel.app/auth/callback` est bien présent

### Si vous avez une erreur "Invalid Redirect URL"

C'est que l'URL n'est pas dans la liste Supabase.

**Solution :**
1. Aller dans Supabase > Authentication > URL Configuration
2. Ajouter exactement : `https://alexisia.vercel.app/auth/callback`
3. Sauvegarder
4. Réessayer

---

## 📋 RÉSUMÉ DE LA CONFIGURATION

| Service | Paramètre | Valeur Exacte |
|---------|-----------|---------------|
| **Supabase** | Site URL | `https://alexisia.vercel.app` |
| **Supabase** | Redirect URL (prod) | `https://alexisia.vercel.app/auth/callback` |
| **Supabase** | Redirect URL (dev) | `http://localhost:3000/*` |
| **Vercel** | NEXT_PUBLIC_APP_URL | `https://alexisia.vercel.app` |

---

## 🎯 CHECKLIST FINALE

- [ ] Site URL configurée dans Supabase
- [ ] Redirect URL `https://alexisia.vercel.app/auth/callback` ajoutée
- [ ] Variable `NEXT_PUBLIC_APP_URL` ajoutée dans Vercel
- [ ] Application redéployée dans Vercel
- [ ] Cache navigateur vidé ou navigation privée
- [ ] Test connexion Google effectué
- [ ] ✅ Connexion fonctionne sans redirection vers localhost !

---

## ⏱️ TEMPS TOTAL : ~5 MINUTES

1. Configuration Supabase : 2 min
2. Configuration Vercel : 2 min
3. Redéploiement : 2-3 min (automatique)
4. Test : 1 min

**TOTAL : ~7 minutes**

---

## 🚀 C'EST PARTI !

Suivez les 4 étapes ci-dessus dans l'ordre et votre authentification fonctionnera parfaitement !

Une fois terminé, votre app sera 100% opérationnelle en production ! 🎉
