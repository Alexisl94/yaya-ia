/**
 * Agent Model Update API
 * Update the LLM model of a specific agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ModelType } from '@/types/database'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: agentId } = await context.params

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { model } = body as { model: ModelType }

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Modèle manquant' },
        { status: 400 }
      )
    }

    // Validate model
    const validModels: ModelType[] = ['haiku', 'gpt-4o-mini', 'gpt-4o', 'sonnet', 'opus', 'claude', 'gpt']
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { success: false, error: 'Modèle invalide' },
        { status: 400 }
      )
    }

    // Check agent ownership
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, user_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    if (agent.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Update the model
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agents')
      .update({ model })
      .eq('id', agentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating agent model:', updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedAgent
    })

  } catch (error) {
    console.error('Agent model update API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}
