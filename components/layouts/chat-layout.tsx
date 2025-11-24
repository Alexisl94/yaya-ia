/**
 * Chat Layout
 * Main layout for the chat interface with header, sidebar, and content area
 */

'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useChatStore } from '@/lib/store/chat-store'
import { Menu, Settings, User, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DoggoLogo } from '@/components/ui/doggo-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ClientOnly } from '@/components/client-only'
import Link from 'next/link'
import { useUserProfile } from '@/lib/hooks/use-user-profile'

interface ChatLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useChatStore()
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now())
  const { profile } = useUserProfile(userId)

  // Refresh avatar timestamp when profile changes
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarTimestamp(Date.now())
    }
  }, [profile?.avatar_url])

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <DoggoLogo size="md" />
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Doggo</h1>
              <p className="text-xs text-slate-500">Votre assistant IA</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>

          <Link href="/agents">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              title="Mes Agents"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent"
            onClick={() => setSettingsOpen(true)}
            title="Paramètres"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <ClientOnly>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10" key={avatarTimestamp}>
                    {profile?.avatar_url ? (
                      <AvatarImage
                        src={`${profile.avatar_url}?v=${avatarTimestamp}`}
                        alt={profile.full_name || profile.email}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                      {profile?.full_name ? getInitials(profile.full_name) : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {profile && (
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5 leading-none">
                      <p className="font-medium text-sm">{profile.full_name || 'Utilisateur'}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/agents')}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  <span>Mes Agents</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ClientOnly>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile unless toggled */}
        <aside
          className={`
            w-64 border-r bg-muted/30 transition-all duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            absolute md:relative z-40 h-[calc(100vh-4rem)]
          `}
        >
          {sidebar}
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Settings Dialog */}
      <ClientOnly>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Paramètres</DialogTitle>
              <DialogDescription>
                Gérez vos préférences et paramètres de l'application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Apparence</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Thème</p>
                    <p className="text-xs text-muted-foreground">
                      Choisissez votre thème préféré
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Les paramètres de notifications seront bientôt disponibles.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Langue</h3>
                <p className="text-sm text-muted-foreground">
                  Français (par défaut)
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </ClientOnly>
    </div>
  )
}
