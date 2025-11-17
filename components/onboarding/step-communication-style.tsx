'use client'

/**
 * Step 3: Communication Style Selection
 * User selects their preferred communication style
 */

import { useState } from 'react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

const COMMUNICATION_STYLES = [
  {
    value: 'professional' as const,
    label: 'Professionnel',
    description: 'Ton formel, structuré et précis',
    icon: '💼',
    example: 'Utilise un langage soutenu avec des phrases bien structurées'
  },
  {
    value: 'accessible' as const,
    label: 'Accessible',
    description: 'Ton friendly et pragmatique',
    icon: '🤝',
    example: 'Ton naturel, phrases simples et exemples concrets'
  },
  {
    value: 'expert' as const,
    label: 'Expert',
    description: 'Ton technique et approfondi',
    icon: '',
    example: 'Vocabulaire technique et explications détaillées'
  }
]

export function StepCommunicationStyle() {
  const { data, setCommunicationStyle, nextStep, prevStep } = useOnboardingStore()

  const [selectedStyle, setSelectedStyle] = useState(data.communicationStyle || null)

  const handleSubmit = () => {
    if (!selectedStyle) return
    setCommunicationStyle(selectedStyle)
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Comment souhaitez-vous communiquer ?
        </h2>
        <p className="text-slate-600">
          Choisissez le style de communication qui vous correspond le mieux
        </p>
      </div>

      {/* Communication Styles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COMMUNICATION_STYLES.map((style) => (
          <Card
            key={style.value}
            onClick={() => setSelectedStyle(style.value)}
            className={`
              relative cursor-pointer transition-all duration-200 hover:shadow-lg
              ${selectedStyle === style.value
                ? 'ring-2 ring-primary shadow-lg'
                : 'hover:scale-105'
              }
            `}
          >
            {selectedStyle === style.value && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white z-10">
                <Check className="w-4 h-4" />
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                  {style.icon}
                </div>

                {/* Label */}
                <h3 className="font-semibold text-lg text-slate-900">
                  {style.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600">
                  {style.description}
                </p>

                {/* Example */}
                <div className="pt-2 border-t border-slate-200 w-full">
                  <p className="text-xs text-slate-500 italic">
                    {style.example}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedStyle}
          className="flex-1"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
