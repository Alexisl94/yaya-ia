import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper'

export const metadata = {
  title: 'Configuration | yaya.ia',
  description: 'Configurez votre assistant IA personnalisé',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            yaya.ia
          </h1>
          <p className="text-slate-600">
            Créez votre assistant IA en 4 étapes
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
