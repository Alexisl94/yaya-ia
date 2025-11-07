# 🤖 Intégration Anthropic Claude - yaya.ia

Documentation complète de l'intégration de l'API Anthropic Claude pour les conversations IA.

## ⚠️ IMPORTANT - SÉCURITÉ

### Votre clé API

Votre clé API Anthropic a été configurée dans `.env.local`. **Cette clé est secrète et ne doit JAMAIS être partagée ou commitée dans Git.**

**🔴 ACTION REQUISE:**
1. Votre clé a été exposée dans ce chat
2. Après cette session, **régénérez votre clé API** sur: https://console.anthropic.com/settings/keys
3. Mettez à jour `.env.local` avec la nouvelle clé
4. Vérifiez que `.env.local` est dans `.gitignore`

### Bonnes pratiques

```bash
# ✅ TOUJOURS dans .gitignore
.env.local
.env*.local

# ❌ JAMAIS commiter
# .env.local avec clés réelles
```

## 📦 Architecture

```
lib/llm/
├── anthropic-client.ts          # Client API Anthropic
├── prompt-generator.ts          # Générateur de prompts
└── README-ANTHROPIC.md          # Cette documentation

app/api/chat/
└── route.ts                     # Route API pour le chat
```

## 🚀 Fonctionnement

### 1. Flow complet

```
User tape message
      ↓
MessageInput (client)
      ↓
POST /api/chat
      ↓
Validation auth + agent
      ↓
Fetch historique (20 derniers messages)
      ↓
Anthropic API (Claude)
      ↓
Sauvegarde message en DB
      ↓
Log usage (billing)
      ↓
Retour au client
```

### 2. Code client (message-input.tsx)

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Bonjour !",
    agentId: "agent-id",
    conversationId: "conv-id"
  })
})

const data = await response.json()
// { success: true, message: {...}, usage: {...} }
```

### 3. API Route (/api/chat/route.ts)

**Sécurité:**
- ✅ Vérifie l'authentification
- ✅ Valide que l'agent appartient à l'utilisateur
- ✅ Limite l'historique à 20 messages (contrôle tokens)

**Fonctionnalités:**
- Fetch agent + system prompt
- Fetch historique conversation
- Appel Claude API
- Sauvegarde messages en DB
- Log usage pour analytics/billing

### 4. Client Anthropic (anthropic-client.ts)

**Fonction principale: `sendMessage()`**

```typescript
const response = await sendMessage(
  systemPrompt: string,
  messages: Array<{role, content}>,
  options?: {
    model?: string,
    maxTokens?: number,
    temperature?: number
  }
)

// Retour:
// {
//   success: true,
//   content: "Réponse de Claude",
//   usage: {
//     input_tokens: 150,
//     output_tokens: 200
//   },
//   model: "claude-3-5-sonnet-20241022"
// }
```

**Fonction streaming: `streamMessage()`**

Pour les réponses en temps réel (à implémenter dans l'UI):

```typescript
for await (const chunk of streamMessage(systemPrompt, messages)) {
  if (chunk.type === 'content') {
    console.log(chunk.text) // Afficher token par token
  } else if (chunk.type === 'done') {
    console.log('Done!')
  }
}
```

## 🎯 Modèles disponibles

### Claude 3.5 Sonnet (par défaut)
- **ID**: `claude-3-5-sonnet-20241022`
- **Contexte**: 200k tokens
- **Vitesse**: Rapide
- **Qualité**: Excellente
- **Coût**: Modéré
- **Usage**: Recommandé pour tous les agents

### Claude 3 Opus (premium)
- **ID**: `claude-3-opus-20240229`
- **Contexte**: 200k tokens
- **Vitesse**: Plus lent
- **Qualité**: Maximale
- **Coût**: Élevé
- **Usage**: Tâches complexes uniquement

### Claude 3 Haiku (économique)
- **ID**: `claude-3-haiku-20240307`
- **Contexte**: 200k tokens
- **Vitesse**: Très rapide
- **Qualité**: Bonne
- **Coût**: Faible
- **Usage**: Tâches simples, prototypes

## 💰 Coûts Anthropic (Nov 2024)

### Claude 3.5 Sonnet
- Input: $3 / million tokens
- Output: $15 / million tokens

### Exemple de calcul
```
Conversation typique:
- System prompt: ~1000 tokens
- Historique (20 msg): ~2000 tokens
- Message user: ~50 tokens
- Réponse Claude: ~300 tokens

Total input: 3050 tokens = $0.009
Total output: 300 tokens = $0.0045
COÛT TOTAL: ~$0.014 par message
```

### Optimisations

**1. Limiter l'historique**
```typescript
// Dans route.ts
.limit(20) // ← Ajuster selon le besoin
```

**2. System prompt concis**
```typescript
// Dans prompt-generator.ts
// Éviter les répétitions
// Aller à l'essentiel
```

**3. Température plus basse**
```typescript
temperature: 0.7 // Au lieu de 1 pour réponses plus courtes
```

## 🔧 Configuration

### Variables d'environnement

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optionnel - limites de sécurité
MAX_TOKENS_PER_REQUEST=4096
MAX_MESSAGES_HISTORY=20
```

### Paramètres par agent

Dans la DB, chaque agent peut avoir:

```typescript
{
  model: 'claude', // ou 'gpt' (fallback)
  temperature: 1,  // 0-2 (créativité)
  max_tokens: 4096 // Limite de réponse
}
```

## 📊 Monitoring

### Usage logs

Chaque message est logué dans `usage_logs`:

```typescript
{
  user_id: "...",
  agent_id: "...",
  conversation_id: "...",
  event_type: "message",
  model_used: "claude-3-5-sonnet-20241022",
  tokens_used: 350,
  metadata: {
    input_tokens: 3050,
    output_tokens: 300,
    latency_ms: 1234
  }
}
```

### Dashboard analytics (à créer)

Requêtes SQL utiles:

```sql
-- Tokens par utilisateur (dernier mois)
SELECT
  user_id,
  SUM(tokens_used) as total_tokens,
  COUNT(*) as messages_count
FROM usage_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Coût estimé par agent
SELECT
  agent_id,
  SUM(
    (metadata->>'input_tokens')::int * 0.000003 +
    (metadata->>'output_tokens')::int * 0.000015
  ) as estimated_cost_usd
FROM usage_logs
WHERE model_used LIKE 'claude-3-5-sonnet%'
GROUP BY agent_id;
```

## 🧪 Tests

### Test l'API directement

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, qui es-tu ?",
    "agentId": "agent-1",
    "conversationId": "conv-1"
  }'
```

### Test avec différents modèles

Modifier temporairement dans `route.ts`:

```typescript
const response = await sendMessage(
  agent.system_prompt,
  conversationHistory,
  {
    model: 'claude-3-opus-20240229', // Tester Opus
    // model: 'claude-3-haiku-20240307', // Tester Haiku
  }
)
```

## 🚀 Prochaines étapes

### 1. Streaming (temps réel)

Créer `/api/chat/stream/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of streamMessage(systemPrompt, messages)) {
        if (chunk.type === 'content') {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          )
        }
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  })
}
```

### 2. Multi-modal (images)

Claude supporte les images:

```typescript
messages: [{
  role: 'user',
  content: [
    { type: 'text', text: 'Que vois-tu sur cette image ?' },
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64Image
      }
    }
  ]
}]
```

### 3. Rate limiting

Ajouter middleware:

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
})

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/chat') {
    const { success } = await ratelimit.limit(userId)
    if (!success) {
      return new Response('Rate limit exceeded', { status: 429 })
    }
  }
}
```

### 4. Prompt caching (économies)

Claude 3.5 Sonnet supporte le prompt caching:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  system: [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' } // ← Cache 5 min
    }
  ],
  // ...
})

// Économies: 90% sur les tokens mis en cache
```

## 🐛 Troubleshooting

### Erreur: "API key not found"

```bash
# Vérifier que la clé est bien dans .env.local
cat .env.local | grep ANTHROPIC

# Redémarrer le serveur
npm run dev
```

### Erreur: "Invalid API key"

1. Vérifier sur https://console.anthropic.com/settings/keys
2. Régénérer si nécessaire
3. Mettre à jour `.env.local`

### Erreur: "Rate limit exceeded"

Anthropic a des limites par défaut:
- Tier 1: 50 requests/min
- Tier 2: 1000 requests/min

Solution: Upgrade sur https://console.anthropic.com/settings/limits

### Réponses lentes

Optimisations:
1. Réduire l'historique (< 20 messages)
2. System prompt plus court
3. Utiliser Haiku pour prototypes
4. Implémenter le streaming

## 📚 Ressources

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Modèles Claude](https://docs.anthropic.com/en/docs/models-overview)
- [Pricing](https://www.anthropic.com/pricing)
- [Prompt Engineering](https://docs.anthropic.com/en/docs/prompt-engineering)
- [Rate Limits](https://docs.anthropic.com/en/api/rate-limits)

---

**Créé avec ❤️ pour yaya.ia**
