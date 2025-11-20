import { redirect } from 'next/navigation'
import { getUserServer } from '@/lib/supabase/auth-server'
import { SettingsClient } from './settings-client'
import { ChatLayout } from '@/components/layouts/chat-layout'
import { ChatSidebar } from '@/components/chat/sidebar'

export const metadata = {
  title: 'Paramètres | Doggo',
  description: 'Gérez vos paramètres et préférences',
}

export default async function SettingsPage() {
  const user = await getUserServer()

  if (!user) {
    redirect('/login')
  }

  return (
    <ChatLayout sidebar={<ChatSidebar />}>
      <SettingsClient userId={user.id} userEmail={user.email || ''} />
    </ChatLayout>
  )
}
