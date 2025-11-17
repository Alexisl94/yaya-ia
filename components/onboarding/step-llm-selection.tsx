'use client'

/**
 * Step LLM Selection (Before Confirmation)
 * Choose between Claude models with granular pricing
 */

import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, CheckCircle, Zap, TrendingUp, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAvailableModels, formatCurrency, type ModelConfig } from '@/lib/pricing/model-pricing'
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

  // Get icon for each model
  const getModelIcon = (model: ModelConfig) => {
    if (model.name === 'haiku') return <Zap className="w-10 h-10 text-primary" />
    if (model.name === 'sonnet') return <TrendingUp className="w-10 h-10 text-purple-600" />
    if (model.name === 'opus') return <Rocket className="w-10 h-10 text-orange-600" />
    return <Brain className="w-10 h-10 text-primary" />
  }

  // Get gradient colors for each model
  const getModelGradient = (model: ModelConfig) => {
    if (model.name === 'haiku') return 'from-blue-100 to-cyan-100'
    if (model.name === 'sonnet') return 'from-purple-100 to-pink-100'
    if (model.name === 'opus') return 'from-orange-100 to-red-100'
    return 'from-blue-100 to-cyan-100'
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Choisissez votre modèle d'IA
        </h2>
        <p className="text-slate-600 text-lg">
          Sélectionnez le modèle Claude qui correspond le mieux à vos besoins et à votre budget
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {availableModels.map((model) => {
          const isSelected = data.selectedLLM === model.id
          const isRecommended = model.recommended

          return (
            <Card
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 relative',
                'border-2',
                isSelected
                  ? 'ring-2 ring-primary shadow-md bg-primary/5 border-primary'
                  : 'hover:border-primary'
              )}
            >
              <CardContent className="p-6">
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute -top-3 -right-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    RECOMMANDÉ
                  </div>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}

                <div className="text-center space-y-4 mt-2">
                  {/* Icon */}
                  <div className={cn(
                    "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br mb-2",
                    getModelGradient(model)
                  )}>
                    {getModelIcon(model)}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {model.displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                      {model.speed === 'fast' && 'Rapide'}
                      {model.speed === 'medium' && 'Équilibré'}
                      {model.speed === 'slow' && 'Précis'}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed min-h-[40px]">
                    {model.description}
                  </p>

                  {/* Doggo Consumption */}
                  {(() => {
                    const consumption = getModelConsumption(model.name as ModelType)
                    return (
                      <div className="pt-4 pb-2 border-t border-slate-200">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-xs text-slate-600 font-medium">Consommation Doggo</p>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{consumption.icon}</span>
                            <div className="text-left">
                              <p className="font-bold text-sm text-slate-900">{consumption.label}</p>
                              <p className="text-xs text-slate-600">{consumption.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Features */}
                  <div className="pt-4 space-y-2 text-left">
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5",
                        isSelected ? "bg-primary" : "bg-slate-400"
                      )} />
                      <p className="text-xs text-slate-700">
                        <strong>Qualité:</strong> {model.quality === 'excellent' ? 'Excellente' : model.quality === 'good' ? 'Bonne' : 'Basique'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5",
                        isSelected ? "bg-primary" : "bg-slate-400"
                      )} />
                      <p className="text-xs text-slate-700">
                        <strong>Vitesse:</strong> {model.speed === 'fast' ? 'Très rapide' : model.speed === 'medium' ? 'Rapide' : 'Réfléchi'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5",
                        isSelected ? "bg-primary" : "bg-slate-400"
                      )} />
                      <p className="text-xs text-slate-700">
                        <strong>Provider:</strong> {model.provider === 'anthropic' ? 'Claude (Anthropic)' : 'ChatGPT (OpenAI)'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box */}
      <Card className="bg-amber-50 border-amber-200 mt-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🐕</span>
            <div className="space-y-2 flex-1">
              <p className="text-sm text-amber-900 font-semibold">
                À propos de votre Doggo
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Chaque mois, vous disposez d'<strong>1 Doggo</strong> pour utiliser vos agents.
                Les modèles <strong>économiques</strong> 🐕 consomment peu de Doggo,
                les <strong>modérés</strong> 🦮 un montant moyen,
                et les <strong>intensifs</strong> 🐺 davantage.<br /><br />
                <strong>Conseil :</strong> Commencez avec un modèle économique recommandé,
                vous pourrez changer à tout moment !
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
