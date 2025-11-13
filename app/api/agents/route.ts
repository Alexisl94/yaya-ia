/**
 * API Route: Agents List
 * GET - Retrieve all agents for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { getUserAgents } from '@/lib/db/agents'

/**
 * GET /api/agents
 * Returns paginated list of user's agents with filters
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const sectorId = searchParams.get('sector_id') || undefined
    const isActiveParam = searchParams.get('is_active')
    const isActive = isActiveParam ? isActiveParam === 'true' : undefined

    // 3. Fetch agents
    const result = await getUserAgents(user.id, {
      page,
      limit,
      search,
      sector_id: sectorId,
      is_active: isActive
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data.data,
      pagination: result.data.pagination
    })

  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
