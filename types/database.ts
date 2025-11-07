/**
 * Database Types for yaya.ia
 * Generated from Supabase schema
 */

// =============================================
// ENUMS
// =============================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type ModelType = 'claude' | 'gpt';
export type MessageRole = 'user' | 'assistant' | 'system';
export type ConversationStatus = 'active' | 'archived' | 'deleted';
export type EventType = 'message' | 'agent_created' | 'conversation_started';
export type SuggestionType = 'template' | 'custom' | 'ai_generated';

// =============================================
// TABLE TYPES
// =============================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentTemplate {
  id: string;
  sector_id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  suggested_tasks: string[];
  default_model: ModelType;
  icon: string | null;
  is_featured: boolean;
  required_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  sector_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  system_prompt: string;
  model: ModelType;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  agent_id: string;
  title: string | null;
  summary: string | null;
  status: ConversationStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  model_used: string | null;
  tokens_used: number | null;
  latency_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  agent_id: string | null;
  conversation_id: string | null;
  event_type: EventType;
  model_used: string | null;
  tokens_used: number;
  cost_usd: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AgentSuggestion {
  id: string;
  user_id: string;
  sector_id: string | null;
  suggestion_type: SuggestionType;
  name: string;
  description: string | null;
  reason: string | null;
  system_prompt: string | null;
  is_dismissed: boolean;
  is_accepted: boolean;
  accepted_at: string | null;
  created_at: string;
}

// =============================================
// VIEW TYPES
// =============================================

export interface UserUsageStats {
  user_id: string;
  email: string;
  subscription_tier: SubscriptionTier;
  total_agents: number;
  total_conversations: number;
  total_messages: number;
  total_tokens_used: number;
  total_cost_usd: number;
  last_conversation_at: string | null;
}

// =============================================
// JOIN TYPES (for queries with relations)
// =============================================

export interface AgentWithRelations extends Agent {
  sector?: Sector;
  template?: AgentTemplate;
  user?: User;
}

export interface ConversationWithRelations extends Conversation {
  agent?: AgentWithRelations;
  user?: User;
  messages?: Message[];
  message_count?: number;
}

export interface MessageWithRelations extends Message {
  conversation?: Conversation;
}

// =============================================
// INPUT TYPES (for creation/update)
// =============================================

export interface CreateUserInput {
  id: string; // From auth.users
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UpdateUserInput {
  full_name?: string;
  avatar_url?: string;
  subscription_tier?: SubscriptionTier;
  subscription_status?: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_ends_at?: string;
}

export interface CreateAgentInput {
  user_id: string;
  sector_id: string;
  template_id?: string;
  name: string;
  description?: string;
  system_prompt: string;
  model?: ModelType;
  temperature?: number;
  max_tokens?: number;
  settings?: Record<string, unknown>;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  system_prompt?: string;
  model?: ModelType;
  temperature?: number;
  max_tokens?: number;
  is_active?: boolean;
  settings?: Record<string, unknown>;
}

export interface CreateConversationInput {
  user_id: string;
  agent_id: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateConversationInput {
  title?: string;
  summary?: string;
  status?: ConversationStatus;
  metadata?: Record<string, unknown>;
}

export interface CreateMessageInput {
  conversation_id: string;
  role: MessageRole;
  content: string;
  model_used?: string;
  tokens_used?: number;
  latency_ms?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateUsageLogInput {
  user_id: string;
  agent_id?: string;
  conversation_id?: string;
  event_type: EventType;
  model_used?: string;
  tokens_used?: number;
  cost_usd?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateAgentSuggestionInput {
  user_id: string;
  sector_id?: string;
  suggestion_type: SuggestionType;
  name: string;
  description?: string;
  reason?: string;
  system_prompt?: string;
}

// =============================================
// QUERY OPTIONS
// =============================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface AgentQueryOptions extends PaginationOptions {
  sector_id?: string;
  is_active?: boolean;
  search?: string;
}

export interface ConversationQueryOptions extends PaginationOptions {
  agent_id?: string;
  status?: ConversationStatus;
  search?: string;
}

export interface MessageQueryOptions extends PaginationOptions {
  role?: MessageRole;
}

export interface UsageLogQueryOptions extends PaginationOptions {
  agent_id?: string;
  event_type?: EventType;
  start_date?: string;
  end_date?: string;
}

// =============================================
// RESPONSE TYPES
// =============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: unknown;
}

export type DatabaseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: DatabaseError };
