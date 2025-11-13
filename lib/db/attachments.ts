/**
 * Database helper functions for ConversationAttachment operations
 * Provides CRUD operations for file attachments
 */

import { createClient } from '@supabase/supabase-js'
import type {
  ConversationAttachment,
  CreateAttachmentInput,
  UpdateAttachmentInput,
  DatabaseResult,
} from '@/types/database'
import { getPostgresPool } from './pg-client'

// Create admin client with service role to bypass RLS and PostgREST cache
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Creates a new attachment record in the database
 *
 * @param {CreateAttachmentInput} input - Attachment data
 * @returns {Promise<DatabaseResult<ConversationAttachment>>} Created attachment or error
 */
export async function createAttachment(
  input: CreateAttachmentInput
): Promise<DatabaseResult<ConversationAttachment>> {
  try {
    console.log('🔧 Attempting to create attachment with admin client (service_role)')

    // Use admin client with service role
    const supabase = createAdminClient()

    // Try direct INSERT with admin client
    const { data, error } = await supabase
      .from('conversation_attachments')
      .insert({
        conversation_id: input.conversation_id,
        message_id: input.message_id || null,
        user_id: input.user_id,
        file_name: input.file_name,
        file_type: input.file_type,
        file_size: input.file_size,
        storage_path: input.storage_path,
        extracted_text: input.extracted_text || null,
        thumbnail_path: input.thumbnail_path || null,
        metadata: input.metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase INSERT error:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error details:', error.details)

      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    console.log('✅ Attachment created successfully! ID:', data.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Unexpected error in createAttachment:', error)
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Retrieves an attachment by ID
 *
 * @param {string} attachmentId - Attachment UUID
 * @returns {Promise<DatabaseResult<ConversationAttachment | null>>} Attachment or null
 */
export async function getAttachmentById(
  attachmentId: string
): Promise<DatabaseResult<ConversationAttachment | null>> {
  try {
    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('conversation_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: null }
      }
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Retrieves all attachments for a conversation
 *
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<DatabaseResult<ConversationAttachment[]>>} List of attachments
 */
export async function getConversationAttachments(
  conversationId: string
): Promise<DatabaseResult<ConversationAttachment[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conversation_attachments')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Retrieves attachments for a specific message
 *
 * @param {string} messageId - Message UUID
 * @returns {Promise<DatabaseResult<ConversationAttachment[]>>} List of attachments
 */
export async function getMessageAttachments(
  messageId: string
): Promise<DatabaseResult<ConversationAttachment[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conversation_attachments')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true })

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Updates an attachment
 *
 * @param {string} attachmentId - Attachment UUID
 * @param {UpdateAttachmentInput} input - Fields to update
 * @returns {Promise<DatabaseResult<ConversationAttachment>>} Updated attachment or error
 */
export async function updateAttachment(
  attachmentId: string,
  input: UpdateAttachmentInput
): Promise<DatabaseResult<ConversationAttachment>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('conversation_attachments')
      .update(input)
      .eq('id', attachmentId)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}

/**
 * Deletes an attachment from the database
 * Note: This does NOT delete the file from storage - handle that separately
 *
 * @param {string} attachmentId - Attachment UUID
 * @returns {Promise<DatabaseResult<void>>} Success or error
 */
export async function deleteAttachment(
  attachmentId: string
): Promise<DatabaseResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('conversation_attachments')
      .delete()
      .eq('id', attachmentId)

    if (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
        },
      }
    }

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error,
      },
    }
  }
}
