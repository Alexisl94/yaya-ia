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
    setLoading,
    setError
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

        // 3. Create a new conversation automatically
        const newConversationId = uuidv4()
        const newConversation: ChatConversation = {
          id: newConversationId,
          user_id: userId,
          agent_id: selectedAgentId,
          title: 'Nouvelle conversation',
          summary: null,
          status: 'active',
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        createConversation(selectedAgentId, newConversation)
        selectConversation(newConversationId)

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
  }, [userId, agentIdFromUrl, isInitialized, setAgents, selectAgent, selectConversation, createConversation, setLoading, setError])

  return (
    <ChatLayout sidebar={<ChatSidebar />}>
      <ChatArea />
    </ChatLayout>
  )
}
