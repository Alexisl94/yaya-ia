/**
 * Database helper functions for Usage Tracking
 * Provides Prisma-like API for usage logs and analytics
 */

import { createClient } from '@/lib/supabase/server'
import type {
  UsageLog,
  CreateUsageLogInput,
  UsageLogQueryOptions,
  PaginatedResponse,
  DatabaseResult,
  UserUsageStats,
} from '@/types/database'

/**
 * Tracks a usage event for billing and analytics
 * 
 * @param {CreateUsageLogInput} input - Usage log data
 * @returns {Promise<DatabaseResult<UsageLog>>} Created usage log or error
 * 
 * @example
 * const result = await trackUsage({
 *   user_id: 'user-uuid',
 *   agent_id: 'agent-uuid',
 *   conversation_id: 'conv-uuid',
 *   event_type: 'message',
 *   model_used: 'claude-3-sonnet',
 *   tokens_used: 150,
 *   cost_usd: 0.00045
 * });
 */
export async function trackUsage(
  input: CreateUsageLogInput
): Promise<DatabaseResult<UsageLog>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: input.user_id,
        agent_id: input.agent_id || null,
        conversation_id: input.conversation_id || null,
        event_type: input.event_type,
        model_used: input.model_used || null,
        tokens_used: input.tokens_used || 0,
        cost_usd: input.cost_usd || null,
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
 * Retrieves usage logs for a user with pagination and filters
 * 
 * @param {string} userId - User UUID
 * @param {UsageLogQueryOptions} options - Query options (pagination, filters)
 * @returns {Promise<DatabaseResult<PaginatedResponse<UsageLog>>>} Paginated usage logs
 * 
 * @example
 * const result = await getUserUsageLogs('user-uuid', {
 *   page: 1,
 *   limit: 100,
 *   event_type: 'message',
 *   start_date: '2024-01-01',
 *   end_date: '2024-01-31'
 * });
 */
export async function getUserUsageLogs(
  userId: string,
  options: UsageLogQueryOptions = {}
): Promise<DatabaseResult<PaginatedResponse<UsageLog>>> {
  try {
    const supabase = await createClient()
    const page = options.page || 1
    const limit = options.limit || 100
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('usage_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (options.agent_id) {
      query = query.eq('agent_id', options.agent_id)
    }

    if (options.event_type) {
      query = query.eq('event_type', options.event_type)
    }

    if (options.start_date) {
      query = query.gte('created_at', options.start_date)
    }

    if (options.end_date) {
      query = query.lte('created_at', options.end_date)
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
 * Gets comprehensive usage statistics for a user
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<DatabaseResult<UserUsageStats | null>>} User usage statistics
 * 
 * @example
 * const result = await getUserUsageStats('user-uuid');
 * if (result.success && result.data) {
 *   console.log(`Total tokens: ${result.data.total_tokens_used}`);
 *   console.log(`Total cost: $${result.data.total_cost_usd}`);
 * }
 */
export async function getUserUsageStats(
  userId: string
): Promise<DatabaseResult<UserUsageStats | null>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_usage_stats')
      .select('*')
      .eq('user_id', userId)
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
 * Calculates total tokens used by a user in a date range
 * 
 * @param {string} userId - User UUID
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise<DatabaseResult<number>>} Total tokens used
 * 
 * @example
 * const result = await getTotalTokensUsed(
 *   'user-uuid',
 *   '2024-01-01',
 *   '2024-01-31'
 * );
 */
export async function getTotalTokensUsed(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DatabaseResult<number>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('usage_logs')
      .select('tokens_used')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

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

    const total = (data || []).reduce((sum, log) => sum + (log.tokens_used || 0), 0)
    return { success: true, data: total }
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
 * Calculates total cost for a user in a date range
 * 
 * @param {string} userId - User UUID
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise<DatabaseResult<number>>} Total cost in USD
 * 
 * @example
 * const result = await getTotalCost(
 *   'user-uuid',
 *   '2024-01-01',
 *   '2024-01-31'
 * );
 */
export async function getTotalCost(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DatabaseResult<number>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('usage_logs')
      .select('cost_usd')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

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

    const total = (data || []).reduce((sum, log) => sum + (log.cost_usd || 0), 0)
    return { success: true, data: total }
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
 * Gets usage breakdown by event type for analytics
 * 
 * @param {string} userId - User UUID
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise<DatabaseResult<Array<{event_type: string, count: number, total_tokens: number}>>>}
 * 
 * @example
 * const result = await getUsageBreakdown(
 *   'user-uuid',
 *   '2024-01-01',
 *   '2024-01-31'
 * );
 */
export async function getUsageBreakdown(
  userId: string,
  startDate: string,
  endDate: string
): Promise<
  DatabaseResult<
    Array<{
      event_type: string
      count: number
      total_tokens: number
      total_cost: number
    }>
  >
> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('usage_logs')
      .select('event_type, tokens_used, cost_usd')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

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

    // Group by event type
    const breakdown = (data || []).reduce(
      (acc, log) => {
        const existing = acc.find((item) => item.event_type === log.event_type)
        if (existing) {
          existing.count++
          existing.total_tokens += log.tokens_used || 0
          existing.total_cost += log.cost_usd || 0
        } else {
          acc.push({
            event_type: log.event_type,
            count: 1,
            total_tokens: log.tokens_used || 0,
            total_cost: log.cost_usd || 0,
          })
        }
        return acc
      },
      [] as Array<{
        event_type: string
        count: number
        total_tokens: number
        total_cost: number
      }>
    )

    return { success: true, data: breakdown }
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
 * Checks if a user has exceeded their usage quota
 * 
 * @param {string} userId - User UUID
 * @param {number} monthlyTokenLimit - Monthly token limit for the user's plan
 * @returns {Promise<DatabaseResult<{exceeded: boolean, used: number, limit: number, percentage: number}>>}
 * 
 * @example
 * const result = await checkUsageQuota('user-uuid', 100000);
 * if (result.success && result.data.exceeded) {
 *   console.log('Usage limit exceeded!');
 * }
 */
export async function checkUsageQuota(
  userId: string,
  monthlyTokenLimit: number
): Promise<
  DatabaseResult<{
    exceeded: boolean
    used: number
    limit: number
    percentage: number
  }>
> {
  try {
    // Get first and last day of current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const tokensResult = await getTotalTokensUsed(
      userId,
      firstDay.toISOString(),
      lastDay.toISOString()
    )

    if (!tokensResult.success) {
      return tokensResult as DatabaseResult<{
        exceeded: boolean
        used: number
        limit: number
        percentage: number
      }>
    }

    const used = tokensResult.data
    const percentage = (used / monthlyTokenLimit) * 100
    const exceeded = used > monthlyTokenLimit

    return {
      success: true,
      data: {
        exceeded,
        used,
        limit: monthlyTokenLimit,
        percentage: Math.round(percentage * 100) / 100,
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
