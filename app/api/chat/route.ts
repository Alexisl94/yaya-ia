/**
 * Chat API Route
 * Handles chat messages and LLM communication
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendMessage } from '@/lib/llm/llm-router'
import { generateConversationTitle } from '@/lib/llm/generate-title'
import { createClient } from '@/lib/supabase/server'
import { getAttachmentById } from '@/lib/db/attachments'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { message, agentId, conversationId, attachmentIds = [] } = body

    console.log('[SEARCH] Chat API received:', {
      message: message ? `"${message.substring(0, 50)}..."` : '(empty)',
      agentId,
      conversationId: conversationId || '(will create new)',
      attachmentIds,
      attachmentCount: attachmentIds.length
    })

    // Validate required fields (message can be empty if attachments are provided)
    // conversationId is now optional - will be created if not provided
    if ((!message && attachmentIds.length === 0) || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields: message (or attachments), agentId' },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = await createClient()

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch agent with system prompt
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single()

    if (agentError || !agent) {
      console.error('Agent not found:', agentError)
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if conversation exists, create if not
    let finalConversationId = conversationId
    let isNewConversation = false

    if (conversationId) {
      // Check if provided conversation exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id) // Security: verify ownership
        .single()

      if (!existingConv) {
        // Conversation ID provided but doesn't exist - create new one
        isNewConversation = true
      }
    } else {
      // No conversation ID provided - create new one
      isNewConversation = true
    }

    if (isNewConversation) {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          title: 'Nouvelle conversation',
          status: 'active'
        })
        .select()
        .single()

      if (convError || !newConv) {
        console.error('Failed to create conversation:', convError)
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        )
      }

      finalConversationId = newConv.id
      console.log('[SUCCESS] Created new conversation:', finalConversationId)
    } else {
      console.log('[SUCCESS] Using existing conversation:', finalConversationId)
    }

    // Fetch conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', finalConversationId)
      .order('created_at', { ascending: true })
      .limit(20) // Limit to last 20 messages for context

    if (messagesError) {
      console.error('[ERROR] Error fetching messages:', messagesError)
      // Continue even if we can't fetch history
    }

    console.log(`[HISTORY] Fetched ${messages?.length || 0} messages from conversation history`)
    if (messages && messages.length > 0) {
      console.log(`[HISTORY] History preview: ${messages.map(m => `${m.role}: "${m.content.substring(0, 30)}..."`).join(' | ')}`)
    }

    // Build conversation history for Claude (simple text messages)
    const conversationHistory: MessageParam[] = (messages || []).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    console.log(`[LLM] Sending ${conversationHistory.length} messages in history to Claude`)

    // Fetch attachments if provided
    const attachments = []
    if (attachmentIds.length > 0) {
      console.log(`[ATTACH] Fetching ${attachmentIds.length} attachments...`)
      for (const attachmentId of attachmentIds) {
        const result = await getAttachmentById(attachmentId)
        if (result.success && result.data) {
          attachments.push(result.data)
          console.log(`[SUCCESS] Fetched attachment: ${result.data.file_name}, extracted_text length: ${result.data.extracted_text?.length || 0}`)
        } else {
          console.error(`[ERROR] Failed to fetch attachment ${attachmentId}:`, result.error)
        }
      }
      console.log(`[ATTACH] Total attachments fetched: ${attachments.length}`)
    }

    // Build multimodal content for current user message
    const userMessageContent: any[] = []

    // Extract and add text documents (PDFs, scraped content, and web search results) as context
    const textDocuments = attachments.filter(a =>
      a.file_type === 'application/pdf' || a.file_type === 'text/plain' || a.file_type === 'text/websearch'
    )
    let documentContext = ''

    if (textDocuments.length > 0) {
      console.log(`[DOC] Processing ${textDocuments.length} text document(s)...`)

      for (const doc of textDocuments) {
        let docText = doc.extracted_text || ''

        // If no extracted text, download and extract/read now
        if (!docText.trim()) {
          try {
            console.log(`📥 Downloading document for extraction: ${doc.file_name}`)
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('conversation-attachments')
              .download(doc.storage_path)

            if (!downloadError && fileData) {
              const buffer = Buffer.from(await fileData.arrayBuffer())

              if (doc.file_type === 'application/pdf') {
                // Extract text from PDF using pdf2json
                const { extractPDFText } = await import('@/lib/utils/file-processing')
                const result = await extractPDFText(buffer)

                if (result) {
                  docText = result.text
                  console.log(`[SUCCESS] PDF extracted: ${docText.length} chars from ${result.pageCount} pages`)
                } else {
                  docText = '[Extraction failed]'
                }
              } else if (doc.file_type === 'text/plain' || doc.file_type === 'text/websearch') {
                // Read text file directly
                docText = buffer.toString('utf-8')
                console.log(`[SUCCESS] Text file read: ${docText.length} chars`)
              }
            }
          } catch (error) {
            console.error('[ERROR] Document extraction error:', error)
            docText = '[Extraction error]'
          }
        } else {
          console.log(`[SUCCESS] Using cached text: ${doc.file_name} (${docText.length} chars)`)
        }

        // Add document icon based on type
        let icon = '[DOC]'
        if (doc.file_type === 'text/websearch') {
          icon = '[SEARCH]'
        } else if (doc.file_type === 'text/plain' && doc.metadata?.scraped) {
          icon = '[WEB]'
        }

        const sourceInfo = doc.metadata?.source_url
          ? `\n**Source:** ${doc.metadata.source_url}\n`
          : doc.metadata?.websearch && doc.metadata?.query
          ? `\n**Recherche:** ${doc.metadata.query}\n**Moteur:** ${doc.metadata.search_engine || 'Web'}\n`
          : ''

        documentContext += `\n\n${icon} **Document: ${doc.file_name}**\n${sourceInfo}\n${docText}\n\n---\n`
      }
    }

    // Build message content
    if (documentContext) {
      // Add document context + user message
      const fullText = `${documentContext}\n\n**Question de l'utilisateur:** ${message || 'Analysez les documents fournis.'}`
      userMessageContent.push({
        type: 'text',
        text: fullText
      })
    } else if (message && message.trim()) {
      // Just user message
      userMessageContent.push({
        type: 'text',
        text: message
      })
    }

    // Add images (Vision API)
    const imageAttachments = attachments.filter(a => a.file_type.startsWith('image/'))
    for (const imageAttachment of imageAttachments) {
      try {
        // Download image from Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('conversation-attachments')
          .download(imageAttachment.storage_path)

        if (downloadError || !fileData) {
          console.error('Error downloading image:', downloadError)
          continue
        }

        // Convert to base64
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const base64 = buffer.toString('base64')

        // Add to Claude content
        userMessageContent.push({
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

    // If no content was added but we have attachments, add a default message
    if (userMessageContent.length === 0 && attachments.length > 0) {
      userMessageContent.push({
        type: 'text',
        text: 'Analysez le(s) fichier(s) fourni(s).'
      })
    }

    // Add current user message to conversation history
    conversationHistory.push({
      role: 'user',
      content: userMessageContent.length > 0 ? userMessageContent : message,
    })

    // Save user message to database
    const { data: savedUserMessage, error: saveUserError } = await supabase
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        role: 'user',
        content: message || '[Fichier(s) envoyé(s)]',
        metadata: {},
      })
      .select()
      .single()

    if (saveUserError) {
      console.error('Error saving user message:', saveUserError)
    }

    // Link attachments to the saved message
    if (savedUserMessage && attachmentIds.length > 0) {
      const { error: updateAttachmentsError } = await supabase
        .from('conversation_attachments')
        .update({ message_id: savedUserMessage.id })
        .in('id', attachmentIds)

      if (updateAttachmentsError) {
        console.error('Error linking attachments to message:', updateAttachmentsError)
      }
    }

    // Call Claude API
    const startTime = Date.now()

    // The LLM router will handle model selection and provider routing
    const response = await sendMessage(
      agent.system_prompt,
      conversationHistory,
      {
        model: agent.model,
        temperature: agent.temperature || 1,
        maxTokens: agent.max_tokens || 4096,
      }
    )

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to get response from AI' },
        { status: 500 }
      )
    }

    const latency = Date.now() - startTime

    // Save assistant message to database
    const totalTokens = response.usage
      ? response.usage.input_tokens + response.usage.output_tokens
      : null

    const { data: savedAssistantMessage, error: saveAssistantError } = await supabase
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        role: 'assistant',
        content: response.content,
        model_used: response.model,
        tokens_used: totalTokens,
        latency_ms: latency,
        metadata: {
          input_tokens: response.usage?.input_tokens || 0,
          output_tokens: response.usage?.output_tokens || 0,
        },
      })
      .select()
      .single()

    if (saveAssistantError) {
      console.error('Error saving assistant message:', saveAssistantError)
    }

    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', finalConversationId)

    // Generate conversation title if this is the first assistant response
    // (i.e., there are exactly 2 messages now: 1 user + 1 assistant)
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', finalConversationId)

    if (messageCount === 2) {
      // Generate title asynchronously (don't wait for it to avoid slowing down response)
      ;(async () => {
        try {
          const { data: allMessages } = await supabase
            .from('messages')
            .select('role, content')
            .eq('conversation_id', finalConversationId)
            .order('created_at', { ascending: true })
            .limit(4)

          if (allMessages && allMessages.length > 0) {
            const titleResult = await generateConversationTitle(
              allMessages as Array<{ role: 'user' | 'assistant'; content: string }>
            )

            if (titleResult.success && titleResult.title) {
              await supabase
                .from('conversations')
                .update({ title: titleResult.title })
                .eq('id', finalConversationId)
            }
          }
        } catch (error) {
          console.error('Failed to generate conversation title:', error)
        }
      })()
    }

    // Log usage for billing/analytics
    await supabase
      .from('usage_logs')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        conversation_id: finalConversationId,
        event_type: 'message',
        model_used: response.model,
        tokens_used: totalTokens || 0,
        metadata: {
          input_tokens: response.usage?.input_tokens || 0,
          output_tokens: response.usage?.output_tokens || 0,
          latency_ms: latency,
        },
      })

    // Return response
    return NextResponse.json({
      success: true,
      conversationId: finalConversationId, // Return the real conversation ID
      message: {
        id: savedAssistantMessage?.id,
        role: 'assistant',
        content: response.content,
        model_used: response.model,
        tokens_used: totalTokens,
        latency_ms: latency,
        created_at: savedAssistantMessage?.created_at || new Date().toISOString(),
      },
      usage: response.usage,
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
