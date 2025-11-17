'use client'

/**
 * AttachmentList Component
 * Displays a list of attachments with thumbnails and actions
 */

import { useState, useEffect } from 'react'
import { Eye, Trash2, FileText, Image as ImageIcon, Loader2, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AttachmentPreview } from './attachment-preview'
import type { ConversationAttachment } from '@/types/database'

interface AttachmentListProps {
  conversationId: string
  onAttachmentDeleted?: (attachmentId: string) => void
}

export function AttachmentList({ conversationId, onAttachmentDeleted }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<(ConversationAttachment & { signed_url?: string; thumbnail_url?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [previewAttachment, setPreviewAttachment] = useState<(ConversationAttachment & { signed_url?: string }) | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAttachments()
  }, [conversationId])

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/attachments`)
      const result = await response.json()

      if (result.success) {
        setAttachments(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching attachments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Supprimer ce fichier ?')) return

    setDeletingId(attachmentId)

    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId))
        onAttachmentDeleted?.(attachmentId)
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting attachment:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `Il y a ${diffMins}min`
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`
    } else if (diffDays === 1) {
      return 'Hier'
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  if (attachments.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-slate-500 text-center py-4">
          Aucun fichier dans cette conversation
        </p>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-slate-600" />
            Fichiers ({attachments.length})
          </h3>
        </div>

        <div className="space-y-2">
          {attachments.map((attachment) => {
            const isImage = attachment.file_type.startsWith('image/')
            const isPDF = attachment.file_type === 'application/pdf'
            const isDeleting = deletingId === attachment.id

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {/* Thumbnail/Icon */}
                <div className="flex-shrink-0">
                  {isImage && attachment.thumbnail_url ? (
                    <img
                      src={attachment.thumbnail_url}
                      alt={attachment.file_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : isImage ? (
                    <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                  ) : isPDF ? (
                    <div className="w-12 h-12 bg-red-50 rounded flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                      <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{attachment.file_name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.file_size)} • {formatDate(attachment.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewAttachment(attachment)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Preview Modal */}
      {previewAttachment && (
        <AttachmentPreview
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </>
  )
}
