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
      // Check if attachments are already in metadata (from MessageInput)
      if (message.metadata?.attachments && Array.isArray(message.metadata.attachments)) {
        setAttachments(message.metadata.attachments as any[])
        return
      }

      // Otherwise, fetch from API for saved messages
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
  }, [message.id, message.metadata, isUser])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'flex gap-2.5 animate-fade-in group/message',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar - smaller and more subtle */}
      <Avatar className={cn(
        'h-7 w-7 shrink-0 mt-0.5',
        isUser && 'bg-gradient-to-br from-blue-500 to-blue-600',
        isAssistant && 'bg-gradient-to-br from-slate-700 to-slate-800'
      )}>
        <AvatarFallback className={cn(
          'text-white',
          isUser && 'bg-transparent',
          isAssistant && 'bg-transparent'
        )}>
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className={cn('flex-1 space-y-0 max-w-[75%]', isUser && 'flex flex-col items-end')}>
        {/* Attachments - ultra compact */}
        {attachments.length > 0 && (
          <div className={cn(
            'flex flex-wrap gap-1 mb-0',
            isUser && 'justify-end'
          )}>
            {attachments.map(attachment => (
              <MessageAttachment
                key={attachment.id}
                attachment={attachment}
              />
            ))}
          </div>
        )}

        <div
          className={cn(
            'group relative rounded-xl px-3 py-1 transition-all',
            isUser && 'bg-blue-600 text-white',
            isAssistant && !isError && 'bg-slate-50/70 hover:bg-slate-50/90 border border-slate-200/50',
            isError && 'bg-red-50 border border-red-200'
          )}
        >
          {/* Message text */}
          {!message.isLoading && (
            <>
              {isAssistant && !isError ? (
                <div className="prose-compact" style={{ fontSize: '13px', lineHeight: '20px' }}>
                  <MarkdownContent content={message.content} />
                </div>
              ) : (
                <div className={cn(
                  'whitespace-pre-wrap break-words text-[13px] leading-normal',
                  isUser && 'text-white',
                  isError && 'text-red-700'
                )}>
                  {message.content}
                </div>
              )}
            </>
          )}

          {/* Copy button - ultra minimal */}
          {!message.isLoading && isAssistant && !isError && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                'absolute -right-1 -top-1 h-5 w-5 opacity-0 transition-opacity',
                'group-hover/message:opacity-100',
                'bg-white/90 hover:bg-white border border-slate-200/50 shadow-sm rounded-md'
              )}
            >
              {copied ? (
                <Check className="h-2.5 w-2.5 text-green-600" />
              ) : (
                <Copy className="h-2.5 w-2.5 text-slate-400" />
              )}
            </Button>
          )}
        </div>

        {/* Metadata - more subtle and compact */}
        <div
          className={cn(
            'flex items-center gap-1 px-1 text-[10px] text-slate-400 mt-0.5',
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
              <span className="text-slate-300">•</span>
              <span>{message.tokens_used} tokens</span>
            </>
          )}
          {message.latency_ms && (
            <>
              <span className="text-slate-300">•</span>
              <span>{(message.latency_ms / 1000).toFixed(1)}s</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
