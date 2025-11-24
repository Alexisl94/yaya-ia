/**
 * Stripe Server-side Configuration
 * Initialisation de Stripe côté serveur
 */

import Stripe from 'stripe'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const isConfigured = STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('placeholder')

if (!isConfigured) {
  console.warn('⚠️  Stripe is not configured. Payment features will be disabled.')
  console.warn('📖 See STRIPE_SETUP.md for setup instructions.')
}

// Utiliser une clé factice si non configuré (pour éviter les erreurs au build)
const stripeKey = isConfigured ? STRIPE_SECRET_KEY : 'sk_test_51placeholder'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

// Helper pour vérifier si Stripe est configuré
export function isStripeConfigured(): boolean {
  return isConfigured
}

/**
 * Crée ou récupère un client Stripe pour un utilisateur
 */
export async function getOrCreateStripeCustomer(params: {
  userId: string
  email: string
  name?: string
}): Promise<string> {
  const { userId, email, name } = params

  // D'abord vérifier si l'utilisateur a déjà un customer_id dans Supabase
  // (géré par l'appelant avec createClient)

  // Créer un nouveau customer Stripe
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      supabase_user_id: userId,
    },
  })

  return customer.id
}

/**
 * Crée une session de checkout Stripe
 */
export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<Stripe.Checkout.Session> {
  const { customerId, priceId, successUrl, cancelUrl, metadata } = params

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata || {},
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    subscription_data: {
      metadata: metadata || {},
    },
  })

  return session
}

/**
 * Crée une session de portail client Stripe
 */
export async function createBillingPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<Stripe.BillingPortal.Session> {
  const { customerId, returnUrl } = params

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

/**
 * Récupère un abonnement Stripe
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

/**
 * Annule un abonnement
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Vérifie la signature d'un webhook Stripe
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
