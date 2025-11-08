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
  // Get first letter of name for avatar
  const avatarText = agent.name[0] || '🤖'

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-lg p-1.5 text-left transition-all',
        'hover:bg-accent/50',
        isActive && 'bg-primary/10 border border-primary/30 shadow-sm',
        !isActive && 'border border-transparent hover:border-border'
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0 w-full">
        {/* Avatar */}
        <Avatar className={cn(
          'h-6 w-6 shrink-0 border transition-colors',
          isActive ? 'border-primary-500 bg-primary-100' : 'border-border bg-muted'
        )}>
          <AvatarFallback className={cn(
            'text-[10px] font-semibold',
            isActive ? 'text-primary-600' : 'text-muted-foreground'
          )}>
            {avatarText}
          </AvatarFallback>
        </Avatar>

        {/* Agent info - avec contrôle strict de la largeur */}
        <div className="flex-1 min-w-0 flex items-center gap-1 overflow-hidden">
          <span className={cn(
            'truncate font-medium text-[11px] block max-w-full',
            isActive && 'text-primary-700'
          )}>
            {agent.name}
          </span>
          {isActive && (
            <div className="h-1 w-1 rounded-full bg-primary-500 animate-pulse shrink-0" />
          )}
        </div>

        {/* Active indicator */}
        {isActive && (
          <ChevronRight className="h-2.5 w-2.5 text-primary-600 shrink-0" />
        )}
      </div>
    </button>
  )
}
