/**
 * EXEMPLE : API Chat avec Support d'Attachments (Images + PDFs)
 * À intégrer dans votre route /api/chat existante
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'
import { getAttachmentById } from '@/lib/db/attachments'
import type { MessageContentBlock } from '@anthropic-ai/sdk/resources/messages'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const {
      message,
      conversationId,
      agentId,
      attachmentIds = [] // IDs des attachments à inclure
    } = body

    if (!message || !conversationId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 3. Récupérer l'agent et son system prompt
    const supabase = await createClient()
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('system_prompt, model')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    // 4. Récupérer les attachments si fournis
    const attachments = []
    if (attachmentIds.length > 0) {
      for (const attachmentId of attachmentIds) {
        const result = await getAttachmentById(attachmentId)
        if (result.success && result.data) {
          attachments.push(result.data)
        }
      }
    }

    // 5. Préparer le contenu du message pour Claude
    const messageContent: MessageContentBlock[] = []

    // 5a. Ajouter le texte des PDFs en premier (contexte)
    const pdfAttachments = attachments.filter(a => a.file_type === 'application/pdf')
    if (pdfAttachments.length > 0) {
      const pdfContext = pdfAttachments
        .map(pdf => {
          return `📄 Document PDF: ${pdf.file_name}
${pdf.metadata?.page_count ? `Pages: ${pdf.metadata.page_count}\n` : ''}
---
${pdf.extracted_text || '[Contenu non disponible]'}
---`
        })
        .join('\n\n')

      // Enrichir le message avec le contexte PDF
      messageContent.push({
        type: 'text',
        text: `Contexte - Documents PDF joints:\n\n${pdfContext}\n\n---\n\nQuestion de l'utilisateur: ${message}`
      })
    } else {
      // Pas de PDF, juste le message
      messageContent.push({
        type: 'text',
        text: message
      })
    }

    // 5b. Ajouter les images (Vision API)
    const imageAttachments = attachments.filter(a => a.file_type.startsWith('image/'))
    for (const imageAttachment of imageAttachments) {
      try {
        // Télécharger l'image depuis Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('conversation-attachments')
          .download(imageAttachment.storage_path)

        if (downloadError || !fileData) {
          console.error('Error downloading image:', downloadError)
          continue
        }

        // Convertir en base64
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const base64 = buffer.toString('base64')

        // Ajouter à Claude
        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageAttachment.file_type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64
          }
        })
      } catch (error) {
        console.error('Error processing image:', error)
      }
    }

    // 6. Appeler Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })

    const response = await anthropic.messages.create({
      model: agent.model === 'claude' ? 'claude-3-5-sonnet-20241022' : 'claude-3-opus-20240229',
      max_tokens: 4096,
      system: agent.system_prompt,
      messages: [{
        role: 'user',
        content: messageContent
      }]
    })

    // 7. Extraire la réponse
    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // 8. Sauvegarder les messages en DB (optionnel)
    // TODO: Implémenter la sauvegarde des messages avec createMessage()

    // 9. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        message: assistantMessage,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// EXEMPLE D'UTILISATION DEPUIS LE FRONTEND
// ============================================

/*
// Dans ton composant chat frontend :

const handleSendMessage = async () => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: "Analyse cette image et ce contrat",
      conversationId: "conversation-uuid",
      agentId: "agent-uuid",
      attachmentIds: [
        "attachment-image-uuid",
        "attachment-pdf-uuid"
      ]
    })
  })

  const result = await response.json()

  if (result.success) {
    console.log('Claude response:', result.data.message)
  }
}
*/

// ============================================
// EXEMPLE DE RÉPONSES CLAUDE
// ============================================

/*
// Exemple 1 : Image seule
User: [uploads logo.png] "Analyse ce logo"
Claude: "J'analyse votre logo. Voici mes observations:

1. **Design**: Style moderne et minimaliste
2. **Couleurs**: Palette professionnelle (bleu/blanc)
3. **Typographie**: Police sans-serif élégante
4. **Suggestions**:
   - Augmenter légèrement le contraste
   - Ajouter une version monochrome
   - Optimiser pour les petites tailles"

// Exemple 2 : PDF seul
User: [uploads contrat.pdf] "Résume ce contrat"
Claude: "Voici le résumé du contrat de prestation:

📋 **Informations générales**
- Type: Contrat de prestation de services
- Parties: [Nom client] et [Votre entreprise]
- Durée: 12 mois (renouvelable)

💰 **Aspects financiers**
- Montant: 50 000€ HT
- Paiement: mensuel (4 167€/mois)
- Délai de paiement: 30 jours

⚠️ **Clauses importantes**
- Clause de confidentialité stricte
- Pénalités de retard: 10% du montant mensuel
- Résiliation possible avec préavis de 3 mois"

// Exemple 3 : Image + texte
User: [uploads maquette.jpg] "Comment améliorer cette maquette pour le mobile ?"
Claude: "Voici mes recommandations pour optimiser cette maquette mobile:

📱 **Adaptation mobile**
1. Réduire la taille du header (actuellement trop imposant)
2. Passer les boutons en pleine largeur
3. Augmenter l'espacement entre les sections

🎨 **Lisibilité**
- Augmenter la taille de police à 16px minimum
- Améliorer le contraste du texte secondaire
- Utiliser des icônes plus grandes

👆 **Interactions**
- Boutons trop petits (zone de touch < 44px)
- Espacer davantage les éléments cliquables"
*/
