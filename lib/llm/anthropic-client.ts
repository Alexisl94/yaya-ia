/**
 * Anthropic Claude API Client
 * Handles communication with Claude AI
 */

import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Send a message to Claude and get a response
 *
 * @param systemPrompt - The system prompt for the agent
 * @param messages - Array of conversation messages
 * @param options - Optional configuration
 */
export async function sendMessage(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
) {
  try {
    const response = await anthropic.messages.create({
      model: options?.model || 'claude-3-haiku-20240307',
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 1,
      system: systemPrompt,
      messages,
    })

    return {
      success: true,
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
      model: response.model,
    }
  } catch (error) {
    console.error('Anthropic API Error:', error)
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
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
) {
  try {
    const stream = await anthropic.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 1,
      system: systemPrompt,
      messages,
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield {
            type: 'content',
            text: event.delta.text,
          }
        }
      } else if (event.type === 'message_stop') {
        yield {
          type: 'done',
        }
      }
    }
  } catch (error) {
    console.error('Anthropic Streaming Error:', error)
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
