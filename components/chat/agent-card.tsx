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
import { getModelInfo } from '@/lib/utils/model-utils'

interface AgentCardProps {
  agent: Agent
  isActive?: boolean
  messageCount?: number
  onClick: () => void
}

export function AgentCard({ agent, isActive, messageCount = 0, onClick }: AgentCardProps) {
  // Get first letter of name for avatar
  const avatarText = agent.name[0] || 'A'

  // Get agent type from settings (fallback for PostgREST cache issues)
  const agentType = (agent.settings as any)?.agentType || agent.agent_type || 'companion'
  const modelInfo = getModelInfo(agent.model)

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
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 mb-0.5">
            <span className={cn(
              'truncate font-medium text-[11px] block',
              isActive && 'text-primary-700'
            )}>
              {agent.name}
            </span>
            {isActive && (
              <div className="h-1 w-1 rounded-full bg-primary-500 animate-pulse shrink-0" />
            )}
          </div>

          {/* Badges discrets */}
          <div className="flex items-center gap-1">
            {/* Agent Type Badge */}
            <span className={cn(
              "px-1 py-0 text-[8px] font-semibold rounded",
              agentType === 'companion'
                ? "bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            )}>
              {agentType === 'companion' ? 'COMP' : 'TASK'}
            </span>

            {/* Model Badge with Emoji */}
            <span className={cn(
              "px-1 py-0 text-[8px] font-semibold rounded flex items-center gap-0.5",
              modelInfo.tier === 'economy' && "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              modelInfo.tier === 'standard' && "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              modelInfo.tier === 'premium' && "bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
              modelInfo.tier === 'ultra' && "bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            )}>
              <span className="text-[8px]">{modelInfo.emoji}</span>
              {modelInfo.displayName.slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <ChevronRight className="h-2.5 w-2.5 text-primary-600 shrink-0" />
        )}
      </div>
    </button>
  )
}
