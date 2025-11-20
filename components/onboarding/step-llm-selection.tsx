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

  const handleSelectModel = (modelName: string) => {
    // Save the short model name (e.g., 'haiku', 'gpt-4o') instead of full ID
    // This ensures consistency with ModelSettingsModal and the rest of the app
    setSelectedLLM(modelName)
  }

  const handleContinue = () => {
    if (!data.selectedLLM) return
    nextStep()
  }

  // Get model display name
  const getModelName = (model: ModelConfig) => {
    if (model.name === 'haiku') return 'Claude 3.5 Haiku'
    if (model.name === 'sonnet') return 'Claude 3.5 Sonnet'
    if (model.name === 'opus') return 'Claude 3 Opus'
    return model.displayName
  }

  // Get model description
  const getModelDescription = (model: ModelConfig) => {
    if (model.name === 'haiku') return 'Rapide et économique'
    if (model.name === 'sonnet') return 'Équilibré et performant'
    if (model.name === 'opus') return 'Puissance maximale'
    return model.description
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Choisissez votre modèle
        </h2>
        <p className="text-sm text-slate-600">
          Sélectionnez le modèle qui correspond à vos besoins
        </p>
      </div>

      {/* Model Cards */}
      <div className="space-y-2">
        {availableModels.map((model) => {
          const isSelected = data.selectedLLM === model.name
          const isRecommended = model.recommended
          const consumption = getModelConsumption(model.name as ModelType)

          return (
            <Card
              key={model.id}
              onClick={() => handleSelectModel(model.name)}
              className={cn(
                'cursor-pointer transition-all duration-200',
                'border',
                isSelected
                  ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                  : 'hover:border-slate-300 border-slate-200 hover:bg-slate-50'
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {/* Selection Indicator */}
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isSelected
                      ? "border-amber-500 bg-amber-500"
                      : "border-slate-300"
                  )}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-slate-900">
                        {getModelName(model)}
                      </h3>
                      {isRecommended && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                          Recommandé
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        · {getModelDescription(model)}
                      </span>
                    </div>
                  </div>

                  {/* Doggo Icon */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-xs text-slate-600">
                    <span className="text-base">{consumption.icon}</span>
                    <span className="hidden sm:inline">{consumption.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>10 000 Doggos offerts</strong> chaque mois. Vous pouvez changer de modèle à tout moment.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex-1"
          size="sm"
        >
          Retour
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!data.selectedLLM}
          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          size="sm"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
