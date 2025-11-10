/**
 * Get Attachments for a Message API Route
 * Returns all attachments linked to a specific message
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id

    // Get Supabase client
    const supabase = await createClient()

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch attachments for this message
    const { data: attachments, error: attachmentsError } = await supabase
      .from('conversation_attachments')
      .select('*')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (attachmentsError) {
      console.error('Error fetching attachments:', attachmentsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attachments' },
        { status: 500 }
      )
    }

    // Generate signed URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      (attachments || []).map(async (attachment) => {
        // Generate signed URL for the file
        const { data: signedUrlData } = await supabase.storage
          .from('conversation-attachments')
          .createSignedUrl(attachment.storage_path, 3600) // 1 hour

        // Generate signed URL for thumbnail if exists
        let thumbnailUrl = undefined
        if (attachment.thumbnail_path) {
          const { data: thumbnailData } = await supabase.storage
            .from('conversation-attachments')
            .createSignedUrl(attachment.thumbnail_path, 3600)

          thumbnailUrl = thumbnailData?.signedUrl
        }

        return {
          ...attachment,
          signed_url: signedUrlData?.signedUrl,
          thumbnail_url: thumbnailUrl,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: attachmentsWithUrls,
    })
  } catch (error) {
    console.error('Get message attachments error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
