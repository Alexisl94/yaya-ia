# 🤖 Système de Génération de Prompts - yaya.ia

Système intelligent de génération de system prompts personnalisés pour les agents IA.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API](#api)
- [Exemples](#exemples)
- [Tests](#tests)

## 🎯 Vue d'ensemble

Le système de génération de prompts transforme les données du formulaire utilisateur en prompts système optimisés pour les LLM. Il supporte:

- **2 types d'agents**: Génériques (polyvalents) et Spécialisés (basés sur templates)
- **3 tons de communication**: Professional, Friendly, Expert
- **9 secteurs prédéfinis**: Événementiel, Immobilier, Comptabilité, Marketing, etc.
- **Personnalisation complète**: Nom, type d'entreprise, clientèle cible, spécificités

### ✨ Fonctionnalités

- ✅ Génération de prompts personnalisés et contextuels
- ✅ Templates de ton prédéfinis (professional, friendly, expert)
- ✅ Support des agents génériques et spécialisés
- ✅ Injection automatique du contexte métier
- ✅ Gestion du contexte légal par secteur
- ✅ Estimation du nombre de tokens
- ✅ Validation des données d'entrée
- ✅ Versioning des prompts

## 🚀 Installation

Les fichiers sont déjà dans le projet. Pour les utiliser:

```typescript
import { generateUniversalPrompt } from '@/lib/llm/prompt-generator'
```

## 💡 Utilisation

### Exemple basique (Agent générique)

```typescript
import { generateUniversalPrompt } from '@/lib/llm/prompt-generator'

const config = {
  sector: evenementielSector, // Depuis la DB
  userContext: {
    userName: 'Marie Dubois',
    company_type: 'freelance',
    target_customers: 'Mariages haut de gamme en Île-de-France',
    company_specifics: 'Spécialité décoration bohème-chic'
  },
  tone: 'friendly',
  agentType: 'generic'
}

const result = generateUniversalPrompt(config)

console.log(result.systemPrompt)  // Prompt complet
console.log(result.metadata.tokens)  // ~1200 tokens
```

### Exemple avancé (Agent spécialisé)

```typescript
const config = {
  sector: evenementielSector,
  userContext: {
    userName: 'Sophie Laurent',
    company_type: 'tpe',
    target_customers: 'Événements corporate B2B',
    company_specifics: 'Focus sur séminaires tech'
  },
  tone: 'professional',
  agentType: 'specialized',
  template: budgetCalculatorTemplate  // Template depuis la DB
}

const result = generateUniversalPrompt(config)
```

## 🏗️ Architecture

### Structure des fichiers

```
lib/llm/
├── prompt-generator.ts          # Module principal
├── prompt-generator.examples.ts # Exemples et tests
└── README.md                     # Documentation
```

### Types principaux

```typescript
interface AgentConfig {
  sector: ExtendedSector
  userContext: UserContext
  tone: 'professional' | 'friendly' | 'expert'
  agentType: 'generic' | 'specialized'
  template?: AgentTemplate
}

interface GeneratedPrompt {
  systemPrompt: string
  metadata: {
    secteur: string
    tokens: number
    version: string
  }
}
```

## 📚 API

### Fonction principale

#### `generateUniversalPrompt(config: AgentConfig): GeneratedPrompt`

Génère un prompt système complet à partir de la configuration.

**Paramètres:**
- `config.sector`: Données du secteur (depuis la DB)
- `config.userContext`: Contexte utilisateur (formulaire)
- `config.tone`: Ton de communication ('professional', 'friendly', 'expert')
- `config.agentType`: Type d'agent ('generic', 'specialized')
- `config.template`: Template (requis si agentType='specialized')

**Retour:**
- `systemPrompt`: Le prompt complet à envoyer au LLM
- `metadata.secteur`: Nom du secteur
- `metadata.tokens`: Estimation du nombre de tokens
- `metadata.version`: Version du générateur (pour tracking)

### Fonctions utilitaires

#### `validateUserContext(context: UserContext): boolean`

Valide que le contexte utilisateur contient les champs requis.

```typescript
try {
  validateUserContext(context)
  // ✅ Contexte valide
} catch (error) {
  // ❌ Champs manquants ou invalides
}
```

#### `validateSector(sector: ExtendedSector): boolean`

Valide que le secteur a les données minimales requises.

#### `getPromptPreview(prompt: GeneratedPrompt): string`

Retourne un aperçu des 200 premiers caractères du prompt.

### Constants exportées

```typescript
// Templates de ton
TONE_TEMPLATES: Record<ToneType, string>

// Labels des types d'entreprise
COMPANY_TYPE_LABELS: Record<CompanyType, string>

// Descriptions de catégories de tâches
TASK_DESCRIPTIONS: Record<string, string>
```

## 🎨 Exemples

### Exemple 1: Wedding Planner Freelance

```typescript
import { example1_FreelanceWeddingPlanner } from '@/lib/llm/prompt-generator.examples'

const prompt = example1_FreelanceWeddingPlanner()
// Génère un prompt friendly pour un wedding planner freelance
```

**Résultat:**
- Ton: Friendly (accessible, chaleureux)
- Secteur: Événementiel
- Type: Freelance
- Tokens: ~1150

### Exemple 2: Agence Marketing PME

```typescript
import { example2_MarketingAgency } from '@/lib/llm/prompt-generator.examples'

const prompt = example2_MarketingAgency()
// Génère un prompt professional pour une agence marketing
```

**Résultat:**
- Ton: Professional (formel, structuré)
- Secteur: Marketing
- Type: PME
- Tokens: ~980

### Exemple 3: Agent Spécialisé

```typescript
import { example4_SpecializedAgent } from '@/lib/llm/prompt-generator.examples'

const prompt = example4_SpecializedAgent()
// Génère un prompt pour un agent "Calculateur de Budget"
```

**Résultat:**
- Template: Calculateur de Budget Événementiel
- Variables remplacées: {{user_name}}, {{sector_name}}, etc.
- Tokens: ~750

## 🧪 Tests

### Lancer tous les exemples

```bash
# Via Node.js (si configuré)
npx tsx lib/llm/prompt-generator.examples.ts
```

Ou dans votre code:

```typescript
import { runAllExamples } from '@/lib/llm/prompt-generator.examples'

runAllExamples()
```

### Tests de validation

```typescript
import { runValidationTests } from '@/lib/llm/prompt-generator.examples'

runValidationTests()
```

**Tests inclus:**
- ✅ Validation contexte utilisateur valide
- ✅ Rejet contexte utilisateur invalide
- ✅ Validation secteur valide
- ✅ Rejet secteur invalide
- ✅ Détection template manquant pour agent spécialisé

## 📊 Structure d'un prompt généré

Un prompt générique typique contient les sections suivantes:

```
# IDENTITÉ
Tu es l'assistant IA de [nom] spécialisé dans [secteur]

# CONTEXTE MÉTIER
## Structure
Type d'entreprise: [type]
Secteur: [secteur]

## Clientèle cible
[description clients]

## Spécificités
[spécificités entreprise]

# EXPERTISE ET COMPÉTENCES
[base_expertise du secteur]

## Tâches que tu maîtrises
- Tâche 1
- Tâche 2
...

# STYLE DE COMMUNICATION
[Instructions selon le ton choisi]

# CONTEXTE LÉGAL ET RÉGLEMENTAIRE
[legal_context du secteur si applicable]

# INSTRUCTIONS OPÉRATIONNELLES
## Adaptation
- Adapte ton niveau de détail
- Pose des questions si info manquante
...

## Collaboration
- Suggère des agents spécialisés si besoin
...

## Qualité
- Fournis des sources
- Vérifie la cohérence
...
```

## 🔄 Workflow d'utilisation

```
Utilisateur remplit formulaire
         ↓
    [sector_id, userContext, tone]
         ↓
Fetch sector depuis DB (avec base_expertise, common_tasks, legal_context)
         ↓
generateUniversalPrompt(config)
         ↓
[systemPrompt complet]
         ↓
Stocké dans agent.system_prompt (DB)
         ↓
Utilisé pour tous les appels LLM de cet agent
```

## 🎯 Cas d'usage

### 1. Création d'un nouvel agent (générique)

```typescript
// Dans votre API route ou action
import { generateUniversalPrompt } from '@/lib/llm/prompt-generator'
import { getSectorById } from '@/lib/db/sectors'

export async function createAgent(formData: FormData) {
  const sectorId = formData.get('sector_id')
  const sector = await getSectorById(sectorId)

  const config = {
    sector,
    userContext: {
      userName: formData.get('user_name'),
      company_type: formData.get('company_type'),
      target_customers: formData.get('target_customers'),
      company_specifics: formData.get('company_specifics')
    },
    tone: formData.get('tone'),
    agentType: 'generic'
  }

  const { systemPrompt } = generateUniversalPrompt(config)

  // Sauvegarder l'agent avec le prompt
  await db.agents.create({
    user_id,
    sector_id: sectorId,
    name: formData.get('name'),
    system_prompt: systemPrompt,
    ...
  })
}
```

### 2. Création d'un agent spécialisé depuis template

```typescript
import { getAgentTemplate } from '@/lib/db/templates'

export async function createSpecializedAgent(templateId: string, userId: string) {
  const template = await getAgentTemplate(templateId)
  const sector = await getSectorById(template.sector_id)
  const userContext = await getUserContext(userId)

  const config = {
    sector,
    userContext,
    tone: 'professional',
    agentType: 'specialized',
    template
  }

  const { systemPrompt } = generateUniversalPrompt(config)

  // Créer l'agent
  await db.agents.create({
    user_id: userId,
    template_id: templateId,
    system_prompt: systemPrompt,
    ...
  })
}
```

### 3. Prévisualisation avant création

```typescript
import { getPromptPreview } from '@/lib/llm/prompt-generator'

export function previewAgent(config: AgentConfig) {
  const prompt = generateUniversalPrompt(config)

  return {
    preview: getPromptPreview(prompt),
    estimatedTokens: prompt.metadata.tokens,
    version: prompt.metadata.version
  }
}
```

## 🔧 Configuration

### Modifier les templates de ton

Éditez les constantes dans `prompt-generator.ts`:

```typescript
export const TONE_TEMPLATES: Record<ToneType, string> = {
  professional: `Vos instructions...`,
  friendly: `Vos instructions...`,
  expert: `Vos instructions...`
}
```

### Ajouter un nouveau type de ton

1. Modifiez le type `ToneType`:
```typescript
export type ToneType = 'professional' | 'friendly' | 'expert' | 'casual'
```

2. Ajoutez le template:
```typescript
export const TONE_TEMPLATES: Record<ToneType, string> = {
  // ...existing
  casual: `Tu communiques de manière décontractée...`
}
```

## 📈 Métriques

**Tailles typiques de prompts générés:**
- Agent générique: 900-1400 tokens
- Agent spécialisé: 600-1000 tokens
- Avec contexte légal: +150-250 tokens

**Performance:**
- Génération: < 1ms (synchrone)
- Pas de call API externe
- Pas de requête DB (données passées en paramètre)

## 🐛 Dépannage

### Erreur: "Template is required for specialized agents"

**Solution:** Assurez-vous de passer un template dans la config si `agentType: 'specialized'`.

### Erreur: "target_customers is required and cannot be empty"

**Solution:** Le champ `userContext.target_customers` doit être renseigné et non vide.

### Tokens trop élevés

**Solution:**
- Utilisez un agent spécialisé (template plus court)
- Réduisez `company_specifics`
- Certains secteurs ont moins de `common_tasks`

## 🚀 Roadmap

- [ ] Support de langues multiples (FR/EN)
- [ ] Templates de prompts sauvegardés
- [ ] Variations A/B de prompts
- [ ] Analytics sur performance des prompts
- [ ] Fine-tuning basé sur feedback utilisateur

## 📝 Licence

Propriétaire - yaya.ia

---

**Créé avec ❤️ pour yaya.ia**
