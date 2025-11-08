'use client'

/**
 * Step 3: Detailed Context
 * Clients, specificities, project size, challenges, and tools
 */

import { useState } from 'react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Users, FileText, AlertCircle, Wrench } from 'lucide-react'

const PROJECT_SIZES = [
  { value: 'small', label: 'Petits projets', description: 'Budget < 5K€', icon: '📦' },
  { value: 'medium', label: 'Projets moyens', description: 'Budget 5-20K€', icon: '📋' },
  { value: 'large', label: 'Grands projets', description: 'Budget > 20K€', icon: '🏗️' },
  { value: 'mixed', label: 'Mixte', description: 'Tous budgets', icon: '🔀' }
]

export function StepDetailedContext() {
  const { data, setDetailedContext, nextStep, prevStep } = useOnboardingStore()

  const [mainClients, setMainClients] = useState(data.mainClients || '')
  const [specificities, setSpecificities] = useState(data.specificities || '')
  const [typicalProjectSize, setTypicalProjectSize] = useState(data.typicalProjectSize || '')
  const [mainChallenges, setMainChallenges] = useState(data.mainChallenges || '')
  const [toolsUsed, setToolsUsed] = useState(data.toolsUsed || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mainClients.trim() || !typicalProjectSize || !mainChallenges.trim()) return

    setDetailedContext(
      mainClients.trim(),
      specificities.trim(),
      typicalProjectSize,
      mainChallenges.trim(),
      toolsUsed.trim()
    )
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Contexte de votre activité
        </h2>
        <p className="text-slate-600">
          Aidez votre assistant à comprendre votre quotidien professionnel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Main Clients */}
        <div className="space-y-2">
          <Label htmlFor="mainClients" className="text-base font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Vos clients principaux
          </Label>
          <textarea
            id="mainClients"
            value={mainClients}
            onChange={(e) => setMainClients(e.target.value)}
            placeholder="Ex: Particuliers pour mariages et anniversaires, entreprises pour séminaires, associations pour événements caritatifs..."
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          <p className="text-xs text-slate-500">
            Décrivez qui sont vos clients types et dans quels contextes ils font appel à vous
          </p>
        </div>

        {/* Typical Project Size */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Taille de projet typique
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PROJECT_SIZES.map((size) => (
              <Card
                key={size.value}
                onClick={() => setTypicalProjectSize(size.value)}
                className={`
                  cursor-pointer transition-all duration-200 hover:shadow-md
                  ${typicalProjectSize === size.value
                    ? 'ring-2 ring-primary shadow-md bg-primary/5'
                    : ''
                  }
                `}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col items-center text-center space-y-1">
                    <span className="text-2xl">{size.icon}</span>
                    <p className="font-medium text-xs">{size.label}</p>
                    <p className="text-[10px] text-slate-500">{size.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Challenges */}
        <div className="space-y-2">
          <Label htmlFor="mainChallenges" className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Vos principaux défis
          </Label>
          <textarea
            id="mainChallenges"
            value={mainChallenges}
            onChange={(e) => setMainChallenges(e.target.value)}
            placeholder="Ex: Trouver des clients réguliers, gérer la saisonnalité, optimiser ma rentabilité, me démarquer de la concurrence..."
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          <p className="text-xs text-slate-500">
            Quels sont vos obstacles actuels ? Cela permettra à l'assistant de vous proposer des solutions ciblées
          </p>
        </div>

        {/* Specificities (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="specificities" className="text-base font-semibold">
            Spécificités de votre activité (optionnel)
          </Label>
          <textarea
            id="specificities"
            value={specificities}
            onChange={(e) => setSpecificities(e.target.value)}
            placeholder="Ex: Spécialisé dans les mariages à destination, expertise en événements eco-responsables, certifié X..."
            className="w-full min-h-[80px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-slate-500">
            Y a-t-il des aspects particuliers ou des expertises spécifiques que l'assistant devrait connaître ?
          </p>
        </div>

        {/* Tools Used (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="toolsUsed" className="text-base font-semibold flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Outils et logiciels utilisés (optionnel)
          </Label>
          <Input
            id="toolsUsed"
            value={toolsUsed}
            onChange={(e) => setToolsUsed(e.target.value)}
            placeholder="Ex: Notion, Trello, QuickBooks, Photoshop, Canva..."
            className="text-sm"
          />
          <p className="text-xs text-slate-500">
            Listez les principaux outils que vous utilisez quotidiennement (séparés par des virgules)
          </p>
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
            type="submit"
            disabled={!mainClients.trim() || !typicalProjectSize || !mainChallenges.trim()}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
