/**
 * Model Pricing Configuration
 * Tarification des différents modèles LLM
 */

export interface ModelConfig {
  id: string
  name: string
  provider: 'anthropic' | 'openai'
  displayName: string
  description: string
  icon: string
  // Prix en USD pour 1M de tokens (input)
  inputPricePerMillion: number
  // Prix en USD pour 1M de tokens (output)
  outputPricePerMillion: number
  // Prix simplifié affiché à l'utilisateur (€ pour 100 messages ~)
  estimatedCostPer100Messages: number
  // Caractéristiques
  speed: 'fast' | 'medium' | 'slow'
  quality: 'basic' | 'good' | 'excellent'
  contextWindow: number
  available: boolean
  recommended?: boolean
}

/**
 * Configuration des modèles disponibles
 * Basé sur la tarification officielle Anthropic & OpenAI (Nov 2024)
 */
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // === CLAUDE (Anthropic) ===
  'claude-3-haiku-20240307': {
    id: 'claude-3-haiku-20240307',
    name: 'haiku',
    provider: 'anthropic',
    displayName: 'Claude 3 Haiku',
    description: 'Rapide et économique, parfait pour un usage quotidien',
    icon: '⚡',
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.25,
    estimatedCostPer100Messages: 0.15, // ~15 centimes
    speed: 'fast',
    quality: 'good',
    contextWindow: 200000,
    available: true,
    recommended: true,
  },
  'claude-3-sonnet-20240229': {
    id: 'claude-3-sonnet-20240229',
    name: 'sonnet',
    provider: 'anthropic',
    displayName: 'Claude 3 Sonnet',
    description: 'Équilibre idéal entre performance et coût',
    icon: '⚖️',
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 15.0,
    estimatedCostPer100Messages: 1.50, // ~1.50€
    speed: 'medium',
    quality: 'excellent',
    contextWindow: 200000,
    available: true,
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'opus',
    provider: 'anthropic',
    displayName: 'Claude 3 Opus',
    description: 'Performance maximale pour les tâches complexes',
    icon: '🚀',
    inputPricePerMillion: 15.0,
    outputPricePerMillion: 75.0,
    estimatedCostPer100Messages: 7.50, // ~7.50€
    speed: 'slow',
    quality: 'excellent',
    contextWindow: 200000,
    available: true,
  },

  // === GPT (OpenAI) - Disponible prochainement ===
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    description: 'Rapide et abordable, idéal pour les tâches simples',
    icon: '⚡',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    estimatedCostPer100Messages: 0.10,
    speed: 'fast',
    quality: 'good',
    contextWindow: 128000,
    available: false,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    description: 'Modèle puissant et polyvalent',
    icon: '🎯',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.0,
    estimatedCostPer100Messages: 1.25,
    speed: 'medium',
    quality: 'excellent',
    contextWindow: 128000,
    available: false,
  },
}

/**
 * Calcule le coût d'une requête en USD
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const config = MODEL_CONFIGS[modelId]
  if (!config) return 0

  const inputCost = (inputTokens / 1_000_000) * config.inputPricePerMillion
  const outputCost = (outputTokens / 1_000_000) * config.outputPricePerMillion

  return inputCost + outputCost
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Récupère les modèles disponibles (triés par coût)
 */
export function getAvailableModels(): ModelConfig[] {
  return Object.values(MODEL_CONFIGS)
    .filter(m => m.available)
    .sort((a, b) => a.estimatedCostPer100Messages - b.estimatedCostPer100Messages)
}

/**
 * Récupère un modèle par son nom court
 */
export function getModelByName(name: string): ModelConfig | undefined {
  return Object.values(MODEL_CONFIGS).find(m => m.name === name)
}

/**
 * Récupère un modèle par son ID complet
 */
export function getModelById(id: string): ModelConfig | undefined {
  return MODEL_CONFIGS[id]
}

/**
 * Convertit un nom de modèle court en ID complet
 */
export function getModelId(modelName: string): string {
  const model = getModelByName(modelName)
  return model?.id || 'claude-3-haiku-20240307' // Default
}
