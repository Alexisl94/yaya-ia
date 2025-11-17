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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Quel type d'assistant souhaitez-vous créer ?
        </h2>
        <p className="text-slate-600 text-lg">
          Choisissez le type d'agent adapté à vos besoins
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Companion Agent */}
        <Card
          onClick={() => handleSelectType('companion')}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 relative',
            'border-2 hover:border-primary'
          )}
        >
          <CardContent className="p-8">
            {/* Recommended Badge */}
            <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              RECOMMANDÉ
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                Assistant Compagnon
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Votre partenaire au quotidien qui connaît tout de votre entreprise
              </p>

              <div className="pt-4 space-y-3 text-left">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Contexte complet</strong> : Connaît votre entreprise, vos clients, vos défis, vos objectifs
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Polyvalent</strong> : Répond à tous types de questions professionnelles
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Proactif</strong> : Anticipe vos besoins et suggère des améliorations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Épinglable</strong> : Accessible en un clic depuis votre sidebar
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button className="w-full" size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Créer mon assistant compagnon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Agent */}
        <Card
          onClick={() => handleSelectType('task')}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105',
            'border-2 hover:border-primary'
          )}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-2">
                <Target className="w-10 h-10 text-purple-600" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                Agent Tâche
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Un spécialiste dédié à une mission précise
              </p>

              <div className="pt-4 space-y-3 text-left">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Ciblé</strong> : Optimisé pour une tâche ou un objectif spécifique
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Rapide à créer</strong> : Configuration simplifiée et accélérée
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Expert</strong> : Concentré sur son domaine d'expertise unique
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                  <p className="text-sm text-slate-700">
                    <strong>Complémentaire</strong> : Idéal en complément de votre assistant principal
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50" size="lg">
                  <Target className="w-4 h-4 mr-2" />
                  Créer un agent tâche
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200 mt-8">
        <CardContent className="p-6">
          <p className="text-sm text-blue-900 text-center">
            <strong> Conseil :</strong> Commencez par créer votre <strong>Assistant Compagnon</strong> pour bénéficier de l'expérience la plus complète. Vous pourrez ensuite créer des agents tâches spécialisés pour des besoins spécifiques (prospection, facturation, réseaux sociaux, etc.).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
