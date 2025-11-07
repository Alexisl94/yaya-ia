/**
 * Middleware désactivé
 * Renommez ce fichier en "middleware.ts" pour désactiver temporairement l'auth
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Auth désactivée - tous les utilisateurs peuvent accéder
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
