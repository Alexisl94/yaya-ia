/**
 * Generate Conversation Title API Route
 * Generates a concise title based on conversation content
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateConversationTitle } from '@/lib/llm/generate-title'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch conversation messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(4) // Only use first 2 exchanges (4 messages)

    if (messagesError || !messages || messages.length === 0) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Generate title using the utility function
    const titleResult = await generateConversationTitle(
      messages as Array<{ role: 'user' | 'assistant'; content: string }>
    )

    if (!titleResult.success || !titleResult.title) {
      return NextResponse.json(
        { error: titleResult.error || 'Failed to generate title' },
        { status: 500 }
      )
    }

    const title = titleResult.title

    // Update conversation with generated title
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId)
      .eq('user_id', user.id) // Security check

    if (updateError) {
      console.error('Error updating conversation title:', updateError)
      return NextResponse.json(
        { error: 'Failed to update conversation title' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      title,
    })
  } catch (error) {
    console.error('Generate Title API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
