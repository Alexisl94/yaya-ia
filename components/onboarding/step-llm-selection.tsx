'use client'

/**
 * Step LLM Selection (Before Confirmation)
 * Choose between Claude and GPT (GPT currently unavailable)
 */

import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Zap, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepLLMSelection() {
  const { data, setSelectedLLM, nextStep, prevStep } = useOnboardingStore()

  const handleSelectLLM = (llm: 'claude' | 'gpt') => {
    setSelectedLLM(llm)
  }

  const handleContinue = () => {
    if (!data.selectedLLM) return
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Choisissez votre modèle d'IA
        </h2>
        <p className="text-slate-600 text-lg">
          Sélectionnez le modèle de langage qui alimentera votre agent
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Claude */}
        <Card
          onClick={() => handleSelectLLM('claude')}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 relative',
            'border-2',
            data.selectedLLM === 'claude'
              ? 'ring-2 ring-primary shadow-md bg-primary/5 border-primary'
              : 'hover:border-primary'
          )}
        >
          <CardContent className="p-8">
            {/* Recommended Badge */}
            <div className="absolute -top-3 -right-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              DISPONIBLE
            </div>

            {/* Selected Indicator */}
            {data.selectedLLM === 'claude' && (
              <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}

            <div className="text-center space-y-4 mt-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 mb-2">
                <span className="text-4xl">🤖</span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                Claude (Anthropic)
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Modèle avancé spécialisé dans la compréhension contextuelle profonde
              </p>

              <div className="pt-4 space-y-3 text-left">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Excellence contextuelle</strong> : Comprend parfaitement les nuances et le contexte long
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Sécurité renforcée</strong> : Conçu pour être fiable et éthique
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Instructions complexes</strong> : Excelle dans le suivi d'instructions détaillées
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Idéal pour</strong> : Assistants compagnons, analyses approfondies
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPT (Disabled) */}
        <Card
          className={cn(
            'relative opacity-60 cursor-not-allowed',
            'border-2 border-slate-300'
          )}
        >
          <CardContent className="p-8">
            {/* Unavailable Badge */}
            <div className="absolute -top-3 -right-3 bg-slate-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              BIENTÔT DISPONIBLE
            </div>

            <div className="text-center space-y-4 mt-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-teal-100 mb-2">
                <Zap className="w-10 h-10 text-teal-600" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                GPT (OpenAI)
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Modèle polyvalent connu pour sa créativité et sa rapidité
              </p>

              <div className="pt-4 space-y-3 text-left">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                  <p className="text-sm text-slate-600">
                    <strong>Créativité</strong> : Génération de contenu original et créatif
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                  <p className="text-sm text-slate-600">
                    <strong>Polyvalence</strong> : Excellent sur une large gamme de tâches
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                  <p className="text-sm text-slate-600">
                    <strong>Rapidité</strong> : Réponses rapides et fluides
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                  <p className="text-sm text-slate-600">
                    <strong>Idéal pour</strong> : Tâches créatives, brainstorming, génération de contenu
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <p className="text-sm text-slate-500 italic">
                  L'intégration GPT sera ajoutée prochainement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200 mt-8">
        <CardContent className="p-6">
          <p className="text-sm text-blue-900 text-center">
            <strong>💡 À savoir :</strong> Vous pourrez changer de modèle plus tard dans les paramètres de l'agent. Le choix du modèle n'affecte pas les fonctionnalités de base, mais peut influencer le style et la qualité des réponses.
          </p>
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
