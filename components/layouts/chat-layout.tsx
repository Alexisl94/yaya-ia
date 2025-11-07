/**
 * Chat Layout
 * Main layout for the chat interface with header, sidebar, and content area
 */

'use client'

import { ReactNode } from 'react'
import { useChatStore } from '@/lib/store/chat-store'
import { Menu, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useChatStore()

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient-primary">yaya.ia</h1>
              <p className="text-xs text-muted-foreground">Agents IA personnalisés</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-accent">
            <Settings className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    </div>
  )
}
