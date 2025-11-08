/**
 * Loading State Components
 * Elegant loading indicators and skeletons
 */

'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot } from 'lucide-react'

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar skeleton */}
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

      {/* Message content skeleton */}
      <div className="flex-1 space-y-2 max-w-[85%]">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[75%]" />
        </div>
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2 animate-fade-in">
      {/* Avatar plus petit */}
      <Avatar className="h-7 w-7 shrink-0 border border-border bg-muted">
        <AvatarFallback className="text-muted-foreground">
          <Bot className="h-3.5 w-3.5" />
        </AvatarFallback>
      </Avatar>

      {/* Typing animation - plus petite et discrète */}
      <div className="rounded-xl bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"></div>
        </div>
      </div>
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-5 rounded-lg" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function AgentSkeleton() {
  return (
    <div className="rounded-lg p-3 space-y-2 animate-fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-6 text-center animate-pulse">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        </div>
        <div>
          <div className="text-lg font-semibold">Chargement...</div>
          <div className="text-sm text-muted-foreground">Préparation de votre espace</div>
        </div>
      </div>
    </div>
  )
}

export function FullPageLoader({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="space-y-6 text-center animate-scale-in">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse bg-primary-500 opacity-20 blur-2xl rounded-full"></div>
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-xl font-bold">{message}</div>
          <div className="text-sm text-muted-foreground">Veuillez patienter</div>
        </div>
      </div>
    </div>
  )
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  }

  return (
    <div
      className={`animate-spin rounded-full border-primary-500 border-t-transparent ${sizeClasses[size]} ${className}`}
    />
  )
}
