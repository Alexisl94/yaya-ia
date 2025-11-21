/**
 * OpenAI API Client
 * Handles communication with OpenAI GPT models
 */

import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiInstance
}

/**
 * Message format compatible with both providers
 */
export interface UnifiedMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Send a message to OpenAI and get a response
 *
 * @param systemPrompt - The system prompt for the agent
 * @param messages - Array of conversation messages
 * @param options - Optional configuration
 */
export async function sendMessage(
  systemPrompt: string,
  messages: UnifiedMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
) {
  try {
    // Convert to OpenAI format with system message first
    const openaiMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: options?.model || 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 1,
    })

    const content = response.choices[0]?.message?.content || ''
    const usage = response.usage

    return {
      success: true,
      content,
      usage: {
        input_tokens: usage?.prompt_tokens || 0,
        output_tokens: usage?.completion_tokens || 0,
      },
      model: response.model,
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a message with streaming response
 *
 * @param systemPrompt - The system prompt for the agent
 * @param messages - Array of conversation messages
 * @param options - Optional configuration
 */
export async function* streamMessage(
  systemPrompt: string,
  messages: UnifiedMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
) {
  try {
    // Convert to OpenAI format with system message first
    const openaiMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    const openai = getOpenAIClient()
    const stream = await openai.chat.completions.create({
      model: options?.model || 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 1,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield {
          type: 'content' as const,
          text: content,
        }
      }
    }

    yield {
      type: 'done' as const,
    }
  } catch (error) {
    console.error('OpenAI Streaming Error:', error)
    yield {
      type: 'error' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
