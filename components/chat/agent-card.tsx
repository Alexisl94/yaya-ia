/**
 * Agent Card Component
 * Displays agent information in sidebar with improved styling
 */

'use client'

import { Agent } from '@/types/database'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
  isActive?: boolean
  messageCount?: number
  onClick: () => void
}

export function AgentCard({ agent, isActive, messageCount = 0, onClick }: AgentCardProps) {
  // Get first letter of profession/name for avatar
  const avatarText = agent.profession?.[0] || agent.name[0] || '🤖'

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl p-3 text-left transition-all',
        'hover:bg-accent/50',
        isActive && 'bg-primary-50 border-2 border-primary-500 shadow-sm',
        !isActive && 'border border-transparent hover:border-border'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Avatar className={cn(
          'h-11 w-11 shrink-0 border-2 transition-colors',
          isActive ? 'border-primary-500 bg-primary-100' : 'border-border bg-muted'
        )}>
          <AvatarFallback className={cn(
            'text-base font-semibold',
            isActive ? 'text-primary-600' : 'text-muted-foreground'
          )}>
            {avatarText}
          </AvatarFallback>
        </Avatar>

        {/* Agent info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={cn(
              'truncate font-semibold text-sm',
              isActive && 'text-primary-700'
            )}>
              {agent.name}
            </div>
            {isActive && (
              <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {agent.profession && (
              <span className="truncate">{agent.profession}</span>
            )}
            {messageCount > 0 && (
              <>
                <span>•</span>
                <span>{messageCount} message{messageCount > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <ChevronRight className="h-4 w-4 text-primary-600 shrink-0" />
        )}
      </div>

      {/* Model badge */}
      {agent.model && (
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] py-0 h-5">
            {agent.model === 'claude' ? '⚡ Claude' : '🤖 GPT'}
          </Badge>
        </div>
      )}
    </button>
  )
}
