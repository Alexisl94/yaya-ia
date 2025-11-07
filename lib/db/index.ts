/**
 * Database Helper Functions
 * Centralized exports for all database operations
 * 
 * @example
 * import { createAgent, getUserAgents } from '@/lib/db'
 * 
 * // Create an agent
 * const result = await createAgent({
 *   user_id: 'uuid',
 *   sector_id: 'uuid',
 *   name: 'My Agent',
 *   system_prompt: 'You are...'
 * })
 */

// Agent operations
export {
  createAgent,
  getAgentById,
  getUserAgents,
  updateAgent,
  deleteAgent,
  hardDeleteAgent,
  getAgentCount,
} from './agents'

// Conversation operations
export {
  createConversation,
  getConversationById,
  getUserConversations,
  getAgentConversations,
  updateConversation,
  archiveConversation,
  deleteConversation,
  hardDeleteConversation,
} from './conversations'

// Message operations
export {
  createMessage,
  getConversationMessages,
  getLatestMessages,
  getMessageCount,
  deleteMessage,
  buildConversationContext,
} from './messages'

// Usage tracking
export {
  trackUsage,
  getUserUsageLogs,
  getUserUsageStats,
  getTotalTokensUsed,
  getTotalCost,
  getUsageBreakdown,
  checkUsageQuota,
} from './usage'
