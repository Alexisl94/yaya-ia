/**
 * Subscription Limits Checker
 * Fonctions pour vérifier les limites des abonnements
 */

import { createClient } from '@/lib/supabase/server'
import { getPlanLimits, isModelAllowed } from '@/lib/pricing/subscription-plans'
import { usdToDoggo } from '@/lib/utils/doggo-pricing'
import type { SubscriptionTier, ModelType } from '@/types/database'

/**
 * Résultat de vérification de limite
 */
export interface LimitCheckResult {
  allowed: boolean
  reason?: string
  currentUsage?: number
  limit?: number
}

/**
 * Vérifie si l'utilisateur peut créer un nouvel agent
 */
export async function checkCanCreateAgent(userId: string): Promise<LimitCheckResult> {
  try {
    const supabase = await createClient()

    // Récupérer le tier de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { allowed: false, reason: 'Profil utilisateur introuvable' }
    }

    const tier = (profile.subscription_tier as SubscriptionTier) || 'free'
    const limits = getPlanLimits(tier)

    // Compter le nombre d'agents actifs
    const { count, error: countError } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (countError) {
      return { allowed: false, reason: 'Erreur lors de la vérification des limites' }
    }

    const currentAgents = count || 0

    if (currentAgents >= limits.maxAgents) {
      return {
        allowed: false,
        reason: `Limite d'agents atteinte (${currentAgents}/${limits.maxAgents}). Passez à un plan supérieur.`,
        currentUsage: currentAgents,
        limit: limits.maxAgents,
      }
    }

    return {
      allowed: true,
      currentUsage: currentAgents,
      limit: limits.maxAgents,
    }
  } catch (error) {
    console.error('Error checking agent limit:', error)
    return { allowed: false, reason: 'Erreur lors de la vérification' }
  }
}

/**
 * Vérifie si l'utilisateur peut utiliser un modèle spécifique
 */
export async function checkCanUseModel(
  userId: string,
  model: ModelType
): Promise<LimitCheckResult> {
  try {
    const supabase = await createClient()

    // Récupérer le tier de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { allowed: false, reason: 'Profil utilisateur introuvable' }
    }

    const tier = (profile.subscription_tier as SubscriptionTier) || 'free'

    // Vérifier si le modèle est autorisé pour ce tier
    if (!isModelAllowed(tier, model)) {
      return {
        allowed: false,
        reason: `Le modèle ${model} n'est pas disponible dans votre plan. Passez à un plan supérieur.`,
      }
    }

    // Pour les modèles premium, vérifier les quotas
    const limits = getPlanLimits(tier)
    const premiumModels = ['gpt-4o', 'sonnet', 'opus'] as const

    if (premiumModels.includes(model as any)) {
      const quota = limits.premiumModelsQuota[model as 'gpt-4o' | 'sonnet' | 'opus']

      if (quota !== undefined) {
        // Compter l'utilisation ce mois-ci
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('model_used', model)
          .gte('created_at', startOfMonth.toISOString())
          .in('conversation_id',
            supabase
              .from('conversations')
              .select('id')
              .eq('user_id', userId)
          )

        if (countError) {
          console.error('Error counting model usage:', countError)
        }

        const currentUsage = count || 0

        if (currentUsage >= quota) {
          return {
            allowed: false,
            reason: `Quota mensuel de ${model} atteint (${currentUsage}/${quota}). Renouvellement le 1er du mois.`,
            currentUsage,
            limit: quota,
          }
        }

        return {
          allowed: true,
          currentUsage,
          limit: quota,
        }
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Error checking model usage:', error)
    return { allowed: false, reason: 'Erreur lors de la vérification' }
  }
}

/**
 * Vérifie si l'utilisateur peut envoyer un message (limite Doggos)
 */
export async function checkCanSendMessage(userId: string): Promise<LimitCheckResult> {
  try {
    const supabase = await createClient()

    // Récupérer le tier et le budget mensuel de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { allowed: false, reason: 'Profil utilisateur introuvable' }
    }

    const tier = (profile.subscription_tier as SubscriptionTier) || 'free'
    const limits = getPlanLimits(tier)

    // Récupérer l'utilisation du mois en cours
    const { data: budgetData, error: budgetError } = await supabase
      .rpc('get_user_monthly_budget', { p_user_id: userId })

    if (budgetError) {
      console.error('Error fetching monthly budget:', budgetError)
      return { allowed: false, reason: 'Erreur lors de la vérification du budget' }
    }

    const budget = budgetData && budgetData.length > 0 ? budgetData[0] : null
    const usedUSD = budget?.total_cost_usd || 0
    const usedDoggo = usdToDoggo(usedUSD)

    if (usedDoggo >= limits.maxDoggoMonthly) {
      return {
        allowed: false,
        reason: `Limite mensuelle de Doggos atteinte (${Math.round(usedDoggo)}/${limits.maxDoggoMonthly}). Passez à un plan supérieur ou attendez le renouvellement.`,
        currentUsage: Math.round(usedDoggo),
        limit: limits.maxDoggoMonthly,
      }
    }

    return {
      allowed: true,
      currentUsage: Math.round(usedDoggo),
      limit: limits.maxDoggoMonthly,
    }
  } catch (error) {
    console.error('Error checking message limit:', error)
    return { allowed: false, reason: 'Erreur lors de la vérification' }
  }
}

/**
 * Vérifie toutes les limites avant d'envoyer un message avec un modèle spécifique
 */
export async function checkAllLimitsForMessage(
  userId: string,
  model: ModelType
): Promise<LimitCheckResult> {
  // Vérifier la limite de Doggos
  const doggoCheck = await checkCanSendMessage(userId)
  if (!doggoCheck.allowed) {
    return doggoCheck
  }

  // Vérifier si le modèle est autorisé et les quotas
  const modelCheck = await checkCanUseModel(userId, model)
  if (!modelCheck.allowed) {
    return modelCheck
  }

  return { allowed: true }
}

/**
 * Récupère un résumé de toutes les limites de l'utilisateur
 */
export async function getUserLimitsSummary(userId: string) {
  try {
    const supabase = await createClient()

    // Récupérer le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (!profile) {
      return null
    }

    const tier = (profile.subscription_tier as SubscriptionTier) || 'free'
    const limits = getPlanLimits(tier)

    // Compter les agents
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    // Récupérer le budget mensuel
    const { data: budgetData } = await supabase
      .rpc('get_user_monthly_budget', { p_user_id: userId })

    const budget = budgetData && budgetData.length > 0 ? budgetData[0] : null
    const usedUSD = budget?.total_cost_usd || 0
    const usedDoggo = usdToDoggo(usedUSD)

    return {
      tier,
      agents: {
        current: agentCount || 0,
        limit: limits.maxAgents,
        percentage: ((agentCount || 0) / limits.maxAgents) * 100,
      },
      doggo: {
        current: Math.round(usedDoggo),
        limit: limits.maxDoggoMonthly,
        percentage: (usedDoggo / limits.maxDoggoMonthly) * 100,
      },
      allowedModels: limits.allowedModels,
      premiumQuotas: limits.premiumModelsQuota,
    }
  } catch (error) {
    console.error('Error getting limits summary:', error)
    return null
  }
}
