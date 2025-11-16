import { redirect } from 'next/navigation'
import { getUserServer } from '@/lib/supabase/auth-server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const user = await getUserServer()

  if (!user) {
    redirect('/login')
  }

  return <DashboardClient userId={user.id} />
}
