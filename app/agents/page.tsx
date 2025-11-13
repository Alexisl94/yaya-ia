/**
 * Agents Management Page
 * View and manage all AI agents
 */

import { getUserServer } from '@/lib/supabase/auth-server'
import { redirect } from 'next/navigation'
import { AgentsPageClient } from './agents-page-client'

export const metadata = {
  title: 'Mes Agents | Doggo',
  description: 'Gérez vos assistants IA',
}

export default async function AgentsPage() {
  const user = await getUserServer()

  if (!user) {
    redirect('/login')
  }

  return <AgentsPageClient userId={user.id} />
}
