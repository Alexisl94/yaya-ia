/**
 * API Route: Create Agent
 * Handles agent creation from the onboarding flow
 * Now includes business profile creation/linking
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createAgent } from '@/lib/db/agents'
import { upsertBusinessProfile, getBusinessProfile } from '@/lib/db/business-profiles'

export async function POST(request: NextRequest) {
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
    const { name, sector_id, system_prompt, model, agent_type, settings, business_profile } = body

    // 3. Validate required fields
    if (!name || !system_prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, system_prompt' },
        { status: 400 }
      )
    }

    // 3.5. Get sector_id from slug if not provided
    let finalSectorId = sector_id
    if (!finalSectorId && settings?.sectorSlug) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: sector } = await supabase
        .from('sectors')
        .select('id')
        .eq('slug', settings.sectorSlug)
        .single()

      if (sector) {
        finalSectorId = sector.id
      } else {
        // Fallback: use first sector
        const { data: firstSector } = await supabase
          .from('sectors')
          .select('id')
          .limit(1)
          .single()
        finalSectorId = firstSector?.id
      }
    }

    // 3.6. Handle business profile (new logic)
    let businessProfileId: string | null = null

    if (business_profile && business_profile.businessName) {
      // Check if profileId was provided (reusing existing profile)
      if (business_profile.profileId) {
        businessProfileId = business_profile.profileId
      } else {
        // Create or update business profile
        const profileResult = await upsertBusinessProfile({
          user_id: user.id,
          business_name: business_profile.businessName,
          business_type: business_profile.businessType || null,
          location: business_profile.location || null,
          years_experience: business_profile.yearsExperience || null,
          main_clients: business_profile.mainClients || null,
          specificities: business_profile.specificities || null,
          typical_project_size: business_profile.typicalProjectSize || null,
          main_challenges: business_profile.mainChallenges || null,
          tools_used: business_profile.toolsUsed || null,
          primary_goals: business_profile.primaryGoals || [],
          business_values: business_profile.businessValues || null,
          example_projects: business_profile.exampleProjects || null,
        })

        if (profileResult.success) {
          businessProfileId = profileResult.data.id
        } else {
          console.warn('Failed to create/update business profile:', profileResult.error)
          // Continue without profile - agent will still be created
        }
      }
    }

    // 4. Create agent in database
    const result = await createAgent({
      user_id: user.id,
      name,
      sector_id: finalSectorId,
      business_profile_id: businessProfileId,
      system_prompt,
      model: model || 'claude',
      agent_type: agent_type || 'companion',
      settings
    })

    if (!result.success) {
      console.error('Failed to create agent:', result.error)
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Failed to create agent' },
        { status: 500 }
      )
    }

    // 5. Return created agent
    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
