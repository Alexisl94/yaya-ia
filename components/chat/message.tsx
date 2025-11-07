/**
 * Message Component
 * Displays individual chat messages
 */

'use client'

import { ChatMessage } from '@/lib/store/chat-store'
import { Button } from '@/components/ui/button'
import { Copy, User, Bot, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface MessageProps {
  message: ChatMessage
}

export function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser && 'bg-primary text-primary-foreground',
          isAssistant && 'bg-muted'
        )}
      >
        {isUser && <User className="h-4 w-4" />}
        {isAssistant && <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 space-y-2', isUser && 'items-end')}>
        <div
          className={cn(
            'group relative max-w-[80%] rounded-lg px-4 py-3',
            isUser && 'ml-auto bg-primary text-primary-foreground',
            isAssistant && 'bg-muted'
          )}
        >
          {/* Message text */}
          <div className="whitespace-pre-wrap break-words text-sm">
            {message.content}
          </div>

          {/* Loading indicator */}
          {message.isLoading && (
            <div className="mt-2 flex items-center gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
            </div>
          )}

          {/* Copy button */}
          {!message.isLoading && isAssistant && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                'absolute -right-2 -top-2 h-7 w-7 opacity-0 transition-opacity',
                'group-hover:opacity-100'
              )}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* Timestamp */}
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
            <span className="text-muted-foreground/60">
              • {message.tokens_used} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
