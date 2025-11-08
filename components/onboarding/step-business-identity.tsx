'use client'

/**
 * Step 2: Business Identity
 * Company name, type, location, and experience
 */

import { useState } from 'react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MapPin, Building2, Calendar } from 'lucide-react'

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

const EXPERIENCE_LEVELS = [
  { value: '0-2', label: 'Débutant (0-2 ans)' },
  { value: '3-5', label: 'Intermédiaire (3-5 ans)' },
  { value: '6-10', label: 'Expérimenté (6-10 ans)' },
  { value: '10+', label: 'Expert (10+ ans)' }
]

export function StepBusinessIdentity() {
  const { data, setBusinessIdentity, nextStep, prevStep } = useOnboardingStore()

  const [businessName, setBusinessName] = useState(data.businessName || '')
  const [businessType, setBusinessType] = useState(data.businessType || null)
  const [location, setLocation] = useState(data.location || '')
  const [yearsExperience, setYearsExperience] = useState(data.yearsExperience || null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim() || !businessType || !location.trim() || !yearsExperience) return

    setBusinessIdentity(businessName.trim(), businessType, location.trim(), yearsExperience)
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Identité de votre activité
        </h2>
        <p className="text-slate-600">
          Présentons votre entreprise pour une personnalisation optimale
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-base font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Nom de votre entreprise / activité
          </Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Ex: Agence Événements Premium, Cabinet Dupont..."
            className="text-base"
            required
          />
          <p className="text-xs text-slate-500">
            Le nom sous lequel vous exercez votre activité
          </p>
        </div>

        {/* Business Type */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Type de structure
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

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localisation
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: Paris, Lyon, Bordeaux, Île-de-France..."
            className="text-base"
            required
          />
          <p className="text-xs text-slate-500">
            Ville ou région où vous exercez principalement
          </p>
        </div>

        {/* Years of Experience */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Années d'expérience
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <Card
                key={level.value}
                onClick={() => setYearsExperience(level.value)}
                className={`
                  cursor-pointer transition-all duration-200 hover:shadow-md
                  ${yearsExperience === level.value
                    ? 'ring-2 ring-primary shadow-md bg-primary/5'
                    : ''
                  }
                `}
              >
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-center">{level.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
            disabled={!businessName.trim() || !businessType || !location.trim() || !yearsExperience}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
