# 💬 Interface de Chat - yaya.ia

Interface de chat complète pour interagir avec les agents IA personnalisés.

## 📁 Structure

```
components/chat/
├── chat-area.tsx      # Zone de chat principale
├── sidebar.tsx        # Barre latérale (agents + historique)
├── message.tsx        # Affichage message individuel
├── message-input.tsx  # Input de saisie message
└── README.md         # Documentation

components/layouts/
└── chat-layout.tsx    # Layout 2 colonnes

lib/store/
└── chat-store.ts      # Gestion d'état Zustand

app/chat/
├── page.tsx           # Page serveur
└── chat-page-client.tsx # Composant client avec mock data
```

## 🎨 Architecture

### Layout Global (chat-layout.tsx)

Structure responsive en 2 colonnes:
- **Header**: Logo + menu utilisateur
- **Sidebar**: Liste agents + historique (collapsible sur mobile)
- **Main**: Zone de chat

### Store Zustand (chat-store.ts)

État global de l'application:

```typescript
interface ChatStore {
  // État
  selectedAgentId: string | null
  selectedConversationId: string | null
  agents: Agent[]
  conversations: Record<agentId, Conversation[]>
  messages: Record<conversationId, Message[]>

  // Actions
  selectAgent(id)
  createConversation(agentId, conversation)
  addMessage(conversationId, message)
  // ... autres actions
}
```

### Composants

#### ChatSidebar
- Liste scrollable des agents
- Section historique des conversations
- Bouton "Nouvel agent"
- Indicateur agent sélectionné

#### ChatArea
- **Mode 1**: Liste des conversations (si aucune sélectionnée)
- **Mode 2**: Chat actif avec messages + input
- Header avec info agent + settings
- Empty states clairs

#### Message
- Affichage différencié user/assistant
- Avatars + contenus
- Timestamps
- Bouton copy pour messages assistant
- Animation loading

#### MessageInput
- Textarea auto-resize
- Compteur caractères
- Shortcut Entrée → envoyer
- État loading
- Shift+Entrée → nouvelle ligne

## 🎯 Flux d'utilisation

```
1. Utilisateur arrive sur /chat
   ↓
2. Page serveur vérifie auth
   ↓
3. ChatPageClient charge mock data
   ↓
4. Store initialisé avec agents + conversations
   ↓
5. User sélectionne agent
   ↓
6. User clique conversation OU crée nouvelle
   ↓
7. User tape message + Entrée
   ↓
8. Message ajouté au store
   ↓
9. Mock response (pour l'instant)
   (TODO: Appel LLM)
```

## 📊 Mock Data

**3 agents de test:**
- Assistant Marketing
- Assistant Événementiel
- Assistant Comptable

**Conversations:**
- Agent 1: 3 conversations
- Agent 2: 1 conversation
- Autres: vides

## 🚀 Utilisation

### Lancer en dev

```bash
npm run dev
# Ouvrir http://localhost:3000/chat
```

### Créer un nouvel agent

```typescript
import { useChatStore } from '@/lib/store/chat-store'

const { addAgent } = useChatStore()

addAgent({
  id: 'new-agent',
  user_id: userId,
  name: 'Mon Agent',
  profession: 'Expert',
  // ...
})
```

### Créer une conversation

```typescript
const { createConversation } = useChatStore()

createConversation(agentId, {
  id: `conv-${Date.now()}`,
  agent_id: agentId,
  user_id: userId,
  title: null,
  status: 'active',
  // ...
})
```

### Envoyer un message

```typescript
const { addMessage } = useChatStore()

addMessage(conversationId, {
  id: `msg-${Date.now()}`,
  role: 'user',
  content: 'Bonjour !',
  created_at: new Date().toISOString(),
})
```

## 🎨 Design System

### Couleurs

- **Primary**: Actions principales, agent sélectionné
- **Muted**: Backgrounds, états inactifs
- **Accent**: Hover states
- **Border**: Séparateurs

### Espacements

- **Gap**: 2, 3, 4 (0.5rem, 0.75rem, 1rem)
- **Padding**: 3, 4, 6 (cards, sections)
- **Margin**: Utilisé pour empty states

### Responsive

- **Mobile** (< 768px): Sidebar collapse + overlay
- **Desktop** (>= 768px): Sidebar fixe

## 🔧 Configuration

### Ajouter un composant UI

```bash
npx shadcn@latest add <component>
```

### Personnaliser le ton

Éditer `chat-area.tsx`:

```typescript
const handleNewConversation = () => {
  // Logique personnalisée
}
```

### Désactiver mock data

Éditer `chat-page-client.tsx`:

```typescript
// Commenter l'initialisation mock
// setAgents(MOCK_AGENTS)
```

## 📝 TODOs

- [ ] Intégration API LLM (Claude/GPT)
- [ ] Fetch agents depuis DB (au lieu de mock)
- [ ] Sauvegarde conversations en DB
- [ ] Streaming responses
- [ ] Markdown rendering pour messages
- [ ] Code highlighting
- [ ] Upload de fichiers
- [ ] Export conversations
- [ ] Search dans historique
- [ ] Keyboard shortcuts
- [ ] Dark mode toggle
- [ ] Notifications
- [ ] Token counter

## 🐛 Problèmes connus

### Import server.ts dans client

**Problème**: `auth.ts` import `server.ts` (next/headers)

**Solution temporaire**: Import commenté, fonctions client OK

**Fix permanent**: Séparer en `auth-client.ts` et `auth-server.ts`

### Build Turbopack

**Problème**: Erreurs occasionnelles avec imports dynamiques

**Solution**: Utiliser `npm run dev` pour développement

## 🧪 Tests

### Test manuel

1. Naviguer vers `/chat`
2. Vérifier 3 agents dans sidebar
3. Cliquer sur "Assistant Marketing"
4. Voir 3 conversations
5. Cliquer sur "Stratégie SEO pour 2024"
6. Taper un message
7. Appuyer sur Entrée
8. Voir mock response après 1s

### Tests à ajouter

```typescript
// tests/chat.test.ts
describe('Chat Interface', () => {
  it('should load agents', () => {})
  it('should select agent', () => {})
  it('should create conversation', () => {})
  it('should send message', () => {})
})
```

## 📚 Références

- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contribution

1. Créer une branche feature
2. Développer + tester
3. Commit avec message clair
4. Push + Pull Request

---

**Créé avec ❤️ pour yaya.ia**
