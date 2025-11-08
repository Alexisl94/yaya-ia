/**
 * Chat Store
 * Manages state for the chat interface
 */

import { create } from 'zustand'
import type { AgentWithRelations, Conversation, Message } from '@/types/database'

export interface ChatMessage extends Omit<Message, 'conversation_id'> {
  // Add any UI-specific fields here
  isLoading?: boolean
}

export interface ChatConversation extends Conversation {
  messages?: ChatMessage[]
}

interface ChatStore {
  // Selected items
  selectedAgentId: string | null
  selectedConversationId: string | null

  // Data
  agents: AgentWithRelations[]
  conversations: Record<string, ChatConversation[]> // Keyed by agentId
  messages: Record<string, ChatMessage[]> // Keyed by conversationId

  // UI State
  isLoading: boolean
  isSidebarOpen: boolean
  error: string | null

  // Actions - Agents
  setAgents: (agents: AgentWithRelations[]) => void
  selectAgent: (agentId: string | null) => void
  addAgent: (agent: AgentWithRelations) => void
  updateAgent: (agentId: string, updates: Partial<AgentWithRelations>) => void
  deleteAgent: (agentId: string) => void

  // Actions - Conversations
  setConversations: (agentId: string, conversations: ChatConversation[]) => void
  selectConversation: (conversationId: string | null) => void
  createConversation: (agentId: string, conversation: ChatConversation) => void
  updateConversation: (conversationId: string, updates: Partial<ChatConversation>) => void
  deleteConversation: (conversationId: string) => void

  // Actions - Messages
  setMessages: (conversationId: string, messages: ChatMessage[]) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (conversationId: string, messageId: string) => void

  // UI Actions
  setLoading: (isLoading: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  setError: (error: string | null) => void

  // Utility
  getCurrentAgent: () => AgentWithRelations | undefined
  getCurrentConversation: () => ChatConversation | undefined
  getCurrentMessages: () => ChatMessage[]
  getAgentConversations: (agentId: string) => ChatConversation[]
  reset: () => void
}

const initialState = {
  selectedAgentId: null,
  selectedConversationId: null,
  agents: [],
  conversations: {},
  messages: {},
  isLoading: false,
  isSidebarOpen: true,
  error: null,
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  ...initialState,

  // =============================================
  // AGENT ACTIONS
  // =============================================

  setAgents: (agents) =>
    set({ agents }),

  selectAgent: (agentId) =>
    set({
      selectedAgentId: agentId,
      selectedConversationId: null, // Reset conversation when switching agents
    }),

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  updateAgent: (agentId, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ),
    })),

  deleteAgent: (agentId) =>
    set((state) => {
      const { [agentId]: _, ...restConversations } = state.conversations
      return {
        agents: state.agents.filter((agent) => agent.id !== agentId),
        conversations: restConversations,
        selectedAgentId: state.selectedAgentId === agentId ? null : state.selectedAgentId,
      }
    }),

  // =============================================
  // CONVERSATION ACTIONS
  // =============================================

  setConversations: (agentId, conversations) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [agentId]: conversations,
      },
    })),

  selectConversation: (conversationId) =>
    set({ selectedConversationId: conversationId }),

  createConversation: (agentId, conversation) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [agentId]: [
          conversation,
          ...(state.conversations[agentId] || []),
        ],
      },
      selectedConversationId: conversation.id,
    })),

  updateConversation: (conversationId, updates) =>
    set((state) => {
      const newConversations = { ...state.conversations }
      Object.keys(newConversations).forEach((agentId) => {
        newConversations[agentId] = newConversations[agentId].map((conv) =>
          conv.id === conversationId ? { ...conv, ...updates } : conv
        )
      })
      return { conversations: newConversations }
    }),

  deleteConversation: (conversationId) =>
    set((state) => {
      const newConversations = { ...state.conversations }
      Object.keys(newConversations).forEach((agentId) => {
        newConversations[agentId] = newConversations[agentId].filter(
          (conv) => conv.id !== conversationId
        )
      })

      const { [conversationId]: _, ...restMessages } = state.messages

      return {
        conversations: newConversations,
        messages: restMessages,
        selectedConversationId:
          state.selectedConversationId === conversationId
            ? null
            : state.selectedConversationId,
      }
    }),

  // =============================================
  // MESSAGE ACTIONS
  // =============================================

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          message,
        ],
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  deleteMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (msg) => msg.id !== messageId
        ),
      },
    })),

  // =============================================
  // UI ACTIONS
  // =============================================

  setLoading: (isLoading) =>
    set({ isLoading }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isOpen) =>
    set({ isSidebarOpen: isOpen }),

  setError: (error) =>
    set({ error }),

  // =============================================
  // UTILITY GETTERS
  // =============================================

  getCurrentAgent: () => {
    const state = get()
    return state.agents.find((agent) => agent.id === state.selectedAgentId)
  },

  getCurrentConversation: () => {
    const state = get()
    if (!state.selectedAgentId || !state.selectedConversationId) return undefined

    const conversations = state.conversations[state.selectedAgentId] || []
    return conversations.find((conv) => conv.id === state.selectedConversationId)
  },

  getCurrentMessages: () => {
    const state = get()
    if (!state.selectedConversationId) return []

    return state.messages[state.selectedConversationId] || []
  },

  getAgentConversations: (agentId) => {
    const state = get()
    return state.conversations[agentId] || []
  },

  reset: () =>
    set(initialState),
}))
