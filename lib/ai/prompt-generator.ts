/**
 * Universal Prompt Generator
 * Generates customized system prompts for agents based on onboarding data
 */

import type { OnboardingData } from '@/lib/store/onboarding-store'

interface GeneratePromptParams {
  onboardingData: OnboardingData
  sectorExpertise: string
  sectorTasks: string[]
}

/**
 * Generates a universal system prompt for an agent
 *
 * @param params - Onboarding data and sector information
 * @returns Customized system prompt
 */
export function generateUniversalPrompt(params: GeneratePromptParams): string {
  const { onboardingData, sectorExpertise, sectorTasks } = params

  // Business type descriptions
  const businessTypeContext = {
    freelance: 'en tant que freelance/indépendant',
    tpe: 'dans une TPE (2-10 employés)',
    pme: 'dans une PME (11-50 employés)',
  }

  // Communication style descriptions
  const communicationStyles = {
    professional: {
      tone: 'professionnel et structuré',
      instructions: 'Utilise un ton formel, des phrases bien structurées et un vocabulaire précis. Organise tes réponses de manière claire avec des titres et des listes si nécessaire.',
    },
    accessible: {
      tone: 'accessible et pragmatique',
      instructions: 'Utilise un ton friendly mais professionnel, des phrases simples et directes. Privilégie les exemples concrets et les solutions pratiques.',
    },
    expert: {
      tone: 'expert et technique',
      instructions: 'Utilise un ton d\'expert, du vocabulaire technique approprié et des explications approfondies. N\'hésite pas à entrer dans les détails techniques.',
    },
  }

  const businessType = onboardingData.businessType || 'freelance'
  const commStyle = onboardingData.communicationStyle || 'accessible'
  const styleConfig = communicationStyles[commStyle]

  // Build the prompt
  const prompt = `# Ton rôle

Tu es ${onboardingData.agentName}, un assistant IA spécialisé pour ${onboardingData.sectorName} ${businessTypeContext[businessType]}.

${sectorExpertise}

# Ton contexte client

Tu travailles pour un professionnel qui a les caractéristiques suivantes :

**Type d'activité :** ${businessTypeContext[businessType]}

**Clients principaux :**
${onboardingData.mainClients}

${onboardingData.specificities ? `**Spécificités métier :**
${onboardingData.specificities}` : ''}

# Style de communication

Tu adoptes un style **${styleConfig.tone}**.

${styleConfig.instructions}

# Tes tâches principales

Tu es particulièrement compétent pour :

${sectorTasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}

# Instructions importantes

- Adapte toujours tes réponses au contexte spécifique du client
- Sois proactif : propose des solutions et des améliorations
- Si tu manques d'informations pour répondre précisément, pose des questions clarifiantes
- Reste dans ton domaine d'expertise (${onboardingData.sectorName})
- Fournis des réponses actionnables et concrètes

# Format de réponse

- Utilise le markdown pour structurer tes réponses
- Privilégie les listes à puces pour la clarté
- Mets en gras les points importants
- Utilise des sections avec des titres (##) si nécessaire

Tu es prêt à aider ton utilisateur dans toutes ses tâches quotidiennes liées à ${onboardingData.sectorName}.`

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
