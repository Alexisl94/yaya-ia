/**
 * Chat API Route
 * Handles chat messages and LLM communication
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendMessage } from '@/lib/llm/anthropic-client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { message, agentId, conversationId } = body

    // Validate required fields
    if (!message || !agentId || !conversationId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, agentId, conversationId' },
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
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Fetch conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20) // Limit to last 20 messages for context

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      // Continue even if we can't fetch history
    }

    // Build conversation history for Claude
    const conversationHistory = (messages || []).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message,
    })

    // Save user message to database
    const { data: savedUserMessage, error: saveUserError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: {},
      })
      .select()
      .single()

    if (saveUserError) {
      console.error('Error saving user message:', saveUserError)
    }

    // Call Claude API
    const startTime = Date.now()
    const response = await sendMessage(
      agent.system_prompt,
      conversationHistory,
      {
        model: agent.model === 'claude' ? 'claude-3-5-sonnet-20241022' : undefined,
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
        conversation_id: conversationId,
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
      .eq('id', conversationId)

    // Log usage for billing/analytics
    await supabase
      .from('usage_logs')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        conversation_id: conversationId,
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
