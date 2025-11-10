/**
 * Onboarding Store
 * Manages state during the 4-step onboarding flow
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingData {
  // Step 0: Agent Type Selection
  agentType: 'companion' | 'task' | null

  // Step 1: Sector selection
  sectorId: string | null
  sectorName: string | null
  sectorSlug: string | null

  // Step 2: Business Profile (UNIVERSAL - shared across all agents)
  profileId: string | null // ID of existing business profile (if reusing)
  businessName: string
  businessType: 'freelance' | 'tpe' | 'pme' | null
  location: string // Ville, région
  yearsExperience: string | null // '0-2', '3-5', '6-10', '10+'
  mainClients: string
  specificities: string
  typicalProjectSize: string // Petit, Moyen, Grand
  mainChallenges: string // Problématiques principales
  toolsUsed: string // Outils/logiciels utilisés

  // Step 3: Goals & Values (for COMPANION agents only)
  primaryGoals: string[] // Liste des objectifs principaux
  businessValues: string // Valeurs de l'entreprise
  exampleProjects: string // Exemples de projets récents

  // Task Agent specific fields (step 3 for task agents)
  taskDescription: string // Description de la tâche spécifique
  taskSpecificGoal: string // Objectif spécifique de cet agent tâche

  // Communication preferences (for both types)
  communicationStyle: 'professional' | 'accessible' | 'expert' | null

  // LLM Selection (for both types)
  selectedLLM: 'claude' | 'gpt' | null

  // Agent metadata
  agentName: string
}

interface OnboardingStore {
  data: OnboardingData
  currentStep: number

  // Actions
  setAgentType: (type: 'companion' | 'task') => void
  setSector: (sectorId: string, sectorName: string, sectorSlug: string) => void
  setBusinessProfile: (profile: {
    profileId: string | null
    businessName: string
    businessType: OnboardingData['businessType']
    location: string
    yearsExperience: string | null
    mainClients: string
    specificities: string
    typicalProjectSize: string
    mainChallenges: string
    toolsUsed: string
  }) => void
  setBusinessIdentity: (businessName: string, businessType: OnboardingData['businessType'], location: string, yearsExperience: string | null) => void
  setDetailedContext: (mainClients: string, specificities: string, typicalProjectSize: string, mainChallenges: string, toolsUsed: string) => void
  setGoalsAndValues: (primaryGoals: string[], businessValues: string, exampleProjects: string) => void
  setTaskDefinition: (taskDescription: string, taskSpecificGoal: string) => void
  setCommunicationStyle: (style: OnboardingData['communicationStyle']) => void
  setSelectedLLM: (llm: 'claude' | 'gpt') => void
  setAgentName: (name: string) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void

  // Helpers
  getMaxStep: () => number
  isCompanionAgent: () => boolean
  isTaskAgent: () => boolean

  // Legacy - keep for backward compatibility
  setBusinessContext: (businessType: OnboardingData['businessType'], mainClients: string, specificities: string) => void
}

const initialData: OnboardingData = {
  agentType: null,
  sectorId: null,
  sectorName: null,
  sectorSlug: null,
  profileId: null,
  businessName: '',
  businessType: null,
  location: '',
  yearsExperience: null,
  mainClients: '',
  specificities: '',
  typicalProjectSize: '',
  mainChallenges: '',
  toolsUsed: '',
  primaryGoals: [],
  businessValues: '',
  exampleProjects: '',
  taskDescription: '',
  taskSpecificGoal: '',
  communicationStyle: null,
  selectedLLM: 'claude', // Default to Claude
  agentName: '',
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      data: initialData,
      currentStep: 1,

      setAgentType: (type) =>
        set((state) => ({
          data: {
            ...state.data,
            agentType: type,
          },
        })),

      setSector: (sectorId, sectorName, sectorSlug) =>
        set((state) => ({
          data: {
            ...state.data,
            sectorId,
            sectorName,
            sectorSlug,
            agentName: state.data.agentType === 'task'
              ? `Agent ${sectorName}`
              : `Assistant ${sectorName}`,
          },
        })),

      setBusinessProfile: (profile) =>
        set((state) => ({
          data: {
            ...state.data,
            profileId: profile.profileId,
            businessName: profile.businessName,
            businessType: profile.businessType,
            location: profile.location,
            yearsExperience: profile.yearsExperience,
            mainClients: profile.mainClients,
            specificities: profile.specificities,
            typicalProjectSize: profile.typicalProjectSize,
            mainChallenges: profile.mainChallenges,
            toolsUsed: profile.toolsUsed,
          },
        })),

      setBusinessIdentity: (businessName, businessType, location, yearsExperience) =>
        set((state) => ({
          data: {
            ...state.data,
            businessName,
            businessType,
            location,
            yearsExperience,
          },
        })),

      setDetailedContext: (mainClients, specificities, typicalProjectSize, mainChallenges, toolsUsed) =>
        set((state) => ({
          data: {
            ...state.data,
            mainClients,
            specificities,
            typicalProjectSize,
            mainChallenges,
            toolsUsed,
          },
        })),

      setGoalsAndValues: (primaryGoals, businessValues, exampleProjects) =>
        set((state) => ({
          data: {
            ...state.data,
            primaryGoals,
            businessValues,
            exampleProjects,
          },
        })),

      setTaskDefinition: (taskDescription, taskSpecificGoal) =>
        set((state) => ({
          data: {
            ...state.data,
            taskDescription,
            taskSpecificGoal,
          },
        })),

      setCommunicationStyle: (style) =>
        set((state) => ({
          data: {
            ...state.data,
            communicationStyle: style,
          },
        })),

      setSelectedLLM: (llm) =>
        set((state) => ({
          data: {
            ...state.data,
            selectedLLM: llm,
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
          currentStep: Math.min(state.currentStep + 1, get().getMaxStep()),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      getMaxStep: () => {
        // Both types now have 7 steps (type, sector, business profile, [goals OR task], style, LLM, confirmation)
        // Companion: type, sector, business profile, goals & values, style, LLM, confirmation
        // Task: type, sector, business profile, task definition, style, LLM, confirmation
        return 7
      },

      isCompanionAgent: () => get().data.agentType === 'companion',

      isTaskAgent: () => get().data.agentType === 'task',

      reset: () =>
        set({
          data: initialData,
          currentStep: 1,
        }),

      // Legacy - keep for backward compatibility
      setBusinessContext: (businessType, mainClients, specificities) =>
        set((state) => ({
          data: {
            ...state.data,
            businessType,
            mainClients,
            specificities,
          },
        })),
    }),
    {
      name: 'onboarding-storage',
    }
  )
)
