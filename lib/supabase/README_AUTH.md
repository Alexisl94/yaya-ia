# Authentication avec Supabase

Documentation complète de l'authentification dans yaya.ia.

## Configuration

### 1. Variables d'environnement

Dans `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Configuration Supabase Dashboard

Aller dans **Authentication > URL Configuration** et ajouter:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000/chat
```

Pour la production:
```
https://yourdomain.com/auth/callback
https://yourdomain.com/chat
```

### 3. OAuth Providers (Optionnel)

Pour activer Google/GitHub OAuth, aller dans **Authentication > Providers**:

#### Google OAuth
1. Créer un projet dans Google Cloud Console
2. Configurer OAuth consent screen
3. Créer des credentials OAuth 2.0
4. Copier Client ID et Client Secret dans Supabase

#### GitHub OAuth
1. Aller dans GitHub Settings > Developer settings > OAuth Apps
2. Créer une nouvelle OAuth App
3. Copier Client ID et Client Secret dans Supabase

## Structure des fichiers

```
/lib/supabase
├── auth.ts           # Helpers auth (signIn, signUp, signOut, etc.)
├── client.ts         # Client Supabase browser
├── server.ts         # Client Supabase server
└── middleware.ts     # Middleware auth et redirections

/components/auth
└── auth-form.tsx     # Composant form réutilisable

/app/(auth)
├── layout.tsx        # Layout pour pages auth
├── login/page.tsx    # Page de connexion
└── signup/page.tsx   # Page d'inscription

/app/auth
└── callback/route.ts # Callback OAuth et email confirmation
```

## Utilisation

### Client-Side (Composants)

```typescript
'use client'

import { signIn, signUp, signOut, getUser } from '@/lib/supabase/auth'

// Sign up
const result = await signUp({
  email: 'user@example.com',
  password: 'securepassword',
  fullName: 'John Doe'
})

if (result.success) {
  router.push('/onboarding')
}

// Sign in
const result = await signIn({
  email: 'user@example.com',
  password: 'securepassword'
})

if (result.success) {
  router.push('/chat')
}

// Sign out
await signOut()
router.push('/login')

// Get current user
const user = await getUser()
if (user) {
  console.log(user.email)
}

// OAuth
await signInWithOAuth('google')
// Redirige automatiquement vers Google
```

### Server-Side (Server Components)

```typescript
import { getUserServer, getSessionServer } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const user = await getUserServer()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.email}</div>
}
```

### API Routes

```typescript
import { getUserServer } from '@/lib/supabase/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getUserServer()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ user })
}
```

## Middleware

Le middleware protège automatiquement toutes les routes sauf:
- `/login`
- `/signup`
- `/landing`
- `/auth/*`
- `/terms`
- `/privacy`

### Comportement

1. **User non connecté** → Redirige vers `/login`
2. **User connecté sur /login ou /signup** → Redirige vers `/chat`
3. **Routes publiques** → Accès libre

## Flow d'authentification

### Sign Up Flow

```mermaid
User → /signup → signUp() → Supabase Auth → Email confirmation
                                                ↓
User clicks email link → /auth/callback → Exchange code → /onboarding
```

### Login Flow

```mermaid
User → /login → signIn() → Supabase Auth → Session created → /chat
```

### OAuth Flow

```mermaid
User → Click OAuth → Redirect to provider → User approves
                                                ↓
Provider → /auth/callback → Exchange code → Session → /chat
```

## Gestion des erreurs

Toutes les fonctions auth retournent un `AuthResult`:

```typescript
interface AuthResult {
  success: boolean
  error?: string
  user?: any
}
```

Exemple de gestion:

```typescript
const result = await signIn({ email, password })

if (!result.success) {
  // Afficher l'erreur
  setError(result.error)
} else {
  // Rediriger
  router.push('/chat')
}
```

## Vérification du statut onboarding

```typescript
import { checkOnboardingStatus } from '@/lib/supabase/auth'

const hasOnboarded = await checkOnboardingStatus(user.id)

if (!hasOnboarded) {
  redirect('/onboarding')
}
```

## Reset password

### Demander un reset

```typescript
'use client'

import { resetPassword } from '@/lib/supabase/auth'

const result = await resetPassword('user@example.com')

if (result.success) {
  alert('Check your email for reset link')
}
```

### Page de reset

Créer `/app/auth/reset-password/page.tsx`:

```typescript
'use client'

import { updatePassword } from '@/lib/supabase/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await updatePassword(password)

    if (result.success) {
      router.push('/login')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        minLength={6}
        required
      />
      <button type="submit">Update password</button>
    </form>
  )
}
```

## Session Management

Les sessions sont gérées automatiquement par Supabase:

- **Durée**: 1 heure par défaut
- **Refresh**: Automatique avant expiration
- **Storage**: Cookies httpOnly sécurisés

## Sécurité

### Best Practices

✅ **DO:**
- Utiliser `getUserServer()` dans Server Components
- Valider les sessions côté serveur
- Utiliser HTTPS en production
- Définir des redirect URLs strictes
- Activer Email confirmation (recommandé)

❌ **DON'T:**
- Ne jamais exposer `SERVICE_ROLE_KEY` côté client
- Ne pas stocker de tokens dans localStorage
- Ne pas bypasser le middleware
- Ne pas désactiver RLS dans Supabase

## Troubleshooting

### Erreur: "Invalid login credentials"
- Vérifier email/password
- Vérifier que l'email est confirmé
- Vérifier que le user existe dans Supabase Auth

### Erreur: "User not found"
- Le profil user n'a pas été créé
- Vérifier le trigger `handle_new_user()` dans Supabase

### Redirect loop infini
- Vérifier les redirect URLs dans Supabase
- Vérifier le middleware config
- Clear cookies et retry

### OAuth ne fonctionne pas
- Vérifier les credentials dans Supabase Dashboard
- Vérifier les redirect URLs dans le provider
- Vérifier que le provider est activé

## Testing

### Test Manuel

1. Créer un compte: `/signup`
2. Vérifier l'email (ou skip si désactivé)
3. Se connecter: `/login`
4. Vérifier redirection vers `/chat`
5. Se déconnecter
6. Vérifier redirection vers `/login`

### Test OAuth

1. Cliquer sur "Google" ou "GitHub"
2. Approuver dans la popup
3. Vérifier redirection vers `/chat`
4. Vérifier que le profil est créé

## Production

### Checklist déploiement

- [ ] Configurer les variables d'environnement
- [ ] Ajouter les redirect URLs production
- [ ] Activer Email confirmation
- [ ] Configurer OAuth providers (si utilisé)
- [ ] Tester le flow complet
- [ ] Vérifier les logs Supabase

### Monitoring

Aller dans Supabase Dashboard > Auth:
- Voir les users inscrits
- Voir les logs d'authentification
- Voir les erreurs

## Support

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [OAuth Setup](https://supabase.com/docs/guides/auth/social-login)
