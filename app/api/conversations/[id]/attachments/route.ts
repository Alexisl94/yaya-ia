/**
 * API Route: Conversation Attachments
 * GET - List all attachments for a conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'
import { getConversationAttachments } from '@/lib/db/attachments'

/**
 * GET /api/conversations/[id]/attachments
 * Lists all attachments for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get conversation ID
    const { id: conversationId } = await params

    // 3. Verify conversation belongs to user
    const supabase = await createClient()
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 4. Get all attachments for this conversation
    const result = await getConversationAttachments(conversationId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    // 5. Generate signed URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      (result.data || []).map(async (attachment) => {
        const { data: urlData } = await supabase.storage
          .from('conversation-attachments')
          .createSignedUrl(attachment.storage_path, 3600)

        let thumbnailUrl: string | null = null
        if (attachment.thumbnail_path) {
          const { data: thumbData } = await supabase.storage
            .from('conversation-attachments')
            .createSignedUrl(attachment.thumbnail_path, 3600)
          thumbnailUrl = thumbData?.signedUrl || null
        }

        return {
          ...attachment,
          signed_url: urlData?.signedUrl || null,
          thumbnail_url: thumbnailUrl
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: attachmentsWithUrls
    })

  } catch (error) {
    console.error('Error listing conversation attachments:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
