/**
 * Empty State Components
 * Engaging empty states for various contexts
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageSquare, Sparkles, Zap, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function ChatEmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    {
      icon: FileText,
      title: 'Rédige un email',
      description: 'Pour relancer un client',
      prompt: 'Aide-moi à rédiger un email de relance pour un client',
    },
    {
      icon: Sparkles,
      title: 'Analyse ce document',
      description: 'Résume les points clés',
      prompt: 'Peux-tu m\'aider à analyser et résumer un document ?',
    },
    {
      icon: Zap,
      title: 'Crée une stratégie',
      description: 'Plan d\'action détaillé',
      prompt: 'Aide-moi à créer une stratégie pour mon projet',
    },
  ]

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-2xl space-y-8 text-center animate-slide-up">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse bg-primary-500 opacity-20 blur-2xl rounded-full"></div>
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold tracking-tight">
            Commencez une conversation
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Posez n'importe quelle question à votre agent. Il est là pour vous aider
            dans vos tâches quotidiennes et répondre à vos besoins professionnels.
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid gap-3 sm:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className={cn(
                'group cursor-pointer border-2 p-4 text-left transition-all',
                'hover:border-primary-500 hover:shadow-md hover:-translate-y-0.5',
                'card-elevated'
              )}
              onClick={() => onSuggestionClick?.(suggestion.prompt)}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-50 p-2 transition-colors group-hover:bg-primary-100">
                  <suggestion.icon className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-sm">{suggestion.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground">
          💡 Astuce : Vous pouvez aussi utiliser{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
            /
          </kbd>{' '}
          pour accéder aux commandes rapides
        </p>
      </div>
    </div>
  )
}

interface NoAgentEmptyStateProps {
  onCreateAgent?: () => void
}

export function NoAgentEmptyState({ onCreateAgent }: NoAgentEmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md space-y-6 text-center animate-scale-in">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            Bienvenue sur Doggo
          </h3>
          <p className="text-muted-foreground text-sm">
            Sélectionnez un agent dans la barre latérale pour commencer à discuter
          </p>
        </div>

        {onCreateAgent && (
          <Button
            onClick={onCreateAgent}
            size="lg"
            className="gradient-primary shadow-md hover:shadow-lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Créer mon premier agent
          </Button>
        )}
      </div>
    </div>
  )
}

export function NoConversationsEmptyState({ onCreateConversation }: { onCreateConversation?: () => void }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md space-y-6 text-center animate-scale-in">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary-500 opacity-10 blur-2xl rounded-full"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-50 border-2 border-secondary-200">
              <MessageSquare className="h-8 w-8 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold">
            Aucune conversation
          </h4>
          <p className="text-muted-foreground text-sm">
            Démarrez une nouvelle conversation avec cet agent pour commencer
          </p>
        </div>

        {onCreateConversation && (
          <Button
            onClick={onCreateConversation}
            className="gradient-primary shadow-md hover:shadow-lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Nouvelle conversation
          </Button>
        )}
      </div>
    </div>
  )
}
