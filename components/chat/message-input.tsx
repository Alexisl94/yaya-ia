/**
 * Message Input Component
 * Text input for sending messages
 */

'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useChatStore } from '@/lib/store/chat-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MessageInput() {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isLoading, selectedConversationId, addMessage } = useChatStore()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return

    const { selectedAgentId, selectedConversationId: currentConvId, setLoading, setError, createConversation, selectConversation } = useChatStore.getState()

    if (!selectedAgentId) {
      setError('Aucun agent sélectionné')
      return
    }

    // Create a new conversation if none is selected
    let conversationId = currentConvId
    if (!conversationId) {
      const newConvId = `conv-${Date.now()}`
      const newConversation = {
        id: newConvId,
        user_id: 'temp', // Will be created in backend
        agent_id: selectedAgentId,
        title: 'Nouvelle conversation',
        summary: null,
        status: 'active' as const,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      createConversation(selectedAgentId, newConversation)
      selectConversation(newConvId)
      conversationId = newConvId
    }

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: message.trim(),
      model_used: null,
      tokens_used: null,
      latency_ms: null,
      metadata: {},
      created_at: new Date().toISOString(),
    }

    // Add user message
    addMessage(conversationId, userMessage)

    // Add temporary loading message for typing indicator
    const loadingMessageId = `msg-loading-${Date.now()}`
    addMessage(conversationId, {
      id: loadingMessageId,
      role: 'assistant' as const,
      content: '',
      model_used: null,
      tokens_used: null,
      latency_ms: null,
      metadata: {},
      created_at: new Date().toISOString(),
      isLoading: true,
    })

    // Clear input
    const messageContent = message.trim()
    setMessage('')

    // Set loading state
    setLoading(true)
    setError(null)

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          agentId: selectedAgentId,
          conversationId: conversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      // Remove loading message
      const { deleteMessage } = useChatStore.getState()
      deleteMessage(conversationId, loadingMessageId)

      // Add assistant message
      if (data.success && data.message) {
        addMessage(conversationId, {
          id: data.message.id,
          role: 'assistant' as const,
          content: data.message.content,
          model_used: data.message.model_used,
          tokens_used: data.message.tokens_used,
          latency_ms: data.message.latency_ms,
          metadata: {},
          created_at: data.message.created_at,
        })

        // Refresh conversation title after a short delay (to allow title generation)
        setTimeout(async () => {
          try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { updateConversation } = useChatStore.getState()

            const { data: conv } = await supabase
              .from('conversations')
              .select('title')
              .eq('id', conversationId)
              .single()

            if (conv && conv.title) {
              updateConversation(conversationId, { title: conv.title })
            }
          } catch (error) {
            console.error('Failed to refresh conversation title:', error)
          }
        }, 3000) // Wait 3 seconds for title generation
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')

      // Remove loading message
      const { deleteMessage } = useChatStore.getState()
      deleteMessage(conversationId, loadingMessageId)

      // Add error message
      addMessage(conversationId, {
        id: `msg-error-${Date.now()}`,
        role: 'assistant' as const,
        content: `Désolé, une erreur est survenue : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        model_used: null,
        tokens_used: null,
        latency_ms: null,
        metadata: { error: true },
        created_at: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            disabled={isLoading}
            className={cn(
              'min-h-[56px] resize-none pr-12 rounded-2xl border-2',
              'focus:border-primary-500 transition-colors',
              isLoading && 'opacity-60'
            )}
            rows={1}
          />
          {message.length > 0 && (
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {message.length}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          size="icon"
          className={cn(
            'h-[56px] w-[56px] rounded-2xl shadow-md',
            'gradient-primary hover:shadow-lg transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
            Entrée
          </kbd>
          <span>pour envoyer</span>
          <span className="text-muted-foreground/50">•</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
            Shift + Entrée
          </kbd>
          <span>nouvelle ligne</span>
        </div>
      </div>
    </div>
  )
}
