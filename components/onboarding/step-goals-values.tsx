'use client'

/**
 * Step 4: Goals & Values
 * Primary goals, business values, and example projects
 */

import { useState } from 'react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Target, Heart, Briefcase, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COMMON_GOALS = [
  { value: 'increase_revenue', label: 'Augmenter mon chiffre d\'affaires', icon: '💰' },
  { value: 'save_time', label: 'Gagner du temps', icon: '⏱️' },
  { value: 'find_clients', label: 'Trouver plus de clients', icon: '🎯' },
  { value: 'improve_quality', label: 'Améliorer la qualité de service', icon: '⭐' },
  { value: 'better_organization', label: 'Mieux m\'organiser', icon: '📋' },
  { value: 'expand_offer', label: 'Développer mon offre', icon: '🚀' },
  { value: 'differentiate', label: 'Me différencier', icon: '💎' },
  { value: 'reduce_stress', label: 'Réduire le stress', icon: '🧘' }
]

export function StepGoalsValues() {
  const { data, setGoalsAndValues, nextStep, prevStep } = useOnboardingStore()

  const [selectedGoals, setSelectedGoals] = useState<string[]>(data.primaryGoals || [])
  const [businessValues, setBusinessValues] = useState(data.businessValues || '')
  const [exampleProjects, setExampleProjects] = useState(data.exampleProjects || '')

  const toggleGoal = (goalValue: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalValue)
        ? prev.filter(g => g !== goalValue)
        : [...prev, goalValue]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGoals.length === 0) return

    setGoalsAndValues(selectedGoals, businessValues.trim(), exampleProjects.trim())
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
          <Target className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Objectifs et valeurs
        </h2>
        <p className="text-slate-600">
          Définissons ensemble ce qui est important pour vous
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary Goals */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4" />
            Vos objectifs principaux (sélectionnez-en 2 à 4)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COMMON_GOALS.map((goal) => (
              <Card
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md relative',
                  selectedGoals.includes(goal.value)
                    ? 'ring-2 ring-primary shadow-md bg-primary/5'
                    : ''
                )}
              >
                {selectedGoals.includes(goal.value) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white z-10">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <CardContent className="p-3">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-2xl">{goal.icon}</span>
                    <p className="font-medium text-xs leading-tight">{goal.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {selectedGoals.length === 0 && 'Sélectionnez au moins un objectif'}
            {selectedGoals.length > 0 && `${selectedGoals.length} objectif(s) sélectionné(s)`}
          </p>
        </div>

        {/* Business Values */}
        <div className="space-y-2">
          <Label htmlFor="businessValues" className="text-base font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Valeurs de votre entreprise (optionnel)
          </Label>
          <textarea
            id="businessValues"
            value={businessValues}
            onChange={(e) => setBusinessValues(e.target.value)}
            placeholder="Ex: Proximité client, excellence, innovation, éco-responsabilité, transparence, éthique..."
            className="w-full min-h-[80px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-slate-500">
            Quelles sont les valeurs qui guident votre travail au quotidien ?
          </p>
        </div>

        {/* Example Projects */}
        <div className="space-y-2">
          <Label htmlFor="exampleProjects" className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Exemples de projets récents (optionnel)
          </Label>
          <textarea
            id="exampleProjects"
            value={exampleProjects}
            onChange={(e) => setExampleProjects(e.target.value)}
            placeholder="Ex: Organisation d'un mariage de 150 personnes à Deauville, séminaire d'entreprise de 3 jours pour 50 personnes..."
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-slate-500">
            Partagez 1 ou 2 exemples concrets de projets que vous avez réalisés récemment
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Pourquoi ces informations ?</strong>
              <br />
              Elles permettent à votre assistant de comprendre vos priorités et d'adapter ses conseils à votre réalité. Plus vous partagez de détails, plus l'assistance sera personnalisée et pertinente.
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
            type="submit"
            disabled={selectedGoals.length === 0}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
