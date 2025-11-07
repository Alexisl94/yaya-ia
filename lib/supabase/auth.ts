/**
 * Supabase Auth Helper Functions
 * Provides authentication utilities for client-side and server-side operations
 */

import { createClient as createBrowserClient } from './client'
import { createClient as createServerClient } from './server'  // Only used server-side

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: any
}

// =============================================
// CLIENT-SIDE AUTH FUNCTIONS
// =============================================

/**
 * Signs up a new user with email and password
 *
 * @param {SignUpData} data - User registration data
 * @returns {Promise<AuthResult>} Result with user data or error
 *
 * @example
 * const result = await signUp({
 *   email: 'user@example.com',
 *   password: 'securepassword123',
 *   fullName: 'John Doe'
 * })
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const supabase = createBrowserClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName || '',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      user: authData.user,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Signs in a user with email and password
 *
 * @param {SignInData} data - User login credentials
 * @returns {Promise<AuthResult>} Result with user data or error
 *
 * @example
 * const result = await signIn({
 *   email: 'user@example.com',
 *   password: 'securepassword123'
 * })
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  try {
    const supabase = createBrowserClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      user: authData.user,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Signs out the current user
 *
 * @returns {Promise<AuthResult>} Result of sign out operation
 *
 * @example
 * const result = await signOut()
 * if (result.success) {
 *   router.push('/login')
 * }
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Gets the current user session (client-side)
 *
 * @returns {Promise<any>} Current user or null
 *
 * @example
 * const user = await getUser()
 * if (user) {
 *   console.log('User is logged in:', user.email)
 * }
 */
export async function getUser() {
  try {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (err) {
    console.error('Error getting user:', err)
    return null
  }
}

/**
 * Gets the current session (client-side)
 *
 * @returns {Promise<any>} Current session or null
 *
 * @example
 * const session = await getSession()
 * if (session) {
 *   console.log('Session expires at:', session.expires_at)
 * }
 */
export async function getSession() {
  try {
    const supabase = createBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (err) {
    console.error('Error getting session:', err)
    return null
  }
}

/**
 * Signs in with OAuth provider (Google, GitHub, etc.)
 *
 * @param {string} provider - OAuth provider name
 * @returns {Promise<AuthResult>} Result of OAuth sign in
 *
 * @example
 * const result = await signInWithOAuth('google')
 * // User will be redirected to Google for authentication
 */
export async function signInWithOAuth(provider: 'google' | 'github'): Promise<AuthResult> {
  try {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Sends a password reset email
 *
 * @param {string} email - User email address
 * @returns {Promise<AuthResult>} Result of password reset request
 *
 * @example
 * const result = await resetPassword('user@example.com')
 * if (result.success) {
 *   alert('Check your email for password reset link')
 * }
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Updates user password
 *
 * @param {string} newPassword - New password
 * @returns {Promise<AuthResult>} Result of password update
 *
 * @example
 * const result = await updatePassword('newSecurePassword123')
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

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
