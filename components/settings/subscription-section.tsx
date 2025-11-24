'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Check, Zap, Crown, Sparkles, ArrowRight, Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  convertBudgetToDoggo,
  formatDoggo,
  getDoggoProgressColor,
  getDoggoStatusMessage,
} from '@/lib/utils/doggo-pricing'
import { getAllPlans, type SubscriptionPlan } from '@/lib/pricing/subscription-plans'
import type { SubscriptionTier } from '@/types/database'
import { toast } from 'sonner'

interface SubscriptionSectionProps {
  userId: string
}

// Mapper les icons
const ICON_MAP = {
  free: Sparkles,
  pro: Zap,
  enterprise: Crown,
}

export function SubscriptionSection({ userId }: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionTier>('free')
  const [monthlyBudget, setMonthlyBudget] = useState<any>(null)
  const plans = getAllPlans()

  useEffect(() => {
    loadSubscriptionData()
  }, [userId])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Load user subscription
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', userId)
        .single()

      if (profile) {
        setCurrentPlan((profile.subscription_tier as SubscriptionTier) || 'free')
      }

      // Load monthly budget
      const response = await fetch('/api/budget/monthly')
      const result = await response.json()
      if (result.success) {
        setMonthlyBudget(result.data)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: SubscriptionTier) => {
    if (planId === 'free') {
      return
    }

    try {
      setUpgrading(planId)

      // Créer une session de checkout Stripe
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingPeriod: 'monthly', // ou 'yearly' si vous voulez offrir le choix
        }),
      })

      const result = await response.json()

      if (result.success && result.data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = result.data.url
      } else {
        throw new Error(result.error || 'Erreur lors de la création de la session')
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors du paiement')
      setUpgrading(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setUpgrading('portal')

      // Ouvrir le portail client Stripe
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success && result.data.url) {
        window.location.href = result.data.url
      } else {
        throw new Error(result.error || 'Erreur lors de l\'ouverture du portail')
      }
    } catch (error) {
      console.error('Error opening portal:', error)
      toast.error('Erreur lors de l\'ouverture du portail de gestion')
      setUpgrading(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const doggo = monthlyBudget ? convertBudgetToDoggo(monthlyBudget) : null
  const colors = doggo ? getDoggoProgressColor(doggo.percentUsed) : null
  const status = doggo ? getDoggoStatusMessage(doggo.percentUsed) : null

  return (
    <div className="space-y-6">
      {/* Current Usage */}
      {doggo && (
        <Card className={cn(
          "border-2",
          doggo.percentUsed >= 80 && "border-orange-500 bg-orange-50/50"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🐕</span>
              Utilisation mensuelle
            </CardTitle>
            <CardDescription>
              Votre consommation pour le mois en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-900">
                  {doggo.percentUsed.toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {status?.message}
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {formatDoggo(doggo.usedDoggo, { decimals: 2 })} / {formatDoggo(doggo.limitDoggo, { decimals: 0 })}
              </Badge>
            </div>

            <Progress
              value={doggo.percentUsed}
              className={cn("h-3", colors?.gradient)}
            />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-xl font-bold">{doggo.totalConversations}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Restant</p>
                <p className="text-xl font-bold">{formatDoggo(doggo.remaining, { decimals: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Subscription Button (for paid plans) */}
      {currentPlan !== 'free' && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Gérer mon abonnement
              </h3>
              <p className="text-sm text-muted-foreground">
                Modifier votre plan, mettre à jour vos informations de paiement, ou annuler votre abonnement
              </p>
            </div>
            <Button
              onClick={handleManageSubscription}
              disabled={upgrading === 'portal'}
              variant="outline"
            >
              {upgrading === 'portal' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings2 className="w-4 h-4 mr-2" />
              )}
              Gérer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = ICON_MAP[plan.id]
          const isCurrentPlan = currentPlan === plan.id
          const isUpgrading = upgrading === plan.id

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative",
                plan.popular && "border-2 border-amber-500 shadow-lg",
                isCurrentPlan && "ring-2 ring-green-500"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Populaire
                </div>
              )}

              <CardHeader>
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br",
                  plan.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-bold">{plan.priceMonthly}€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.limits.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || isUpgrading}
                  className={cn(
                    "w-full",
                    plan.popular && !isCurrentPlan && "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  )}
                  variant={plan.popular && !isCurrentPlan ? "default" : "outline"}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Plan actuel
                    </>
                  ) : plan.priceMonthly === 0 ? (
                    'Plan actif'
                  ) : (
                    <>
                      {plan.ctaText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info */}
      <Card className="bg-slate-50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note :</strong> Tous les tarifs sont HT. Vous pouvez résilier ou changer de plan à tout moment.
            Les changements prennent effet immédiatement. Garantie satisfait ou remboursé 14 jours.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
