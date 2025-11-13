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
            'relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all max-w-[240px]',
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
              className="w-full h-auto max-h-48 object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-slate-400" />
            </div>
          )}

          {/* Hover Overlay - more subtle */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                <Eye className="w-5 h-5 text-slate-700" />
              </div>
            </div>
          </div>

          {/* File Name - more subtle */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2">
            <p className="text-white text-[10px] font-medium truncate drop-shadow">{attachment.file_name}</p>
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
            'inline-flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-200/60 bg-white/95 hover:bg-slate-50/90 cursor-pointer transition-all max-w-[220px] group',
            className
          )}
        >
          {/* PDF Icon - minimal */}
          <div className="flex-shrink-0 p-1 bg-red-50 rounded-md">
            <FileText className="w-3.5 h-3.5 text-red-500" />
          </div>

          {/* File Info - ultra compact */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[10.5px] truncate text-slate-700 leading-tight">{attachment.file_name}</p>
            <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
              {formatFileSize(attachment.file_size)}
              {attachment.metadata?.page_count && (
                <> • {attachment.metadata.page_count}p</>
              )}
            </p>
          </div>

          {/* View Icon - minimal */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3 h-3 text-slate-400" />
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
