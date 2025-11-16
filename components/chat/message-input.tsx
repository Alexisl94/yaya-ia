/**
 * Message Input Component
 * Text input for sending messages
 */

'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useChatStore } from '@/lib/store/chat-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Paperclip, X, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileUploader } from '@/components/chat/file-uploader'
import { WebScraper } from '@/components/chat/web-scraper'
import { MessageAttachment } from '@/components/chat/message-attachment'
import type { ConversationAttachment } from '@/types/database'

export function MessageInput() {
  const [message, setMessage] = useState('')
  const [showUploader, setShowUploader] = useState(false)
  const [showScraper, setShowScraper] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<(ConversationAttachment & { signed_url?: string; thumbnail_url?: string })[]>([])
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

  const handleUploadComplete = (attachment: ConversationAttachment & { signed_url?: string; thumbnail_url?: string }) => {
    setPendingAttachments(prev => [...prev, attachment])
    setShowUploader(false)
  }

  const handleScrapeComplete = (attachments: ConversationAttachment[]) => {
    setPendingAttachments(prev => [...prev, ...attachments])
    setShowScraper(false)
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  const handleSubmit = async () => {
    if ((!message.trim() && pendingAttachments.length === 0) || isLoading) return

    const { selectedAgentId, selectedConversationId: currentConvId, setLoading, setError, selectConversation } = useChatStore.getState()

    if (!selectedAgentId) {
      setError('Aucun agent sélectionné')
      return
    }

    console.log('💬 [SUBMIT] Starting handleSubmit with conversationId:', currentConvId || 'NULL')

    // Check if current conversation ID is a temporary ID (created by UI button)
    const isTemporaryId = currentConvId?.startsWith('conv-') || currentConvId?.startsWith('temp-conv-')

    // Use current conversation ID only if it's a real UUID, otherwise treat as NULL
    let conversationId = (currentConvId && !isTemporaryId) ? currentConvId : null
    const isNewConversation = !conversationId || isTemporaryId

    console.log('💬 [SUBMIT] isTemporaryId:', isTemporaryId)
    console.log('💬 [SUBMIT] isNewConversation:', isNewConversation)
    console.log('💬 [SUBMIT] Will send to API:', conversationId || 'NULL')

    // Save message content before clearing
    const messageContent = message.trim()

    // For existing conversations, add optimistic UI updates
    let loadingMessageId: string | null = null
    if (!isNewConversation && conversationId) {
      const userMessage = {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        content: messageContent,
        model_used: null,
        tokens_used: null,
        latency_ms: null,
        metadata: {
          attachments: pendingAttachments,
        },
        created_at: new Date().toISOString(),
      }

      // Add user message
      addMessage(conversationId, userMessage)

      // Add temporary loading message for typing indicator
      loadingMessageId = `msg-loading-${Date.now()}`
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
    }

    // Clear input
    setMessage('')
    setPendingAttachments([])

    // Set loading state
    setLoading(true)
    setError(null)

    try {
      // Get all attachments for this conversation (not just pending ones)
      let allAttachmentIds = pendingAttachments.map(a => a.id)

      // Fetch existing attachments from the conversation (only if continuing existing conversation)
      if (!isNewConversation && conversationId) {
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data: existingAttachments } = await supabase
            .from('conversation_attachments')
            .select('id')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(10) // Limit to last 10 attachments to avoid sending too much data

          if (existingAttachments && existingAttachments.length > 0) {
            // Add existing attachment IDs (avoid duplicates)
            const existingIds = existingAttachments.map(a => a.id)
            allAttachmentIds = Array.from(new Set([...existingIds, ...allAttachmentIds]))
            console.log(`📎 Sending ${allAttachmentIds.length} attachments to AI (${existingIds.length} existing + ${pendingAttachments.length} new)`)
          }
        } catch (error) {
          console.error('Failed to fetch existing attachments:', error)
          // Continue with just pending attachments
        }
      }

      console.log('💬 [API] Sending request with conversationId:', isNewConversation ? 'NULL' : conversationId)

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          agentId: selectedAgentId,
          conversationId: isNewConversation ? null : conversationId,
          attachmentIds: allAttachmentIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      console.log('💬 [API] Received response with conversationId:', data.conversationId)

      // Get the real conversation ID from API response
      const realConversationId = data.conversationId

      // If this was a new conversation OR we had a temporary ID, replace it with the real one
      if (isNewConversation && realConversationId) {
        console.log(`✅ [NEW CONV] Created conversation: ${realConversationId}`)

        const { createConversation, selectConversation, deleteConversation } = useChatStore.getState()

        // If we had a temporary conversation, delete it first
        if (currentConvId && isTemporaryId) {
          console.log(`🗑️ [CLEANUP] Deleting temporary conversation: ${currentConvId}`)
          deleteConversation(currentConvId)
        }

        // Create the real conversation in the store
        const newConversation = {
          id: realConversationId,
          user_id: data.message?.user_id || 'user',
          agent_id: selectedAgentId,
          title: 'Nouvelle conversation',
          summary: null,
          status: 'active' as const,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        createConversation(selectedAgentId, newConversation)
        selectConversation(realConversationId)
        conversationId = realConversationId

        console.log(`✅ [NEW CONV] Selected real conversation: ${realConversationId}`)
      }

      // Now conversationId is definitely set (either from currentConvId or from API)

      // Add messages to the conversation
      if (data.success && data.message) {
        // Remove loading message if it exists
        if (loadingMessageId && !isNewConversation) {
          const { deleteMessage } = useChatStore.getState()
          deleteMessage(conversationId!, loadingMessageId)
        }

        // Add user message (for new conversations, we add it now since we didn't before)
        if (isNewConversation) {
          const userMessage = {
            id: `msg-user-${Date.now()}`,
            role: 'user' as const,
            content: messageContent,
            model_used: null,
            tokens_used: null,
            latency_ms: null,
            metadata: {},
            created_at: new Date().toISOString(),
          }
          addMessage(conversationId!, userMessage)
          console.log(`✅ [NEW CONV] Added user message to new conversation`)
        }

        // Add assistant message
        addMessage(conversationId!, {
          id: data.message.id,
          role: 'assistant' as const,
          content: data.message.content,
          model_used: data.message.model_used,
          tokens_used: data.message.tokens_used,
          latency_ms: data.message.latency_ms,
          metadata: {},
          created_at: data.message.created_at,
        })

        console.log(`✅ [MESSAGES] Added assistant message to conversation: ${conversationId}`)

        // Refresh conversation title after a short delay (to allow title generation)
        setTimeout(async () => {
          try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { updateConversation } = useChatStore.getState()

            const { data: conv } = await supabase
              .from('conversations')
              .select('title')
              .eq('id', conversationId!)
              .single()

            if (conv && conv.title) {
              updateConversation(conversationId!, { title: conv.title })
            }
          } catch (error) {
            console.error('Failed to refresh conversation title:', error)
          }
        }, 3000) // Wait 3 seconds for title generation
      }
    } catch (error) {
      console.error('❌ [ERROR] Error sending message:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')

      if (conversationId) {
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
      }
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
      {/* Pending Attachments Preview */}
      {pendingAttachments.length > 0 && (
        <div className="flex gap-1.5 flex-wrap px-2 py-1.5 bg-slate-50/50 rounded-lg border border-slate-200/60">
          {pendingAttachments.map(attachment => (
            <div key={attachment.id} className="relative group">
              <MessageAttachment
                attachment={attachment}
              />
              <button
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

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

        {/* Paperclip Button */}
        <Button
          onClick={() => setShowUploader(true)}
          disabled={isLoading || !selectedConversationId}
          size="icon"
          variant="outline"
          className={cn(
            'h-[56px] w-[56px] rounded-2xl shadow-sm',
            'hover:shadow-md transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Web Scraper Button */}
        <Button
          onClick={() => setShowScraper(true)}
          disabled={isLoading || !selectedConversationId}
          size="icon"
          variant="outline"
          className={cn(
            'h-[56px] w-[56px] rounded-2xl shadow-sm',
            'hover:shadow-md transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Globe className="h-5 w-5" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSubmit}
          disabled={(!message.trim() && pendingAttachments.length === 0) || isLoading}
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

      {/* File Uploader Modal */}
      {showUploader && selectedConversationId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <FileUploader
              conversationId={selectedConversationId}
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUploader(false)}
            />
          </div>
        </div>
      )}

      {/* Web Scraper Modal */}
      {showScraper && selectedConversationId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <WebScraper
              conversationId={selectedConversationId}
              onScrapeComplete={handleScrapeComplete}
              onClose={() => setShowScraper(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
