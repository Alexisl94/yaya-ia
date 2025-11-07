'use client'

/**
 * Step 2: Business Context
 * User provides business type, clients, and specificities
 */

import { useState } from 'react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const BUSINESS_TYPES = [
  {
    value: 'freelance' as const,
    label: 'Freelance / Indépendant',
    description: 'Vous travaillez seul(e)',
    icon: '👤'
  },
  {
    value: 'tpe' as const,
    label: 'TPE',
    description: '2-10 employés',
    icon: '👥'
  },
  {
    value: 'pme' as const,
    label: 'PME',
    description: '11-50 employés',
    icon: '🏢'
  }
]

export function StepBusinessContext() {
  const { data, setBusinessContext, nextStep, prevStep } = useOnboardingStore()

  const [businessType, setBusinessType] = useState(data.businessType || null)
  const [mainClients, setMainClients] = useState(data.mainClients || '')
  const [specificities, setSpecificities] = useState(data.specificities || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType || !mainClients.trim()) return

    setBusinessContext(businessType, mainClients, specificities)
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Parlez-nous de votre activité
        </h2>
        <p className="text-slate-600">
          Ces informations permettront à votre assistant de mieux vous comprendre
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Type d'activité
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {BUSINESS_TYPES.map((type) => (
              <Card
                key={type.value}
                onClick={() => setBusinessType(type.value)}
                className={`
                  cursor-pointer transition-all duration-200 hover:shadow-md
                  ${businessType === type.value
                    ? 'ring-2 ring-primary shadow-md'
                    : ''
                  }
                `}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl">{type.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{type.label}</p>
                      <p className="text-xs text-slate-500">{type.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Clients */}
        <div className="space-y-2">
          <Label htmlFor="mainClients" className="text-base font-semibold">
            Vos clients principaux
          </Label>
          <textarea
            id="mainClients"
            value={mainClients}
            onChange={(e) => setMainClients(e.target.value)}
            placeholder="Ex: Particuliers pour mariages et anniversaires, entreprises pour séminaires..."
            className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          <p className="text-xs text-slate-500">
            Décrivez qui sont vos clients types
          </p>
        </div>

        {/* Specificities */}
        <div className="space-y-2">
          <Label htmlFor="specificities" className="text-base font-semibold">
            Spécificités de votre activité (optionnel)
          </Label>
          <textarea
            id="specificities"
            value={specificities}
            onChange={(e) => setSpecificities(e.target.value)}
            placeholder="Ex: Spécialisé dans les mariages à destination, expertise en événements eco-responsables..."
            className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-slate-500">
            Y a-t-il des aspects particuliers de votre métier que l'assistant devrait connaître ?
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
            disabled={!businessType || !mainClients.trim()}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
