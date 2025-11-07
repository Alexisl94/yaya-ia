/**
 * Supabase Auth Helper Functions (Server-Side Only)
 * Use these functions in Server Components, Server Actions, and API routes
 *
 * ⚠️ DO NOT import this file in Client Components!
 * For client-side auth, use @/lib/supabase/auth instead
 */

import { createClient as createServerClient } from './server'

// =============================================
// SERVER-SIDE AUTH FUNCTIONS
// =============================================

/**
 * Gets the current user session (server-side)
 * Use this in Server Components and API routes
 *
 * @returns {Promise<any>} Current user or null
 *
 * @example
 * // In a Server Component
 * import { getUserServer } from '@/lib/supabase/auth-server'
 *
 * const user = await getUserServer()
 * if (!user) {
 *   redirect('/login')
 * }
 */
export async function getUserServer() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (err) {
    console.error('Error getting user (server):', err)
    return null
  }
}

/**
 * Gets the current session (server-side)
 *
 * @returns {Promise<any>} Current session or null
 *
 * @example
 * import { getSessionServer } from '@/lib/supabase/auth-server'
 *
 * const session = await getSessionServer()
 */
export async function getSessionServer() {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (err) {
    console.error('Error getting session (server):', err)
    return null
  }
}

/**
 * Checks if user has completed onboarding
 *
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if onboarding completed
 *
 * @example
 * import { checkOnboardingStatus } from '@/lib/supabase/auth-server'
 *
 * const hasOnboarded = await checkOnboardingStatus(user.id)
 * if (!hasOnboarded) {
 *   redirect('/onboarding')
 * }
 */
export async function checkOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient()

    // Check if user has created at least one agent
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (error) {
      console.error('Error checking onboarding status:', error)
      return false
    }

    return (data && data.length > 0) || false
  } catch (err) {
    console.error('Error checking onboarding:', err)
    return false
  }
}

/**
 * Gets Supabase server client
 * Use this when you need direct access to the Supabase client in server context
 *
 * @returns {Promise<SupabaseClient>} Supabase client instance
 *
 * @example
 * import { getSupabaseServer } from '@/lib/supabase/auth-server'
 *
 * const supabase = await getSupabaseServer()
 * const { data } = await supabase.from('agents').select('*')
 */
export async function getSupabaseServer() {
  return await createServerClient()
}
