/**
 * API Route: Create Agent
 * Handles agent creation from the onboarding flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createAgent } from '@/lib/db/agents'

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
    const { name, sector_id, system_prompt, settings } = body

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

    // 4. Create agent in database
    const result = await createAgent({
      user_id: user.id,
      name,
      sector_id: finalSectorId,
      system_prompt,
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
