'use client'

/**
 * MessageAttachment Component
 * Displays an attachment inline within a chat message
 */

import { useState } from 'react'
import { FileText, Image as ImageIcon, Eye } from 'lucide-react'
import { AttachmentPreview } from './attachment-preview'
import { cn } from '@/lib/utils'
import type { ConversationAttachment } from '@/types/database'

interface MessageAttachmentProps {
  attachment: ConversationAttachment & { signed_url?: string; thumbnail_url?: string }
  className?: string
}

export function MessageAttachment({ attachment, className }: MessageAttachmentProps) {
  const [showPreview, setShowPreview] = useState(false)

  const isImage = attachment.file_type.startsWith('image/')
  const isPDF = attachment.file_type === 'application/pdf'

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  if (isImage) {
    return (
      <>
        <div
          onClick={() => setShowPreview(true)}
          className={cn(
            'relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 max-w-xs',
            className
          )}
        >
          {/* Image Thumbnail */}
          {attachment.thumbnail_url ? (
            <img
              src={attachment.thumbnail_url}
              alt={attachment.file_name}
              className="w-full h-auto"
            />
          ) : attachment.signed_url ? (
            <img
              src={attachment.signed_url}
              alt={attachment.file_name}
              className="w-full h-auto max-h-64 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-400" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white rounded-full p-3">
                <Eye className="w-6 h-6 text-slate-700" />
              </div>
            </div>
          </div>

          {/* File Name */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white text-xs truncate">{attachment.file_name}</p>
          </div>
        </div>

        {showPreview && (
          <AttachmentPreview
            attachment={attachment}
            onClose={() => setShowPreview(false)}
          />
        )}
      </>
    )
  }

  if (isPDF) {
    return (
      <>
        <div
          onClick={() => setShowPreview(true)}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors max-w-sm',
            className
          )}
        >
          {/* PDF Icon */}
          <div className="flex-shrink-0 p-2 bg-red-50 rounded">
            <FileText className="w-6 h-6 text-red-500" />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{attachment.file_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Document PDF • {formatFileSize(attachment.file_size)}
              {attachment.metadata?.page_count && (
                <> • {attachment.metadata.page_count} pages</>
              )}
            </p>
            {attachment.extracted_text && (
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                {attachment.extracted_text.substring(0, 100)}...
              </p>
            )}
          </div>

          {/* View Icon */}
          <div className="flex-shrink-0">
            <div className="p-2 hover:bg-slate-100 rounded transition-colors">
              <Eye className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {showPreview && (
          <AttachmentPreview
            attachment={attachment}
            onClose={() => setShowPreview(false)}
          />
        )}
      </>
    )
  }

  return null
}
