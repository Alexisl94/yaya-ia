# 🇫🇷 Guide Google Cloud Console en Français

## 📍 OÙ VOUS ÊTES

Vous êtes dans Google Cloud Console et l'interface est en français.

## 🎯 CE QU'ON VEUT FAIRE

Créer des identifiants OAuth pour permettre la connexion Google sur votre app.

---

## 🚀 GUIDE ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Aller dans "API et services"

Dans le menu hamburger (☰) en haut à gauche, chercher et cliquer sur :

```
API et services
```

### ÉTAPE 2 : Aller dans "Identifiants"

Dans le menu de gauche, vous devez voir plusieurs options :

```
📋 Identifiants   ← CLIQUEZ ICI
🔒 Écran de consentement OAuth
📊 Tableau de bord
📚 Bibliothèque
```

Cliquez sur **"Identifiants"**

---

### ÉTAPE 3 : Créer des identifiants

En haut de la page, vous devez voir un bouton :

```
+ CRÉER DES IDENTIFIANTS
```

Cliquez dessus, un menu déroulant s'ouvre avec plusieurs options :

```
- Clé API
- ID client OAuth 2.0     ← CHOISIR CELUI-CI
- Compte de service
```

Cliquez sur **"ID client OAuth 2.0"**

---

### ÉTAPE 4 : Configurer l'écran de consentement (PREMIÈRE FOIS SEULEMENT)

**SI c'est la première fois**, vous verrez un message :

```
⚠️ Pour créer un ID client OAuth, vous devez d'abord
   configurer votre écran de consentement
```

Un bouton apparaît : **"CONFIGURER L'ÉCRAN DE CONSENTEMENT"**

Cliquez dessus.

#### 4.1 Type d'utilisateur

Vous arrivez sur une page avec deux options :

```
○ Interne  (pour Google Workspace uniquement)
● Externe  ← CHOISIR CELUI-CI
```

Cochez **"Externe"** puis cliquez sur **"CRÉER"**

#### 4.2 Informations sur l'application

Remplissez le formulaire :

**Nom de l'application :**
```
yaya.ia
```
(ou `alexisia`)

**E-mail d'assistance utilisateur :**
```
[Votre email Google]
```

**Logo de l'application :** (optionnel)
```
Laisser vide pour l'instant
```

**Domaine de l'application :** (optionnel)
```
Laisser vide
```

**Liens :** (optionnel)
```
Laisser vide
```

**Adresses e-mail pour les développeurs :**
```
[Votre email]
```

Cliquez sur **"ENREGISTRER ET CONTINUER"**

#### 4.3 Champs d'application (Scopes)

Cette page liste les autorisations demandées.

**Pour l'instant, ne rien ajouter.**

Cliquez directement sur **"ENREGISTRER ET CONTINUER"**

#### 4.4 Utilisateurs test

Cette page permet d'ajouter des utilisateurs de test.

**En mode "Test", seuls les utilisateurs ajoutés ici pourront se connecter.**

**Pour l'instant, ne rien ajouter** (vous pourrez vous connecter quand même car vous êtes le propriétaire).

Cliquez sur **"ENREGISTRER ET CONTINUER"**

#### 4.5 Récapitulatif

Vérifiez les informations puis cliquez sur :

```
REVENIR AU TABLEAU DE BORD
```

---

### ÉTAPE 5 : Créer l'ID client OAuth (MAINTENANT)

Retournez dans **"Identifiants"** (menu de gauche)

Cliquez à nouveau sur **"+ CRÉER DES IDENTIFIANTS"** → **"ID client OAuth 2.0"**

#### 5.1 Type d'application

Dans le menu déroulant **"Type d'application"**, choisir :

```
Application Web
```

#### 5.2 Nom

Donner un nom à votre client :

```
yaya.ia Web Client
```

#### 5.3 Origines JavaScript autorisées

C'est **TRÈS IMPORTANT** !

Cliquez sur **"+ AJOUTER UN URI"**

**URI 1 :** (pour la production)
```
https://alexisia.vercel.app
```

Cliquez à nouveau sur **"+ AJOUTER UN URI"**

**URI 2 :** (pour le développement local)
```
http://localhost:3000
```

#### 5.4 URI de redirection autorisés

C'est **TRÈS TRÈS IMPORTANT** !

Cliquez sur **"+ AJOUTER UN URI"**

**URI 1 :** (pour Supabase production)
```
https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback
```

Cliquez à nouveau sur **"+ AJOUTER UN URI"**

**URI 2 :** (pour Supabase local)
```
http://localhost:54321/auth/v1/callback
```

#### 5.5 Créer

Une fois tout rempli, cliquez sur le bouton bleu :

```
CRÉER
```

---

### ÉTAPE 6 : Copier vos identifiants

Une fenêtre popup s'affiche avec vos identifiants :

```
Client OAuth créé

Votre ID client
123456789-abc.apps.googleusercontent.com

Votre code secret client
GOCSPX-abcdefghijklmnop
```

**🚨 IMPORTANT : COPIEZ CES DEUX VALEURS !**

**ID client** : Sélectionnez et copiez (Ctrl+C)
**Code secret client** : Cliquez sur l'icône de copie à droite

**GARDEZ-LES DANS UN FICHIER TEXTE TEMPORAIRE !**

Cliquez sur **"OK"** pour fermer la popup.

---

## ✅ RÉCAPITULATIF DE CE QUE VOUS DEVEZ AVOIR

Dans Google Cloud Console → API et services → Identifiants :

Vous devez voir votre **"ID client OAuth 2.0"** avec :

**Origines JavaScript autorisées :**
- `https://alexisia.vercel.app`
- `http://localhost:3000`

**URI de redirection autorisés :**
- `https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback`
- `http://localhost:54321/auth/v1/callback`

---

## 🔄 PROCHAINE ÉTAPE : CONFIGURER SUPABASE

Maintenant que vous avez vos identifiants Google, il faut les mettre dans Supabase :

1. Ouvrir https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz

2. Menu gauche → **"Authentication"**

3. Onglet → **"Providers"**

4. Chercher **"Google"** et cliquer dessus

5. Activer le toggle (mettre en vert) si pas déjà fait

6. **Client ID (for OAuth) :**
   ```
   [COLLER L'ID CLIENT DE GOOGLE]
   ```

7. **Client Secret (for OAuth) :**
   ```
   [COLLER LE CODE SECRET CLIENT DE GOOGLE]
   ```

8. Cliquer sur **"Save"**

---

## 🧪 TESTER

1. Vider le cache ou ouvrir une navigation privée (Ctrl+Shift+N)

2. Aller sur https://alexisia.vercel.app/login

3. Cliquer sur "Connexion avec Google"

4. Une popup Google doit s'ouvrir

5. Sélectionner votre compte Google

6. ✅ Vous devez être connecté !

---

## 🆘 SI VOUS AVEZ UNE ERREUR

### Erreur : "Accès bloqué: la demande de yaya.ia a été bloquée"

C'est normal ! Votre app est en mode "Test".

**Solution rapide :**
1. Google Cloud Console → API et services → Écran de consentement OAuth
2. Cliquer sur **"PUBLIER L'APPLICATION"**
3. Confirmer

**OU** ajouter votre email dans les "Utilisateurs test" :
1. Écran de consentement OAuth
2. Section "Utilisateurs test"
3. **"+ AJOUTER DES UTILISATEURS"**
4. Ajouter votre email
5. Enregistrer

### Erreur : "redirect_uri_mismatch"

Les URIs ne sont pas bonnes.

**Solution :**
1. Retourner dans Identifiants
2. Cliquer sur votre ID client
3. Vérifier les **URI de redirection autorisés**
4. Doit contenir : `https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback`
5. Enregistrer

### Le bouton ne fait rien

**Vérifier dans la console (F12) :**
- Ouvrir la console développeur (F12)
- Onglet "Console"
- Cliquer sur le bouton Google
- Regarder les erreurs affichées en rouge

---

## 📸 CAPTURES D'ÉCRAN (Ce que vous devez voir)

### Dans "Identifiants"

Vous devez voir une ligne avec :
```
Type: ID client OAuth 2.0
Nom: yaya.ia Web Client
```

En cliquant dessus, vous devez voir :
```
Origines JavaScript autorisées:
  https://alexisia.vercel.app
  http://localhost:3000

URI de redirection autorisés:
  https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback
  http://localhost:54321/auth/v1/callback
```

---

## ✅ CHECKLIST FINALE

- [ ] ID client OAuth 2.0 créé dans Google Cloud Console
- [ ] Origines JavaScript : `https://alexisia.vercel.app` ajouté
- [ ] URI de redirection : `https://mzolqvxmdgbwonigsdoz.supabase.co/auth/v1/callback` ajouté
- [ ] ID client et Secret copiés
- [ ] Google activé dans Supabase (toggle vert)
- [ ] ID client collé dans Supabase
- [ ] Secret collé dans Supabase
- [ ] Sauvegardé dans Supabase
- [ ] Cache navigateur vidé
- [ ] Test effectué
- [ ] ✅ Connexion Google fonctionne !

---

## 🎯 RÉSUMÉ EN UNE PHRASE

**Google Cloud Console** → **API et services** → **Identifiants** → **+ CRÉER DES IDENTIFIANTS** → **ID client OAuth 2.0** → Remplir les URLs → Copier ID/Secret → **Supabase** → **Authentication** → **Providers** → **Google** → Coller ID/Secret → **Save**

---

## 💡 BESOIN D'AIDE ?

Dites-moi à quelle étape vous êtes bloqué et je vous aiderai ! 😊
