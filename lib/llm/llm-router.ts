/**
 * LLM Router
 * Routes requests to the appropriate LLM provider based on model type
 */

import * as anthropicClient from './anthropic-client'
import * as openaiClient from './openai-client'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import type { UnifiedMessage } from './openai-client'

/**
 * Model to provider mapping
 * Supports both short names (haiku, sonnet, opus) and full model IDs
 */
const MODEL_PROVIDERS = {
  // Anthropic models - short names
  'haiku': 'anthropic',
  'sonnet': 'anthropic',
  'opus': 'anthropic',
  'claude': 'anthropic',

  // Anthropic models - full IDs (from model-pricing.ts)
  'claude-3-haiku-20240307': 'anthropic',
  'claude-3-sonnet-20240229': 'anthropic',
  'claude-3-opus-20240229': 'anthropic',

  // OpenAI models - short names and full IDs
  'gpt-4o-mini': 'openai',
  'gpt-4o': 'openai',
  'gpt': 'openai',
} as const

/**
 * Model to actual model ID mapping
 * Maps short names to full IDs, full IDs pass through
 */
const MODEL_IDS = {
  // Anthropic - short names to full IDs
  'haiku': 'claude-3-haiku-20240307',
  'sonnet': 'claude-3-sonnet-20240229', // Fixed: match model-pricing.ts
  'opus': 'claude-3-opus-20240229',
  'claude': 'claude-3-haiku-20240307', // Legacy fallback

  // Anthropic - full IDs pass through
  'claude-3-haiku-20240307': 'claude-3-haiku-20240307',
  'claude-3-sonnet-20240229': 'claude-3-sonnet-20240229',
  'claude-3-opus-20240229': 'claude-3-opus-20240229',

  // OpenAI - full IDs pass through
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4o': 'gpt-4o',
  'gpt': 'gpt-4o-mini', // Default to mini for 'gpt'
} as const

type ModelType = keyof typeof MODEL_PROVIDERS

/**
 * Determine which provider to use for a given model
 * Falls back to auto-detection based on model ID prefix
 */
function getProvider(model: string): 'anthropic' | 'openai' {
  // Try exact match first
  const provider = MODEL_PROVIDERS[model as ModelType]
  if (provider) return provider

  // Auto-detect from model ID
  if (model.startsWith('gpt-') || model.startsWith('gpt')) return 'openai'
  if (model.startsWith('claude-')) return 'anthropic'

  // Default fallback
  console.warn(`[LLM] Unknown model "${model}", defaulting to anthropic`)
  return 'anthropic'
}

/**
 * Get the actual model ID for a model type
 */
function getModelId(model: string): string {
  return MODEL_IDS[model as ModelType] || model
}

/**
 * Convert Anthropic MessageParam to UnifiedMessage
 */
function convertToUnifiedMessages(messages: MessageParam[]): UnifiedMessage[] {
  return messages.map(msg => {
    // Handle both simple and multimodal content
    const content = Array.isArray(msg.content)
      ? msg.content
          .filter(c => c.type === 'text')
          .map(c => (c.type === 'text' ? c.text : ''))
          .join('\n')
      : msg.content

    return {
      role: msg.role,
      content,
    }
  })
}

/**
 * Send a message to the appropriate LLM provider
 *
 * @param systemPrompt - The system prompt for the agent
 * @param messages - Array of conversation messages
 * @param options - Optional configuration
 */
export async function sendMessage(
  systemPrompt: string,
  messages: MessageParam[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
) {
  const model = options?.model || 'haiku'
  const provider = getProvider(model)
  const modelId = getModelId(model)

  console.log(`[LLM] Routing to ${provider} with model ${modelId}`)

  if (provider === 'openai') {
    // Convert messages to unified format
    const unifiedMessages = convertToUnifiedMessages(messages)

    return await openaiClient.sendMessage(systemPrompt, unifiedMessages, {
      ...options,
      model: modelId,
    })
  } else {
    // Use Anthropic
    return await anthropicClient.sendMessage(systemPrompt, messages, {
      ...options,
      model: modelId,
    })
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
  messages: MessageParam[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
) {
  const model = options?.model || 'haiku'
  const provider = getProvider(model)
  const modelId = getModelId(model)

  console.log(`[LLM] Streaming from ${provider} with model ${modelId}`)

  if (provider === 'openai') {
    // Convert messages to unified format
    const unifiedMessages = convertToUnifiedMessages(messages)

    yield* openaiClient.streamMessage(systemPrompt, unifiedMessages, {
      ...options,
      model: modelId,
    })
  } else {
    // Use Anthropic
    yield* anthropicClient.streamMessage(systemPrompt, messages, {
      ...options,
      model: modelId,
    })
  }
}
