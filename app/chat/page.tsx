/**
 * Chat Page
 * Main interface for interacting with AI agents
 */

import { getUserServer } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { ChatPageClient } from './chat-page-client'

export const metadata = {
  title: 'Chat | yaya.ia',
  description: 'Discutez avec vos assistants IA personnalisés',
}

export default async function ChatPage() {
  const user = await getUserServer()

  if (!user) {
    redirect('/login')
  }

  return <ChatPageClient userId={user.id} />
}
