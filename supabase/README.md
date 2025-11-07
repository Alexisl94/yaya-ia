# Supabase Database Schema

Schéma de base de données pour yaya.ia - Plateforme d'agents IA multi-secteurs.

## Setup

### 1. Créer un projet Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et les clés API

### 2. Appliquer la migration

#### Option A: Via Supabase Dashboard

1. Ouvrir le SQL Editor dans le dashboard Supabase
2. Copier le contenu de `migrations/20250106000000_initial_schema.sql`
3. Exécuter le script

#### Option B: Via Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet
supabase link --project-ref your-project-ref

# Appliquer les migrations
supabase db push
```

### 3. Configurer les variables d'environnement

Copier les clés depuis Supabase Dashboard > Settings > API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Structure de la Base de Données

### Tables Principales

#### `users`
- Profils utilisateurs étendus (liés à `auth.users`)
- Gestion des abonnements Stripe
- Tiers d'abonnement (free, pro, enterprise)

#### `sectors`
- Secteurs d'activité (événementiel, immobilier, etc.)
- Catégorisation des agents

#### `agent_templates`
- Templates d'agents pré-configurés
- Par secteur d'activité
- Avec prompts système optimisés

#### `agents`
- Agents IA créés par les utilisateurs
- Configuration complète (model, temperature, max_tokens)
- Lien avec secteur et template

#### `conversations`
- Threads de conversation entre user et agent
- Statut (active, archived, deleted)
- Métadonnées additionnelles

#### `messages`
- Messages individuels dans les conversations
- Rôle (user, assistant, system)
- Tracking des tokens et latence

#### `usage_logs`
- Logs d'utilisation pour billing et analytics
- Tracking des tokens et coûts
- Par type d'événement

#### `agent_suggestions`
- Suggestions d'agents pour les utilisateurs
- Générées par IA ou basées sur templates

### Vues

#### `user_usage_stats`
Vue matérialisée pour les statistiques d'utilisation:
- Total agents, conversations, messages
- Total tokens utilisés et coût
- Dernière activité

## Row Level Security (RLS)

Toutes les tables utilisateurs ont RLS activé:

- **users**: Un utilisateur ne peut voir/modifier que son profil
- **agents**: Un utilisateur ne peut voir/modifier que ses agents
- **conversations**: Un utilisateur ne peut voir que ses conversations
- **messages**: Un utilisateur ne peut voir que les messages de ses conversations
- **usage_logs**: Un utilisateur ne peut voir que ses logs

Les tables publiques (`sectors`, `agent_templates`) sont en lecture seule pour tous.

## Triggers & Functions

### `handle_updated_at()`
- Mise à jour automatique du champ `updated_at` sur les tables concernées
- Trigger sur UPDATE

### `handle_new_user()`
- Création automatique du profil utilisateur lors de l'inscription
- Trigger sur INSERT dans `auth.users`

## Seed Data

Le script inclut des données de départ:

### 8 Secteurs d'activité
- Événementiel
- Immobilier
- Comptabilité
- Marketing
- Juridique
- Ressources Humaines
- Santé & Bien-être
- Éducation

### Templates d'agents
- Assistant Événementiel
- Agent Immobilier
- (Plus à ajouter)

## Index

Des index sont créés sur les colonnes fréquemment requêtées:

- `agents(user_id, sector_id, is_active)`
- `conversations(user_id, agent_id, status, created_at)`
- `messages(conversation_id, created_at, role)`
- `usage_logs(user_id, created_at, event_type)`

## Backup & Restore

### Backup

```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Via pg_dump (avec connexion directe)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Restore

```bash
# Via Supabase CLI
supabase db reset --db-url postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

## Monitoring

### Performance

Vérifier les requêtes lentes dans Supabase Dashboard > Database > Performance

### Utilisation

```sql
-- Top utilisateurs par tokens
SELECT 
  u.email,
  SUM(ul.tokens_used) as total_tokens,
  SUM(ul.cost_usd) as total_cost
FROM users u
JOIN usage_logs ul ON u.id = ul.user_id
GROUP BY u.id, u.email
ORDER BY total_tokens DESC
LIMIT 10;

-- Agents les plus utilisés
SELECT 
  a.name,
  COUNT(DISTINCT c.id) as conversation_count,
  COUNT(m.id) as message_count
FROM agents a
LEFT JOIN conversations c ON a.id = c.agent_id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY a.id, a.name
ORDER BY message_count DESC
LIMIT 10;
```

## Migrations Futures

Pour ajouter de nouvelles migrations:

```bash
# Créer une nouvelle migration
supabase migration new feature_name

# Éditer le fichier généré dans supabase/migrations/
# Puis appliquer:
supabase db push
```

## Troubleshooting

### Erreur "relation does not exist"
- Vérifier que la migration a bien été appliquée
- Vérifier que vous êtes connecté au bon projet

### Erreur "permission denied"
- Vérifier les politiques RLS
- Vérifier que l'utilisateur est authentifié

### Slow queries
- Vérifier les index
- Utiliser `EXPLAIN ANALYZE` pour analyser les requêtes

## Support

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
