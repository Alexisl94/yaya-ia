'use client'

/**
 * Main Onboarding Page
 * Manages the dynamic onboarding flow based on agent type
 * Companion: 7 steps | Task: 7 steps (both now include Business Profile)
 */

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper'
import { StepAgentType } from '@/components/onboarding/step-agent-type'
import { StepSector } from '@/components/onboarding/step-sector'
import { StepBusinessProfile } from '@/components/onboarding/step-business-profile'
import { StepGoalsValues } from '@/components/onboarding/step-goals-values'
import { StepTaskDefinition } from '@/components/onboarding/step-task-definition'
import { StepCommunicationStyle } from '@/components/onboarding/step-communication-style'
import { StepLLMSelection } from '@/components/onboarding/step-llm-selection'
import { StepConfirmation } from '@/components/onboarding/step-confirmation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { currentStep, isCompanionAgent, isTaskAgent, reset } = useOnboardingStore()

  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler la création de l\'agent ? Toutes les données seront perdues.')) {
      reset()
      router.push('/')
    }
  }

  const renderStep = () => {
    // Step 1: Always agent type selection
    if (currentStep === 1) return <StepAgentType />

    // Step 2: Always sector selection
    if (currentStep === 2) return <StepSector />

    // Step 3: Always business profile (UNIVERSAL)
    if (currentStep === 3) return <StepBusinessProfile />

    // Companion workflow (7 steps total)
    if (isCompanionAgent()) {
      if (currentStep === 4) return <StepGoalsValues />
      if (currentStep === 5) return <StepCommunicationStyle />
      if (currentStep === 6) return <StepLLMSelection />
      if (currentStep === 7) return <StepConfirmation />
    }

    // Task workflow (7 steps total)
    if (isTaskAgent()) {
      if (currentStep === 4) return <StepTaskDefinition />
      if (currentStep === 5) return <StepCommunicationStyle />
      if (currentStep === 6) return <StepLLMSelection />
      if (currentStep === 7) return <StepConfirmation />
    }

    // Fallback
    return <StepAgentType />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Cancel Button */}
      <div className="flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-xl font-semibold dark:text-slate-100">Créer un nouvel agent</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Configurez votre assistant IA personnalisé</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-muted-foreground hover:text-foreground h-8 transition-smooth"
        >
          <X className="w-4 h-4 mr-1.5" />
          Annuler
        </Button>
      </div>

      {/* Stepper */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <OnboardingStepper currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-lg border shadow-sm p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
        <div className="animate-slide-in-right">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
