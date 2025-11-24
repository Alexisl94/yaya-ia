/**
 * Stripe Checkout Session API
 * Crée une session de paiement Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, getOrCreateStripeCustomer, isStripeConfigured } from '@/lib/stripe/stripe-server'
import { SUBSCRIPTION_PLANS } from '@/lib/pricing/subscription-plans'
import type { SubscriptionTier } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // Vérifier que Stripe est configuré
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Le système de paiement n\'est pas encore configuré. Consultez STRIPE_SETUP.md' },
        { status: 503 }
      )
    }
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les données de la requête
    const body = await request.json()
    const { planId, billingPeriod = 'monthly' } = body as {
      planId: SubscriptionTier
      billingPeriod: 'monthly' | 'yearly'
    }

    // Valider le plan
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan invalide' }, { status: 400 })
    }

    if (planId === 'free') {
      return NextResponse.json(
        { success: false, error: 'Le plan gratuit ne nécessite pas de paiement' },
        { status: 400 }
      )
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      )
    }

    // Créer ou récupérer le customer Stripe
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      customerId = await getOrCreateStripeCustomer({
        userId: user.id,
        email: profile.email || user.email!,
        name: profile.full_name || undefined,
      })

      // Mettre à jour le profil avec le customer_id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Sélectionner le bon price_id selon la période
    const priceId =
      billingPeriod === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: 'Price ID non configuré pour ce plan' },
        { status: 500 }
      )
    }

    // Créer la session de checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${appUrl}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancelUrl: `${appUrl}/settings?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_period: billingPeriod,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la session',
      },
      { status: 500 }
    )
  }
}
