'use client'

/**
 * Step 4: Confirmation & Agent Creation
 * User reviews settings, customizes agent name, and creates the agent
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Sparkles } from 'lucide-react'
import { SECTORS } from '@/lib/seed/sectors'
import { generateUniversalPrompt } from '@/lib/ai/prompt-generator'
import { createAgent } from '@/lib/db/agents'
import { getUser } from '@/lib/supabase/auth'

const BUSINESS_TYPE_LABELS = {
  freelance: 'Freelance / Indépendant',
  tpe: 'TPE (2-10 employés)',
  pme: 'PME (11-50 employés)'
}

const STYLE_LABELS = {
  professional: 'Professionnel',
  accessible: 'Accessible',
  expert: 'Expert'
}

export function StepConfirmation() {
  const { data, setAgentName, prevStep, reset } = useOnboardingStore()
  const router = useRouter()

  const [agentName, setAgentNameLocal] = useState(data.agentName || `Assistant ${data.sectorName}`)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get sector details
  const sector = SECTORS.find(s => s.slug === data.sectorSlug)

  const handleCreateAgent = async () => {
    if (!agentName.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      // Get current user
      const user = await getUser()
      if (!user) {
        throw new Error('Vous devez être connecté pour créer un agent')
      }

      // Update agent name in store
      setAgentName(agentName)

      // Generate system prompt
      const systemPrompt = generateUniversalPrompt({
        onboardingData: data,
        sectorExpertise: sector?.base_expertise || '',
        sectorTasks: sector?.common_tasks || []
      })

      // Create agent in database
      const result = await createAgent({
        user_id: user.id,
        name: agentName,
        sector_id: null, // We'll look up the actual DB ID later; for now we use slug
        system_prompt: systemPrompt,
        config: {
          sectorSlug: data.sectorSlug,
          sectorName: data.sectorName,
          businessType: data.businessType,
          mainClients: data.mainClients,
          specificities: data.specificities,
          communicationStyle: data.communicationStyle
        },
        is_active: true
      })

      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création')
      }

      // Reset onboarding state
      reset()

      // Redirect to chat with the new agent
      router.push(`/chat?agent=${result.data.id}`)
    } catch (err) {
      console.error('Error creating agent:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Votre assistant est prêt !
        </h2>
        <p className="text-slate-600">
          Vérifiez les informations et personnalisez le nom de votre assistant
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Récapitulatif
          </h3>

          {/* Sector */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
            <span className="text-2xl">{sector?.icon}</span>
            <div>
              <p className="font-medium text-slate-900">Secteur</p>
              <p className="text-sm text-slate-600">{data.sectorName}</p>
            </div>
          </div>

          {/* Business Type */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
            <span className="text-2xl">🏢</span>
            <div>
              <p className="font-medium text-slate-900">Type d'activité</p>
              <p className="text-sm text-slate-600">
                {data.businessType && BUSINESS_TYPE_LABELS[data.businessType]}
              </p>
            </div>
          </div>

          {/* Main Clients */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-slate-900">Clients principaux</p>
              <p className="text-sm text-slate-600">{data.mainClients}</p>
            </div>
          </div>

          {/* Specificities */}
          {data.specificities && (
            <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-medium text-slate-900">Spécificités</p>
                <p className="text-sm text-slate-600">{data.specificities}</p>
              </div>
            </div>
          )}

          {/* Communication Style */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-medium text-slate-900">Style de communication</p>
              <p className="text-sm text-slate-600">
                {data.communicationStyle && STYLE_LABELS[data.communicationStyle]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Name Input */}
      <div className="space-y-2">
        <Label htmlFor="agentName" className="text-base font-semibold">
          Nom de votre assistant
        </Label>
        <Input
          id="agentName"
          value={agentName}
          onChange={(e) => setAgentNameLocal(e.target.value)}
          placeholder="Ex: Assistant Événementiel"
          className="text-lg"
        />
        <p className="text-xs text-slate-500">
          Vous pourrez le modifier plus tard dans les paramètres
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isCreating}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={handleCreateAgent}
          disabled={!agentName.trim() || isCreating}
          className="flex-1"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Créer mon assistant
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
