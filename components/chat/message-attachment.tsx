'use client'

/**
 * MessageAttachment Component
 * Displays an attachment inline within a chat message
 */

import { useState } from 'react'
import { FileText, Image as ImageIcon, Eye, Globe, ExternalLink } from 'lucide-react'
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
  const isScrapedPage = attachment.file_type === 'text/plain' && attachment.metadata?.scraped === true

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
            'relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-all max-w-[120px]',
            className
          )}
        >
          {/* Image Thumbnail */}
          {attachment.thumbnail_url ? (
            <img
              src={attachment.thumbnail_url}
              alt={attachment.file_name}
              className="w-full h-auto max-h-24 object-cover"
            />
          ) : attachment.signed_url ? (
            <img
              src={attachment.signed_url}
              alt={attachment.file_name}
              className="w-full h-auto max-h-24 object-cover"
            />
          ) : (
            <div className="w-full h-20 bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-slate-400" />
            </div>
          )}

          {/* Hover Overlay - more subtle */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                <Eye className="w-3 h-3 text-slate-700" />
              </div>
            </div>
          </div>

          {/* File Name - more subtle */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent px-1.5 py-0.5">
            <p className="text-white text-[8px] font-medium truncate drop-shadow">{attachment.file_name}</p>
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
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-200/50 bg-red-50/30 hover:bg-red-50/60 cursor-pointer transition-all group',
            className
          )}
        >
          <FileText className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
          <span className="text-[9.5px] text-slate-600 truncate max-w-[100px]">
            {attachment.file_name.replace('.pdf', '')}
          </span>
          <span className="text-[8px] text-red-400/70">
            {formatFileSize(attachment.file_size)}
          </span>
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

  // Scraped web pages
  if (isScrapedPage) {
    const sourceUrl = attachment.metadata?.source_url as string | undefined
    const title = attachment.metadata?.title as string | undefined
    const domain = sourceUrl ? new URL(sourceUrl).hostname.replace('www.', '') : ''

    return (
      <>
        <div
          onClick={() => setShowPreview(true)}
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-200/50 bg-blue-50/30 hover:bg-blue-50/60 cursor-pointer transition-all group',
            className
          )}
        >
          <Globe className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
          <span className="text-[9.5px] text-blue-900 truncate max-w-[150px]">
            {title || domain || 'Page web'}
          </span>
          {domain && (
            <span className="text-[8px] text-blue-400/70">{domain}</span>
          )}
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
