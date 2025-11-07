/**
 * System Prompt Generator for yaya.ia Agents
 *
 * Transforms user form data into optimized system prompts for LLM agents.
 * Supports both generic and specialized agents with customizable tone and context.
 *
 * @module prompt-generator
 */

import type { AgentTemplate } from '@/types/database'

// =============================================
// TYPES & INTERFACES
// =============================================

/**
 * Company type categories
 */
export type CompanyType = 'freelance' | 'tpe' | 'pme'

/**
 * Tone presets for agent communication style
 */
export type ToneType = 'professional' | 'friendly' | 'expert'

/**
 * Agent type classification
 */
export type AgentType = 'generic' | 'specialized'

/**
 * User context information for prompt personalization
 */
export interface UserContext {
  /** User's display name (optional) */
  userName?: string
  /** Type of company/business structure */
  company_type: CompanyType
  /** Description of target customer base */
  target_customers: string
  /** Additional company-specific context (optional) */
  company_specifics?: string
}

/**
 * Extended sector data with seed information
 * Contains both database fields and additional seed data
 */
export interface ExtendedSector {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Extended fields from seed data
  base_expertise?: string
  common_tasks?: string[]
  legal_context?: string | null
}

/**
 * Complete agent configuration for prompt generation
 */
export interface AgentConfig {
  /** Business sector from database */
  sector: ExtendedSector
  /** User's business context */
  userContext: UserContext
  /** Communication tone preference */
  tone: ToneType
  /** Type of agent to create */
  agentType: AgentType
  /** Template for specialized agents (required if agentType is 'specialized') */
  template?: AgentTemplate
}

/**
 * Generated prompt with metadata
 */
export interface GeneratedPrompt {
  /** The complete system prompt for the LLM */
  systemPrompt: string
  /** Additional metadata about the prompt */
  metadata: {
    /** Sector name */
    secteur: string
    /** Estimated token count */
    tokens: number
    /** Version identifier for tracking */
    version: string
  }
}

// =============================================
// CONSTANTS & TEMPLATES
// =============================================

/**
 * Current prompt generator version
 */
const PROMPT_VERSION = '1.0.0'

/**
 * Tone-specific instruction templates
 */
export const TONE_TEMPLATES: Record<ToneType, string> = {
  professional: `Tu communiques de manière professionnelle et structurée:
- Utilise un vocabulaire technique précis
- Reste formel dans tes formulations (vouvoiement)
- Privilégie la clarté et la concision
- Apporte des réponses factuelles et détaillées`,

  friendly: `Tu communiques de manière accessible et chaleureuse:
- Utilise un ton conversationnel (tutoiement possible)
- Explique les concepts complexes simplement
- Montre de l'empathie et de l'écoute
- N'hésite pas à utiliser des exemples concrets`,

  expert: `Tu communiques en tant qu'expert reconnu dans ton domaine:
- Démontre ta maîtrise technique approfondie
- Utilise le jargon professionnel approprié
- Fournis des analyses détaillées et des recommandations précises
- Anticipe les questions complexes et apporte des insights avancés`
}

/**
 * Company type descriptions for context
 */
export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  freelance: 'freelance / indépendant',
  tpe: 'TPE (Très Petite Entreprise)',
  pme: 'PME (Petite et Moyenne Entreprise)'
}

/**
 * Standard task category descriptions
 */
export const TASK_DESCRIPTIONS: Record<string, string> = {
  redaction: 'Rédaction de documents professionnels',
  analyse: 'Analyse et synthèse d\'informations',
  conseil: 'Conseil stratégique et opérationnel',
  gestion: 'Gestion administrative et organisation',
  communication: 'Communication client et marketing',
  legal: 'Conformité légale et réglementaire'
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Estimates token count for a string (rough approximation)
 * Uses 1 token ≈ 4 characters rule of thumb
 *
 * @param text - Text to estimate
 * @returns Estimated token count
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Generates tone-specific instructions based on selected tone
 *
 * @param tone - Selected tone type
 * @returns Formatted tone instructions
 */
function getToneInstructions(tone: ToneType): string {
  return TONE_TEMPLATES[tone]
}

/**
 * Formats a list of tasks into a bullet-point string
 *
 * @param tasks - Array of task descriptions
 * @returns Formatted task list
 */
function formatTaskList(tasks: string[]): string {
  if (!tasks || tasks.length === 0) {
    return '- Assistance générale sur les tâches courantes'
  }
  return tasks.map(task => `- ${task}`).join('\n')
}

/**
 * Generates the identity section of the prompt
 *
 * @param config - Agent configuration
 * @returns Formatted identity section
 */
function generateIdentitySection(config: AgentConfig): string {
  const { userContext, sector } = config

  if (userContext.userName) {
    return `# IDENTITÉ

Tu es l'assistant IA personnel de ${userContext.userName}, spécialisé dans le secteur ${sector.name}.`
  }

  return `# IDENTITÉ

Tu es un assistant IA spécialisé dans le secteur ${sector.name}.`
}

/**
 * Generates the business context section
 *
 * @param config - Agent configuration
 * @returns Formatted business context section
 */
function generateBusinessContextSection(config: AgentConfig): string {
  const { userContext, sector } = config
  const companyTypeLabel = COMPANY_TYPE_LABELS[userContext.company_type]

  let context = `# CONTEXTE MÉTIER

## Structure
Type d'entreprise: ${companyTypeLabel}
Secteur d'activité: ${sector.name}

## Clientèle cible
${userContext.target_customers}`

  if (userContext.company_specifics) {
    context += `

## Spécificités
${userContext.company_specifics}`
  }

  return context
}

/**
 * Generates the expertise section based on sector knowledge
 *
 * @param config - Agent configuration
 * @returns Formatted expertise section
 */
function generateExpertiseSection(config: AgentConfig): string {
  const { sector } = config

  let expertise = `# EXPERTISE ET COMPÉTENCES\n\n`

  if (sector.base_expertise) {
    expertise += sector.base_expertise
  } else {
    expertise += `Tu possèdes une expertise approfondie dans le secteur ${sector.name}.`
  }

  if (sector.common_tasks && sector.common_tasks.length > 0) {
    expertise += `\n\n## Tâches que tu maîtrises\n${formatTaskList(sector.common_tasks)}`
  }

  return expertise
}

/**
 * Generates the communication style section
 *
 * @param config - Agent configuration
 * @returns Formatted style section
 */
function generateStyleSection(config: AgentConfig): string {
  return `# STYLE DE COMMUNICATION

${getToneInstructions(config.tone)}`
}

/**
 * Generates the legal context section if applicable
 *
 * @param config - Agent configuration
 * @returns Formatted legal section or empty string
 */
function generateLegalSection(config: AgentConfig): string {
  const { sector } = config

  if (!sector.legal_context) {
    return ''
  }

  return `

# CONTEXTE LÉGAL ET RÉGLEMENTAIRE

${sector.legal_context}

⚠️ Rappel: En cas de question juridique complexe, recommande toujours de consulter un professionnel du droit.`
}

/**
 * Generates operational instructions for the agent
 *
 * @param config - Agent configuration
 * @returns Formatted instructions section
 */
function generateInstructionsSection(config: AgentConfig): string {
  return `

# INSTRUCTIONS OPÉRATIONNELLES

## Adaptation
- Adapte ton niveau de détail selon le contexte de la demande
- Si des informations sont manquantes, pose des questions de clarification
- Privilégie les réponses actionnables et concrètes

## Collaboration
- Si une tâche sort de ton périmètre, indique-le clairement
- Suggère la création d'agents spécialisés pour des tâches récurrentes complexes
- Reste dans ton domaine d'expertise: ${config.sector.name}

## Qualité
- Fournis toujours des sources ou références quand c'est pertinent
- Vérifie la cohérence de tes réponses avec le contexte métier
- Signale les limites de tes recommandations si nécessaire`
}

// =============================================
// MAIN GENERATION FUNCTIONS
// =============================================

/**
 * Generates a prompt for a generic (universal) agent
 *
 * Generic agents are versatile assistants that handle a wide range of tasks
 * within their sector, using the sector's base expertise and common tasks.
 *
 * @param config - Agent configuration
 * @returns Complete system prompt
 */
function generateGenericPrompt(config: AgentConfig): string {
  const sections = [
    generateIdentitySection(config),
    generateBusinessContextSection(config),
    generateExpertiseSection(config),
    generateStyleSection(config),
    generateLegalSection(config),
    generateInstructionsSection(config)
  ]

  return sections.filter(s => s.length > 0).join('\n\n')
}

/**
 * Generates a prompt for a specialized agent using a template
 *
 * Specialized agents are created from predefined templates with specific
 * system prompts. Variables in the template are replaced with user context.
 *
 * @param config - Agent configuration (must include template)
 * @returns Complete system prompt
 * @throws Error if template is missing
 */
function generateSpecializedPrompt(config: AgentConfig): string {
  if (!config.template) {
    throw new Error('Template is required for specialized agents')
  }

  const { template, sector, userContext, tone } = config
  let prompt = template.system_prompt

  // Replace template variables
  const replacements: Record<string, string> = {
    '{{sector_name}}': sector.name,
    '{{sector_slug}}': sector.slug,
    '{{tone}}': tone,
    '{{company_type}}': COMPANY_TYPE_LABELS[userContext.company_type],
    '{{target_customers}}': userContext.target_customers,
    '{{user_name}}': userContext.userName || 'l\'utilisateur',
    '{{company_specifics}}': userContext.company_specifics || ''
  }

  // Apply all replacements
  Object.entries(replacements).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(key, 'g'), value)
  })

  // Add tone instructions if not already present
  if (!prompt.includes('STYLE DE COMMUNICATION')) {
    prompt += `\n\n${generateStyleSection(config)}`
  }

  return prompt
}

/**
 * Main function: Generates a complete system prompt from agent configuration
 *
 * This is the primary entry point for prompt generation. It routes to the
 * appropriate generation function based on the agent type and returns a
 * complete GeneratedPrompt object with metadata.
 *
 * @param config - Complete agent configuration
 * @returns Generated prompt with metadata
 *
 * @example
 * ```typescript
 * const prompt = generateUniversalPrompt({
 *   sector: eventSector,
 *   userContext: {
 *     userName: 'Marie',
 *     company_type: 'freelance',
 *     target_customers: 'Mariages haut de gamme en Île-de-France',
 *     company_specifics: 'Spécialité décoration bohème-chic'
 *   },
 *   tone: 'friendly',
 *   agentType: 'generic'
 * })
 *
 * console.log(prompt.systemPrompt)
 * console.log(`Estimated tokens: ${prompt.metadata.tokens}`)
 * ```
 */
export function generateUniversalPrompt(config: AgentConfig): GeneratedPrompt {
  // Validate configuration
  if (!config.sector) {
    throw new Error('Sector is required')
  }
  if (!config.userContext) {
    throw new Error('User context is required')
  }

  // Generate appropriate prompt type
  let systemPrompt: string

  if (config.agentType === 'specialized') {
    systemPrompt = generateSpecializedPrompt(config)
  } else {
    systemPrompt = generateGenericPrompt(config)
  }

  // Generate metadata
  const metadata = {
    secteur: config.sector.name,
    tokens: estimateTokens(systemPrompt),
    version: PROMPT_VERSION
  }

  return {
    systemPrompt,
    metadata
  }
}

// =============================================
// UTILITY EXPORTS
// =============================================

/**
 * Validates that all required fields are present in a user context
 *
 * @param context - User context to validate
 * @returns True if valid, throws error if invalid
 */
export function validateUserContext(context: UserContext): boolean {
  if (!context.company_type) {
    throw new Error('company_type is required')
  }
  if (!context.target_customers || context.target_customers.trim() === '') {
    throw new Error('target_customers is required and cannot be empty')
  }
  return true
}

/**
 * Validates that a sector has the minimum required data for prompt generation
 *
 * @param sector - Sector to validate
 * @returns True if valid, throws error if invalid
 */
export function validateSector(sector: ExtendedSector): boolean {
  if (!sector.name || !sector.slug) {
    throw new Error('Sector must have name and slug')
  }
  return true
}

/**
 * Creates a preview of a prompt (first 200 characters)
 *
 * @param prompt - Generated prompt
 * @returns Preview string
 */
export function getPromptPreview(prompt: GeneratedPrompt): string {
  const preview = prompt.systemPrompt.substring(0, 200)
  return preview + (prompt.systemPrompt.length > 200 ? '...' : '')
}
