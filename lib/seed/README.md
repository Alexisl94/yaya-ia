# Seed Scripts

Scripts pour peupler la base de données avec des données initiales.

## Installation

Les dépendances nécessaires sont déjà installées:
- `tsx` - Pour exécuter les fichiers TypeScript
- `dotenv` - Pour charger les variables d'environnement

## Configuration

Avant de lancer le seed, configurer les variables d'environnement dans `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Important**: Utiliser la clé `SERVICE_ROLE_KEY`, pas la clé `ANON_KEY`. La service role key permet de bypasser le RLS (Row Level Security).

## Seed Secteurs

Peuple la table `sectors` avec 9 secteurs pré-configurés.

### Exécution

```bash
npm run seed:sectors
```

### Secteurs inclus

1. 🎉 **Événementiel** - Organisateur d'événements, wedding planner
2. 🏠 **Immobilier** - Agent immobilier, gestionnaire de biens
3. 🧮 **Comptabilité** - Expert-comptable, gestionnaire de paie
4. 📈 **Marketing** - Consultant marketing, traffic manager
5. ⚖️ **Juridique** - Avocat, juriste d'entreprise
6. 🏥 **Santé & Bien-être** - Professionnel de santé, coach
7. 🍽️ **Restauration** - Restaurateur, chef cuisinier
8. 🎓 **Éducation & Formation** - Formateur, enseignant
9. 💼 **Autre** - Secteur générique

### Fonctionnalités

- **Upsert**: Le script utilise `upsert` basé sur le `slug`. Si un secteur existe déjà, il sera mis à jour.
- **Idempotent**: Peut être exécuté plusieurs fois sans créer de doublons
- **Migration automatique**: Applique automatiquement les nouvelles colonnes si nécessaire

### Structure des données

Chaque secteur contient:
- `name` - Nom du secteur
- `slug` - Identifiant unique (URL-friendly)
- `description` - Description du secteur
- `icon` - Emoji représentant le secteur
- `color` - Couleur hex pour l'UI
- `base_expertise` - Contexte d'expertise détaillé pour les agents
- `common_tasks` - Liste des tâches courantes (array)
- `legal_context` - Obligations légales et réglementaires

### Output

```bash
🌱 Starting sectors seed...

✅ Successfully seeded 9 sectors:

  1. 🎉 Événementiel (evenementiel)
  2. 🏠 Immobilier (immobilier)
  3. 🧮 Comptabilité (comptabilite)
  4. 📈 Marketing (marketing)
  5. ⚖️ Juridique (juridique)
  6. 🏥 Santé & Bien-être (sante)
  7. 🍽️ Restauration (restauration)
  8. 🎓 Éducation & Formation (education)
  9. 💼 Autre (autre)

🎉 Seed completed successfully!

✨ Done!
```

## Ajouter un nouveau secteur

1. Éditer `lib/seed/sectors.ts`
2. Ajouter un nouvel objet dans le tableau `SECTORS`:

```typescript
{
  name: 'Nouveau Secteur',
  slug: 'nouveau-secteur',
  description: 'Description...',
  icon: '🎯',
  color: '#3b82f6',
  base_expertise: `Contexte d'expertise...`,
  common_tasks: [
    'Tâche 1',
    'Tâche 2'
  ],
  legal_context: 'Obligations légales...',
  is_active: true
}
```

3. Relancer le seed:

```bash
npm run seed:sectors
```

## Troubleshooting

### Erreur: Missing Supabase environment variables

Vérifier que `.env.local` contient les bonnes variables:
```bash
cat .env.local | grep SUPABASE
```

### Erreur: permission denied

Vérifier que vous utilisez bien la `SERVICE_ROLE_KEY` et non l'`ANON_KEY`.

### Erreur: relation does not exist

Appliquer d'abord les migrations SQL:
```bash
# Dans Supabase Dashboard > SQL Editor
# Exécuter: supabase/migrations/20250106000000_initial_schema.sql
# Puis: supabase/migrations/20250106000001_add_sectors_metadata.sql
```

## Créer un nouveau script de seed

1. Créer un nouveau fichier dans `lib/seed/`:

```typescript
// lib/seed/seed-templates.ts
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function seedTemplates() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Your seed logic here
}

seedTemplates()
```

2. Ajouter le script dans `package.json`:

```json
{
  "scripts": {
    "seed:templates": "tsx lib/seed/seed-templates.ts"
  }
}
```

## Scripts disponibles

- `npm run seed:sectors` - Seed les secteurs d'activité

## Prochains seeds à créer

- [ ] Agent templates (templates d'agents par secteur)
- [ ] Exemple d'agents pour la démo
- [ ] Secteurs additionnels sur demande
