/**
 * API Route: Debug Agents
 * Shows the current state of all agents for debugging
 */

import { NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'

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

    // 2. Get all agents for this user (without agent_type to avoid cache issues)
    const supabase = await createClient()
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, name, settings')
      .eq('user_id', user.id)

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    // 3. Format the data for debugging
    const debug = agents?.map(agent => ({
      id: agent.id,
      name: agent.name,
      agent_type_in_settings: agent.settings?.agentType || 'companion',
      settings_raw: agent.settings
    }))

    return NextResponse.json({
      success: true,
      total: agents?.length || 0,
      agents: debug
    })

  } catch (error) {
    console.error('Error debugging agents:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
