/**
 * Stripe Customer Portal API
 * Redirige vers le portail client Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession, isStripeConfigured } from '@/lib/stripe/stripe-server'

export async function POST(request: NextRequest) {
  try {
    // Vérifier que Stripe est configuré
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Le système de paiement n\'est pas encore configuré.' },
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

    // Récupérer le profil utilisateur avec stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profil utilisateur introuvable' },
        { status: 404 }
      )
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: 'Aucun abonnement Stripe trouvé' },
        { status: 400 }
      )
    }

    // Créer une session de portail client
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await createBillingPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: `${appUrl}/settings`,
    })

    return NextResponse.json({
      success: true,
      data: {
        url: session.url,
      },
    })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erreur lors de la création de la session',
      },
      { status: 500 }
    )
  }
}
