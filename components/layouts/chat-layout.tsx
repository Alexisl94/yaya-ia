/**
 * Chat Layout
 * Main layout for the chat interface with header, sidebar, and content area
 */

'use client'

import { ReactNode, useState } from 'react'
import { useChatStore } from '@/lib/store/chat-store'
import { Menu, Settings, User, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DoggoLogo } from '@/components/ui/doggo-logo'
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

interface ChatLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useChatStore()
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
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
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push('/agents')}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  <span>Mes Agents</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
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
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Apparence</h3>
                <p className="text-sm text-muted-foreground">
                  Les paramètres de thème seront bientôt disponibles.
                </p>
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
