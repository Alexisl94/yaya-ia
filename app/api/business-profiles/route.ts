/**
 * API Route: Business Profiles
 * GET - Retrieve user's business profile
 * POST - Create or update business profile (upsert)
 */

import { NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { getBusinessProfile, upsertBusinessProfile } from '@/lib/db/business-profiles'
import type { CreateBusinessProfileInput } from '@/types/database'

/**
 * GET /api/business-profiles
 * Retrieves the authenticated user's business profile
 */
export async function GET() {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get business profile
    const result = await getBusinessProfile(user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    // 3. Return profile (can be null if doesn't exist)
    return NextResponse.json({
      success: true,
      data: result.data,
      exists: result.data !== null
    })

  } catch (error) {
    console.error('Error fetching business profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/business-profiles
 * Creates or updates the authenticated user's business profile
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()

    // 3. Validate required fields
    if (!body.business_name || body.business_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'business_name is required' },
        { status: 400 }
      )
    }

    // 4. Prepare input
    const input: CreateBusinessProfileInput = {
      user_id: user.id,
      business_name: body.business_name.trim(),
      business_type: body.business_type || null,
      location: body.location || null,
      years_experience: body.years_experience || null,
      main_clients: body.main_clients || null,
      specificities: body.specificities || null,
      typical_project_size: body.typical_project_size || null,
      main_challenges: body.main_challenges || null,
      tools_used: body.tools_used || null,
      primary_goals: body.primary_goals || [],
      business_values: body.business_values || null,
      example_projects: body.example_projects || null,
    }

    // 5. Create or update profile
    const result = await upsertBusinessProfile(input)

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
    console.error('Error creating/updating business profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
