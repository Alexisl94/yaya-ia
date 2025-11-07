import { AuthForm } from '@/components/auth/auth-form'

export const metadata = {
  title: 'Créer un compte | yaya.ia',
  description: 'Créez votre compte yaya.ia et commencez à utiliser vos agents IA personnalisés',
}

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">yaya.ia</h1>
          <p className="text-slate-600">
            Créez vos agents IA personnalisés en quelques clics
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
