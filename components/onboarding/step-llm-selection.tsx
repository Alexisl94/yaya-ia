'use client'

/**
 * Step LLM Selection (Before Confirmation)
 * Choose between Claude models with granular pricing
 */

import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAvailableModels, type ModelConfig } from '@/lib/pricing/model-pricing'
import { getModelConsumption } from '@/lib/utils/doggo-pricing'
import type { ModelType } from '@/types/database'

export function StepLLMSelection() {
  const { data, setSelectedLLM, nextStep, prevStep } = useOnboardingStore()

  // Get all available Claude models (sorted by cost)
  const availableModels = getAvailableModels()

  const handleSelectModel = (modelId: string) => {
    setSelectedLLM(modelId)
  }

  const handleContinue = () => {
    if (!data.selectedLLM) return
    nextStep()
  }

  // Get simple model label
  const getSimpleLabel = (model: ModelConfig) => {
    if (model.name === 'haiku') return 'Rapide & Économique'
    if (model.name === 'sonnet') return 'Équilibré'
    if (model.name === 'opus') return 'Puissant'
    return 'Standard'
  }

  // Get simple description
  const getSimpleDescription = (model: ModelConfig) => {
    if (model.name === 'haiku') return 'Parfait pour un usage quotidien'
    if (model.name === 'sonnet') return 'Le meilleur compromis qualité/prix'
    if (model.name === 'opus') return 'Performance maximale'
    return 'Pour tous vos besoins'
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header - Plus simple */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">
          Choisissez votre modèle IA
        </h2>
        <p className="text-slate-600">
          Sélectionnez le modèle qui vous convient
        </p>
      </div>

      {/* Model Cards - Design épuré */}
      <div className="space-y-3">
        {availableModels.map((model) => {
          const isSelected = data.selectedLLM === model.id
          const isRecommended = model.recommended
          const consumption = getModelConsumption(model.name as ModelType)

          return (
            <Card
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md relative',
                'border-2',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'hover:border-slate-300 border-slate-200'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Selection Indicator */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-slate-300"
                  )}>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {getSimpleLabel(model)}
                      </h3>
                      {isRecommended && (
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">
                          Recommandé
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {getSimpleDescription(model)}
                    </p>
                  </div>

                  {/* Doggo Icon - Discret */}
                  <div className="flex items-center gap-2 flex-shrink-0 bg-slate-50 px-3 py-2 rounded-lg">
                    <span className="text-2xl">{consumption.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box - Simplifié */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm text-blue-900">
            Chaque mois : <strong>10 000 Doggos</strong> gratuits.
            Les modèles 🐕 consomment peu, 🦮 moyen, 🐺 plus.
            <span className="block mt-1 text-blue-700">Vous pouvez changer de modèle à tout moment.</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!data.selectedLLM}
          className="flex-1"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
