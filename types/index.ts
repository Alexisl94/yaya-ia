// Database Types
export interface Agent {
  id: string
  user_id: string
  name: string
  description: string | null
  profession: string
  system_prompt: string
  model: 'claude' | 'gpt'
  agent_type: 'companion' | 'task' // Type d'agent: Compagnon ou Tâche
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  agent_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

// API Types
export interface CreateAgentRequest {
  name: string
  description?: string
  profession: string
  system_prompt: string
  model?: 'claude' | 'gpt'
}

export interface ChatRequest {
  agent_id: string
  conversation_id?: string
  message: string
}

export interface ChatResponse {
  message: string
  conversation_id: string
}
