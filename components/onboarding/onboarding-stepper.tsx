'use client'

/**
 * Onboarding Stepper
 * Visual progress indicator for the dynamic onboarding flow
 * Companion: 7 steps | Task: 5 steps
 */

import { Check } from 'lucide-react'
import { useOnboardingStore } from '@/lib/store/onboarding-store'

interface OnboardingStepperProps {
  currentStep: number
}

const companionSteps = [
  { number: 1, title: 'Type' },
  { number: 2, title: 'Secteur' },
  { number: 3, title: 'Identité' },
  { number: 4, title: 'Contexte' },
  { number: 5, title: 'Objectifs' },
  { number: 6, title: 'Style' },
  { number: 7, title: 'Modèle' },
  { number: 8, title: 'Validation' },
]

const taskSteps = [
  { number: 1, title: 'Type' },
  { number: 2, title: 'Secteur' },
  { number: 3, title: 'Mission' },
  { number: 4, title: 'Style' },
  { number: 5, title: 'Modèle' },
  { number: 6, title: 'Validation' },
]

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  const { isCompanionAgent, isTaskAgent } = useOnboardingStore()

  // Determine which steps to show
  const steps = isTaskAgent() ? taskSteps : companionSteps
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300
                  ${
                    currentStep > step.number
                      ? 'bg-primary text-primary-foreground'
                      : currentStep === step.number
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-slate-200 text-slate-500'
                  }
                `}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>

              {/* Step title */}
              <span
                className={`
                  mt-2 text-xs font-medium absolute top-12 whitespace-nowrap
                  ${
                    currentStep >= step.number
                      ? 'text-slate-900'
                      : 'text-slate-400'
                  }
                `}
              >
                {step.title}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 mb-8">
                <div
                  className={`
                    h-full transition-all duration-300
                    ${
                      currentStep > step.number
                        ? 'bg-primary'
                        : 'bg-slate-200'
                    }
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
