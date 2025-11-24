/**
 * Subscription Plans Configuration
 * Définition claire des limites et fonctionnalités par plan
 */

import { SubscriptionTier } from '@/types/database'
import { ModelType } from '@/types/database'

export interface PlanLimits {
  maxAgents: number
  maxDoggoMonthly: number
  maxConversationsMonthly: number
  allowedModels: ModelType[]
  premiumModelsQuota: {
    'gpt-4o'?: number
    'sonnet'?: number
    'opus'?: number
  }
  features: string[]
  support: 'community' | 'priority' | 'premium'
}

export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  limits: PlanLimits
  popular?: boolean
  color: string
  ctaText: string
}

/**
 * Configuration des plans d'abonnement
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour découvrir yaya.ia',
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    limits: {
      maxAgents: 1,
      maxDoggoMonthly: 1000, // ~0.50€ de tokens
      maxConversationsMonthly: 50,
      allowedModels: ['haiku', 'gpt-4o-mini', 'claude', 'gpt'],
      premiumModelsQuota: {},
      features: [
        '1 agent IA personnalisé',
        '1000 Doggos/mois (~50 conversations)',
        'Modèles économiques (Haiku, GPT-4o-mini)',
        'Support communautaire',
        'Toutes les fonctionnalités de base',
      ],
      support: 'community',
    },
    color: 'from-slate-500 to-slate-600',
    ctaText: 'Plan actuel',
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les professionnels exigeants',
    priceMonthly: 10,
    priceYearly: 96, // 2 mois offerts
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    popular: true,
    limits: {
      maxAgents: 3,
      maxDoggoMonthly: 10000, // 5€ de tokens
      maxConversationsMonthly: 300,
      allowedModels: ['haiku', 'gpt-4o-mini', 'gpt-4o', 'sonnet', 'claude', 'gpt'],
      premiumModelsQuota: {
        'gpt-4o': 20,
        'sonnet': 50,
      },
      features: [
        '3 agents IA personnalisés',
        '10 000 Doggos/mois (~300 conversations)',
        'Tous les modèles économiques illimités',
        '50 requêtes Sonnet/mois',
        '20 requêtes GPT-4o/mois',
        'Support prioritaire email',
        'Optimisation automatique des coûts',
        'Analyses de performance',
      ],
      support: 'priority',
    },
    color: 'from-amber-500 to-orange-600',
    ctaText: 'Passer au Pro',
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les équipes et grandes organisations',
    priceMonthly: 30,
    priceYearly: 288, // 2 mois offerts
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
    stripePriceIdYearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',
    limits: {
      maxAgents: 10,
      maxDoggoMonthly: 30000, // 15€ de tokens
      maxConversationsMonthly: 800,
      allowedModels: ['haiku', 'gpt-4o-mini', 'gpt-4o', 'sonnet', 'opus', 'claude', 'gpt'],
      premiumModelsQuota: {
        'gpt-4o': 50,
        'sonnet': 150,
        'opus': 10,
      },
      features: [
        '10 agents IA personnalisés',
        '30 000 Doggos/mois (~800 conversations)',
        'Tous les modèles disponibles',
        '150 requêtes Sonnet/mois',
        '50 requêtes GPT-4o/mois',
        '10 requêtes Opus/mois',
        'Support premium 24/7',
        'Intégrations API avancées',
        'Analyses prédictives',
        'Gestionnaire de compte dédié',
      ],
      support: 'premium',
    },
    color: 'from-purple-500 to-purple-600',
    ctaText: 'Passer à Enterprise',
  },
}

/**
 * Récupère la configuration d'un plan
 */
export function getPlan(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier]
}

/**
 * Récupère les limites d'un plan
 */
export function getPlanLimits(tier: SubscriptionTier): PlanLimits {
  return SUBSCRIPTION_PLANS[tier].limits
}

/**
 * Vérifie si un modèle est autorisé pour un plan
 */
export function isModelAllowed(tier: SubscriptionTier, model: ModelType): boolean {
  const limits = getPlanLimits(tier)
  return limits.allowedModels.includes(model)
}

/**
 * Vérifie si un utilisateur peut créer un nouvel agent
 */
export function canCreateAgent(tier: SubscriptionTier, currentAgentCount: number): boolean {
  const limits = getPlanLimits(tier)
  return currentAgentCount < limits.maxAgents
}

/**
 * Vérifie si la limite de Doggos mensuelle est atteinte
 */
export function isDoggoLimitReached(tier: SubscriptionTier, usedDoggo: number): boolean {
  const limits = getPlanLimits(tier)
  return usedDoggo >= limits.maxDoggoMonthly
}

/**
 * Calcule le pourcentage d'utilisation des Doggos
 */
export function getDoggoUsagePercent(tier: SubscriptionTier, usedDoggo: number): number {
  const limits = getPlanLimits(tier)
  return (usedDoggo / limits.maxDoggoMonthly) * 100
}

/**
 * Récupère le quota restant pour un modèle premium
 */
export function getPremiumModelQuota(
  tier: SubscriptionTier,
  model: 'gpt-4o' | 'sonnet' | 'opus'
): number | null {
  const limits = getPlanLimits(tier)
  return limits.premiumModelsQuota[model] || null
}

/**
 * Récupère tous les plans triés par prix
 */
export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS).sort((a, b) => a.priceMonthly - b.priceMonthly)
}

/**
 * Récupère les plans payants uniquement
 */
export function getPaidPlans(): SubscriptionPlan[] {
  return getAllPlans().filter(plan => plan.priceMonthly > 0)
}

/**
 * Compare deux plans
 */
export function comparePlans(tierA: SubscriptionTier, tierB: SubscriptionTier): number {
  const planA = getPlan(tierA)
  const planB = getPlan(tierB)
  return planA.priceMonthly - planB.priceMonthly
}

/**
 * Vérifie si un upgrade est possible
 */
export function canUpgrade(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  return comparePlans(currentTier, targetTier) < 0
}

/**
 * Vérifie si un downgrade est possible
 */
export function canDowngrade(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  return comparePlans(currentTier, targetTier) > 0
}
