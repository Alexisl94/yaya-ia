'use client'

/**
 * Step 1: Agent Type Selection
 * Choose between Companion Agent (full context) or Task Agent (specific purpose)
 */

import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Target, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepAgentType() {
  const { data, setAgentType, nextStep } = useOnboardingStore()

  const handleSelectType = (type: 'companion' | 'task') => {
    setAgentType(type)
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Quel type d'assistant ?
        </h2>
        <p className="text-sm text-slate-600">
          Choisissez selon votre besoin
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Companion Agent */}
        <Card
          onClick={() => handleSelectType('companion')}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md relative',
            'border-2 hover:border-amber-500'
          )}
        >
          <CardContent className="p-4">
            {/* Recommended Badge */}
            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              RECOMMANDÉ
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-50 border border-amber-200">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                Assistant Compagnon
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Votre partenaire qui connaît votre entreprise
              </p>

              <div className="pt-2 space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5" />
                  <p className="text-xs text-slate-700">
                    Contexte complet de l'entreprise
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5" />
                  <p className="text-xs text-slate-700">
                    Polyvalent et adaptable
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5" />
                  <p className="text-xs text-slate-700">
                    Proactif et suggère des améliorations
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Agent */}
        <Card
          onClick={() => handleSelectType('task')}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            'border-2 hover:border-purple-500'
          )}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-50 border border-purple-200">
                <Target className="w-6 h-6 text-purple-600" />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                Agent Tâche
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Un spécialiste pour une mission précise
              </p>

              <div className="pt-2 space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5" />
                  <p className="text-xs text-slate-700">
                    Optimisé pour une tâche spécifique
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5" />
                  <p className="text-xs text-slate-700">
                    Configuration rapide
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5" />
                  <p className="text-xs text-slate-700">
                    Expert dans son domaine
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="text-xs text-blue-900 text-center leading-relaxed">
          <strong>Conseil :</strong> Commencez par l'Assistant Compagnon pour une expérience complète. Vous pourrez créer des agents spécialisés ensuite.
        </p>
      </div>
    </div>
  )
}
