import { AuthForm } from '@/components/auth/auth-form'
import { DoggoLogo } from '@/components/ui/doggo-logo'

export const metadata = {
  title: 'Créer un compte | Doggo',
  description: 'Créez votre compte Doggo et profitez de votre assistant IA personnel',
}

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-amber-50/30 to-orange-50/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <DoggoLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Doggo</h1>
          <p className="text-slate-600">
            Créez votre compte et profitez de votre assistant IA
          </p>
        </div>

        <AuthForm mode="signup" />

        <div className="mt-6 text-center text-xs text-slate-500">
          En créant un compte, vous acceptez nos{' '}
          <a href="/terms" className="underline hover:text-slate-700">
            Conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="/privacy" className="underline hover:text-slate-700">
            Politique de confidentialité
          </a>
        </div>
      </div>
    </div>
  )
}
