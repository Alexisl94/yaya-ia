/**
 * Chat Area
 * Main chat interface with messages and input
 */

'use client'

import { useChatStore } from '@/lib/store/chat-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings2, Plus, MessageSquare } from 'lucide-react'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import { TypingIndicator } from './loading-states'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ClientOnly } from '@/components/client-only'

export function ChatArea() {
  const {
    selectedAgentId,
    selectedConversationId,
    getCurrentAgent,
    getCurrentMessages,
    getAgentConversations,
    selectConversation,
    createConversation,
  } = useChatStore()

  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false)

  const agent = getCurrentAgent()
  const messages = getCurrentMessages()
  const conversations = selectedAgentId ? getAgentConversations(selectedAgentId) : []

  // No agent selected
  if (!selectedAgentId || !agent) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 text-2xl font-semibold">Bienvenue sur AgentHub</h2>
          <p className="mb-4 text-muted-foreground">
            Sélectionnez un agent dans la barre latérale pour commencer
          </p>
        </div>
      </div>
    )
  }

  // Agent selected but no conversation
  const handleNewConversation = () => {
    if (!selectedAgentId) return

    const newConversation = {
      id: `conv-${Date.now()}`,
      user_id: 'user-1', // TODO: Get from auth
      agent_id: selectedAgentId,
      title: null,
      summary: null,
      status: 'active' as const,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    createConversation(selectedAgentId, newConversation)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
            {agent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold">{agent.name}</h2>
              {/* Agent Type Badge */}
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-semibold rounded-full",
                agent.agent_type === 'companion'
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-purple-100 text-purple-700 border border-purple-300"
              )}>
                {agent.agent_type === 'companion' ? '✨ COMPAGNON' : '🎯 TÂCHE'}
              </span>
              {/* LLM Badge */}
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-semibold rounded-full",
                agent.model === 'claude'
                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                  : "bg-green-100 text-green-700 border border-green-300"
              )}>
                {agent.model === 'claude' ? 'CLAUDE' : 'GPT'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {agent.description || 'Assistant IA personnalisé'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAgentSettingsOpen(true)}
          title="Paramètres de l'agent"
        >
          <Settings2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Conversations List (if no conversation selected) */}
      {!selectedConversationId && (
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Conversations</h3>
              <Button onClick={handleNewConversation} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle conversation
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-16rem)]">
              {conversations.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <h4 className="mb-2 font-semibold">Aucune conversation</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Démarrez une nouvelle conversation avec {agent.name}
                  </p>
                  <Button onClick={handleNewConversation}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle conversation
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={cn(
                        'rounded-lg border p-4 text-left transition-all',
                        'hover:border-primary hover:shadow-md'
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <h4 className="mb-1 font-semibold">
                        {conv.title || 'Nouvelle conversation'}
                      </h4>
                      {conv.summary && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {conv.summary}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Messages Area (if conversation selected) */}
      {selectedConversationId && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <h4 className="mb-2 font-semibold">Commencez la conversation</h4>
                  <p className="text-sm text-muted-foreground">
                    Posez votre première question à {agent.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {/* Typing indicator when agent is responding */}
                {messages.some(msg => msg.isLoading) && <TypingIndicator />}
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <MessageInput />
          </div>
        </>
      )}

      {/* Agent Settings Dialog */}
      <ClientOnly>
        <Dialog open={agentSettingsOpen} onOpenChange={setAgentSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Paramètres de l'agent : {agent?.name}</DialogTitle>
              <DialogDescription>
                Consultez et modifiez les paramètres de votre agent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Informations</h3>
                <div className="rounded-lg border p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom</p>
                    <p className="text-sm font-medium">{agent?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{agent?.description || 'Aucune description'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Modèle</p>
                    <p className="text-sm">{agent?.model || 'Non défini'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Secteur</p>
                    <p className="text-sm">{agent?.sector?.name || 'Non défini'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Instructions système</h3>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {agent?.system_prompt || 'Aucune instruction système définie'}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </ClientOnly>
    </div>
  )
}
