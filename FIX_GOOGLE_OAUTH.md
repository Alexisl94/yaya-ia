# 🔧 Corriger l'Authentification Google OAuth

## ❌ PROBLÈME

Cliquer sur "Connexion avec Google" ne fait rien, vous restez bloqué sur la page de login.

URL actuelle : `https://alexisia.vercel.app/login?redirect=%2Fchat`

## 🎯 CAUSES POSSIBLES

1. Google OAuth n'est pas configuré dans Supabase
2. Les URLs autorisées ne sont pas configurées dans Google Cloud Console
3. Les clés Client ID/Secret ne sont pas correctement définies

## ✅ SOLUTION COMPLÈTE

---

### ÉTAPE 1 : Vérifier la configuration Google OAuth dans Supabase

#### 1.1 Ouvrir Supabase Dashboard
→ https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz

#### 1.2 Aller dans Authentication
→ Menu gauche : "Authentication"

#### 1.3 Aller dans Providers
→ Onglet "Providers"

#### 1.4 Trouver Google

Faire défiler jusqu'à "Google" et cliquer dessus

#### 1.5 Vérifier si Google est activé

**Si Google est DÉSACTIVÉ (toggle gris) :**
→ Vous devez le configurer (suivre les étapes ci-dessous)

**Si Google est ACTIVÉ (toggle vert) :**
→ Vérifier les paramètres (Client ID, Secret)

---

### ÉTAPE 2 : Configurer Google Cloud Console

#### 2.1 Vérifier si vous avez un projet Google Cloud

**Option A : Vous avez déjà un projet**
→ Aller sur https://console.cloud.google.com
→ Sélectionner votre projet

**Option B : Vous devez créer un projet**
→ Aller sur https://console.cloud.google.com
→ Cliquer sur le nom du projet en haut
→ Cliquer sur "New Project"
→ Nom : "yaya-ia" ou "alexisia"
→ Créer

#### 2.2 Activer Google+ API

1. Dans le menu hamburger (☰) → "APIs & Services" → "Library"
2. Chercher "Google+ API"
3. Cliquer dessus
4. Cliquer sur "Enable"

#### 2.3 Créer des identifiants OAuth

1. Menu hamburger (☰) → "APIs & Services" → "Credentials"
2. Cliquer sur "+ CREATE CREDENTIALS"
3. Choisir "OAuth client ID"

**Si c'est la première fois :**
4. Cliquer sur "CONFIGURE CONSENT SCREEN"
5. Choisir "External"
6. Cliquer "CREATE"
7. Remplir :
   - App name : "yaya.ia" ou "alexisia"
   - User support email : votre email
   - Developer contact : votre email
8. Cliquer "SAVE AND CONTINUE"
9. Ignorer "Scopes" → "SAVE AND CONTINUE"
10. Ignorer "Test users" → "SAVE AND CONTINUE"
11. Revenir à "Credentials"

#### 2.4 Créer le OAuth Client ID

1. "+ CREATE CREDENTIALS" → "OAuth client ID"
2. Application type : "Web application"
3. Name : "yaya.ia Web Client"

**Authorized JavaScript origins :**
Cliquer sur "+ Add URI" et ajouter :
```
https://alexisia.vercel.app
```

Cliquer sur "+ Add URI" à nouveau et ajouter :
```
http://localhost:3000
```

**Authorized redirect URIs :**
Cliquer sur "+ Add URI" et ajouter :
```
https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback
```

Cliquer sur "+ Add URI" à nouveau et ajouter :
```
http://localhost:54321/auth/v1/callback
```

4. Cliquer sur "CREATE"

#### 2.5 Copier les identifiants

Une popup s'affiche avec :
- **Client ID** : `xxx.apps.googleusercontent.com`
- **Client Secret** : `GOCSPX-xxx`

**COPIEZ CES DEUX VALEURS** (vous en aurez besoin pour Supabase)

---

### ÉTAPE 3 : Configurer Google OAuth dans Supabase

#### 3.1 Retourner dans Supabase
→ https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz

#### 3.2 Authentication → Providers → Google

#### 3.3 Activer Google

Mettre le toggle sur "Enabled" (vert)

#### 3.4 Remplir les champs

**Client ID (for OAuth) :**
```
[Coller votre Client ID de Google Cloud Console]
```

**Client Secret (for OAuth) :**
```
[Coller votre Client Secret de Google Cloud Console]
```

**Authorized Client IDs :**
```
[Laisser vide pour l'instant]
```

#### 3.5 Sauvegarder

Cliquer sur "Save"

---

### ÉTAPE 4 : Vérifier les URLs de redirection Supabase

#### 4.1 Authentication → URL Configuration

Vérifier que vous avez bien :

**Site URL :**
```
https://alexisia.vercel.app
```

**Redirect URLs :**
```
https://alexisia.vercel.app/auth/callback
http://localhost:3000/*
```

#### 4.2 Sauvegarder si modifié

---

### ÉTAPE 5 : Tester

#### 5.1 Vider le cache
- Ouvrir une fenêtre de navigation privée (Ctrl+Shift+N)
- Ou vider le cache (Ctrl+Shift+Delete)

#### 5.2 Tester la connexion

1. Aller sur https://alexisia.vercel.app/login
2. Cliquer sur "Connexion avec Google"
3. Vous devez voir la popup Google OAuth
4. Sélectionner votre compte Google
5. Accepter les permissions
6. Vous devez être redirigé vers https://alexisia.vercel.app/chat

---

## 🔍 VÉRIFICATIONS

### Si le bouton ne fait toujours rien

**1. Ouvrir la console du navigateur (F12)**
- Onglet "Console"
- Cliquer sur "Connexion avec Google"
- Regarder les erreurs

**Erreurs possibles :**

**A) "Invalid client_id"**
→ Le Client ID dans Supabase est incorrect
→ Revérifier et coller à nouveau

**B) "redirect_uri_mismatch"**
→ L'URL de callback n'est pas autorisée dans Google Cloud Console
→ Ajouter : `https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback`

**C) "popup blocked"**
→ Votre navigateur bloque les popups
→ Autoriser les popups pour alexisia.vercel.app

**D) Aucune erreur, mais rien ne se passe**
→ Vérifier que Google est bien activé dans Supabase (toggle vert)

### Si vous êtes redirigé mais pas authentifié

**Vérifier les cookies**
- F12 → Application → Cookies
- Vérifier qu'il y a des cookies Supabase

**Si pas de cookies :**
→ Problème avec les URLs de redirection
→ Revérifier ÉTAPE 4

---

## 📋 CHECKLIST COMPLÈTE

### Google Cloud Console
- [ ] Projet créé
- [ ] Google+ API activée
- [ ] Consent Screen configuré
- [ ] OAuth Client ID créé
- [ ] Authorized origins : `https://alexisia.vercel.app`
- [ ] Authorized redirect : `https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback`
- [ ] Client ID et Secret copiés

### Supabase
- [ ] Google Provider activé (toggle vert)
- [ ] Client ID configuré
- [ ] Client Secret configuré
- [ ] Site URL : `https://alexisia.vercel.app`
- [ ] Redirect URL : `https://alexisia.vercel.app/auth/callback`

### Test
- [ ] Cache vidé ou navigation privée
- [ ] Clic sur "Connexion Google"
- [ ] Popup Google s'ouvre
- [ ] Connexion réussie
- [ ] Redirection vers /chat
- [ ] ✅ Authentifié !

---

## 🆘 SI VOUS N'AVEZ PAS ENCORE CONFIGURÉ GOOGLE OAUTH

### Alternative temporaire : Utiliser Email/Password

En attendant de configurer Google OAuth, vous pouvez :

1. Aller sur https://alexisia.vercel.app/signup
2. S'inscrire avec Email + Password
3. Vérifier votre email
4. Vous connecter

**C'est plus rapide pour tester l'app !**

---

## 💡 IMPORTANT

### Environnements multiples

Si vous développez en local ET en production :

**Authorized JavaScript origins :**
```
https://alexisia.vercel.app
http://localhost:3000
```

**Authorized redirect URIs :**
```
https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback
http://localhost:54321/auth/v1/callback
```

### Mode Test Google OAuth

Par défaut, votre app Google OAuth est en "Testing mode" :
- Max 100 utilisateurs
- Seulement les emails que vous ajoutez dans "Test users"

**Pour la production :**
1. Google Cloud Console
2. OAuth consent screen
3. Cliquer sur "PUBLISH APP"
4. Attendre la vérification Google (peut prendre quelques jours)

---

## 🚀 RÉSUMÉ

1. **Google Cloud Console** : Créer OAuth credentials
2. **Supabase** : Activer Google Provider et configurer avec Client ID/Secret
3. **URLs** : Vérifier que toutes les URLs sont correctes
4. **Tester** : Vider le cache et réessayer

**Temps estimé : 10-15 minutes**

Une fois configuré, ça fonctionnera parfaitement ! 🎉
