/**
 * Chat Page Client Component
 * Client-side chat interface with state management
 */

'use client'

import { useEffect } from 'react'
import { ChatLayout } from '@/components/layouts/chat-layout'
import { ChatSidebar } from '@/components/chat/sidebar'
import { ChatArea } from '@/components/chat/chat-area'
import { useChatStore } from '@/lib/store/chat-store'
import type { Agent } from '@/types/database'

interface ChatPageClientProps {
  userId: string
}

// Mock data for testing UI
const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    user_id: 'user-1',
    sector_id: 'sector-marketing',
    template_id: null,
    name: 'Assistant Marketing',
    description: 'Expert en stratégie marketing digital',
    system_prompt: 'Tu es un expert en marketing digital...',
    model: 'claude',
    temperature: 0.7,
    max_tokens: 2000,
    is_active: true,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'agent-2',
    user_id: 'user-1',
    sector_id: 'sector-events',
    template_id: null,
    name: 'Assistant Événementiel',
    description: 'Spécialiste en organisation d\'événements',
    system_prompt: 'Tu es un expert en organisation d\'événements...',
    model: 'claude',
    temperature: 0.7,
    max_tokens: 2000,
    is_active: true,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'agent-3',
    user_id: 'user-1',
    sector_id: 'sector-accounting',
    template_id: null,
    name: 'Assistant Comptable',
    description: 'Expert en comptabilité et fiscalité',
    system_prompt: 'Tu es un expert-comptable...',
    model: 'claude',
    temperature: 0.7,
    max_tokens: 2000,
    is_active: true,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function ChatPageClient({ userId }: ChatPageClientProps) {
  const { setAgents, agents, setConversations, selectedAgentId } = useChatStore()

  // Initialize with mock data
  useEffect(() => {
    if (agents.length === 0) {
      setAgents(MOCK_AGENTS)

      // Add some mock conversations for the first agent
      const mockConversations = [
        {
          id: 'conv-1',
          user_id: userId,
          agent_id: 'agent-1',
          title: 'Stratégie SEO pour 2024',
          summary: 'Discussion sur les meilleures pratiques SEO',
          status: 'active' as const,
          metadata: {},
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'conv-2',
          user_id: userId,
          agent_id: 'agent-1',
          title: 'Campagne Google Ads',
          summary: 'Optimisation budget publicitaire',
          status: 'active' as const,
          metadata: {},
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'conv-3',
          user_id: userId,
          agent_id: 'agent-1',
          title: 'Stratégie réseaux sociaux',
          summary: 'Plan de contenu pour Instagram et LinkedIn',
          status: 'active' as const,
          metadata: {},
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          updated_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ]

      setConversations('agent-1', mockConversations)

      // Add mock conversations for second agent
      const mockConversations2 = [
        {
          id: 'conv-4',
          user_id: userId,
          agent_id: 'agent-2',
          title: 'Planification mariage juin 2024',
          summary: 'Organisation complète pour 150 invités',
          status: 'active' as const,
          metadata: {},
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]

      setConversations('agent-2', mockConversations2)
    }
  }, [setAgents, setConversations, agents.length, userId])

  return (
    <ChatLayout sidebar={<ChatSidebar />}>
      <ChatArea />
    </ChatLayout>
  )
}
