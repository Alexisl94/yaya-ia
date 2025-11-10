/**
 * API Route: Attachment by ID
 * GET - Retrieve attachment with signed URL
 * DELETE - Delete attachment from storage and database
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'
import { getAttachmentById, deleteAttachment } from '@/lib/db/attachments'

/**
 * GET /api/attachments/[id]
 * Retrieves an attachment with a signed URL for download
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

    // 2. Get attachment ID
    const { id: attachmentId } = await params

    // 3. Retrieve attachment from database
    const result = await getAttachmentById(attachmentId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, error: 'Attachment not found' },
        { status: 404 }
      )
    }

    const attachment = result.data

    // 4. Verify ownership
    if (attachment.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 5. Generate signed URL for file access (valid for 1 hour)
    const supabase = await createClient()
    const { data: urlData, error: urlError } = await supabase.storage
      .from('conversation-attachments')
      .createSignedUrl(attachment.storage_path, 3600)

    if (urlError) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate file URL' },
        { status: 500 }
      )
    }

    // 6. Generate signed URL for thumbnail if exists
    let thumbnailUrl: string | null = null
    if (attachment.thumbnail_path) {
      const { data: thumbData } = await supabase.storage
        .from('conversation-attachments')
        .createSignedUrl(attachment.thumbnail_path, 3600)

      thumbnailUrl = thumbData?.signedUrl || null
    }

    return NextResponse.json({
      success: true,
      data: {
        ...attachment,
        signed_url: urlData.signedUrl,
        thumbnail_url: thumbnailUrl
      }
    })

  } catch (error) {
    console.error('Error retrieving attachment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/attachments/[id]
 * Deletes an attachment from storage and database
 */
export async function DELETE(
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

    // 2. Get attachment ID
    const { id: attachmentId } = await params

    // 3. Retrieve attachment to verify ownership and get paths
    const result = await getAttachmentById(attachmentId)

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: 'Attachment not found' },
        { status: 404 }
      )
    }

    const attachment = result.data

    // 4. Verify ownership
    if (attachment.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // 5. Delete file from storage
    const filesToDelete = [attachment.storage_path]
    if (attachment.thumbnail_path) {
      filesToDelete.push(attachment.thumbnail_path)
    }

    const { error: storageError } = await supabase.storage
      .from('conversation-attachments')
      .remove(filesToDelete)

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Continue anyway - better to delete DB record even if storage fails
    }

    // 6. Delete from database
    const deleteResult = await deleteAttachment(attachmentId)

    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete attachment record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
