/**
 * Database helper functions for BusinessProfile operations
 * Provides centralized business profile management
 */

import { createClient } from '@/lib/supabase/server'
import type {
  BusinessProfile,
  CreateBusinessProfileInput,
  UpdateBusinessProfileInput,
  DatabaseResult,
} from '@/types/database'

/**
 * Gets the business profile for a user
 *
 * @param {string} userId - User UUID
 * @returns {Promise<DatabaseResult<BusinessProfile | null>>} Business profile or null
 *
 * @example
 * const result = await getBusinessProfile('user-uuid');
 * if (result.success && result.data) {
 *   console.log('Profile found:', result.data);
 * }
 */
export async function getBusinessProfile(
  userId: string
): Promise<DatabaseResult<BusinessProfile | null>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // PGRST116 = no rows returned
      if (error.code === 'PGRST116') {
        return { success: true, data: null }
      }
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Creates a new business profile for a user
 *
 * @param {CreateBusinessProfileInput} input - Profile creation data
 * @returns {Promise<DatabaseResult<BusinessProfile>>} Created profile or error
 *
 * @example
 * const result = await createBusinessProfile({
 *   user_id: 'uuid',
 *   business_name: 'Alex Marketing',
 *   business_type: 'freelance',
 *   location: 'Lyon',
 *   main_clients: 'PME locales'
 * });
 */
export async function createBusinessProfile(
  input: CreateBusinessProfileInput
): Promise<DatabaseResult<BusinessProfile>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('business_profiles')
      .insert({
        user_id: input.user_id,
        business_name: input.business_name,
        business_type: input.business_type || null,
        location: input.location || null,
        years_experience: input.years_experience || null,
        main_clients: input.main_clients || null,
        specificities: input.specificities || null,
        typical_project_size: input.typical_project_size || null,
        main_challenges: input.main_challenges || null,
        tools_used: input.tools_used || null,
        primary_goals: input.primary_goals || [],
        business_values: input.business_values || null,
        example_projects: input.example_projects || null,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Updates a business profile
 *
 * @param {string} profileId - Profile UUID
 * @param {UpdateBusinessProfileInput} input - Fields to update
 * @returns {Promise<DatabaseResult<BusinessProfile>>} Updated profile or error
 *
 * @example
 * const result = await updateBusinessProfile('profile-uuid', {
 *   business_name: 'Nouveau nom',
 *   location: 'Paris'
 * });
 */
export async function updateBusinessProfile(
  profileId: string,
  input: UpdateBusinessProfileInput
): Promise<DatabaseResult<BusinessProfile>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('business_profiles')
      .update(input)
      .eq('id', profileId)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Deletes a business profile
 * WARNING: This will set all agents' business_profile_id to NULL
 *
 * @param {string} profileId - Profile UUID
 * @returns {Promise<DatabaseResult<void>>} Success or error
 *
 * @example
 * const result = await deleteBusinessProfile('profile-uuid');
 */
export async function deleteBusinessProfile(
  profileId: string
): Promise<DatabaseResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('business_profiles')
      .delete()
      .eq('id', profileId)

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Creates or updates a business profile (upsert)
 * Checks if profile exists for user, creates if not, updates if yes
 *
 * @param {CreateBusinessProfileInput} input - Profile data
 * @returns {Promise<DatabaseResult<BusinessProfile>>} Created/updated profile or error
 *
 * @example
 * const result = await upsertBusinessProfile({
 *   user_id: 'uuid',
 *   business_name: 'Alex Marketing',
 *   business_type: 'freelance'
 * });
 */
export async function upsertBusinessProfile(
  input: CreateBusinessProfileInput
): Promise<DatabaseResult<BusinessProfile>> {
  try {
    const supabase = await createClient()

    // Check if profile exists
    const existingProfile = await getBusinessProfile(input.user_id)

    if (!existingProfile.success) {
      return existingProfile as DatabaseResult<BusinessProfile>
    }

    // Update if exists
    if (existingProfile.data) {
      return updateBusinessProfile(existingProfile.data.id, input)
    }

    // Create if doesn't exist
    return createBusinessProfile(input)
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}
