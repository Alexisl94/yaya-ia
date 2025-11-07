'use client'

/**
 * Sector Card Component
 * Displays a sector option during onboarding
 */

import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface SectorCardProps {
  name: string
  description: string
  icon: string
  color: string
  isSelected?: boolean
  onClick: () => void
}

export function SectorCard({
  name,
  description,
  icon,
  color,
  isSelected = false,
  onClick
}: SectorCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected
          ? 'ring-2 ring-offset-2 shadow-lg'
          : 'hover:scale-105'
        }
      `}
      style={{
        borderColor: isSelected ? color : undefined,
        '--ring-color': color
      } as React.CSSProperties}
    >
      {isSelected && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white z-10"
          style={{ backgroundColor: color }}
        >
          <Check className="w-4 h-4" />
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-lg text-slate-900">
            {name}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
