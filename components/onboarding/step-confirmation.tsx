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
import { getUser } from '@/lib/supabase/auth'
import { AgentNameInput } from '@/components/chat/agent-name-input'

const BUSINESS_TYPE_LABELS = {
  freelance: 'Freelance / Indépendant',
  tpe: 'TPE (2-10 employés)',
  pme: 'PME (11-50 employés)'
}

const EXPERIENCE_LABELS = {
  '0-2': 'Débutant (0-2 ans)',
  '3-5': 'Intermédiaire (3-5 ans)',
  '6-10': 'Expérimenté (6-10 ans)',
  '10+': 'Expert (10+ ans)'
}

const PROJECT_SIZE_LABELS = {
  small: 'Petits projets (< 5K€)',
  medium: 'Projets moyens (5-20K€)',
  large: 'Grands projets (> 20K€)',
  mixed: 'Projets de toutes tailles'
}

const GOAL_LABELS: Record<string, string> = {
  increase_revenue: 'Augmenter mon chiffre d\'affaires',
  save_time: 'Gagner du temps',
  find_clients: 'Trouver plus de clients',
  improve_quality: 'Améliorer la qualité de service',
  better_organization: 'Mieux m\'organiser',
  expand_offer: 'Développer mon offre',
  differentiate: 'Me différencier',
  reduce_stress: 'Réduire le stress'
}

const STYLE_LABELS = {
  professional: 'Professionnel',
  accessible: 'Accessible',
  expert: 'Expert'
}

const AGENT_NAME_REGEX = /^[a-zA-Z0-9_-]*$/
const MIN_LENGTH = 3
const MAX_LENGTH = 25

export function StepConfirmation() {
  const { data, setAgentName, prevStep, reset, isCompanionAgent, isTaskAgent } = useOnboardingStore()
  const router = useRouter()

  const [agentName, setAgentNameLocal] = useState(data.agentName || `Assistant${data.sectorName ? data.sectorName.replace(/\s+/g, '') : ''}`.slice(0, MAX_LENGTH))
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get sector details
  const sector = SECTORS.find(s => s.slug === data.sectorSlug)
  const isCompanion = isCompanionAgent()
  const isTask = isTaskAgent()

  // Validate agent name
  const isValidAgentName = agentName.length >= MIN_LENGTH &&
                           agentName.length <= MAX_LENGTH &&
                           AGENT_NAME_REGEX.test(agentName)

  const handleCreateAgent = async () => {
    if (!isValidAgentName) return

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

      // Create agent via API route
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentName,
          sector_id: null, // We'll look up the actual DB ID later; for now we use slug
          system_prompt: systemPrompt,
          model: data.selectedLLM || 'claude',
          agent_type: data.agentType || 'companion',
          business_profile: {
            profileId: data.profileId,
            businessName: data.businessName,
            businessType: data.businessType,
            location: data.location,
            yearsExperience: data.yearsExperience,
            mainClients: data.mainClients,
            specificities: data.specificities,
            typicalProjectSize: data.typicalProjectSize,
            mainChallenges: data.mainChallenges,
            toolsUsed: data.toolsUsed,
            primaryGoals: data.primaryGoals,
            businessValues: data.businessValues,
            exampleProjects: data.exampleProjects,
          },
          settings: {
            sectorSlug: data.sectorSlug,
            sectorName: data.sectorName,
            agentType: data.agentType,
            taskDescription: data.taskDescription,
            taskSpecificGoal: data.taskSpecificGoal,
            communicationStyle: data.communicationStyle,
            selectedLLM: data.selectedLLM
          }
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création')
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

          {/* Agent Type */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
            <span className="text-2xl">{isCompanion ? '✨' : '🎯'}</span>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Type d'agent</p>
              <p className="text-sm text-slate-600">{isCompanion ? 'Assistant Compagnon' : 'Agent Tâche'}</p>
            </div>
          </div>

          {/* Sector */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
            <span className="text-2xl">{sector?.icon}</span>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Secteur</p>
              <p className="text-sm text-slate-600">{data.sectorName}</p>
            </div>
          </div>

          {/* Task Agent specific info */}
          {isTask && (
            <>
              {/* Task Description */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                <span className="text-2xl">📝</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Tâche principale</p>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{data.taskDescription}</p>
                </div>
              </div>

              {/* Task Goal */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Objectif</p>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{data.taskSpecificGoal}</p>
                </div>
              </div>
            </>
          )}

          {/* Companion Agent specific info */}
          {isCompanion && (
            <>
              {/* Business Identity */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                <span className="text-2xl">🏢</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Entreprise</p>
                  <p className="text-sm text-slate-600">{data.businessName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.businessType && BUSINESS_TYPE_LABELS[data.businessType]} • {data.location}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Expérience</p>
                  <p className="text-sm text-slate-600">
                    {data.yearsExperience && EXPERIENCE_LABELS[data.yearsExperience as keyof typeof EXPERIENCE_LABELS]}
                  </p>
                </div>
              </div>

              {/* Project Size */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                <span className="text-2xl">📦</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Taille de projets</p>
                  <p className="text-sm text-slate-600">
                    {data.typicalProjectSize && PROJECT_SIZE_LABELS[data.typicalProjectSize as keyof typeof PROJECT_SIZE_LABELS]}
                  </p>
                </div>
              </div>

              {/* Main Clients */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                <span className="text-2xl">👥</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Clients principaux</p>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{data.mainClients}</p>
                </div>
              </div>

              {/* Main Challenges */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Défis principaux</p>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{data.mainChallenges}</p>
                </div>
              </div>

              {/* Primary Goals */}
              {data.primaryGoals.length > 0 && (
                <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Objectifs</p>
                    <ul className="text-sm text-slate-600 mt-1 space-y-1">
                      {data.primaryGoals.map((goal, idx) => (
                        <li key={idx}>• {GOAL_LABELS[goal] || goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Business Values */}
              {data.businessValues && (
                <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <span className="text-2xl">💎</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Valeurs</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{data.businessValues}</p>
                  </div>
                </div>
              )}

              {/* Example Projects */}
              {data.exampleProjects && (
                <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <span className="text-2xl">💼</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Exemples de projets</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{data.exampleProjects}</p>
                  </div>
                </div>
              )}

              {/* Specificities */}
              {data.specificities && (
                <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <span className="text-2xl">⭐</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Spécificités</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{data.specificities}</p>
                  </div>
                </div>
              )}

              {/* Tools Used */}
              {data.toolsUsed && (
                <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <span className="text-2xl">🛠️</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Outils utilisés</p>
                    <p className="text-sm text-slate-600">{data.toolsUsed}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Communication Style (both types) */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Style de communication</p>
              <p className="text-sm text-slate-600">
                {data.communicationStyle && STYLE_LABELS[data.communicationStyle]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Name Input */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Personnalisation finale
          </h3>
          <AgentNameInput
            value={agentName}
            onChange={setAgentNameLocal}
            agentType={data.agentType as 'companion' | 'task'}
            sectorName={data.sectorName}
            description={isTask ? data.taskDescription : data.businessName}
          />
          <p className="text-xs text-slate-500 mt-4">
            💡 Vous pourrez le modifier plus tard dans les paramètres de l'agent
          </p>
        </CardContent>
      </Card>

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
          disabled={!isValidAgentName || isCreating}
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
