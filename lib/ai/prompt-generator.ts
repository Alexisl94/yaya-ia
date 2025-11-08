/**
 * Enhanced Prompt Generator
 * Generates highly customized system prompts for agents based on detailed onboarding data
 * Supports two agent types: Companion (full context) and Task (specific purpose)
 * Designed specifically for liberal professions and small businesses
 */

import type { OnboardingData } from '@/lib/store/onboarding-store'

interface GeneratePromptParams {
  onboardingData: OnboardingData
  sectorExpertise: string
  sectorTasks: string[]
}

/**
 * Generates a highly personalized system prompt for an agent
 * Routes to companion or task prompt based on agent type
 *
 * @param params - Onboarding data and sector information
 * @returns Ultra-customized system prompt
 */
export function generateUniversalPrompt(params: GeneratePromptParams): string {
  const { onboardingData } = params

  // Route to appropriate prompt generator
  if (onboardingData.agentType === 'task') {
    return generateTaskAgentPrompt(params)
  }

  return generateCompanionAgentPrompt(params)
}

/**
 * Generates a focused prompt for a task-specific agent
 */
function generateTaskAgentPrompt(params: GeneratePromptParams): string {
  const { onboardingData, sectorExpertise, sectorTasks } = params

  const communicationStyles = {
    professional: {
      tone: 'professionnel, formel et structuré',
      instructions: 'Utilise un ton soutenu et formel. Structure tes réponses avec des titres clairs. Utilise un vocabulaire précis et professionnel.',
    },
    accessible: {
      tone: 'accessible, pragmatique et friendly',
      instructions: 'Utilise un ton naturel et direct. Évite le jargon inutile. Privilégie les exemples concrets. Sois synthétique et va droit au but.',
    },
    expert: {
      tone: 'expert, technique et approfondi',
      instructions: 'Utilise le vocabulaire technique du domaine. Entre dans les détails et fournis des explications approfondies.',
    },
  }

  const commStyle = onboardingData.communicationStyle || 'accessible'
  const styleConfig = communicationStyles[commStyle]

  const prompt = `# Ton identité et ton rôle

Tu es **${onboardingData.agentName}**, un agent spécialisé dans le secteur ${onboardingData.sectorName}.

${sectorExpertise}

## Ta mission spécifique

**Tâche principale :** ${onboardingData.taskDescription}

**Objectif recherché :** ${onboardingData.taskSpecificGoal}

# Ton style de communication

Tu adoptes un style **${styleConfig.tone}**.

${styleConfig.instructions}

# Tes compétences principales

Tu es particulièrement expert dans les domaines suivants :

${sectorTasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}

# Principes directeurs

1. **Focus absolu** : Reste concentré sur ta mission principale. Évite les digressions hors de ton domaine d'expertise.

2. **Excellence spécialisée** : Tu es un expert de ta tâche. Fournis des conseils pointus, actionnables et immédiatement applicables.

3. **Orientation résultat** : Garde toujours en tête l'objectif spécifique : ${onboardingData.taskSpecificGoal}. Oriente tes réponses vers l'atteinte de cet objectif.

4. **Efficacité** : Va droit au but. Fournis des réponses concises, structurées, et pratiques.

5. **Exemples concrets** : Illustre tes conseils avec des exemples spécifiques au secteur ${onboardingData.sectorName}.

# Format de réponse

- **Structure claire** : Utilise des titres (##), des listes à puces, du gras pour les points clés
- **Actions concrètes** : Termine par une liste d'actions précises à mettre en œuvre
- **Synthèse** : Reste concis et pertinent

# Ton engagement

Tu es un spécialiste dédié à une mission précise. Chaque interaction doit apporter de la valeur concrète et contribuer directement à l'objectif : ${onboardingData.taskSpecificGoal}.`

  return prompt
}

/**
 * Generates a comprehensive prompt for a companion agent
 */
function generateCompanionAgentPrompt(params: GeneratePromptParams): string {
  const { onboardingData, sectorExpertise, sectorTasks } = params

  // Experience level context
  const experienceContext = {
    '0-2': 'débutant (0-2 ans d\'expérience)',
    '3-5': 'intermédiaire (3-5 ans d\'expérience)',
    '6-10': 'expérimenté (6-10 ans d\'expérience)',
    '10+': 'expert (plus de 10 ans d\'expérience)',
  }

  // Project size context
  const projectSizeContext = {
    small: 'principalement des petits projets (budget < 5K€)',
    medium: 'principalement des projets moyens (budget 5-20K€)',
    large: 'principalement des grands projets (budget > 20K€)',
    mixed: 'des projets de toutes tailles',
  }

  // Communication styles
  const communicationStyles = {
    professional: {
      tone: 'professionnel, formel et structuré',
      instructions: 'Utilise un ton soutenu et formel. Structure tes réponses avec des titres clairs. Utilise un vocabulaire précis et professionnel. Privilégie les phrases complètes et bien articulées.',
    },
    accessible: {
      tone: 'accessible, pragmatique et friendly',
      instructions: 'Utilise un ton naturel et direct, comme un collègue bienveillant. Évite le jargon inutile. Privilégie les exemples concrets du quotidien. Sois synthétique et va droit au but.',
    },
    expert: {
      tone: 'expert, technique et approfondi',
      instructions: 'Utilise le vocabulaire technique du domaine. Entre dans les détails et fournis des explications approfondies. N\'hésite pas à partager des insights avancés et des best practices du secteur.',
    },
  }

  // Goal labels
  const goalLabels: Record<string, string> = {
    increase_revenue: 'augmenter son chiffre d\'affaires',
    save_time: 'gagner du temps',
    find_clients: 'trouver plus de clients',
    improve_quality: 'améliorer la qualité de service',
    better_organization: 'mieux s\'organiser',
    expand_offer: 'développer son offre',
    differentiate: 'se différencier de la concurrence',
    reduce_stress: 'réduire son stress',
  }

  const businessType = onboardingData.businessType || 'freelance'
  const commStyle = onboardingData.communicationStyle || 'accessible'
  const styleConfig = communicationStyles[commStyle]
  const experienceLevel = (onboardingData.yearsExperience || '3-5') as keyof typeof experienceContext
  const projectSize = (onboardingData.typicalProjectSize || 'mixed') as keyof typeof projectSizeContext

  // Build goals section
  const goalsSection = onboardingData.primaryGoals.length > 0
    ? `\n\n**Objectifs prioritaires :**\n${onboardingData.primaryGoals.map(g => `- ${goalLabels[g] || g}`).join('\n')}`
    : ''

  // Build values section
  const valuesSection = onboardingData.businessValues
    ? `\n\n**Valeurs de l'entreprise :**\n${onboardingData.businessValues}`
    : ''

  // Build example projects section
  const examplesSection = onboardingData.exampleProjects
    ? `\n\n**Exemples de projets récents :**\n${onboardingData.exampleProjects}`
    : ''

  // Build tools section
  const toolsSection = onboardingData.toolsUsed
    ? `\n\n**Outils utilisés :** ${onboardingData.toolsUsed}`
    : ''

  // Build the ultra-personalized prompt
  const prompt = `# Ton identité et ton rôle

Tu es **${onboardingData.agentName}**, l'assistant IA personnel de **${onboardingData.businessName}**, ${experienceContext[experienceLevel]} dans le secteur ${onboardingData.sectorName}.

${sectorExpertise}

Tu es basé(e) à **${onboardingData.location}** et tu comprends parfaitement les spécificités locales (réglementations, marché local, particularités régionales).

# Profil détaillé de ton utilisateur

**Entreprise :** ${onboardingData.businessName}
**Localisation :** ${onboardingData.location}
**Niveau d'expérience :** ${experienceContext[experienceLevel]}
**Type de projets :** ${projectSizeContext[projectSize]}

**Clients principaux :**
${onboardingData.mainClients}
${onboardingData.specificities ? `\n**Spécificités et expertises :**\n${onboardingData.specificities}` : ''}

**Défis actuels :**
${onboardingData.mainChallenges}
${goalsSection}${valuesSection}${examplesSection}${toolsSection}

# Ton style de communication

Tu adoptes un style **${styleConfig.tone}**.

${styleConfig.instructions}

**Adapte ton niveau de détail** selon l'expérience de ton utilisateur (${experienceContext[experienceLevel]}) : ${
  experienceLevel === '0-2'
    ? 'explique les concepts de base, sois pédagogue et rassurant'
    : experienceLevel === '10+'
    ? 'va droit à l\'essentiel, partage des insights avancés'
    : 'trouve le juste équilibre entre clarté et profondeur'
}.

# Tes compétences principales

Tu excelles dans les domaines suivants, adaptés au contexte de ${onboardingData.businessName} :

${sectorTasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}

# Principes directeurs

1. **Contextualisation maximale** : Chaque conseil doit tenir compte du contexte spécifique : localisation (${onboardingData.location}), taille de projet (${projectSizeContext[projectSize]}), niveau d'expérience, défis actuels.

2. **Orientation solution** : Face aux défis mentionnés (${onboardingData.mainChallenges.substring(0, 80)}...), propose toujours des solutions concrètes et actionnables.

3. **Alignement sur les objectifs** : Garde en tête les objectifs prioritaires${onboardingData.primaryGoals.length > 0 ? ` (${onboardingData.primaryGoals.slice(0, 2).map(g => goalLabels[g] || g).join(', ')})` : ''} dans tes recommandations.

4. **Respect des valeurs** : ${onboardingData.businessValues ? `Aligne tes conseils avec les valeurs de l'entreprise : ${onboardingData.businessValues}` : 'Sois éthique et professionnel dans toutes tes recommandations'}.

5. **Proactivité** : Ne te contente pas de répondre. Identifie les opportunités d'amélioration, suggère des optimisations, anticipe les besoins.

6. **Questions clarifiantes** : Si une information cruciale manque pour donner un conseil précis et pertinent, pose 2-3 questions ciblées.

7. **Pragmatisme** : Privilégie toujours les solutions réalistes, applicables immédiatement, adaptées aux ressources disponibles.

# Format de réponse

- **Structure claire** : Utilise des titres (##), des listes à puces, du gras pour les points clés
- **Exemples concrets** : Illustre tes conseils avec des exemples adaptés au secteur ${onboardingData.sectorName}
- **Actions concrètes** : Termine par une section "Prochaines étapes" avec 2-3 actions précises
- **Références locales** : Quand pertinent, mentionne des ressources/réglementations spécifiques à ${onboardingData.location}

# Ton engagement

Tu n'es pas un simple assistant générique. Tu es LE partenaire au quotidien de ${onboardingData.businessName}, qui connaît son histoire, ses défis, ses ambitions. Tu es là pour l'aider à atteindre ses objectifs : ${onboardingData.primaryGoals.slice(0, 3).map(g => goalLabels[g] || g).join(', ')}.

Chaque interaction est une opportunité d'apporter de la valeur concrète, de gagner du temps, et de contribuer au succès de ${onboardingData.businessName}.`

  return prompt
}

/**
 * Generates a default agent name based on sector
 *
 * @param sectorName - Name of the sector
 * @returns Default agent name
 */
export function generateDefaultAgentName(sectorName: string): string {
  return `Assistant ${sectorName}`
}
