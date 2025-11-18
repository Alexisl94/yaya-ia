/**
 * Doggo Pricing System
 * Système de tarification simplifié et gamifié
 * Budget mensuel : 10 000 Doggos = 5€ maximum de consommation de tokens
 * Donc 1 Doggo = 0.0005€ de consommation de tokens (tous LLM confondus)
 */

import type { ModelType } from '@/types/database'

// ==============================================
// CONSTANTS
// ==============================================

/** Prix de l'abonnement mensuel en EUR */
export const SUBSCRIPTION_PRICE_EUR = 10

/** 1 Doggo = 0.0005€ de tokens consommés (10000 Doggos = 5€) */
export const DOGGO_VALUE_EUR = 0.0005

/** 1 Doggo = 0.000526$ (approximation 1 EUR = 1.053 USD) */
export const DOGGO_VALUE_USD = 0.000526

/** Limite par défaut : 10000 Doggos (équivalent à 5€ de tokens) */
export const DEFAULT_DOGGO_LIMIT = 10000

// ==============================================
// CONSUMPTION LEVELS
// ==============================================

export type ConsumptionLevel = 'low' | 'medium' | 'high'

export interface ConsumptionInfo {
  level: ConsumptionLevel
  label: string
  description: string
  icon: string
  color: string
}

export const CONSUMPTION_LEVELS: Record<ConsumptionLevel, ConsumptionInfo> = {
  low: {
    level: 'low',
    label: 'Économique',
    description: 'Consomme peu de Doggo',
    icon: '🐕',
    color: 'green'
  },
  medium: {
    level: 'medium',
    label: 'Modéré',
    description: 'Consommation moyenne de Doggo',
    icon: '🦮',
    color: 'yellow'
  },
  high: {
    level: 'high',
    label: 'Intensif',
    description: 'Consomme beaucoup de Doggo',
    icon: '🐺',
    color: 'orange'
  }
}

// ==============================================
// MODEL CONSUMPTION MAPPING
// ==============================================

/**
 * Mapping des modèles vers leur niveau de consommation
 * Basé sur le coût par 1k tokens
 */
export const MODEL_CONSUMPTION: Record<ModelType, ConsumptionLevel> = {
  // Économiques
  'haiku': 'low',
  'gpt-4o-mini': 'low',
  'gpt': 'low',
  'claude': 'low',

  // Modérés
  'sonnet': 'medium',
  'gpt-4o': 'medium',

  // Intensifs
  'opus': 'high'
}

// ==============================================
// CONVERSION FUNCTIONS
// ==============================================

/**
 * Convertit un montant USD en Doggos
 */
export function usdToDoggo(usd: number): number {
  return usd / DOGGO_VALUE_USD
}

/**
 * Convertit des Doggos en USD
 */
export function doggoToUsd(doggo: number): number {
  return doggo * DOGGO_VALUE_USD
}

/**
 * Convertit un montant EUR en Doggos
 */
export function eurToDoggo(eur: number): number {
  return eur / DOGGO_VALUE_EUR
}

/**
 * Convertit des Doggos en EUR
 */
export function doggoToEur(doggo: number): number {
  return doggo * DOGGO_VALUE_EUR
}

// ==============================================
// DISPLAY FUNCTIONS
// ==============================================

/**
 * Formate l'affichage des Doggos
 * @param doggo - Nombre de Doggos
 * @param options - Options de formatage
 */
export function formatDoggo(
  doggo: number,
  options: {
    decimals?: number
    showUnit?: boolean
    showIcon?: boolean
  } = {}
): string {
  const {
    decimals = 2,
    showUnit = true,
    showIcon = false
  } = options

  const formatted = doggo.toFixed(decimals)
  const unit = showUnit ? ' Doggo' : ''
  const plural = Math.abs(doggo) !== 1 ? 's' : ''
  const icon = showIcon ? '🐕 ' : ''

  return `${icon}${formatted}${unit}${plural}`
}

/**
 * Obtient le pourcentage d'utilisation
 */
export function getDoggoUsagePercent(usedDoggo: number, limitDoggo: number = DEFAULT_DOGGO_LIMIT): number {
  if (limitDoggo === 0) return 0
  return (usedDoggo / limitDoggo) * 100
}

/**
 * Obtient le niveau de consommation d'un modèle
 */
export function getModelConsumption(model: ModelType): ConsumptionInfo {
  const level = MODEL_CONSUMPTION[model] || 'medium'
  return CONSUMPTION_LEVELS[level]
}

/**
 * Obtient la couleur de la barre de progression selon le % utilisé
 */
export function getDoggoProgressColor(percent: number): {
  gradient: string
  badge: string
  text: string
} {
  if (percent < 50) {
    return {
      gradient: 'from-green-500 to-green-600',
      badge: 'bg-green-100 text-green-700',
      text: 'text-green-700'
    }
  } else if (percent < 80) {
    return {
      gradient: 'from-yellow-500 to-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700',
      text: 'text-yellow-700'
    }
  } else {
    return {
      gradient: 'from-red-500 to-red-600',
      badge: 'bg-red-100 text-red-700',
      text: 'text-red-700'
    }
  }
}

/**
 * Obtient un message de statut selon l'utilisation
 */
export function getDoggoStatusMessage(percent: number): {
  message: string
  alert: boolean
} {
  if (percent < 50) {
    return {
      message: 'Vous avez encore beaucoup de Doggo disponible',
      alert: false
    }
  } else if (percent < 80) {
    return {
      message: 'Vous approchez de votre limite Doggo',
      alert: false
    }
  } else if (percent < 100) {
    return {
      message: 'Attention : votre Doggo est presque épuisé !',
      alert: true
    }
  } else {
    return {
      message: 'Limite Doggo atteinte - passez au palier supérieur',
      alert: true
    }
  }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Calcule le nombre de Doggos restants
 */
export function getRemainingDoggo(usedDoggo: number, limitDoggo: number = DEFAULT_DOGGO_LIMIT): number {
  return Math.max(0, limitDoggo - usedDoggo)
}

/**
 * Vérifie si la limite Doggo est atteinte
 */
export function isDoggoLimitReached(usedDoggo: number, limitDoggo: number = DEFAULT_DOGGO_LIMIT): boolean {
  return usedDoggo >= limitDoggo
}

/**
 * Convertit les données de budget en format Doggo
 */
export interface DoggoBudget {
  usedDoggo: number
  limitDoggo: number
  percentUsed: number
  remaining: number
  isLimitReached: boolean
  totalConversations: number
}

export function convertBudgetToDoggo(budget: {
  total_cost_usd: number
  budget_limit_usd: number
  total_conversations: number
}): DoggoBudget {
  const usedDoggo = usdToDoggo(budget.total_cost_usd)
  const limitDoggo = DEFAULT_DOGGO_LIMIT // Always 1 Doggo limit
  const percentUsed = getDoggoUsagePercent(usedDoggo, limitDoggo)
  const remaining = getRemainingDoggo(usedDoggo, limitDoggo)
  const isLimitReached = isDoggoLimitReached(usedDoggo, limitDoggo)

  return {
    usedDoggo,
    limitDoggo,
    percentUsed,
    remaining,
    isLimitReached,
    totalConversations: budget.total_conversations
  }
}
