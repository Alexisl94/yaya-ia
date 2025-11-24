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
import { AgentNameInput } from './agent-name-input'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getAvailableModels, getModelById, formatCurrency } from '@/lib/pricing/model-pricing'
import type { AgentWithRelations } from '@/types/database'

const AGENT_NAME_REGEX = /^[a-zA-Z0-9_-]*$/
const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 25

export function ChatArea() {
  const {
    selectedAgentId,
    selectedConversationId,
    getCurrentAgent,
    getCurrentMessages,
    getAgentConversations,
    selectConversation,
    createConversation,
    updateAgent,
    deleteAgent,
  } = useChatStore()

  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false)
  const [editedAgent, setEditedAgent] = useState<{
    name: string
    description: string
    system_prompt: string
    model: string
    agent_type: 'companion' | 'task'
    temperature: number
    max_tokens: number
  } | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Ref for messages container to auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const agent = getCurrentAgent()
  const messages = getCurrentMessages()
  const conversations = selectedAgentId ? getAgentConversations(selectedAgentId) : []

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, messages])

  // Get agent type from settings (fallback for PostgREST cache issues)
  const agentType = agent ? ((agent.settings as any)?.agentType || agent.agent_type || 'companion') : 'companion'
  const agentModel = agent?.model || 'claude-3-haiku-20240307'
  const modelConfig = getModelById(agentModel)

  // Initialize edited agent when opening settings
  const handleOpenSettings = () => {
    if (agent) {
      setEditedAgent({
        name: agent.name,
        description: agent.description || '',
        system_prompt: agent.system_prompt,
        model: agent.model,
        agent_type: agentType as 'companion' | 'task',
        temperature: agent.temperature,
        max_tokens: agent.max_tokens,
      })
    }
    setAgentSettingsOpen(true)
  }

  const handleSaveAgent = async () => {
    if (!selectedAgentId || !editedAgent) return

    // Validate agent name
    const isValidName = editedAgent.name.length >= MIN_NAME_LENGTH &&
                       editedAgent.name.length <= MAX_NAME_LENGTH &&
                       AGENT_NAME_REGEX.test(editedAgent.name)

    if (!isValidName) {
      toast.error('Le nom de l\'agent doit contenir entre 3 et 25 caractères (lettres, chiffres, - et _ uniquement)')
      return
    }

    try {
      // Update agent via API
      const response = await fetch(`/api/agents/${selectedAgentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedAgent),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      // Update local store
      updateAgent(selectedAgentId, editedAgent as Partial<AgentWithRelations>)
      toast.success('Agent mis à jour avec succès')
      setAgentSettingsOpen(false)
    } catch (error) {
      console.error('Error updating agent:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  const handleDeleteAgent = async () => {
    if (!selectedAgentId) return

    try {
      // Delete agent via API
      const response = await fetch(`/api/agents/${selectedAgentId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      // Update local store
      deleteAgent(selectedAgentId)
      toast.success('Agent supprimé avec succès')
      setAgentSettingsOpen(false)
      setIsDeleteConfirmOpen(false)
    } catch (error) {
      console.error('Error deleting agent:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    }
  }

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
      <div className="flex items-center justify-between border-b px-3 md:px-6 py-3 md:py-4 animate-slide-down">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary/10 text-lg md:text-xl shrink-0">
            {agent.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
              <h2 className="font-semibold text-sm md:text-base truncate">{agent.name}</h2>
              {/* Agent Type Badge */}
              <span className={cn(
                "px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-semibold rounded-full shrink-0",
                agentType === 'companion'
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700"
              )}>
                {agentType === 'companion' ? 'COMPAGNON' : 'TÂCHE'}
              </span>
              {/* LLM Badge - Hidden on very small screens */}
              <span className={cn(
                "hidden sm:inline-block px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-semibold rounded-full shrink-0",
                modelConfig?.provider === 'anthropic'
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700"
              )}>
                {modelConfig?.displayName || agentModel}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {agent.description || 'Assistant IA personnalisé'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenSettings}
          title="Paramètres de l'agent"
          className="shrink-0 transition-smooth hover:bg-accent"
        >
          <Settings2 className="h-4 w-4 md:h-5 md:w-5" />
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
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-3 md:px-6 py-3 md:py-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center animate-fade-in">
                <div className="text-center px-4">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50 animate-bounce-slow" />
                  <h4 className="mb-2 font-semibold text-sm md:text-base">Commencez la conversation</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Posez votre première question à {agent.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                  >
                    <MessageBubble message={message} />
                  </div>
                ))}
                {/* Typing indicator when agent is responding */}
                {messages.some(msg => msg.isLoading) && (
                  <div className="animate-fade-in">
                    <TypingIndicator />
                  </div>
                )}
                {/* Invisible element at the bottom for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input - Fixed at bottom */}
          <div className="border-t p-3 md:p-4 bg-background">
            <MessageInput />
          </div>
        </>
      )}

      {/* Agent Settings Dialog */}
      <Dialog open={agentSettingsOpen} onOpenChange={setAgentSettingsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Paramètres de l'agent</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de votre agent et sauvegardez les modifications
            </DialogDescription>
          </DialogHeader>

          {editedAgent && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Informations de base</h3>

                <AgentNameInput
                  value={editedAgent.name}
                  onChange={(name) => setEditedAgent({ ...editedAgent, name })}
                  agentType={editedAgent.agent_type}
                  sectorName={agent?.sector?.name}
                  description={editedAgent.description}
                />

                <div className="space-y-2">
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea
                    id="agent-description"
                    value={editedAgent.description}
                    onChange={(e) => setEditedAgent({ ...editedAgent, description: e.target.value })}
                    placeholder="Décrivez brièvement le rôle de cet agent..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Model Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Configuration du modèle</h3>

                <div className="space-y-2">
                  <Label htmlFor="agent-model">Modèle IA</Label>
                  <Select
                    value={editedAgent.model}
                    onValueChange={(value) => setEditedAgent({ ...editedAgent, model: value })}
                  >
                    <SelectTrigger id="agent-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableModels().map((model) => {
                        const pricing = formatCurrency(model.estimatedCostPer100Messages)
                        return (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{model.displayName}</span>
                              <span className="text-xs text-muted-foreground ml-4">
                                {pricing} / ~100 msg
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {editedAgent.model && (() => {
                    const selectedModel = getModelById(editedAgent.model)
                    return selectedModel && (
                      <p className="text-xs text-muted-foreground">
                        {selectedModel.description} • {selectedModel.speed === 'fast' ? 'Rapide' : selectedModel.speed === 'medium' ? 'Équilibré' : 'Précis'}
                      </p>
                    )
                  })()}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-type">Type d'agent</Label>
                  <Select
                    value={editedAgent.agent_type}
                    onValueChange={(value) => setEditedAgent({ ...editedAgent, agent_type: value as 'companion' | 'task' })}
                  >
                    <SelectTrigger id="agent-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="companion">Compagnon</SelectItem>
                      <SelectItem value="task">Tâche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-temperature">
                      Température
                      <span className="ml-2 text-xs text-muted-foreground">({editedAgent.temperature})</span>
                    </Label>
                    <Input
                      id="agent-temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={editedAgent.temperature}
                      onChange={(e) => setEditedAgent({ ...editedAgent, temperature: parseFloat(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">0 = précis, 2 = créatif</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-max-tokens">Tokens maximum</Label>
                    <Input
                      id="agent-max-tokens"
                      type="number"
                      min="100"
                      max="100000"
                      step="100"
                      value={editedAgent.max_tokens}
                      onChange={(e) => setEditedAgent({ ...editedAgent, max_tokens: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Longueur max des réponses</p>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="agent-prompt">Prompt système</Label>
                <Textarea
                  id="agent-prompt"
                  value={editedAgent.system_prompt}
                  onChange={(e) => setEditedAgent({ ...editedAgent, system_prompt: e.target.value })}
                  placeholder="Instructions système pour l'agent..."
                  rows={8}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Ces instructions définissent le comportement et la personnalité de l'agent
                </p>
              </div>

              {/* Additional Info */}
              <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
                <p className="text-xs font-medium">Informations additionnelles</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Secteur:</span>{' '}
                    <span className="font-medium">{agent?.sector?.name || 'Non défini'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID:</span>{' '}
                    <span className="font-mono font-medium">{agent?.id?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer l'agent
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setAgentSettingsOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSaveAgent}>
                Enregistrer les modifications
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'agent "{agent?.name}" ? Cette action est irréversible.
              Toutes les conversations associées seront également supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAgent}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
