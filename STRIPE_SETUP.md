# Configuration Stripe - Workflow de Paiement

Ce document explique comment configurer et tester le workflow de paiement Stripe pour yaya.ia.

## Architecture du Système de Paiement

### Plans d'Abonnement

**Plan GRATUIT (Free)**
- 1 agent IA
- 1 000 Doggos/mois (~0.50€ de tokens)
- ~50 conversations/mois
- Modèles économiques uniquement (Haiku, GPT-4o-mini)
- Support communautaire

**Plan PRO (10€/mois)**
- 3 agents IA
- 10 000 Doggos/mois (5€ de tokens)
- ~300 conversations/mois
- Tous modèles économiques + quotas premium
- 50 requêtes Sonnet/mois
- 20 requêtes GPT-4o/mois
- Support prioritaire

**Plan ENTERPRISE (30€/mois)**
- 10 agents IA
- 30 000 Doggos/mois (15€ de tokens)
- ~800 conversations/mois
- Tous les modèles disponibles
- 150 requêtes Sonnet/mois
- 50 requêtes GPT-4o/mois
- 10 requêtes Opus/mois
- Support premium 24/7

## Configuration Stripe

### 1. Créer un compte Stripe

1. Aller sur [stripe.com](https://stripe.com) et créer un compte
2. Activer le mode Test pour le développement

### 2. Récupérer les clés API

Dans le dashboard Stripe (mode Test):
1. Aller dans **Developers > API Keys**
2. Copier la **Publishable key** et la **Secret key**
3. Les ajouter dans votre `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 3. Créer les produits et prix

#### Produit PRO

1. Aller dans **Products > Add product**
2. Nom: "yaya.ia Pro"
3. Description: "3 agents IA, 10 000 Doggos/mois"
4. Créer 2 prix récurrents:
   - **Mensuel**: 10€/mois
   - **Annuel**: 96€/an (2 mois offerts)
5. Copier les Price IDs (format: `price_xxxxx`)

#### Produit ENTERPRISE

1. Aller dans **Products > Add product**
2. Nom: "yaya.ia Enterprise"
3. Description: "10 agents IA, 30 000 Doggos/mois"
4. Créer 2 prix récurrents:
   - **Mensuel**: 30€/mois
   - **Annuel**: 288€/an (2 mois offerts)
5. Copier les Price IDs

### 4. Configurer les Price IDs

Ajouter les Price IDs dans `.env.local`:

```bash
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxxxx
```

### 5. Configurer les Webhooks (pour la production)

1. Aller dans **Developers > Webhooks**
2. Ajouter un endpoint: `https://votre-domaine.com/api/stripe/webhook`
3. Sélectionner les événements:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copier le **Webhook signing secret** dans `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### Pour tester localement les webhooks

Installer Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
```

Authentifier:
```bash
stripe login
```

Écouter les webhooks en local:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Cette commande vous donnera un webhook secret temporaire à utiliser dans `.env.local`.

## Workflow de Paiement

### 1. Choix du plan

L'utilisateur va dans **Settings > Subscription** et clique sur "Passer au Pro" ou "Passer à Enterprise".

### 2. Création de la session Checkout

```typescript
POST /api/stripe/checkout
Body: {
  planId: 'pro' | 'enterprise',
  billingPeriod: 'monthly' | 'yearly'
}
```

Le backend:
1. Vérifie l'authentification
2. Crée ou récupère le customer Stripe
3. Crée une session Checkout Stripe
4. Retourne l'URL de paiement

### 3. Redirection vers Stripe Checkout

L'utilisateur est redirigé vers la page Stripe Checkout hébergée où il entre ses informations de paiement.

### 4. Paiement et webhook

Après paiement réussi:
1. Stripe envoie un webhook `checkout.session.completed`
2. Notre endpoint `/api/stripe/webhook` traite l'événement
3. La base de données est mise à jour:
   - `subscription_tier` → 'pro' ou 'enterprise'
   - `subscription_status` → 'active'
   - `stripe_customer_id` et `stripe_subscription_id` sont enregistrés

### 5. Redirection de succès

L'utilisateur est redirigé vers `/settings?success=true` avec son abonnement activé.

### 6. Gestion de l'abonnement

L'utilisateur peut gérer son abonnement via le Customer Portal Stripe:

```typescript
POST /api/stripe/portal
```

Cela lui permet de:
- Changer de plan
- Mettre à jour ses informations de paiement
- Annuler son abonnement
- Voir ses factures

## Vérification des limites

Le système vérifie automatiquement les limites avant chaque action:

### Création d'agent

```typescript
import { checkCanCreateAgent } from '@/lib/subscription/limits-checker'

const check = await checkCanCreateAgent(userId)
if (!check.allowed) {
  return res.status(403).json({ error: check.reason })
}
```

### Envoi de message

```typescript
import { checkAllLimitsForMessage } from '@/lib/subscription/limits-checker'

const check = await checkAllLimitsForMessage(userId, model)
if (!check.allowed) {
  return res.status(403).json({ error: check.reason })
}
```

### Utilisation d'un modèle

```typescript
import { checkCanUseModel } from '@/lib/subscription/limits-checker'

const check = await checkCanUseModel(userId, 'gpt-4o')
if (!check.allowed) {
  return res.status(403).json({ error: check.reason })
}
```

## Test du Workflow

### Mode Test Stripe

1. Utiliser les cartes de test Stripe:

**Paiement réussi:**
- Numéro: `4242 4242 4242 4242`
- Date: n'importe quelle date future
- CVC: n'importe quoi

**Paiement refusé:**
- Numéro: `4000 0000 0000 0002`

**Authentification 3D Secure:**
- Numéro: `4000 0025 0000 3155`

### Scénarios à tester

1. **Upgrade Free → Pro**
   - Se connecter avec un compte gratuit
   - Aller dans Settings
   - Cliquer sur "Passer au Pro"
   - Compléter le paiement avec la carte test
   - Vérifier la redirection et l'activation

2. **Upgrade Pro → Enterprise**
   - Utiliser un compte Pro
   - Cliquer sur "Passer à Enterprise"
   - Vérifier que le plan change correctement

3. **Gestion de l'abonnement**
   - Avec un compte payant, cliquer sur "Gérer mon abonnement"
   - Tester l'annulation (l'abonnement reste actif jusqu'à la fin de la période)
   - Tester le changement de moyen de paiement

4. **Vérification des limites**
   - Créer le nombre maximum d'agents
   - Tenter d'en créer un de plus
   - Vérifier le message d'erreur

5. **Webhooks**
   - Avec Stripe CLI en local, tester l'annulation d'un abonnement
   - Vérifier que le profil revient en "free"

## Structure des fichiers

```
lib/
├── pricing/
│   ├── subscription-plans.ts     # Configuration des plans et limites
│   └── model-pricing.ts          # Prix des modèles LLM
├── stripe/
│   └── stripe-server.ts          # Initialisation Stripe côté serveur
└── subscription/
    └── limits-checker.ts         # Vérification des limites

app/api/
├── stripe/
│   ├── checkout/route.ts         # Création session checkout
│   ├── webhook/route.ts          # Traitement webhooks
│   └── portal/route.ts           # Portail client
└── subscription/
    └── limits/route.ts           # API limites utilisateur

components/
└── settings/
    └── subscription-section.tsx  # UI des plans d'abonnement
```

## Checklist de mise en production

- [ ] Passer Stripe en mode Live
- [ ] Mettre à jour les clés API dans les variables d'environnement
- [ ] Créer les produits et prix en mode Live
- [ ] Configurer les webhooks en production
- [ ] Tester tous les scénarios en mode Live (avec de petits montants)
- [ ] Configurer les emails Stripe (reçus, rappels de paiement)
- [ ] Activer le Customer Portal
- [ ] Définir les paramètres de facturation (TVA si applicable)
- [ ] Configurer les rappels de paiement échoué
- [ ] Mettre en place le monitoring des paiements

## Support et Documentation

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
