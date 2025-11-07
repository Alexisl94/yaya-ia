'use client'

/**
 * Step 1: Sector Selection
 * User selects their business sector from 9 options
 */

import { SectorCard } from './sector-card'
import { SECTORS } from '@/lib/seed/sectors'
import { useOnboardingStore } from '@/lib/store/onboarding-store'

export function StepSector() {
  const { data, setSector, nextStep } = useOnboardingStore()

  const handleSectorSelect = (sectorId: string, sectorName: string, sectorSlug: string) => {
    setSector(sectorId, sectorName, sectorSlug)
    // Auto advance to next step after selection
    setTimeout(() => nextStep(), 300)
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Quel est votre secteur d'activité ?
        </h2>
        <p className="text-slate-600">
          Sélectionnez le domaine qui correspond le mieux à votre activité professionnelle
        </p>
      </div>

      {/* Sector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {SECTORS.map((sector) => (
          <SectorCard
            key={sector.slug}
            name={sector.name}
            description={sector.description}
            icon={sector.icon}
            color={sector.color}
            isSelected={data.sectorSlug === sector.slug}
            onClick={() => handleSectorSelect(
              sector.slug, // Use slug as ID - we'll look up the actual ID when creating the agent
              sector.name,
              sector.slug
            )}
          />
        ))}
      </div>
    </div>
  )
}
