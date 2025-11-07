import { AuthForm } from '@/components/auth/auth-form'

export const metadata = {
  title: 'Se connecter | yaya.ia',
  description: 'Connectez-vous à votre compte yaya.ia',
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">yaya.ia</h1>
          <p className="text-slate-600">
            Vos agents IA personnalisés pour automatiser vos tâches métier
          </p>
        </div>

        <AuthForm mode="login" />
      </div>
    </div>
  )
}
