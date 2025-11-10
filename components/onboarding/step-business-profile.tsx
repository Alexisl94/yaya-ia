'use client'

/**
 * Step: Business Profile (Universal for Companion and Task agents)
 * Detects if a business profile exists and offers to reuse it or create/edit
 */

import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Loader2, CheckCircle, Edit } from 'lucide-react'
import type { BusinessProfile } from '@/types/database'

const BUSINESS_TYPE_OPTIONS = [
  { value: 'freelance', label: 'Freelance / Indépendant' },
  { value: 'tpe', label: 'TPE (2-10 employés)' },
  { value: 'pme', label: 'PME (11-50 employés)' }
]

const EXPERIENCE_OPTIONS = [
  { value: '0-2', label: 'Débutant (0-2 ans)' },
  { value: '3-5', label: 'Intermédiaire (3-5 ans)' },
  { value: '6-10', label: 'Expérimenté (6-10 ans)' },
  { value: '10+', label: 'Expert (10+ ans)' }
]

const PROJECT_SIZE_OPTIONS = [
  { value: 'small', label: 'Petits projets (< 5K€)' },
  { value: 'medium', label: 'Projets moyens (5-20K€)' },
  { value: 'large', label: 'Grands projets (> 20K€)' },
  { value: 'mixed', label: 'Projets de toutes tailles' }
]

export function StepBusinessProfile() {
  const { data, setBusinessProfile, nextStep, prevStep } = useOnboardingStore()

  const [isLoading, setIsLoading] = useState(true)
  const [existingProfile, setExistingProfile] = useState<BusinessProfile | null>(null)
  const [mode, setMode] = useState<'reuse' | 'edit' | 'create'>('create')

  // Form state
  const [businessName, setBusinessName] = useState(data.businessName || '')
  const [businessType, setBusinessType] = useState<'freelance' | 'tpe' | 'pme' | null>(data.businessType)
  const [location, setLocation] = useState(data.location || '')
  const [yearsExperience, setYearsExperience] = useState<string | null>(data.yearsExperience)
  const [mainClients, setMainClients] = useState(data.mainClients || '')
  const [specificities, setSpecificities] = useState(data.specificities || '')
  const [typicalProjectSize, setTypicalProjectSize] = useState(data.typicalProjectSize || '')
  const [mainChallenges, setMainChallenges] = useState(data.mainChallenges || '')
  const [toolsUsed, setToolsUsed] = useState(data.toolsUsed || '')

  // Fetch existing profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/business-profiles')
        const result = await response.json()

        if (result.success && result.data) {
          setExistingProfile(result.data)
          setMode('reuse')

          // Pre-fill form with existing data
          setBusinessName(result.data.business_name)
          setBusinessType(result.data.business_type)
          setLocation(result.data.location || '')
          setYearsExperience(result.data.years_experience)
          setMainClients(result.data.main_clients || '')
          setSpecificities(result.data.specificities || '')
          setTypicalProjectSize(result.data.typical_project_size || '')
          setMainChallenges(result.data.main_challenges || '')
          setToolsUsed(result.data.tools_used || '')
        } else {
          setMode('create')
        }
      } catch (error) {
        console.error('Error fetching business profile:', error)
        setMode('create')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessName.trim()) return

    // Save to store
    setBusinessProfile({
      profileId: existingProfile?.id || null,
      businessName: businessName.trim(),
      businessType,
      location: location.trim(),
      yearsExperience,
      mainClients: mainClients.trim(),
      specificities: specificities.trim(),
      typicalProjectSize,
      mainChallenges: mainChallenges.trim(),
      toolsUsed: toolsUsed.trim()
    })

    nextStep()
  }

  const handleReuseProfile = () => {
    if (!existingProfile) return

    setBusinessProfile({
      profileId: existingProfile.id,
      businessName: existingProfile.business_name,
      businessType: existingProfile.business_type,
      location: existingProfile.location || '',
      yearsExperience: existingProfile.years_experience,
      mainClients: existingProfile.main_clients || '',
      specificities: existingProfile.specificities || '',
      typicalProjectSize: existingProfile.typical_project_size || '',
      mainChallenges: existingProfile.main_challenges || '',
      toolsUsed: existingProfile.tools_used || ''
    })

    nextStep()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Reuse mode: Show existing profile with option to use or edit
  if (mode === 'reuse' && existingProfile) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Profil entreprise détecté
          </h2>
          <p className="text-slate-600">
            Nous avons déjà vos informations d'entreprise
          </p>
        </div>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-600">Entreprise</p>
                <p className="text-lg font-bold text-slate-900">{existingProfile.business_name}</p>
              </div>
              {existingProfile.business_type && (
                <div>
                  <p className="text-sm font-semibold text-slate-600">Type</p>
                  <p className="text-slate-900">
                    {BUSINESS_TYPE_OPTIONS.find(opt => opt.value === existingProfile.business_type)?.label}
                  </p>
                </div>
              )}
              {existingProfile.location && (
                <div>
                  <p className="text-sm font-semibold text-slate-600">Localisation</p>
                  <p className="text-slate-900">{existingProfile.location}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode('edit')}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            onClick={handleReuseProfile}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Utiliser ce profil
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
          className="w-full"
        >
          Retour
        </Button>
      </div>
    )
  }

  // Edit/Create mode: Show full form
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {mode === 'edit' ? 'Modifier votre profil entreprise' : 'Parlez-nous de votre entreprise'}
        </h2>
        <p className="text-slate-600">
          Ces informations seront partagées entre tous vos agents pour des conseils personnalisés
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-base font-semibold">
            Nom de votre entreprise *
          </Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Ex: Alex Marketing"
            required
          />
        </div>

        {/* Business Type & Location */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-base font-semibold">
              Type d'entreprise
            </Label>
            <select
              id="businessType"
              value={businessType || ''}
              onChange={(e) => setBusinessType(e.target.value as 'freelance' | 'tpe' | 'pme')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner...</option>
              {BUSINESS_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-semibold">
              Localisation
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Lyon, France"
            />
          </div>
        </div>

        {/* Experience & Project Size */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearsExperience" className="text-base font-semibold">
              Années d'expérience
            </Label>
            <select
              id="yearsExperience"
              value={yearsExperience || ''}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner...</option>
              {EXPERIENCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="typicalProjectSize" className="text-base font-semibold">
              Taille de projets
            </Label>
            <select
              id="typicalProjectSize"
              value={typicalProjectSize}
              onChange={(e) => setTypicalProjectSize(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner...</option>
              {PROJECT_SIZE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Clients */}
        <div className="space-y-2">
          <Label htmlFor="mainClients" className="text-base font-semibold">
            Clients principaux
          </Label>
          <Textarea
            id="mainClients"
            value={mainClients}
            onChange={(e) => setMainClients(e.target.value)}
            placeholder="Ex: PME locales, startups tech, e-commerce..."
            rows={3}
          />
        </div>

        {/* Main Challenges */}
        <div className="space-y-2">
          <Label htmlFor="mainChallenges" className="text-base font-semibold">
            Défis principaux
          </Label>
          <Textarea
            id="mainChallenges"
            value={mainChallenges}
            onChange={(e) => setMainChallenges(e.target.value)}
            placeholder="Ex: Trouver des clients réguliers, gérer mon temps, développer ma visibilité..."
            rows={3}
          />
        </div>

        {/* Specificities */}
        <div className="space-y-2">
          <Label htmlFor="specificities" className="text-base font-semibold">
            Spécificités et expertises
          </Label>
          <Textarea
            id="specificities"
            value={specificities}
            onChange={(e) => setSpecificities(e.target.value)}
            placeholder="Ex: Spécialisé en SEO local, expert Shopify, focus secteur santé..."
            rows={2}
          />
        </div>

        {/* Tools Used */}
        <div className="space-y-2">
          <Label htmlFor="toolsUsed" className="text-base font-semibold">
            Outils utilisés
          </Label>
          <Input
            id="toolsUsed"
            value={toolsUsed}
            onChange={(e) => setToolsUsed(e.target.value)}
            placeholder="Ex: Notion, Trello, Google Workspace, Canva..."
          />
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Pourquoi ces informations ?</strong> Elles permettent à tous vos agents
              (compagnon et tâches) de vous donner des conseils ultra-personnalisés adaptés à votre
              contexte réel. Vous pourrez modifier ce profil à tout moment.
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
            disabled={!businessName.trim()}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
