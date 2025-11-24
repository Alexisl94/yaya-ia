/**
 * Subscription Limits API
 * Récupère les limites de l'abonnement de l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserLimitsSummary } from '@/lib/subscription/limits-checker'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le résumé des limites
    const summary = await getUserLimitsSummary(user.id)

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Impossible de récupérer les limites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error('Limits API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}
