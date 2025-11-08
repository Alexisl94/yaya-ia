'use client'

/**
 * Step 3 (Task Agents): Task Definition
 * Define the specific task and goal for a task agent
 */

import { useState } from 'react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Target, Lightbulb } from 'lucide-react'

const TASK_EXAMPLES = [
  {
    category: 'Marketing & Communication',
    examples: [
      { task: 'Rédaction de posts LinkedIn', goal: 'Créer du contenu professionnel engageant pour mon réseau' },
      { task: 'Stratégie de contenu Instagram', goal: 'Développer ma présence sur les réseaux sociaux' },
      { task: 'Newsletter hebdomadaire', goal: 'Maintenir le lien avec mes clients et prospects' },
    ]
  },
  {
    category: 'Commercial & Prospection',
    examples: [
      { task: 'Qualification de prospects', goal: 'Identifier les clients potentiels les plus prometteurs' },
      { task: 'Emails de prospection', goal: 'Initier des conversations commerciales pertinentes' },
      { task: 'Relances clients', goal: 'Maximiser le taux de transformation' },
    ]
  },
  {
    category: 'Gestion & Administration',
    examples: [
      { task: 'Gestion de facturation', goal: 'Automatiser et simplifier la facturation' },
      { task: 'Suivi de trésorerie', goal: 'Garder une vision claire de ma situation financière' },
      { task: 'Organisation planning', goal: 'Optimiser mon temps et mes rendez-vous' },
    ]
  },
]

export function StepTaskDefinition() {
  const { data, setTaskDefinition, nextStep, prevStep } = useOnboardingStore()

  const [taskDescription, setTaskDescription] = useState(data.taskDescription || '')
  const [taskSpecificGoal, setTaskSpecificGoal] = useState(data.taskSpecificGoal || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDescription.trim() || !taskSpecificGoal.trim()) return

    setTaskDefinition(taskDescription.trim(), taskSpecificGoal.trim())
    nextStep()
  }

  const handleUseExample = (example: { task: string; goal: string }) => {
    setTaskDescription(example.task)
    setTaskSpecificGoal(example.goal)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
          <Target className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Définissez la mission de votre agent
        </h2>
        <p className="text-slate-600">
          Plus vous serez précis, plus l'agent sera efficace dans sa tâche
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Description */}
        <div className="space-y-2">
          <Label htmlFor="taskDescription" className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4" />
            Quelle tâche cet agent doit-il accomplir ?
          </Label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Ex: Rédiger des posts LinkedIn professionnels pour promouvoir mes services"
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          <p className="text-xs text-slate-500">
            Décrivez précisément la tâche principale que cet agent devra effectuer
          </p>
        </div>

        {/* Task Specific Goal */}
        <div className="space-y-2">
          <Label htmlFor="taskSpecificGoal" className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Quel est l'objectif recherché ?
          </Label>
          <textarea
            id="taskSpecificGoal"
            value={taskSpecificGoal}
            onChange={(e) => setTaskSpecificGoal(e.target.value)}
            placeholder="Ex: Générer de l'engagement et attirer des clients qualifiés via LinkedIn"
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          <p className="text-xs text-slate-500">
            Quel résultat concret souhaitez-vous obtenir avec cette tâche ?
          </p>
        </div>

        {/* Examples */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Exemples de tâches par catégorie
            </h3>
            <div className="space-y-4">
              {TASK_EXAMPLES.map((category) => (
                <div key={category.category}>
                  <p className="text-xs font-semibold text-slate-700 mb-2">{category.category}</p>
                  <div className="space-y-2">
                    {category.examples.map((example, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUseExample(example)}
                        className="w-full text-left px-3 py-2 text-xs bg-white border border-slate-200 rounded hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <p className="font-medium text-slate-900">{example.task}</p>
                        <p className="text-slate-600 mt-0.5">{example.goal}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Conseil :</strong> Un agent tâche est plus efficace quand sa mission est bien délimitée. Créez plusieurs agents tâches plutôt qu'un seul agent qui fait tout.
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
            disabled={!taskDescription.trim() || !taskSpecificGoal.trim()}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
