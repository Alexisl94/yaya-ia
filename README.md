# yaya.ia

Plateforme SaaS permettant aux professionnels libéraux de créer et gérer des agents IA personnalisés pour automatiser leurs tâches métier.

> 🚀 Application déployée avec toutes les corrections de build Vercel

## Stack Technique

- **Frontend & Backend**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Anthropic Claude API (primary), OpenAI (fallback)
- **Payments**: Stripe
- **Deploy**: Vercel

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

## Prochaines Étapes

- [ ] Implémenter l'authentification Supabase
- [ ] Créer les API routes pour les agents
- [ ] Intégrer Claude API et OpenAI
- [ ] Implémenter le système de chat
- [ ] Ajouter la gestion des abonnements Stripe
- [ ] Créer les pages d'onboarding
- [ ] Implémenter le dashboard utilisateur
# Build 1763665251
