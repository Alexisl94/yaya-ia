/**
 * API Route: Business Profile by ID
 * PATCH - Update specific business profile
 * DELETE - Delete business profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { updateBusinessProfile, deleteBusinessProfile, getBusinessProfile } from '@/lib/db/business-profiles'
import { createClient } from '@/lib/supabase/server'
import type { UpdateBusinessProfileInput } from '@/types/database'

/**
 * PATCH /api/business-profiles/[id]
 * Updates a business profile (only if owned by authenticated user)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get profile ID
    const { id: profileId } = await params

    // 3. Verify ownership
    const supabase = await createClient()
    const { data: profile, error: fetchError } = await supabase
      .from('business_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 4. Parse request body
    const body = await request.json()

    // 5. Prepare update input
    const input: UpdateBusinessProfileInput = {
      business_name: body.business_name,
      business_type: body.business_type,
      location: body.location,
      years_experience: body.years_experience,
      main_clients: body.main_clients,
      specificities: body.specificities,
      typical_project_size: body.typical_project_size,
      main_challenges: body.main_challenges,
      tools_used: body.tools_used,
      primary_goals: body.primary_goals,
      business_values: body.business_values,
      example_projects: body.example_projects,
    }

    // 6. Update profile
    const result = await updateBusinessProfile(profileId, input)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('Error updating business profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/business-profiles/[id]
 * Deletes a business profile (only if owned by authenticated user)
 * WARNING: This will set all agents' business_profile_id to NULL
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get profile ID
    const { id: profileId } = await params

    // 3. Verify ownership
    const supabase = await createClient()
    const { data: profile, error: fetchError } = await supabase
      .from('business_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 4. Delete profile
    const result = await deleteBusinessProfile(profileId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting business profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
