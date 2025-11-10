/**
 * API Route: Agent by ID
 * Handles individual agent operations (update, delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { updateAgent, hardDeleteAgent, getAgentById } from '@/lib/db/agents'

/**
 * PATCH - Update an agent
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

    // 2. Get agent ID from params
    const { id: agentId } = await params

    // 3. Verify agent ownership
    const agentResult = await getAgentById(agentId)
    if (!agentResult.success || !agentResult.data) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    if (agentResult.data.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this agent' },
        { status: 403 }
      )
    }

    // 4. Parse request body
    const body = await request.json()

    // 5. Update agent in database
    const result = await updateAgent(agentId, body)

    if (!result.success) {
      console.error('Failed to update agent:', result.error)
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Failed to update agent' },
        { status: 500 }
      )
    }

    // 6. Return updated agent
    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Hard delete an agent
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

    // 2. Get agent ID from params
    const { id: agentId } = await params

    // 3. Verify agent ownership
    const agentResult = await getAgentById(agentId)
    if (!agentResult.success || !agentResult.data) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    if (agentResult.data.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this agent' },
        { status: 403 }
      )
    }

    // 4. Hard delete agent from database
    const result = await hardDeleteAgent(agentId)

    if (!result.success) {
      console.error('Failed to delete agent:', result.error)
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Failed to delete agent' },
        { status: 500 }
      )
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
