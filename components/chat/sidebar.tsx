/**
 * Chat Sidebar
 * Displays list of agents and conversation history
 */

'use client'

import { useChatStore } from '@/lib/store/chat-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Plus, Bot, History, ChevronRight, Sparkles, BarChart3, Home } from 'lucide-react'
import { AgentCard } from './agent-card'
import { AgentSkeleton } from './loading-states'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ChatSidebar() {
  const router = useRouter()
  const {
    agents,
    selectedAgentId,
    selectAgent,
    conversations,
    selectedConversationId,
    selectConversation,
  } = useChatStore()

  const [showHistory, setShowHistory] = useState(true)

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)
  const agentConversations = selectedAgentId
    ? conversations[selectedAgentId] || []
    : []

  return (
    <div className="flex h-full flex-col">
      {/* Navigation Links */}
      <div className="border-b p-2">
        <div className="grid grid-cols-2 gap-1.5">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-9"
            >
              <Home className="h-3.5 w-3.5 mr-2" />
              Accueil
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-9"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Agents Section */}
      <div className="flex-1 overflow-hidden">
        <div className="border-b">
          <div className="p-3 pb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mes Agents
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => router.push('/onboarding')}
              title="Créer un nouvel agent"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-32rem)] px-2 pb-2">
            <div className="space-y-1.5">
              {agents.length === 0 && (
                <div className="py-8 px-2 text-center animate-fade-in">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Aucun agent pour le moment
                  </p>
                  <Button
                    size="sm"
                    className="gradient-primary shadow-md hover:shadow-lg text-xs"
                    onClick={() => {
                      window.location.href = '/onboarding'
                    }}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Créer votre premier agent
                  </Button>
                </div>
              )}

              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={selectedAgentId === agent.id}
                  onClick={() => selectAgent(agent.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* History Section */}
        <div className="border-b">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex w-full items-center justify-between p-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5" />
              <span>Historique</span>
            </div>
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                showHistory && 'rotate-90'
              )}
            />
          </button>

          {showHistory && (
            <div className="px-2 pb-2">
              {agentConversations.length === 0 ? (
                <div className="py-6 px-2 text-center text-xs text-muted-foreground">
                  Aucune conversation
                </div>
              ) : (
                <ScrollArea className="h-72">
                  <div className="space-y-1 pr-2">
                    {agentConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={cn(
                          'group w-full rounded-lg p-2.5 text-left transition-all overflow-hidden',
                          'hover:bg-accent/80',
                          selectedConversationId === conv.id
                            ? 'bg-primary/10 border border-primary/30 shadow-sm'
                            : 'hover:shadow-sm'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className={cn(
                            "text-xs font-medium line-clamp-2 flex-1",
                            selectedConversationId === conv.id && 'text-primary-700'
                          )}>
                            {conv.title || 'Nouvelle conversation'}
                          </div>
                          {selectedConversationId === conv.id && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-0.5 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span>
                            {new Date(conv.updated_at || conv.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: new Date(conv.updated_at || conv.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      {selectedAgent && (
        <div className="border-t p-2.5">
          <div className="rounded-lg bg-primary/5 p-2.5 overflow-hidden">
            <div className="mb-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Agent actif
            </div>
            <div className="truncate text-xs font-semibold max-w-full">
              {selectedAgent.name}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
