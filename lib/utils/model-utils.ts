/**
 * Model Utilities
 * Utilitaires pour gérer les modèles LLM, coûts et recommandations
 */

import type { ModelType, FunctionalType } from '@/types/database'

// =============================================
// MODÈLES LLM
// =============================================

export interface ModelInfo {
  id: ModelType
  name: string
  displayName: string
  emoji: string
  tier: 'economy' | 'standard' | 'premium' | 'ultra'
  costPer1kTokens: number // en USD
  speed: 1 | 2 | 3 | 4 | 5 // 1=lent, 5=rapide
  quality: 1 | 2 | 3 | 4 | 5 // 1=basic, 5=excellent
  description: string
  bestFor: string[]
}

export const MODELS: Record<ModelType, ModelInfo> = {
  'haiku': {
    id: 'haiku',
    name: 'Claude Haiku',
    displayName: 'Haiku',
    emoji: '',
    tier: 'economy',
    costPer1kTokens: 0.004,
    speed: 5,
    quality: 3,
    description: 'Rapide et économique pour les tâches simples',
    bestFor: ['Brouillons', 'Support client', 'Réponses rapides']
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    displayName: 'Mini',
    emoji: '🔷',
    tier: 'economy',
    costPer1kTokens: 0.002,
    speed: 5,
    quality: 4,
    description: 'Excellent rapport qualité/prix',
    bestFor: ['Usage quotidien', 'Emails', 'Support', 'Traductions']
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    displayName: 'GPT-4o',
    emoji: '🌟',
    tier: 'premium',
    costPer1kTokens: 0.032,
    speed: 4,
    quality: 5,
    description: 'Performant pour code et créativité',
    bestFor: ['Code', 'Créativité', 'Analyse', 'Rédaction pro']
  },
  'sonnet': {
    id: 'sonnet',
    name: 'Claude Sonnet',
    displayName: 'Sonnet',
    emoji: '',
    tier: 'standard',
    costPer1kTokens: 0.048,
    speed: 4,
    quality: 5,
    description: 'Équilibré entre qualité et coût',
    bestFor: ['Rédaction', 'Analyse', 'Réflexion']
  },
  'opus': {
    id: 'opus',
    name: 'Claude Opus',
    displayName: 'Opus',
    emoji: '💠',
    tier: 'ultra',
    costPer1kTokens: 0.075,
    speed: 3,
    quality: 5,
    description: 'Meilleur pour analyses complexes',
    bestFor: ['Analyse profonde', 'Recherche', 'Stratégie']
  },
  'claude': {
    id: 'claude',
    name: 'Claude (Legacy)',
    displayName: 'Claude',
    emoji: '',
    tier: 'economy',
    costPer1kTokens: 0.004,
    speed: 5,
    quality: 3,
    description: 'Version legacy (mappé sur Haiku)',
    bestFor: []
  },
  'gpt': {
    id: 'gpt',
    name: 'GPT (Legacy)',
    displayName: 'GPT',
    emoji: '🔷',
    tier: 'economy',
    costPer1kTokens: 0.002,
    speed: 5,
    quality: 4,
    description: 'Version legacy (mappé sur Mini)',
    bestFor: []
  }
}

// =============================================
// RECOMMANDATIONS PAR TYPE D'AGENT
// =============================================

export interface ModelRecommendation {
  best: ModelType
  good: ModelType
  budget: ModelType
}

export const MODEL_RECOMMENDATIONS: Record<FunctionalType, ModelRecommendation> = {
  creative: {
    best: 'gpt-4o',
    good: 'sonnet',
    budget: 'gpt-4o-mini'
  },
  analytical: {
    best: 'opus',
    good: 'gpt-4o',
    budget: 'sonnet'
  },
  support: {
    best: 'gpt-4o-mini',
    good: 'haiku',
    budget: 'haiku'
  },
  code: {
    best: 'gpt-4o',
    good: 'sonnet',
    budget: 'gpt-4o-mini'
  },
  general: {
    best: 'gpt-4o',
    good: 'gpt-4o-mini',
    budget: 'haiku'
  }
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

/**
 * Calcule le coût d'une conversation
 */
export function calculateConversationCost(
  tokens: number,
  model: ModelType
): number {
  const modelInfo = MODELS[model]
  return (tokens / 1000) * modelInfo.costPer1kTokens
}

/**
 * Calcule le coût moyen par conversation
 */
export function calculateAvgCostPerConversation(
  totalCost: number,
  totalConversations: number
): number {
  if (totalConversations === 0) return 0
  return totalCost / totalConversations
}

/**
 * Formatte le coût en USD
 */
export function formatCostUSD(cost: number): string {
  if (cost === 0) return '$0'
  if (cost < 0.01) return '<$0.01'
  return `$${cost.toFixed(2)}`
}

/**
 * Formatte le coût en EUR
 */
export function formatCostEUR(cost: number): string {
  const eurCost = cost * 0.95 // Approximation 1 USD = 0.95 EUR
  if (eurCost === 0) return '0€'
  if (eurCost < 0.01) return '<0.01€'
  return `${eurCost.toFixed(2)}€`
}

/**
 * Obtient la couleur du badge selon le coût mensuel
 */
export function getCostBadgeColor(monthlyCost: number): {
  color: 'green' | 'yellow' | 'red'
  label: string
} {
  if (monthlyCost < 5) {
    return {
      color: 'green',
      label: 'Économique'
    }
  } else if (monthlyCost < 20) {
    return {
      color: 'yellow',
      label: 'Modéré'
    }
  } else {
    return {
      color: 'red',
      label: 'Coûteux'
    }
  }
}

/**
 * Calcule les économies potentielles en changeant de modèle
 */
export function calculatePotentialSavings(
  currentModel: ModelType,
  suggestedModel: ModelType,
  currentMonthlyCost: number
): {
  savingsUSD: number
  savingsPercent: number
  savingsEUR: number
} {
  const currentCost = MODELS[currentModel].costPer1kTokens
  const suggestedCost = MODELS[suggestedModel].costPer1kTokens

  const savingsPercent = ((currentCost - suggestedCost) / currentCost) * 100
  const savingsUSD = currentMonthlyCost * (savingsPercent / 100)
  const savingsEUR = savingsUSD * 0.95

  return {
    savingsUSD,
    savingsPercent: Math.round(savingsPercent),
    savingsEUR
  }
}

/**
 * Obtient la recommandation de modèle pour un agent
 */
export function getModelRecommendation(
  functionalType: FunctionalType,
  currentModel: ModelType,
  monthlyCost: number
): {
  shouldOptimize: boolean
  suggestedModel: ModelType | null
  reason: string
  priority: 'high' | 'medium' | 'low' | 'none'
} {
  const recommendation = MODEL_RECOMMENDATIONS[functionalType]

  // Si l'agent coûte cher et utilise un modèle surdimensionné
  if (functionalType === 'support' && monthlyCost > 15) {
    if (currentModel === 'gpt-4o' || currentModel === 'sonnet' || currentModel === 'opus') {
      return {
        shouldOptimize: true,
        suggestedModel: 'gpt-4o-mini',
        reason: 'GPT-4o-mini est largement suffisant pour du support client',
        priority: 'high'
      }
    }
  }

  // Si l'agent est créatif mais sur un modèle cheap
  if (functionalType === 'creative' && (currentModel === 'haiku' || currentModel === 'gpt-4o-mini')) {
    return {
      shouldOptimize: false,
      suggestedModel: 'gpt-4o',
      reason: 'GPT-4o améliorerait significativement la créativité',
      priority: 'medium'
    }
  }

  // Si l'agent est déjà optimal
  if (currentModel === recommendation.best) {
    return {
      shouldOptimize: false,
      suggestedModel: null,
      reason: 'Configuration optimale pour ce type d\'agent',
      priority: 'none'
    }
  }

  // Suggestion générale d'optimisation
  if (monthlyCost > 25 && MODELS[currentModel].tier !== 'economy') {
    return {
      shouldOptimize: true,
      suggestedModel: recommendation.good,
      reason: 'Économisez tout en gardant une bonne qualité',
      priority: 'medium'
    }
  }

  return {
    shouldOptimize: false,
    suggestedModel: null,
    reason: 'Aucune optimisation nécessaire',
    priority: 'none'
  }
}

/**
 * Formatte le nombre de tokens
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens} tokens`
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}k tokens`
  return `${(tokens / 1000000).toFixed(2)}M tokens`
}

/**
 * Obtient les infos d'un modèle
 */
export function getModelInfo(model: ModelType): ModelInfo {
  return MODELS[model]
}

/**
 * Obtient la liste des modèles triés par coût
 */
export function getModelsSortedByCost(): ModelInfo[] {
  return Object.values(MODELS)
    .filter(m => !m.id.includes('claude') && !m.id.includes('gpt')) // Exclure legacy
    .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)
}
