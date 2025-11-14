/**
 * Monthly Budget API
 * Get monthly budget stats for current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Call the database function to get monthly budget
    const { data, error } = await supabase
      .rpc('get_user_monthly_budget', { p_user_id: user.id })

    if (error) {
      console.error('Error fetching monthly budget:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // The function returns a single row
    const budgetData = data && data.length > 0 ? data[0] : {
      total_cost_usd: 0,
      total_tokens: 0,
      total_conversations: 0,
      budget_limit_usd: 0,
      budget_used_percent: 0
    }

    return NextResponse.json({
      success: true,
      data: budgetData
    })

  } catch (error) {
    console.error('Monthly budget API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}
