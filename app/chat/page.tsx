/**
 * Chat Page
 * Main interface for interacting with AI agents
 */

import { getUserServer } from '@/lib/supabase/auth-server'
import { redirect } from 'next/navigation'
import { ChatPageClient } from './chat-page-client'

export const metadata = {
  title: 'Chat | Doggo',
  description: 'Discutez avec Doggo, votre assistant IA personnel',
}

export default async function ChatPage() {
  const user = await getUserServer()

  if (!user) {
    redirect('/login')
  }

  return <ChatPageClient userId={user.id} />
}
