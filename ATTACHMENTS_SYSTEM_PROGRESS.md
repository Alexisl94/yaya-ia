# 🚀 Système d'Attachments - Progression

## ✅ Ce qui a été fait (50% complété)

### 1. Base de données ✅
- ✅ Migration `conversation_attachments` table créée
- ✅ Documentation Storage bucket (à créer manuellement)
- ✅ Types TypeScript pour `ConversationAttachment`

### 2. Backend ✅
- ✅ Dépendances installées (`pdf-parse`, `sharp`)
- ✅ Fonctions DB CRUD (`lib/db/attachments.ts`)
- ✅ Utilitaires traitement fichiers (`lib/utils/file-processing.ts`)
  - Extraction texte PDF
  - Compression images
  - Création thumbnails
  - Validation fichiers
- ✅ API Upload (`/api/attachments/upload`)
  - Upload multipart form
  - Compression automatique images
  - Extraction texte PDFs
  - Thumbnails automatiques
  - Stockage Supabase Storage

---

## 🔨 Ce qu'il reste à faire (50%)

### 3. Backend APIs (1-2h)
- ⏳ `/api/attachments/[id]` - GET (récupérer attachment + signed URL)
- ⏳ `/api/attachments/[id]` - DELETE (supprimer de storage + DB)
- ⏳ `/api/conversations/[id]/attachments` - GET (lister tous les attachments)

### 4. Frontend Components (3-4h)
- ⏳ `<FileUploader />` - Drag & drop zone avec preview
- ⏳ `<AttachmentPreview />` - Affichage image/PDF avec zoom
- ⏳ `<AttachmentList />` - Liste des attachments dans une conversation
- ⏳ `<MessageAttachment />` - Attachment inline dans un message

### 5. Intégration Chat (2-3h)
- ⏳ Modifier `chat-input.tsx` pour ajouter bouton upload
- ⏳ Modifier `/api/chat` pour supporter vision Claude
- ⏳ Modifier `/api/chat` pour injecter texte PDF dans contexte
- ⏳ Affichage attachments dans les messages

### 6. UX Polish (1-2h)
- ⏳ Loading states pendant upload
- ⏳ Progress bar
- ⏳ Error handling & messages
- ⏳ Preview avant envoi
- ⏳ Bouton delete sur attachments

---

## 📋 Actions immédiates requises

### AVANT DE CONTINUER :

1. **Exécuter la migration SQL** :
   ```
   supabase/migrations/20250111000003_create_conversation_attachments.sql
   ```

2. **Créer le bucket Storage** (voir `supabase/STORAGE_SETUP.md`) :
   - Nom : `conversation-attachments`
   - Public : NON
   - Max size : 10MB
   - Types : images + PDF

3. **Configurer les RLS policies Storage** (dans STORAGE_SETUP.md)

---

## 🎯 Plan pour finaliser (6-8h de dev restantes)

### Phase 1 : Compléter le Backend (1-2h)
```typescript
// Routes à créer :
/api/attachments/[id]/route.ts        // GET, DELETE
/api/conversations/[id]/attachments   // GET liste
```

### Phase 2 : Frontend Core (3-4h)
```typescript
// Composants à créer :
components/chat/file-uploader.tsx
components/chat/attachment-preview.tsx
components/chat/attachment-list.tsx
components/chat/message-attachment.tsx
```

### Phase 3 : Intégration Chat (2-3h)
```typescript
// Modifications :
- Ajouter upload button dans chat-input
- Modifier /api/chat pour vision
- Afficher attachments dans messages
```

### Phase 4 : Tests & Polish (1h)
- Test upload image + vision
- Test upload PDF + extraction
- Loading states
- Error handling

---

## 💡 Code snippets pour continuer

### API GET Attachment
```typescript
// /api/attachments/[id]/route.ts
export async function GET(request, { params }) {
  const attachment = await getAttachmentById(params.id)
  const { data } = await supabase.storage
    .from('conversation-attachments')
    .createSignedUrl(attachment.storage_path, 3600)

  return NextResponse.json({
    ...attachment,
    signed_url: data.signedUrl
  })
}
```

### FileUploader Component
```typescript
// components/chat/file-uploader.tsx
export function FileUploader({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = async (e) => {
    const files = e.dataTransfer.files
    const formData = new FormData()
    formData.append('file', files[0])
    formData.append('conversation_id', conversationId)

    const res = await fetch('/api/attachments/upload', {
      method: 'POST',
      body: formData
    })

    onUpload(await res.json())
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={...}
      className={isDragging ? 'border-primary' : ''}
    >
      Drag & drop ou cliquez pour uploader
    </div>
  )
}
```

### Vision API Integration
```typescript
// /api/chat - Modifier pour vision
if (message.attachments && message.attachments.some(a => a.file_type.startsWith('image/'))) {
  const imageAttachment = message.attachments[0]
  const imageBuffer = await fetchImageFromStorage(imageAttachment.storage_path)

  // Claude Vision API
  content: [
    { type: 'text', text: message.content },
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageAttachment.file_type,
        data: imageBuffer.toString('base64')
      }
    }
  ]
}

if (message.attachments && message.attachments.some(a => a.file_type === 'application/pdf')) {
  const pdfAttachment = message.attachments[0]
  // Injecter le texte extrait dans le contexte
  content: `Document PDF (${pdfAttachment.file_name}):\n${pdfAttachment.extracted_text}\n\nQuestion: ${message.content}`
}
```

---

## 🚀 Pour reprendre

Quand tu veux continuer, dis-moi juste "continue le système d'attachments" et je reprendrai exactement où on s'est arrêté !

**Prochaine étape** : Créer les 3 routes API restantes (GET, DELETE, liste attachments)

---

## 📊 Estimation temps total

- ✅ **Fait** : ~6h (50%)
- ⏳ **Reste** : ~6-8h (50%)
- 🎯 **Total** : ~12-14h pour le système complet

Tu es déjà à mi-chemin ! 🎉
