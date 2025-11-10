/**
 * API Route: Fix Agent Types
 * Migration script to fix agent_type for existing agents
 * This reads from settings.agentType and updates the agent_type column
 */

import { NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // 1. Authenticate user (admin only in production)
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get all agents for this user
    const supabase = await createClient()
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No agents to fix',
        updated: 0
      })
    }

    // 3. Fix each agent's type based on settings
    const updates = []
    for (const agent of agents) {
      // Check if settings contains agentType
      const correctType = agent.settings?.agentType || 'companion'

      // Only update if the type is different
      if (agent.agent_type !== correctType) {
        const { error: updateError } = await supabase
          .from('agents')
          .update({ agent_type: correctType })
          .eq('id', agent.id)

        if (updateError) {
          console.error(`Failed to update agent ${agent.id}:`, updateError)
        } else {
          updates.push({
            id: agent.id,
            name: agent.name,
            oldType: agent.agent_type,
            newType: correctType
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${updates.length} agents`,
      updated: updates.length,
      details: updates
    })

  } catch (error) {
    console.error('Error fixing agent types:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
