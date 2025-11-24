# 🤖 yaya.ia

Plateforme SaaS permettant aux professionnels libéraux de créer et gérer des agents IA personnalisés pour automatiser leurs tâches métier.

> 🚀 **Prêt pour la production** | Système de paiement Stripe intégré | Workflow complet d'abonnement

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Alexisl94/yaya-ia)

## ✨ Fonctionnalités

### 🎯 Gestion d'Agents IA
- Création d'agents personnalisés par secteur d'activité
- Support multi-modèles (Claude Haiku, Sonnet, Opus, GPT-4o, GPT-4o-mini)
- Configuration avancée (température, max tokens, prompts système)
- Agents de type Compagnon ou Tâche

### 💬 Chat Intelligent
- Interface de chat moderne et réactive
- Support des pièces jointes (PDF, images)
- Extraction de texte automatique
- Recherche web intégrée (SerpAPI)
- Historique des conversations

### 💳 Système d'Abonnement
- **Plan Gratuit**: 1 agent, 1000 Doggos/mois, modèles économiques
- **Plan Pro (10€/mois)**: 3 agents, 10000 Doggos/mois, quotas premium
- **Plan Enterprise (30€/mois)**: 10 agents, 30000 Doggos/mois, tous modèles
- Paiements sécurisés via Stripe
- Customer Portal pour gestion self-service
- Webhooks automatisés

### 🎨 Interface Utilisateur
- Design moderne avec Dark Mode
- Responsive (mobile-first)
- Composants shadcn/ui
- Animations fluides

### 🔐 Sécurité & Auth
- Authentification Supabase
- Row Level Security (RLS)
- Gestion des sessions
- Protection des routes

## 🛠 Stack Technique

- **Frontend & Backend**: Next.js 16 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **AI**: Anthropic Claude API, OpenAI GPT-4o
- **Search**: SerpAPI
- **Payments**: Stripe (Checkout, Webhooks, Customer Portal)
- **Deploy**: Vercel
- **State Management**: Zustand

## Structure du Projet

```
/app
  /api
    /agents          # API endpoints pour les agents IA
    /auth            # API endpoints pour l'authentification
  /(auth)
    /login           # Page de connexion
    /signup          # Page d'inscription
  /(app)
    /onboarding      # Onboarding des nouveaux utilisateurs
    /chat            # Interface de chat avec les agents
    /agents          # Gestion des agents IA
    /settings        # Paramètres utilisateur
  /landing           # Page d'accueil publique
/components
  /ui                # Composants shadcn/ui
  /chat              # Composants de chat
  /agents            # Composants de gestion d'agents
  /layouts           # Layouts réutilisables
/lib
  /supabase          # Configuration Supabase
  /llm               # Intégrations LLM (Claude, GPT)
  /utils             # Utilitaires
/types               # Types TypeScript
```

## Installation

1. Cloner le repository
2. Installer les dépendances:

```bash
npm install
```

3. Configurer les variables d'environnement:

Copier `.env.example` vers `.env.local` et remplir les valeurs:

```bash
cp .env.example .env.local
```

Variables requises:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **AI**: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

4. Lancer le serveur de développement:

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Configuration Supabase

1. Créer un nouveau projet sur [Supabase](https://supabase.com)
2. Récupérer l'URL et les clés API depuis les paramètres du projet
3. Créer les tables nécessaires (voir `/supabase/schema.sql` - à créer)

## Ajouter des Composants shadcn/ui

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

## Scripts Disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Build de production
- `npm run start` - Démarrer le serveur de production
- `npm run lint` - Linter le code

## Deployment

Le déploiement sur Vercel est automatique depuis la branche `main`.

1. Connecter le repository à Vercel
2. Configurer les variables d'environnement
3. Déployer

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guide complet de déploiement sur Vercel
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Configuration et test du système de paiement
- **[SETUP_AVATARS_STORAGE.md](./SETUP_AVATARS_STORAGE.md)** - Configuration du stockage d'avatars
- **[GUIDE_CONFIGURATION_SUPABASE.md](./GUIDE_CONFIGURATION_SUPABASE.md)** - Configuration Supabase complète

## 🎯 Roadmap

### ✅ Version 1.0 (Actuelle)
- [x] Authentification et profils utilisateurs
- [x] Création et gestion d'agents IA
- [x] Système de chat avec streaming
- [x] Support multi-modèles (Claude + GPT)
- [x] Système d'abonnement Stripe complet
- [x] Vérification des limites en temps réel
- [x] Pièces jointes et extraction de texte
- [x] Recherche web intégrée
- [x] Dark mode
- [x] Interface responsive

### 🚧 Version 1.1 (À venir)
- [ ] Partage de conversations
- [ ] Export de conversations (PDF, Markdown)
- [ ] API publique pour intégrations
- [ ] Webhooks personnalisés
- [ ] Analytics avancés
- [ ] Templates d'agents par secteur
- [ ] Marketplace d'agents

### 🔮 Version 2.0 (Futur)
- [ ] Mode multi-agents (collaboration)
- [ ] Fine-tuning de modèles
- [ ] Intégrations tierces (Zapier, Make)
- [ ] Mode vocal
- [ ] Application mobile

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 👤 Auteur

Créé avec ❤️ par Alexis

---

**Repository**: https://github.com/Alexisl94/yaya-ia
**Déployé sur**: Vercel
**Status**: ✅ Production Ready
