/**
 * Chat Page Client Component
 * Client-side chat interface with state management
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatLayout } from '@/components/layouts/chat-layout'
import { ChatSidebar } from '@/components/chat/sidebar'
import { ChatArea } from '@/components/chat/chat-area'
import { useChatStore, type ChatConversation } from '@/lib/store/chat-store'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

interface ChatPageClientProps {
  userId: string
}

export function ChatPageClient({ userId }: ChatPageClientProps) {
  const searchParams = useSearchParams()
  const agentIdFromUrl = searchParams.get('agent')

  const {
    setAgents,
    selectAgent,
    selectConversation,
    createConversation,
    setConversations,
    setMessages,
    setLoading,
    setError,
    selectedConversationId,
    selectedAgentId
  } = useChatStore()

  const [isInitialized, setIsInitialized] = useState(false)

  // Load real data from database
  useEffect(() => {
    async function loadData() {
      if (isInitialized) return

      try {
        setLoading(true)
        const supabase = createClient()

        // 1. Load all user's agents
        const { data: agents, error: agentsError } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (agentsError) {
          console.error('Error loading agents:', agentsError)
          setError('Impossible de charger vos agents')
          return
        }

        if (!agents || agents.length === 0) {
          setError('Aucun agent trouvé. Veuillez créer un agent d\'abord.')
          return
        }

        setAgents(agents)

        // 2. Select agent from URL or use first one
        const selectedAgentId = agentIdFromUrl || agents[0].id
        const selectedAgent = agents.find(a => a.id === selectedAgentId)

        if (!selectedAgent) {
          setError('Agent non trouvé')
          return
        }

        selectAgent(selectedAgentId)

        // 3. Load existing conversations for the selected agent
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .eq('agent_id', selectedAgentId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (conversationsError) {
          console.error('Error loading conversations:', conversationsError)
        }

        if (conversations && conversations.length > 0) {
          // Load conversations into the store
          setConversations(selectedAgentId, conversations)

          // Optionally select the most recent conversation
          // selectConversation(conversations[0].id)
        }

        // Don't automatically create a conversation anymore
        // The user will create one when they start chatting

        setIsInitialized(true)
        setError(null)
      } catch (error) {
        console.error('Error initializing chat:', error)
        setError('Erreur lors de l\'initialisation du chat')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId, agentIdFromUrl, isInitialized, setAgents, selectAgent, selectConversation, createConversation, setConversations, setLoading, setError])

  // Load conversations when agent changes
  useEffect(() => {
    async function loadAgentConversations() {
      if (!selectedAgentId || !isInitialized) return

      try {
        const supabase = createClient()

        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .eq('agent_id', selectedAgentId)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })

        if (conversationsError) {
          console.error('Error loading conversations:', conversationsError)
          return
        }

        if (conversations) {
          setConversations(selectedAgentId, conversations)
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
      }
    }

    loadAgentConversations()
  }, [selectedAgentId, isInitialized, setConversations])

  // Load messages when a conversation is selected
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) return

      try {
        const supabase = createClient()

        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversationId)
          .order('created_at', { ascending: true })

        if (messagesError) {
          console.error('Error loading messages:', messagesError)
          // Initialize with empty array if error (conversation might be new)
          setMessages(selectedConversationId, [])
          return
        }

        // Set messages or empty array if none found
        setMessages(selectedConversationId, messages || [])
      } catch (error) {
        console.error('Error loading messages:', error)
        // Initialize with empty array on error
        setMessages(selectedConversationId, [])
      }
    }

    loadMessages()
  }, [selectedConversationId, setMessages])

  return (
    <ChatLayout sidebar={<ChatSidebar />}>
      <ChatArea />
    </ChatLayout>
  )
}
