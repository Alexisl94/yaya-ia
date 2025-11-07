'use client'

/**
 * Onboarding Stepper
 * Visual progress indicator for the 4-step onboarding flow
 */

import { Check } from 'lucide-react'

interface OnboardingStepperProps {
  currentStep: number
}

const steps = [
  { number: 1, title: 'Secteur' },
  { number: 2, title: 'Contexte' },
  { number: 3, title: 'Préférences' },
  { number: 4, title: 'Confirmation' },
]

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
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
