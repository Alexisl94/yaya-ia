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
        relative cursor-pointer transition-all duration-200 hover:shadow-md border-2
        ${isSelected
          ? 'border-amber-500 bg-amber-50/50 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
        }
      `}
    >
      {isSelected && (
        <div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white z-10 bg-amber-500"
        >
          <Check className="w-3 h-3" />
        </div>
      )}

      <CardContent className="p-3">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>

          {/* Name */}
          <h3 className="font-medium text-sm text-slate-900">
            {name}
          </h3>
        </div>
      </CardContent>
    </Card>
  )
}
