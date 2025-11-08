/**
 * Generate Conversation Title
 * Utility function to generate a concise title based on conversation content
 */

import { sendMessage } from './anthropic-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function generateConversationTitle(
  messages: Message[]
): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    if (!messages || messages.length === 0) {
      return { success: false, error: 'No messages provided' }
    }

    // Build conversation context using first few messages
    const conversationContext = messages
      .slice(0, 4) // Use only first 2 exchanges (4 messages)
      .map((msg) => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
      .join('\n\n')

    // Generate title using Claude
    const titlePrompt = `Génère un titre court et concis (maximum 50 caractères) pour résumer cette conversation. Le titre doit être en français, sans guillemets, et capturer l'essence de la demande principale de l'utilisateur.

Conversation:
${conversationContext}

Réponds UNIQUEMENT avec le titre, sans aucun texte additionnel, ponctuation finale ou guillemets.`

    const response = await sendMessage(
      'Tu es un assistant qui génère des titres concis pour des conversations.',
      [{ role: 'user', content: titlePrompt }],
      {
        model: 'claude-3-haiku-20240307',
        temperature: 0.7,
        maxTokens: 100,
      }
    )

    if (!response.success || !response.content) {
      return { success: false, error: 'Failed to generate title' }
    }

    // Clean up the title (remove quotes, trim)
    let title = response.content.trim()
    title = title.replace(/^["']|["']$/g, '') // Remove surrounding quotes
    title = title.replace(/[.!?]$/, '') // Remove trailing punctuation

    // Truncate if too long
    if (title.length > 60) {
      title = title.substring(0, 57) + '...'
    }

    return { success: true, title }
  } catch (error) {
    console.error('Error generating conversation title:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
