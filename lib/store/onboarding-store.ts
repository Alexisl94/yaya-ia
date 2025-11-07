/**
 * Onboarding Store
 * Manages state during the 4-step onboarding flow
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingData {
  // Step 1: Sector selection
  sectorId: string | null
  sectorName: string | null
  sectorSlug: string | null

  // Step 2: Business context
  businessType: 'freelance' | 'tpe' | 'pme' | null
  mainClients: string
  specificities: string

  // Step 3: Communication preferences
  communicationStyle: 'professional' | 'accessible' | 'expert' | null

  // Agent metadata
  agentName: string
}

interface OnboardingStore {
  data: OnboardingData
  currentStep: number

  // Actions
  setSector: (sectorId: string, sectorName: string, sectorSlug: string) => void
  setBusinessContext: (businessType: OnboardingData['businessType'], mainClients: string, specificities: string) => void
  setCommunicationStyle: (style: OnboardingData['communicationStyle']) => void
  setAgentName: (name: string) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const initialData: OnboardingData = {
  sectorId: null,
  sectorName: null,
  sectorSlug: null,
  businessType: null,
  mainClients: '',
  specificities: '',
  communicationStyle: null,
  agentName: '',
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      data: initialData,
      currentStep: 1,

      setSector: (sectorId, sectorName, sectorSlug) =>
        set((state) => ({
          data: {
            ...state.data,
            sectorId,
            sectorName,
            sectorSlug,
            agentName: `Assistant ${sectorName}`, // Default agent name
          },
        })),

      setBusinessContext: (businessType, mainClients, specificities) =>
        set((state) => ({
          data: {
            ...state.data,
            businessType,
            mainClients,
            specificities,
          },
        })),

      setCommunicationStyle: (style) =>
        set((state) => ({
          data: {
            ...state.data,
            communicationStyle: style,
          },
        })),

      setAgentName: (name) =>
        set((state) => ({
          data: {
            ...state.data,
            agentName: name,
          },
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      reset: () =>
        set({
          data: initialData,
          currentStep: 1,
        }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
)
