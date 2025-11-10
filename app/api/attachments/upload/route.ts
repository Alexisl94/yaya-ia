/**
 * API Route: Upload Attachment
 * Handles file upload with processing (compression, PDF extraction)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserServer } from '@/lib/supabase/auth-server'
import { createClient } from '@/lib/supabase/server'
import { createAttachment } from '@/lib/db/attachments'
import {
  extractPDFText,
  compressImage,
  createThumbnail,
  getImageDimensions,
  isAllowedFileType,
  isValidFileSize,
  generateSafeFilename,
} from '@/lib/utils/file-processing'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getUserServer()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversationId = formData.get('conversation_id') as string
    const messageId = formData.get('message_id') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversation_id is required' },
        { status: 400 }
      )
    }

    // 3. Validate file
    if (!isAllowedFileType(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      )
    }

    if (!isValidFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { success: false, error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // 4. Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    let fileBuffer = Buffer.from(arrayBuffer)

    // 5. Process file based on type
    let extractedText: string | null = null
    let thumbnailPath: string | null = null
    let metadata: Record<string, any> = {}
    let processedBuffer = fileBuffer

    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'

    if (isImage) {
      // Compress image
      processedBuffer = await compressImage(fileBuffer, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85,
        format: 'jpeg'
      })

      // Get dimensions
      const dimensions = await getImageDimensions(processedBuffer)
      metadata.width = dimensions.width
      metadata.height = dimensions.height

      // Create thumbnail
      const thumbnailBuffer = await createThumbnail(fileBuffer, 200)
      const thumbnailFilename = `thumb_${generateSafeFilename(file.name)}`
      const thumbnailStoragePath = `${user.id}/${conversationId}/thumbnails/${thumbnailFilename}`

      // Upload thumbnail to storage
      const supabase = await createClient()
      const { error: thumbnailError } = await supabase.storage
        .from('conversation-attachments')
        .upload(thumbnailStoragePath, thumbnailBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (!thumbnailError) {
        thumbnailPath = thumbnailStoragePath
      }
    } else if (isPDF) {
      // Extract text from PDF
      try {
        const pdfData = await extractPDFText(fileBuffer)
        extractedText = pdfData.text
        metadata.page_count = pdfData.pageCount
      } catch (error) {
        console.error('PDF text extraction failed:', error)
        // Continue even if extraction fails
      }
    }

    // 6. Generate safe filename and storage path
    const safeFilename = generateSafeFilename(file.name)
    const storagePath = `${user.id}/${conversationId}/${safeFilename}`

    // 7. Upload file to Supabase Storage
    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from('conversation-attachments')
      .upload(storagePath, processedBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // 8. Create attachment record in database
    const attachmentResult = await createAttachment({
      conversation_id: conversationId,
      message_id: messageId || undefined,
      user_id: user.id,
      file_name: file.name,
      file_type: file.type,
      file_size: processedBuffer.length,
      storage_path: storagePath,
      extracted_text: extractedText,
      thumbnail_path: thumbnailPath,
      metadata
    })

    if (!attachmentResult.success) {
      // Cleanup: delete uploaded file if DB insert fails
      await supabase.storage
        .from('conversation-attachments')
        .remove([storagePath])

      if (thumbnailPath) {
        await supabase.storage
          .from('conversation-attachments')
          .remove([thumbnailPath])
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create attachment record' },
        { status: 500 }
      )
    }

    // 9. Generate signed URL for immediate access
    const { data: urlData } = await supabase.storage
      .from('conversation-attachments')
      .createSignedUrl(storagePath, 3600) // 1 hour

    return NextResponse.json({
      success: true,
      data: {
        ...attachmentResult.data,
        signed_url: urlData?.signedUrl
      }
    })

  } catch (error) {
    console.error('Error uploading attachment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
