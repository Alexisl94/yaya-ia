/**
 * Message Bubble Component
 * Displays chat messages with improved styling and animations
 */

'use client'

import { ChatMessage } from '@/lib/store/chat-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Copy, User, Bot, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { MarkdownContent } from './markdown-content'
import { MessageAttachment } from './message-attachment'
import type { ConversationAttachment } from '@/types/database'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [attachments, setAttachments] = useState<(ConversationAttachment & { signed_url?: string; thumbnail_url?: string })[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isError = Boolean(message.metadata?.error)

  // Fetch attachments for this message
  useEffect(() => {
    const fetchAttachments = async () => {
      // Only fetch for user messages and if message has an ID (saved in DB)
      if (isUser && message.id && !message.id.startsWith('msg-')) {
        setLoadingAttachments(true)
        try {
          const response = await fetch(`/api/messages/${message.id}/attachments`)
          const result = await response.json()
          if (result.success && result.data) {
            setAttachments(result.data)
          }
        } catch (error) {
          console.error('Error fetching attachments:', error)
        } finally {
          setLoadingAttachments(false)
        }
      }
    }

    fetchAttachments()
  }, [message.id, isUser])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        'h-9 w-9 shrink-0 border-2',
        isUser && 'border-primary-200 bg-primary-50',
        isAssistant && 'border-secondary-200 bg-secondary-50'
      )}>
        <AvatarFallback className={cn(
          isUser && 'text-primary-600',
          isAssistant && 'text-secondary-600'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className={cn('flex-1 space-y-2', isUser && 'flex flex-col items-end')}>
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className={cn(
            'flex flex-wrap gap-2 max-w-[85%]',
            isUser && 'justify-end'
          )}>
            {attachments.map(attachment => (
              <MessageAttachment
                key={attachment.id}
                attachment={attachment}
                className="max-w-xs"
              />
            ))}
          </div>
        )}

        <div
          className={cn(
            'group relative max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all',
            'hover:shadow-md',
            isUser && 'bg-primary-500 text-primary-foreground',
            isAssistant && !isError && 'bg-card border border-border',
            isError && 'bg-danger-50 border border-danger-200'
          )}
        >
          {/* Message text - hide if loading (will show TypingIndicator instead) */}
          {!message.isLoading && (
            <>
              {isAssistant && !isError ? (
                // Render markdown for assistant messages
                <MarkdownContent content={message.content} />
              ) : (
                // Plain text for user messages and errors
                <div className={cn(
                  'whitespace-pre-wrap break-words text-sm leading-relaxed',
                  isUser && 'text-white',
                  isError && 'text-danger-700'
                )}>
                  {message.content}
                </div>
              )}
            </>
          )}

          {/* Copy button */}
          {!message.isLoading && isAssistant && !isError && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                'absolute -right-2 -top-2 h-7 w-7 opacity-0 transition-opacity',
                'group-hover:opacity-100',
                'bg-white hover:bg-slate-50 border border-border shadow-sm'
              )}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>

        {/* Metadata */}
        <div
          className={cn(
            'flex items-center gap-2 px-1 text-xs text-muted-foreground',
            isUser && 'justify-end'
          )}
        >
          <span>
            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.tokens_used && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground/80">
                {message.tokens_used} tokens
              </span>
            </>
          )}
          {message.latency_ms && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground/80">
                {(message.latency_ms / 1000).toFixed(1)}s
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
