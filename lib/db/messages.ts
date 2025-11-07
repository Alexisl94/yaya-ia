/**
 * Database helper functions for Message operations
 * Provides Prisma-like API for message management
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Message,
  CreateMessageInput,
  MessageQueryOptions,
  PaginatedResponse,
  DatabaseResult,
} from '@/types/database'

/**
 * Creates a new message in a conversation
 * 
 * @param {CreateMessageInput} input - Message creation data
 * @returns {Promise<DatabaseResult<Message>>} Created message or error
 * 
 * @example
 * const result = await createMessage({
 *   conversation_id: 'conv-uuid',
 *   role: 'user',
 *   content: 'Bonjour, peux-tu m'aider?'
 * });
 */
export async function createMessage(
  input: CreateMessageInput
): Promise<DatabaseResult<Message>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: input.conversation_id,
        role: input.role,
        content: input.content,
        model_used: input.model_used || null,
        tokens_used: input.tokens_used || null,
        latency_ms: input.latency_ms || null,
        metadata: input.metadata || {},
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Retrieves all messages for a conversation with pagination
 * 
 * @param {string} conversationId - Conversation UUID
 * @param {MessageQueryOptions} options - Query options (pagination, filters)
 * @returns {Promise<DatabaseResult<PaginatedResponse<Message>>>} Paginated messages
 * 
 * @example
 * const result = await getConversationMessages('conv-uuid', {
 *   page: 1,
 *   limit: 50,
 *   role: 'user'
 * });
 */
export async function getConversationMessages(
  conversationId: string,
  options: MessageQueryOptions = {}
): Promise<DatabaseResult<PaginatedResponse<Message>>> {
  try {
    const supabase = await createClient()
    const page = options.page || 1
    const limit = options.limit || 50
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)

    // Apply filters
    if (options.role) {
      query = query.eq('role', options.role)
    }

    // Apply pagination - oldest first for conversation flow
    query = query
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return {
      success: true,
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Retrieves the latest N messages from a conversation
 * Useful for conversation context building
 * 
 * @param {string} conversationId - Conversation UUID
 * @param {number} limit - Number of messages to retrieve (default: 10)
 * @returns {Promise<DatabaseResult<Message[]>>} Latest messages
 * 
 * @example
 * const result = await getLatestMessages('conv-uuid', 5);
 * // Returns the 5 most recent messages
 */
export async function getLatestMessages(
  conversationId: string,
  limit: number = 10
): Promise<DatabaseResult<Message[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    // Reverse to get chronological order
    return { success: true, data: (data || []).reverse() }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Gets the total message count for a conversation
 * 
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<DatabaseResult<number>>} Message count
 * 
 * @example
 * const result = await getMessageCount('conv-uuid');
 */
export async function getMessageCount(
  conversationId: string
): Promise<DatabaseResult<number>> {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data: count || 0 }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Deletes a specific message
 * WARNING: This action is irreversible
 * 
 * @param {string} messageId - Message UUID
 * @returns {Promise<DatabaseResult<void>>} Success or error
 * 
 * @example
 * const result = await deleteMessage('message-uuid');
 */
export async function deleteMessage(
  messageId: string
): Promise<DatabaseResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('messages').delete().eq('id', messageId)

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Builds conversation context from messages for LLM
 * Formats messages into the structure expected by LLM APIs
 * 
 * @param {string} conversationId - Conversation UUID
 * @param {number} maxMessages - Maximum messages to include (default: 10)
 * @returns {Promise<DatabaseResult<Array<{role: string, content: string}>>>} Formatted messages
 * 
 * @example
 * const result = await buildConversationContext('conv-uuid', 5);
 * if (result.success) {
 *   // Send result.data to Claude or GPT API
 * }
 */
export async function buildConversationContext(
  conversationId: string,
  maxMessages: number = 10
): Promise<DatabaseResult<Array<{ role: string; content: string }>>> {
  try {
    const messagesResult = await getLatestMessages(conversationId, maxMessages)

    if (!messagesResult.success) {
      return messagesResult as DatabaseResult<Array<{ role: string; content: string }>>
    }

    const formattedMessages = messagesResult.data.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    return { success: true, data: formattedMessages }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}
