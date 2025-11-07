'use client'

/**
 * Main Onboarding Page
 * Manages the 4-step onboarding flow
 */

import { useOnboardingStore } from '@/lib/store/onboarding-store'
import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper'
import { StepSector } from '@/components/onboarding/step-sector'
import { StepBusinessContext } from '@/components/onboarding/step-business-context'
import { StepCommunicationStyle } from '@/components/onboarding/step-communication-style'
import { StepConfirmation } from '@/components/onboarding/step-confirmation'

export default function OnboardingPage() {
  const { currentStep } = useOnboardingStore()

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <OnboardingStepper currentStep={currentStep} />

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm p-8 min-h-[500px]">
        {currentStep === 1 && <StepSector />}
        {currentStep === 2 && <StepBusinessContext />}
        {currentStep === 3 && <StepCommunicationStyle />}
        {currentStep === 4 && <StepConfirmation />}
      </div>
    </div>
  )
}
