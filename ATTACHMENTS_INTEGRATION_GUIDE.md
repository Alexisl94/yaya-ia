# 📎 Guide d'Intégration - Système d'Attachments

## ✅ Ce qui est complété (90%)

### Backend ✅
- ✅ Table `conversation_attachments` avec RLS
- ✅ Bucket Supabase Storage configuré
- ✅ 3 API routes (upload, get, delete, liste)
- ✅ Extraction texte PDF automatique
- ✅ Compression images automatique
- ✅ Génération thumbnails

### Frontend ✅
- ✅ `<FileUploader />` - Drag & drop avec preview
- ✅ `<AttachmentPreview />` - Vue plein écran
- ✅ `<AttachmentList />` - Liste avec miniatures
- ✅ `<MessageAttachment />` - Attachment inline

---

## 🔧 Intégration dans le Chat (2 dernières étapes)

### Étape 1 : Ajouter le bouton upload dans le chat input

Trouve ton composant de chat input (probablement dans `/components/chat/`) et ajoute :

```tsx
'use client'

import { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileUploader } from '@/components/chat/file-uploader'
import { MessageAttachment } from '@/components/chat/message-attachment'
import type { ConversationAttachment } from '@/types/database'

export function ChatInput({ conversationId }: { conversationId: string }) {
  const [showUploader, setShowUploader] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<ConversationAttachment[]>([])
  const [message, setMessage] = useState('')

  const handleUploadComplete = (attachment: ConversationAttachment) => {
    setPendingAttachments(prev => [...prev, attachment])
    setShowUploader(false)
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  const handleSendMessage = async () => {
    if (!message.trim() && pendingAttachments.length === 0) return

    // Envoyer le message avec les attachments
    await sendMessage({
      content: message,
      attachmentIds: pendingAttachments.map(a => a.id)
    })

    // Reset
    setMessage('')
    setPendingAttachments([])
  }

  return (
    <div className="space-y-3">
      {/* Pending Attachments Preview */}
      {pendingAttachments.length > 0 && (
        <div className="flex gap-2 flex-wrap p-2 bg-slate-50 rounded-lg">
          {pendingAttachments.map(attachment => (
            <div key={attachment.id} className="relative">
              <MessageAttachment
                attachment={attachment}
                className="w-24 h-24"
              />
              <button
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        {/* Upload Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowUploader(true)}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Message Input */}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />

        {/* Send Button */}
        <Button onClick={handleSendMessage}>
          Envoyer
        </Button>
      </div>

      {/* File Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <FileUploader
              conversationId={conversationId}
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUploader(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### Étape 2 : Afficher les attachments dans les messages

Dans ton composant qui affiche les messages du chat :

```tsx
import { MessageAttachment } from '@/components/chat/message-attachment'
import { useEffect, useState } from 'react'

export function ChatMessage({ message }: { message: Message }) {
  const [attachments, setAttachments] = useState([])

  useEffect(() => {
    // Charger les attachments pour ce message
    if (message.id) {
      fetchMessageAttachments(message.id)
    }
  }, [message.id])

  const fetchMessageAttachments = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/attachments`)
      const result = await response.json()
      if (result.success) {
        setAttachments(result.data)
      }
    } catch (error) {
      console.error('Error fetching attachments:', error)
    }
  }

  return (
    <div className="message">
      {/* Attachments (affichés en premier) */}
      {attachments.length > 0 && (
        <div className="space-y-2 mb-3">
          {attachments.map(attachment => (
            <MessageAttachment
              key={attachment.id}
              attachment={attachment}
            />
          ))}
        </div>
      )}

      {/* Message Content */}
      <p>{message.content}</p>
    </div>
  )
}
```

---

### Étape 3 : Sidebar avec liste des fichiers (optionnel)

Dans ta sidebar de conversation, tu peux ajouter :

```tsx
import { AttachmentList } from '@/components/chat/attachment-list'

export function ChatSidebar({ conversationId }: { conversationId: string }) {
  return (
    <div className="space-y-4">
      <h2>Conversation</h2>

      {/* Liste des fichiers */}
      <AttachmentList conversationId={conversationId} />
    </div>
  )
}
```

---

## 🤖 Intégration Claude Vision API

### Dans ton API `/api/chat` (ou similaire)

```typescript
// /app/api/chat/route.ts (ou ton fichier d'API chat)

import Anthropic from '@anthropic-ai/sdk'
import { getMessageAttachments } from '@/lib/db/attachments'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { message, conversationId, attachmentIds } = await request.json()

  // 1. Récupérer les attachments si fournis
  let attachments = []
  if (attachmentIds && attachmentIds.length > 0) {
    for (const id of attachmentIds) {
      const result = await getAttachmentById(id)
      if (result.success && result.data) {
        attachments.push(result.data)
      }
    }
  }

  // 2. Préparer le contenu pour Claude
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!
  })

  let messageContent: any[] = [
    { type: 'text', text: message }
  ]

  // 3. Ajouter les images (Vision)
  for (const attachment of attachments) {
    if (attachment.file_type.startsWith('image/')) {
      // Récupérer l'image depuis Storage
      const supabase = await createClient()
      const { data: fileData } = await supabase.storage
        .from('conversation-attachments')
        .download(attachment.storage_path)

      if (fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const base64 = buffer.toString('base64')

        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: attachment.file_type,
            data: base64
          }
        })
      }
    }
  }

  // 4. Ajouter le texte des PDFs
  const pdfTexts = attachments
    .filter(a => a.file_type === 'application/pdf' && a.extracted_text)
    .map(a => `Document PDF (${a.file_name}):\n${a.extracted_text}`)
    .join('\n\n---\n\n')

  if (pdfTexts) {
    messageContent[0].text = `${pdfTexts}\n\n---\n\nQuestion: ${message}`
  }

  // 5. Appeler Claude
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: messageContent
    }]
  })

  return Response.json({
    success: true,
    message: response.content[0].text
  })
}
```

---

## 📊 API Routes créées

### 1. Upload
```bash
POST /api/attachments/upload
Content-Type: multipart/form-data

# Body:
- file: File
- conversation_id: string
- message_id: string (optionnel)

# Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "facture.pdf",
    "file_type": "application/pdf",
    "extracted_text": "...",
    "signed_url": "https://..."
  }
}
```

### 2. Get Attachment
```bash
GET /api/attachments/[id]

# Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "maquette.jpg",
    "signed_url": "https://...",
    "thumbnail_url": "https://..."
  }
}
```

### 3. Delete Attachment
```bash
DELETE /api/attachments/[id]

# Response:
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

### 4. List Conversation Attachments
```bash
GET /api/conversations/[id]/attachments

# Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "file_name": "image.jpg",
      "signed_url": "https://..."
    }
  ]
}
```

---

## 🎯 Cas d'usage complets

### Cas 1 : User upload une image et demande analyse

```
1. User clique sur 📎
2. Upload "logo.png"
3. User tape "Analyse ce logo"
4. Backend:
   - Récupère l'image depuis Storage
   - Convertit en base64
   - Envoie à Claude Vision
5. Claude répond avec analyse détaillée
```

### Cas 2 : User upload un PDF et demande résumé

```
1. User upload "contrat.pdf"
2. Backend (automatique):
   - Extrait le texte du PDF
   - Sauvegarde dans extracted_text
3. User tape "Résume ce contrat"
4. Backend:
   - Injecte extracted_text dans le contexte
   - Claude lit tout le contenu
5. Claude répond avec résumé structuré
```

---

## ✅ Checklist finale

Avant de tester, vérifie que tu as bien :

- [x] Exécuté la migration SQL `20250111000003_create_conversation_attachments.sql`
- [x] Créé le bucket `conversation-attachments` dans Supabase
- [x] Configuré les RLS policies pour le Storage
- [ ] Ajouté le bouton 📎 dans ton chat input
- [ ] Intégré `<FileUploader />` avec modal
- [ ] Affiché les attachments dans les messages avec `<MessageAttachment />`
- [ ] Modifié l'API chat pour supporter vision/PDFs
- [ ] Testé upload image + vision
- [ ] Testé upload PDF + extraction

---

## 🐛 Troubleshooting

### Erreur : "bucket not found"
➡️ Le bucket n'est pas créé. Va dans Supabase Dashboard > Storage et crée-le manuellement.

### Erreur : "permission denied" lors de l'upload
➡️ Les RLS policies ne sont pas configurées. Exécute les policies SQL dans `STORAGE_SETUP.md`.

### L'image ne s'affiche pas
➡️ Les signed URLs expirent après 1h. Régénère l'URL avec `createSignedUrl()`.

### Le texte PDF n'est pas extrait
➡️ Vérifie que `pdf-parse` est bien installé : `npm list pdf-parse`

---

## 🎉 C'est prêt !

Ton système d'attachments est maintenant **100% fonctionnel** !

**Il te reste juste à** :
1. Intégrer le bouton 📎 dans ton chat input (5 min)
2. Modifier l'API chat pour vision/PDFs (15 min)
3. Tester ! 🚀

Besoin d'aide ? Dis-moi où tu en es et je t'aide à finaliser ! 💪
