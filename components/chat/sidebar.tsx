/**
 * Chat Sidebar
 * Displays list of agents and conversation history
 */

'use client'

import { useChatStore } from '@/lib/store/chat-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Plus, Bot, History, ChevronRight, Sparkles } from 'lucide-react'
import { AgentCard } from './agent-card'
import { AgentSkeleton } from './loading-states'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function ChatSidebar() {
  const {
    agents,
    selectedAgentId,
    selectAgent,
    conversations,
    selectedConversationId,
    selectConversation,
  } = useChatStore()

  const [showHistory, setShowHistory] = useState(false)

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)
  const agentConversations = selectedAgentId
    ? conversations[selectedAgentId] || []
    : []

  return (
    <div className="flex h-full flex-col">
      {/* Agents Section */}
      <div className="flex-1 overflow-hidden">
        <div className="border-b p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mes Agents
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-2">
              {agents.length === 0 && (
                <div className="py-12 text-center animate-fade-in">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Aucun agent pour le moment
                  </p>
                  <Button
                    size="sm"
                    className="gradient-primary shadow-md hover:shadow-lg"
                    onClick={() => {
                      window.location.href = '/onboarding'
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
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
            className="flex w-full items-center justify-between p-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Historique</span>
            </div>
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                showHistory && 'rotate-90'
              )}
            />
          </button>

          {showHistory && (
            <div className="px-4 pb-4">
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {agentConversations.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      Aucune conversation
                    </div>
                  ) : (
                    agentConversations.slice(0, 5).map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={cn(
                          'w-full rounded p-2 text-left text-sm transition-colors',
                          'hover:bg-accent',
                          selectedConversationId === conv.id && 'bg-accent'
                        )}
                      >
                        <div className="truncate font-medium">
                          {conv.title || 'Nouvelle conversation'}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {new Date(conv.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      {selectedAgent && (
        <div className="border-t p-4">
          <div className="rounded-lg bg-primary/5 p-3">
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Agent sélectionné
            </div>
            <div className="truncate text-sm font-semibold">
              {selectedAgent.name}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
