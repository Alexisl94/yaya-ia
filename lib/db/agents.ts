/**
 * Database helper functions for Agent operations
 * Provides Prisma-like API for agent management
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Agent,
  AgentWithRelations,
  CreateAgentInput,
  UpdateAgentInput,
  AgentQueryOptions,
  PaginatedResponse,
  DatabaseResult,
} from '@/types/database'

/**
 * Creates a new AI agent for a user
 * 
 * @param {CreateAgentInput} input - Agent creation data
 * @returns {Promise<DatabaseResult<Agent>>} Created agent or error
 * 
 * @example
 * const result = await createAgent({
 *   user_id: 'uuid',
 *   sector_id: 'uuid',
 *   name: 'Mon Assistant Marketing',
 *   system_prompt: 'Tu es un expert en marketing...',
 *   model: 'claude'
 * });
 * 
 * if (result.success) {
 *   console.log('Agent créé:', result.data);
 * }
 */
export async function createAgent(
  input: CreateAgentInput
): Promise<DatabaseResult<Agent>> {
  try {
    const supabase = await createClient()

    // Insert agent with ALL fields including agent_type directly
    // Note: We include agent_type in the initial insert to avoid RPC function issues
    const { data: insertedAgent, error: insertError } = await supabase
      .from('agents')
      .insert({
        user_id: input.user_id,
        sector_id: input.sector_id,
        name: input.name,
        system_prompt: input.system_prompt,
        model: input.model || 'claude',
        agent_type: input.agent_type || 'companion', // Include agent_type directly
        business_profile_id: input.business_profile_id || null, // Include business_profile_id directly
        template_id: input.template_id || null,
        description: input.description || null,
        temperature: input.temperature || 0.7,
        max_tokens: input.max_tokens || 2000,
        settings: input.settings || {},
      })
      .select()
      .single()

    if (insertError) {
      return {
        success: false,
        error: {
          code: insertError.code || 'UNKNOWN_ERROR',
          message: insertError.message,
          details: insertError.details,
        },
      }
    }

    return { success: true, data: insertedAgent as Agent }
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
 * Retrieves an agent by ID with optional relations
 * 
 * @param {string} agentId - Agent UUID
 * @param {Object} options - Query options
 * @param {boolean} options.includeSector - Include sector information
 * @param {boolean} options.includeTemplate - Include template information
 * @returns {Promise<DatabaseResult<AgentWithRelations | null>>} Agent with relations or null
 * 
 * @example
 * const result = await getAgentById('agent-uuid', { 
 *   includeSector: true, 
 *   includeTemplate: true 
 * });
 */
export async function getAgentById(
  agentId: string,
  options: {
    includeSector?: boolean
    includeTemplate?: boolean
  } = {}
): Promise<DatabaseResult<AgentWithRelations | null>> {
  try {
    const supabase = await createClient()

    let query = supabase.from('agents').select('*').eq('id', agentId)

    if (options.includeSector) {
      query = supabase
        .from('agents')
        .select('*, sector:sectors(*)')
        .eq('id', agentId)
    }

    if (options.includeTemplate) {
      query = supabase
        .from('agents')
        .select('*, sector:sectors(*), template:agent_templates(*)')
        .eq('id', agentId)
    }

    const { data, error } = await query.single()

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
 * Retrieves all agents for a specific user with pagination and filters
 * 
 * @param {string} userId - User UUID
 * @param {AgentQueryOptions} options - Query options (pagination, filters)
 * @returns {Promise<DatabaseResult<PaginatedResponse<AgentWithRelations>>>} Paginated agents
 * 
 * @example
 * const result = await getUserAgents('user-uuid', {
 *   page: 1,
 *   limit: 10,
 *   sector_id: 'marketing-uuid',
 *   is_active: true,
 *   search: 'assistant'
 * });
 */
export async function getUserAgents(
  userId: string,
  options: AgentQueryOptions = {}
): Promise<DatabaseResult<PaginatedResponse<AgentWithRelations>>> {
  try {
    const supabase = await createClient()
    const page = options.page || 1
    const limit = options.limit || 10
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('agents')
      .select('*, sector:sectors(*)', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (options.sector_id) {
      query = query.eq('sector_id', options.sector_id)
    }

    if (options.is_active !== undefined) {
      query = query.eq('is_active', options.is_active)
    }

    if (options.search) {
      query = query.or(
        `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
      )
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
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
 * Updates an agent's information
 * 
 * @param {string} agentId - Agent UUID
 * @param {UpdateAgentInput} input - Fields to update
 * @returns {Promise<DatabaseResult<Agent>>} Updated agent or error
 * 
 * @example
 * const result = await updateAgent('agent-uuid', {
 *   name: 'Nouveau nom',
 *   temperature: 0.8,
 *   is_active: false
 * });
 */
export async function updateAgent(
  agentId: string,
  input: UpdateAgentInput
): Promise<DatabaseResult<Agent>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('agents')
      .update(input)
      .eq('id', agentId)
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
 * Soft deletes an agent (sets is_active to false)
 * 
 * @param {string} agentId - Agent UUID
 * @returns {Promise<DatabaseResult<Agent>>} Deactivated agent or error
 * 
 * @example
 * const result = await deleteAgent('agent-uuid');
 */
export async function deleteAgent(
  agentId: string
): Promise<DatabaseResult<Agent>> {
  return updateAgent(agentId, { is_active: false })
}

/**
 * Hard deletes an agent from the database
 * WARNING: This action is irreversible
 * 
 * @param {string} agentId - Agent UUID
 * @returns {Promise<DatabaseResult<void>>} Success or error
 * 
 * @example
 * const result = await hardDeleteAgent('agent-uuid');
 */
export async function hardDeleteAgent(
  agentId: string
): Promise<DatabaseResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('agents').delete().eq('id', agentId)

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
 * Gets the total count of active agents for a user
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<DatabaseResult<number>>} Count of active agents
 * 
 * @example
 * const result = await getAgentCount('user-uuid');
 * if (result.success) {
 *   console.log(`User has ${result.data} active agents`);
 * }
 */
export async function getAgentCount(
  userId: string
): Promise<DatabaseResult<number>> {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

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
