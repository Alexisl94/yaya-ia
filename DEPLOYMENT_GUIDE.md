# Guide de Déploiement - yaya.ia

Ce guide vous explique comment déployer yaya.ia en production sur Vercel.

## ✅ Code déjà déployé sur GitHub

Le code a été poussé avec succès sur : **https://github.com/Alexisl94/yaya-ia**

Commit : `feat: Implémentation complète du système de paiement Stripe et workflow d'abonnement`

## 🚀 Déploiement sur Vercel

### Option 1 : Via l'interface web Vercel (Recommandé)

1. **Aller sur Vercel**
   - Accéder à https://vercel.com
   - Se connecter avec votre compte GitHub

2. **Importer le projet**
   - Cliquer sur "Add New Project"
   - Sélectionner le repository `yaya-ia`
   - Cliquer sur "Import"

3. **Configuration du projet**
   - **Framework Preset**: Next.js (détecté automatiquement)
   - **Root Directory**: `./` (par défaut)
   - **Build Command**: `next build` (par défaut)
   - **Output Directory**: `.next` (par défaut)

4. **Variables d'environnement** (IMPORTANT !)

   Ajouter toutes ces variables dans Vercel :

   ```bash
   # Supabase (OBLIGATOIRE)
   NEXT_PUBLIC_SUPABASE_URL=https://mzolqvxmdgbwonigsdoz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2xxdnhtZGdid29uaWdzZG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjI0OTIsImV4cCI6MjA3ODAzODQ5Mn0.CJzG5eiqLeSwKrdMwpQo7X9-ZWpFpbYHYIETegn4ZZE
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16b2xxdnhtZGdid29uaWdzZG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ2MjQ5MiwiZXhwIjoyMDc4MDM4NDkyfQ.0Vln_Ii5aTi43BTgvoew5szQTlJPdt533cKG34okcn0

   # Anthropic API (OBLIGATOIRE)
   ANTHROPIC_API_KEY=votre_clé_anthropic

   # OpenAI API (OBLIGATOIRE)
   OPENAI_API_KEY=votre_clé_openai

   # SerpAPI (OBLIGATOIRE pour la recherche web)
   SERPAPI_API_KEY=votre_clé_serpapi

   # Stripe (OPTIONNEL - peut être configuré plus tard)
   STRIPE_SECRET_KEY=sk_live_votre_clé_stripe_live
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_stripe_live
   STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_production
   STRIPE_PRICE_PRO_MONTHLY=price_xxx_pro_monthly
   STRIPE_PRICE_PRO_YEARLY=price_xxx_pro_yearly
   STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx_enterprise_monthly
   STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx_enterprise_yearly

   # Application Configuration
   NEXT_PUBLIC_APP_URL=https://votre-domaine-vercel.vercel.app
   NODE_ENV=production
   ```

5. **Déployer**
   - Cliquer sur "Deploy"
   - Attendre la fin du build (2-3 minutes)
   - Votre application sera disponible sur une URL Vercel

### Option 2 : Via la CLI Vercel

Si vous préférez utiliser la ligne de commande :

```bash
# 1. S'authentifier (ouvrir le lien dans le navigateur)
vercel login

# 2. Déployer en production
vercel --prod

# 3. Suivre les prompts :
# - Set up and deploy: Yes
# - Which scope: Choisir votre compte
# - Link to existing project: No
# - Project name: yaya-ia
# - Directory: ./
# - Override settings: No
```

## 📋 Après le déploiement

### 1. Configurer l'URL de production dans Supabase

1. Aller dans votre projet Supabase
2. **Authentication > URL Configuration**
3. Ajouter l'URL de production dans :
   - **Site URL**: `https://votre-app.vercel.app`
   - **Redirect URLs**: `https://votre-app.vercel.app/auth/callback`

### 2. Configurer Stripe (si vous utilisez les paiements)

#### A. Passer en mode Live

1. Aller sur https://dashboard.stripe.com
2. Basculer du mode "Test" au mode "Live" (toggle en haut à droite)

#### B. Créer les produits en mode Live

Créer exactement les mêmes produits qu'en Test :

**Produit Pro (10€/mois)**
- Products > Add product
- Prix mensuel : 10€
- Prix annuel : 96€ (2 mois offerts)
- Copier les Price IDs

**Produit Enterprise (30€/mois)**
- Products > Add product
- Prix mensuel : 30€
- Prix annuel : 288€ (2 mois offerts)
- Copier les Price IDs

#### C. Récupérer les clés Live

1. Developers > API Keys
2. Copier la **Publishable key** et **Secret key** (mode Live)
3. Les ajouter dans les variables d'environnement Vercel

#### D. Configurer le webhook en production

1. Developers > Webhooks > Add endpoint
2. URL : `https://votre-app.vercel.app/api/stripe/webhook`
3. Sélectionner les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copier le **Signing secret**
5. L'ajouter dans Vercel comme `STRIPE_WEBHOOK_SECRET`

#### E. Activer le Customer Portal

1. Settings > Billing > Customer portal
2. Activer "Allow customers to update their payment methods"
3. Activer "Allow customers to cancel their subscriptions"
4. Configurer les autres options selon vos besoins

### 3. Tester le déploiement

1. **Page d'accueil**
   - Accéder à `https://votre-app.vercel.app`
   - Vérifier que la page se charge correctement

2. **Authentification**
   - S'inscrire avec un nouvel utilisateur
   - Vérifier la réception de l'email de confirmation

3. **Fonctionnalités de base**
   - Créer un agent
   - Envoyer un message
   - Vérifier que le système de Doggos fonctionne

4. **Système de paiement** (si Stripe configuré)
   - Aller dans Settings
   - Cliquer sur "Passer au Pro"
   - Tester avec une carte de test d'abord !
   - Vérifier que le webhook fonctionne

### 4. Mettre à jour l'URL dans le code (optionnel)

Si vous avez un domaine personnalisé, mettez à jour :

```bash
# Dans Vercel > Settings > Domains
# Ajouter votre domaine personnalisé

# Puis mettre à jour la variable d'environnement
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

## 🔧 Maintenance et mises à jour

### Déploiement automatique

Vercel déploie automatiquement à chaque push sur la branche `master`.

Pour déployer manuellement :

```bash
git add .
git commit -m "votre message"
git push origin master
```

### Voir les logs

1. Aller sur https://vercel.com
2. Sélectionner votre projet
3. Onglet "Deployments" pour voir l'historique
4. Cliquer sur un déploiement pour voir les logs

### Variables d'environnement

Pour ajouter/modifier des variables :

1. Vercel Dashboard > Votre projet > Settings > Environment Variables
2. Ajouter ou modifier les variables
3. Redéployer pour prendre en compte les changements

## 📊 Monitoring

### Vercel Analytics (optionnel)

1. Aller dans Settings > Analytics
2. Activer Vercel Analytics
3. Vous aurez accès aux métriques de performance

### Stripe Dashboard

Pour suivre les paiements :
- https://dashboard.stripe.com/payments (mode Live)
- https://dashboard.stripe.com/subscriptions (abonnements)

### Supabase Dashboard

Pour suivre l'usage :
- https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz
- Onglet "Database" pour voir les données
- Onglet "Auth" pour les utilisateurs

## 🆘 Résolution de problèmes

### Le build échoue

- Vérifier les logs dans Vercel
- S'assurer que toutes les variables d'environnement sont définies
- Vérifier qu'il n'y a pas d'erreurs TypeScript

### Les paiements ne fonctionnent pas

- Vérifier que les clés Stripe Live sont correctes
- Vérifier que le webhook est configuré avec la bonne URL
- Vérifier les logs Stripe : Dashboard > Developers > Logs

### L'authentification ne fonctionne pas

- Vérifier que l'URL de production est configurée dans Supabase
- Vérifier que les redirect URLs sont corrects

### Les variables d'environnement ne sont pas prises en compte

- Aller dans Settings > Environment Variables
- Vérifier qu'elles sont définies pour "Production"
- Redéployer après modification

## 📝 Checklist de déploiement

- [ ] Code poussé sur GitHub ✅
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] URL de production ajoutée dans Supabase
- [ ] Authentification testée
- [ ] Création d'agent testée
- [ ] Chat testé
- [ ] Stripe configuré en mode Live (optionnel)
- [ ] Webhook Stripe configuré (optionnel)
- [ ] Paiement test effectué (optionnel)
- [ ] Domaine personnalisé configuré (optionnel)

## 🎉 C'est terminé !

Votre application est maintenant en production et accessible au monde entier !

URL GitHub : https://github.com/Alexisl94/yaya-ia
URL Vercel : https://[votre-projet].vercel.app

Pour toute question, consultez :
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Stripe](https://stripe.com/docs)
