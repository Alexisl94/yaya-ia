/**
 * Database helper functions for Conversation operations
 * Provides Prisma-like API for conversation management
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Conversation,
  ConversationWithRelations,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationQueryOptions,
  PaginatedResponse,
  DatabaseResult,
} from '@/types/database'

/**
 * Creates a new conversation between a user and an agent
 * 
 * @param {CreateConversationInput} input - Conversation creation data
 * @returns {Promise<DatabaseResult<Conversation>>} Created conversation or error
 * 
 * @example
 * const result = await createConversation({
 *   user_id: 'user-uuid',
 *   agent_id: 'agent-uuid',
 *   title: 'Planning événement'
 * });
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<DatabaseResult<Conversation>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: input.user_id,
        agent_id: input.agent_id,
        title: input.title || null,
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
 * Retrieves a conversation by ID with optional relations
 * 
 * @param {string} conversationId - Conversation UUID
 * @param {Object} options - Query options
 * @param {boolean} options.includeAgent - Include agent information
 * @param {boolean} options.includeMessages - Include all messages
 * @param {boolean} options.includeMessageCount - Include message count
 * @returns {Promise<DatabaseResult<ConversationWithRelations | null>>} Conversation with relations or null
 * 
 * @example
 * const result = await getConversationById('conv-uuid', {
 *   includeAgent: true,
 *   includeMessages: true
 * });
 */
export async function getConversationById(
  conversationId: string,
  options: {
    includeAgent?: boolean
    includeMessages?: boolean
    includeMessageCount?: boolean
  } = {}
): Promise<DatabaseResult<ConversationWithRelations | null>> {
  try {
    const supabase = await createClient()

    let selectQuery = '*'
    
    if (options.includeAgent) {
      selectQuery += ', agent:agents(*, sector:sectors(*))'
    }
    
    if (options.includeMessages) {
      selectQuery += ', messages(*)'
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(selectQuery)
      .eq('id', conversationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: null }
      }
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    // Get message count if requested
    if (options.includeMessageCount && data) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)

      ;(data as ConversationWithRelations).message_count = count || 0
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
 * Retrieves all conversations for a user with pagination and filters
 * 
 * @param {string} userId - User UUID
 * @param {ConversationQueryOptions} options - Query options (pagination, filters)
 * @returns {Promise<DatabaseResult<PaginatedResponse<ConversationWithRelations>>>} Paginated conversations
 * 
 * @example
 * const result = await getUserConversations('user-uuid', {
 *   page: 1,
 *   limit: 20,
 *   agent_id: 'agent-uuid',
 *   status: 'active'
 * });
 */
export async function getUserConversations(
  userId: string,
  options: ConversationQueryOptions = {}
): Promise<DatabaseResult<PaginatedResponse<ConversationWithRelations>>> {
  try {
    const supabase = await createClient()
    const page = options.page || 1
    const limit = options.limit || 20
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('conversations')
      .select('*, agent:agents(*, sector:sectors(*))', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (options.agent_id) {
      query = query.eq('agent_id', options.agent_id)
    }

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`)
    }

    // Apply pagination
    query = query
      .order('updated_at', { ascending: false })
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
 * Retrieves conversations for a specific agent
 * 
 * @param {string} agentId - Agent UUID
 * @param {ConversationQueryOptions} options - Query options
 * @returns {Promise<DatabaseResult<PaginatedResponse<Conversation>>>} Paginated conversations
 * 
 * @example
 * const result = await getAgentConversations('agent-uuid', {
 *   status: 'active',
 *   limit: 10
 * });
 */
export async function getAgentConversations(
  agentId: string,
  options: ConversationQueryOptions = {}
): Promise<DatabaseResult<PaginatedResponse<Conversation>>> {
  try {
    const supabase = await createClient()
    const page = options.page || 1
    const limit = options.limit || 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)

    if (options.status) {
      query = query.eq('status', options.status)
    }

    query = query
      .order('updated_at', { ascending: false })
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
 * Updates a conversation's information
 * 
 * @param {string} conversationId - Conversation UUID
 * @param {UpdateConversationInput} input - Fields to update
 * @returns {Promise<DatabaseResult<Conversation>>} Updated conversation or error
 * 
 * @example
 * const result = await updateConversation('conv-uuid', {
 *   title: 'Nouveau titre',
 *   status: 'archived'
 * });
 */
export async function updateConversation(
  conversationId: string,
  input: UpdateConversationInput
): Promise<DatabaseResult<Conversation>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conversations')
      .update(input)
      .eq('id', conversationId)
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
 * Archives a conversation (sets status to archived)
 * 
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<DatabaseResult<Conversation>>} Archived conversation or error
 * 
 * @example
 * const result = await archiveConversation('conv-uuid');
 */
export async function archiveConversation(
  conversationId: string
): Promise<DatabaseResult<Conversation>> {
  return updateConversation(conversationId, { status: 'archived' })
}

/**
 * Soft deletes a conversation (sets status to deleted)
 * 
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<DatabaseResult<Conversation>>} Deleted conversation or error
 * 
 * @example
 * const result = await deleteConversation('conv-uuid');
 */
export async function deleteConversation(
  conversationId: string
): Promise<DatabaseResult<Conversation>> {
  return updateConversation(conversationId, { status: 'deleted' })
}

/**
 * Hard deletes a conversation from the database
 * WARNING: This action is irreversible and will cascade delete all messages
 * 
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<DatabaseResult<void>>} Success or error
 * 
 * @example
 * const result = await hardDeleteConversation('conv-uuid');
 */
export async function hardDeleteConversation(
  conversationId: string
): Promise<DatabaseResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

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
