/**
 * Stripe Webhook Handler
 * Gère les événements Stripe (paiements, annulations, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, verifyWebhookSignature } from '@/lib/stripe/stripe-server'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionTier, SubscriptionStatus } from '@/types/database'
import Stripe from 'stripe'

// Désactiver le body parser de Next.js pour les webhooks
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Récupérer le body brut
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Gère la completion d'une session de checkout
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const planId = session.metadata?.plan_id as SubscriptionTier

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session')
    return
  }

  const supabase = await createClient()

  // Récupérer l'abonnement Stripe
  const subscriptionId = session.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Mettre à jour le profil utilisateur
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: planId,
      subscription_status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  console.log(`✅ Subscription activated for user ${userId} - Plan: ${planId}`)
}

/**
 * Gère la mise à jour d'un abonnement
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  const supabase = await createClient()

  // Mapper le statut Stripe vers notre enum
  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'active',
    canceled: 'canceled',
    past_due: 'past_due',
    trialing: 'trialing',
  }

  const status = statusMap[subscription.status] || 'active'

  // Déterminer le tier basé sur le price_id
  const priceId = subscription.items.data[0]?.price.id
  let tier: SubscriptionTier = 'free'

  // Mapper price_id vers tier (à adapter selon vos price IDs)
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY || priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
    tier = 'pro'
  } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || priceId === process.env.STRIPE_PRICE_ENTERPRISE_YEARLY) {
    tier = 'enterprise'
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log(`✅ Subscription updated for user ${userId} - Status: ${status}`)
}

/**
 * Gère la suppression d'un abonnement
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  const supabase = await createClient()

  // Repasser l'utilisateur en plan gratuit
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }

  console.log(`✅ Subscription canceled for user ${userId} - Reverted to free plan`)
}

/**
 * Gère le succès d'un paiement de facture
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await handleSubscriptionUpdate(subscription)

  console.log(`✅ Invoice payment succeeded for subscription ${subscriptionId}`)
}

/**
 * Gère l'échec d'un paiement de facture
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  const customerId = invoice.customer as string

  if (!subscriptionId) {
    return
  }

  const supabase = await createClient()

  // Trouver l'utilisateur par customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Mettre à jour le statut
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) {
    console.error('Error updating payment status:', error)
    throw error
  }

  console.log(`⚠️ Invoice payment failed for subscription ${subscriptionId}`)
}
