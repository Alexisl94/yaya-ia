# Database Helper Functions

API Prisma-like pour interagir avec la base de données Supabase de yaya.ia.

## Installation

Les helper functions utilisent le client Supabase configuré dans `/lib/supabase/server.ts`.

```typescript
import { createAgent, getUserAgents, createMessage } from '@/lib/db'
```

## Structure

```
/lib/db
├── agents.ts        # Opérations sur les agents IA
├── conversations.ts # Gestion des conversations
├── messages.ts      # Messages et contexte
├── usage.ts         # Tracking et analytics
└── index.ts         # Exports centralisés
```

## Usage Examples

### Agents

```typescript
import { createAgent, getUserAgents, updateAgent } from '@/lib/db'

// Créer un agent
const result = await createAgent({
  user_id: 'user-uuid',
  sector_id: 'marketing-uuid',
  name: 'Assistant Marketing',
  system_prompt: 'Tu es un expert en marketing digital...',
  model: 'claude',
  temperature: 0.7
})

if (result.success) {
  console.log('Agent créé:', result.data.id)
}

// Récupérer les agents d'un utilisateur
const agents = await getUserAgents('user-uuid', {
  page: 1,
  limit: 10,
  is_active: true,
  search: 'marketing'
})

// Mettre à jour un agent
await updateAgent('agent-uuid', {
  name: 'Nouveau nom',
  is_active: false
})
```

### Conversations

```typescript
import { 
  createConversation, 
  getUserConversations,
  archiveConversation 
} from '@/lib/db'

// Créer une conversation
const conv = await createConversation({
  user_id: 'user-uuid',
  agent_id: 'agent-uuid',
  title: 'Planification événement'
})

// Récupérer les conversations
const conversations = await getUserConversations('user-uuid', {
  agent_id: 'agent-uuid',
  status: 'active',
  limit: 20
})

// Archiver une conversation
await archiveConversation('conv-uuid')
```

### Messages

```typescript
import { 
  createMessage, 
  getConversationMessages,
  buildConversationContext 
} from '@/lib/db'

// Créer un message utilisateur
await createMessage({
  conversation_id: 'conv-uuid',
  role: 'user',
  content: 'Bonjour, peux-tu m\'aider?'
})

// Créer une réponse assistant
await createMessage({
  conversation_id: 'conv-uuid',
  role: 'assistant',
  content: 'Bien sûr! Comment puis-je t\'aider?',
  model_used: 'claude-3-sonnet-20240229',
  tokens_used: 150,
  latency_ms: 1200
})

// Récupérer l'historique
const messages = await getConversationMessages('conv-uuid', {
  limit: 50
})

// Construire le contexte pour l'IA
const context = await buildConversationContext('conv-uuid', 10)
// context.data contient les 10 derniers messages formatés pour l'API
```

### Usage Tracking

```typescript
import { 
  trackUsage, 
  getUserUsageStats,
  checkUsageQuota 
} from '@/lib/db'

// Tracker l'utilisation
await trackUsage({
  user_id: 'user-uuid',
  agent_id: 'agent-uuid',
  conversation_id: 'conv-uuid',
  event_type: 'message',
  model_used: 'claude-3-sonnet-20240229',
  tokens_used: 150,
  cost_usd: 0.00045
})

// Obtenir les statistiques
const stats = await getUserUsageStats('user-uuid')
if (stats.success && stats.data) {
  console.log('Tokens utilisés:', stats.data.total_tokens_used)
  console.log('Coût total:', stats.data.total_cost_usd)
}

// Vérifier le quota
const quota = await checkUsageQuota('user-uuid', 100000)
if (quota.success && quota.data.exceeded) {
  console.log('Limite dépassée!', quota.data.percentage, '%')
}
```

## Gestion des Erreurs

Toutes les fonctions retournent un `DatabaseResult<T>`:

```typescript
type DatabaseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: DatabaseError }
```

Exemple de gestion d'erreur:

```typescript
const result = await createAgent(input)

if (result.success) {
  // Utiliser result.data
  console.log('Agent créé:', result.data.id)
} else {
  // Gérer l'erreur
  console.error('Erreur:', result.error.message)
  console.error('Code:', result.error.code)
}
```

## Pagination

Les fonctions de listing retournent des résultats paginés:

```typescript
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
```

## Row Level Security (RLS)

Toutes les opérations respectent les politiques RLS de Supabase. Les utilisateurs ne peuvent accéder qu'à leurs propres données.

## Types TypeScript

Tous les types sont définis dans `/types/database.ts` et sont importés automatiquement.

## Best Practices

1. **Toujours gérer les erreurs** avec `result.success`
2. **Utiliser la pagination** pour les grandes listes
3. **Tracker l'utilisation** après chaque appel LLM
4. **Construire le contexte** avec `buildConversationContext` plutôt que manuellement
5. **Préférer le soft delete** (`deleteAgent`) au hard delete
6. **Vérifier les quotas** avant les opérations coûteuses

## Performance

- Les index sont configurés sur les colonnes fréquemment requêtées
- Utilisez `includeRelations` options avec parcimonie
- La pagination est obligatoire pour les grandes collections
- Les vues matérialisées (`user_usage_stats`) sont mises à jour automatiquement

## Testing

```typescript
// Example de test
import { createAgent, deleteAgent } from '@/lib/db'

const testAgent = await createAgent({
  user_id: testUserId,
  sector_id: testSectorId,
  name: 'Test Agent',
  system_prompt: 'Test'
})

expect(testAgent.success).toBe(true)

// Cleanup
await deleteAgent(testAgent.data.id)
```
