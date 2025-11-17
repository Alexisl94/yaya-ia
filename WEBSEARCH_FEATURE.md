# 🔍 Fonctionnalité Web Search - Documentation Complète

## 📋 Vue d'ensemble

La fonctionnalité **Web Search** permet d'effectuer des recherches web en temps réel et d'injecter les résultats directement dans le contexte de la conversation avec l'agent IA. Cela permet d'obtenir des réponses précises et à jour sur des sujets récents.

### ✨ Avantages

- **Informations récentes** : Accès aux données les plus récentes via Google Search
- **Contexte enrichi** : Les résultats sont automatiquement injectés dans la conversation
- **Compatible tous LLMs** : Fonctionne avec GPT-4, Claude, et tout autre modèle
- **UX intuitive** : Interface simple en un clic

---

## 🏗️ Architecture

### Composants créés

```
components/chat/
  └── web-searcher.tsx        # Modal UI pour la recherche

app/api/
  └── websearch/
      └── route.ts             # API endpoint pour SerpAPI

app/api/chat/
  └── route.ts                 # ✏️ Modifié pour gérer text/websearch
```

### Flux de données

```
User clique sur 🔍
    ↓
Modal WebSearcher s'ouvre
    ↓
User entre une requête : "Nouveautés React 19"
    ↓
API /api/websearch → SerpAPI (Google)
    ↓
Résultats formatés en markdown
    ↓
Stocké comme ConversationAttachment (type: text/websearch)
    ↓
Ajouté à pendingAttachments[]
    ↓
User envoie son message
    ↓
API /api/chat reçoit attachmentIds
    ↓
Contenu web search injecté dans contexte LLM
    ↓
LLM répond avec informations récentes
```

---

## 🚀 Configuration

### 1. Obtenir une clé API SerpAPI

1. Créer un compte sur [SerpAPI](https://serpapi.com/)
2. Plan gratuit : **100 recherches/mois**
3. Copier votre clé API

### 2. Ajouter la clé dans `.env.local`

```bash
# Ajouter cette ligne à votre fichier .env.local
SERPAPI_API_KEY=votre_cle_api_serpapi
```

### 3. Redémarrer le serveur

```bash
npm run dev
```

---

## 💻 Utilisation

### Interface utilisateur

1. **Ouvrir une conversation** avec un agent
2. **Cliquer sur le bouton 🔍** (Search) à côté du champ de message
3. **Entrer votre requête** de recherche
   - Ex: "Nouveautés React 19"
   - Ex: "Tarifs AWS Lambda 2024"
   - Ex: "Dernières actualités IA"
4. **Choisir le nombre de résultats** (3, 5, ou 10)
5. **Cliquer sur "Rechercher"**
6. Les résultats apparaissent comme attachment
7. **Écrire votre question** et envoyer

### Exemple concret

```
👤 User: [Clique sur 🔍]
       → Recherche: "Nouveautés React 19"
       → Nombre de résultats: 5
       → [Clique sur "Rechercher"]

       [Résultats apparaissent comme attachment]

       → Tape: "Quelles sont les principales nouveautés ?"
       → [Envoie]

🤖 Agent: "D'après les résultats de recherche récents :

Les principales nouveautés de React 19 incluent :

1. **Actions** - Nouvelle API pour gérer les mutations...
2. **use() Hook** - Permet de lire des ressources...
3. **Server Components** - Composants rendus côté serveur...

[Sources: react.dev, dev.to, etc.]"
```

---

## 📊 Détails techniques

### Structure de l'attachment créé

```typescript
{
  id: "uuid",
  conversation_id: "conv-123",
  file_type: "text/websearch",  // Type spécial pour web search
  file_name: "websearch-nouveautes-react-19-1731875400000.md",
  extracted_text: `
# Résultats de recherche : Nouveautés React 19

**Recherché le:** 17/11/2024, 16:30:00
**Nombre de résultats:** 5

---

## [1] React 19 Release Candidate

**Source:** react.dev
**URL:** https://react.dev/blog/2024/04/25/react-19

React 19 introduces new features like Actions, the use() hook...

---

## [2] What's New in React 19

**Source:** dev.to
**URL:** https://dev.to/...

The latest version brings improved...

---
  `,
  metadata: {
    websearch: true,
    query: "Nouveautés React 19",
    num_results: 5,
    search_engine: "serpapi",
    searched_at: "2024-11-17T16:30:00.000Z",
    results: [
      {
        title: "React 19 Release Candidate",
        link: "https://react.dev/blog/2024/04/25/react-19",
        snippet: "React 19 introduces new features..."
      },
      // ... autres résultats
    ]
  }
}
```

### API Endpoint

**POST** `/api/websearch`

**Request:**
```json
{
  "query": "Nouveautés React 19",
  "numResults": 5,
  "conversation_id": "uuid",
  "message_id": "uuid" // optionnel
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attachments": [
      {
        "id": "uuid",
        "file_name": "websearch-...",
        "file_type": "text/websearch",
        "extracted_text": "...",
        "signed_url": "https://...",
        "metadata": { ... }
      }
    ],
    "results": [
      {
        "position": 1,
        "title": "React 19 Release Candidate",
        "link": "https://...",
        "snippet": "...",
        "source": "react.dev"
      }
    ],
    "summary": {
      "query": "Nouveautés React 19",
      "total_results": 5,
      "search_engine": "SerpAPI (Google)"
    }
  }
}
```

---

## 🎨 Composant WebSearcher

### Props

```typescript
interface WebSearcherProps {
  conversationId: string    // ID de la conversation
  messageId?: string        // ID du message (optionnel)
  onSearchComplete: (attachments: ConversationAttachment[]) => void
  onClose: () => void
}
```

### Fonctionnalités

- ✅ Input avec auto-focus
- ✅ Validation de la requête
- ✅ Choix du nombre de résultats (3, 5, 10)
- ✅ Progress bar pendant la recherche
- ✅ Preview des premiers résultats
- ✅ Gestion d'erreurs
- ✅ Enter pour lancer la recherche

---

## 💰 Coûts estimés

### SerpAPI

| Plan | Recherches/mois | Prix |
|------|-----------------|------|
| Gratuit | 100 | $0 |
| Hobby | 5,000 | $50 |
| Pro | 15,000 | $100 |

### Calcul par utilisateur

Pour **10 recherches/utilisateur/mois** :
- 100 utilisateurs = 1,000 recherches = Plan Gratuit ✅
- 500 utilisateurs = 5,000 recherches = $50/mois
- 1,500 utilisateurs = 15,000 recherches = $100/mois

**Coût par recherche** : ~$0.01

---

## 🔧 Personnalisation

### Changer le service de recherche

Actuellement SerpAPI, mais facile à changer :

**Option 1 : Brave Search API**
```typescript
// Dans app/api/websearch/route.ts
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search'

const response = await fetch(`${BRAVE_API_URL}?q=${query}`, {
  headers: {
    'X-Subscription-Token': process.env.BRAVE_API_KEY!
  }
})
```

**Option 2 : Serper.dev** (moins cher)
```typescript
const SERPER_API_URL = 'https://google.serper.dev/search'

const response = await fetch(SERPER_API_URL, {
  method: 'POST',
  headers: {
    'X-API-KEY': process.env.SERPER_API_KEY!,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ q: query })
})
```

### Modifier le nombre max de résultats

```typescript
// Dans app/api/websearch/route.ts
const MAX_RESULTS = 10  // Changer cette valeur
```

### Changer la locale

```typescript
// Dans app/api/websearch/route.ts
url.searchParams.append('gl', 'fr') // Pays
url.searchParams.append('hl', 'fr') // Langue
```

---

## 🐛 Troubleshooting

### Erreur : "SERPAPI_API_KEY non configurée"
➡️ Ajoutez `SERPAPI_API_KEY=votre_cle` dans `.env.local` et redémarrez le serveur.

### Erreur : "Clé API SerpAPI invalide"
➡️ Vérifiez que votre clé est correcte sur https://serpapi.com/manage-api-key

### Erreur : "Limite de requêtes SerpAPI atteinte"
➡️ Vous avez atteint votre quota mensuel. Attendez le mois prochain ou upgradez votre plan.

### Aucun résultat trouvé
➡️ Essayez une requête plus simple ou en anglais.

### Les résultats ne sont pas injectés
➡️ Vérifiez que `/api/chat/route.ts` contient bien `|| a.file_type === 'text/websearch'` à la ligne 160.

---

## 📈 Évolutions futures possibles

### Court terme
- [ ] Cache des résultats (éviter recherches dupliquées)
- [ ] Filtrage par date (dernière semaine, mois, année)
- [ ] Support d'autres moteurs (Bing, DuckDuckGo)

### Moyen terme
- [ ] Recherche d'images
- [ ] Recherche de news spécifique
- [ ] Recherche académique (Google Scholar)
- [ ] Traduction automatique des résultats

### Long terme
- [ ] Auto-détection : l'agent décide quand rechercher
- [ ] Recherche incrémentale (raffiner les résultats)
- [ ] Citations avec liens cliquables
- [ ] Analytics : requêtes les plus fréquentes

---

## ✅ Tests

### Test manuel

1. **Test basique**
   ```
   - Ouvrir une conversation
   - Cliquer sur 🔍
   - Rechercher "React 19"
   - Vérifier que 5 résultats apparaissent
   - Envoyer un message
   - Vérifier que l'agent mentionne les résultats
   ```

2. **Test avec différents LLMs**
   ```
   - GPT-4 mini : ✅
   - Claude Sonnet : ✅
   - GPT-4 : ✅
   ```

3. **Test edge cases**
   ```
   - Requête vide → Erreur affichée
   - Requête très longue → Fonctionne
   - Caractères spéciaux → Fonctionne
   - 10 résultats → Fonctionne
   ```

---

## 📝 Code examples

### Utiliser programmatiquement

```typescript
const response = await fetch('/api/websearch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Nouveautés React 19',
    numResults: 5,
    conversation_id: conversationId
  })
})

const { data } = await response.json()
const attachments = data.attachments
```

### Récupérer les métadonnées

```typescript
const attachment = attachments[0]
const searchQuery = attachment.metadata.query
const searchEngine = attachment.metadata.search_engine
const results = attachment.metadata.results

console.log(`Recherché: ${searchQuery}`)
console.log(`Moteur: ${searchEngine}`)
console.log(`${results.length} résultats trouvés`)
```

---

## 🎉 Conclusion

La fonctionnalité **Web Search** est maintenant **100% fonctionnelle** !

### Ce qui a été créé :
- ✅ Composant UI complet (`WebSearcher.tsx`)
- ✅ API route backend (`/api/websearch`)
- ✅ Intégration dans `message-input.tsx`
- ✅ Support dans `/api/chat` pour injection contexte
- ✅ Documentation complète

### Pour commencer :
1. Obtenir une clé SerpAPI (gratuit)
2. Ajouter `SERPAPI_API_KEY` dans `.env.local`
3. Redémarrer le serveur
4. Cliquer sur 🔍 et tester !

**C'est prêt à utiliser ! 🚀**
