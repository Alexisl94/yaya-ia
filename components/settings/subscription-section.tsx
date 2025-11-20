'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  convertBudgetToDoggo,
  formatDoggo,
  getDoggoProgressColor,
  getDoggoStatusMessage,
} from '@/lib/utils/doggo-pricing'

interface SubscriptionSectionProps {
  userId: string
}

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    icon: Sparkles,
    features: [
      '1 agent IA',
      '50 conversations/mois',
      'Modèles économiques',
      'Support communautaire',
    ],
    color: 'from-slate-500 to-slate-600',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 10,
    icon: Zap,
    popular: true,
    features: [
      '3 agents IA',
      '300 conversations/mois',
      'Tous les modèles économiques',
      '20 requêtes GPT-4o/mois',
      'Support prioritaire',
      'Optimisation automatique',
    ],
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 30,
    icon: Crown,
    features: [
      '10 agents IA',
      '800 conversations/mois',
      'Tous les modèles disponibles',
      '50 requêtes GPT-4o/mois',
      '10 requêtes Opus/mois',
      'Support premium 24/7',
      'Analyses avancées',
    ],
    color: 'from-purple-500 to-purple-600',
  },
]

export function SubscriptionSection({ userId }: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [monthlyBudget, setMonthlyBudget] = useState<any>(null)

  useEffect(() => {
    loadSubscriptionData()
  }, [userId])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Load user subscription (from profiles or a subscriptions table)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', userId)
        .single()

      if (profile) {
        setCurrentPlan(profile.subscription_plan || 'free')
      }

      // Load monthly budget
      const response = await fetch('/api/budget/monthly')
      const result = await response.json()
      if (result.success) {
        setMonthlyBudget(result.data)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (planId: string) => {
    // TODO: Implement Stripe checkout
    console.log('Upgrade to:', planId)
    alert('La fonctionnalité de paiement Stripe sera bientôt disponible !')
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

      {/* Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = currentPlan === plan.id

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
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  className={cn(
                    "w-full",
                    plan.popular && "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Plan actuel
                    </>
                  ) : plan.price === 0 ? (
                    'Plan actif'
                  ) : (
                    <>
                      Passer à {plan.name}
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
