/**
 * Doggo Logo Component
 * Simple, friendly dog icon representing the AI companion
 */

import { cn } from '@/lib/utils'

interface DoggoLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DoggoLogo({ className, size = 'md' }: DoggoLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  return (
    <div className={cn(
      'flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md',
      sizeClasses[size],
      className
    )}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4"
      >
        {/* Dog head shape */}
        <path
          d="M12 4C8.5 4 6 6.5 6 10v4c0 3.5 2.5 6 6 6s6-2.5 6-6v-4c0-3.5-2.5-6-6-6z"
          fill="white"
          opacity="0.95"
        />
        {/* Left ear */}
        <path
          d="M7 6c-1 0-2 1-2 2.5S6 11 7 11c.5 0 1-.5 1-1.5V7.5C8 6.5 7.5 6 7 6z"
          fill="white"
          opacity="0.95"
        />
        {/* Right ear */}
        <path
          d="M17 6c1 0 2 1 2 2.5S18 11 17 11c-.5 0-1-.5-1-1.5V7.5c0-1 .5-1.5 1-1.5z"
          fill="white"
          opacity="0.95"
        />
        {/* Left eye */}
        <circle cx="9.5" cy="11" r="1.2" fill="currentColor" className="text-amber-900" />
        {/* Right eye */}
        <circle cx="14.5" cy="11" r="1.2" fill="currentColor" className="text-amber-900" />
        {/* Nose */}
        <path
          d="M12 13c-.8 0-1.5.5-1.5 1.2 0 .4.3.8.7 1l.8.5.8-.5c.4-.2.7-.6.7-1 0-.7-.7-1.2-1.5-1.2z"
          fill="currentColor"
          className="text-amber-900"
        />
        {/* Smile */}
        <path
          d="M10 15.5c0 1.1.9 2 2 2s2-.9 2-2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          className="text-amber-900"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}
