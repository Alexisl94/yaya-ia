'use client'

/**
 * AttachmentPreview Component
 * Full-screen preview for images and PDFs
 */

import { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ConversationAttachment } from '@/types/database'

interface AttachmentPreviewProps {
  attachment: ConversationAttachment & { signed_url?: string }
  onClose: () => void
}

export function AttachmentPreview({ attachment, onClose }: AttachmentPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [isLoading, setIsLoading] = useState(true)

  const isImage = attachment.file_type.startsWith('image/')
  const isPDF = attachment.file_type === 'application/pdf'

  useEffect(() => {
    // Prevent body scroll when preview is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleDownload = async () => {
    if (!attachment.signed_url) return

    try {
      const response = await fetch(attachment.signed_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.file_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{attachment.file_name}</h3>
          <p className="text-white/60 text-sm">
            {formatFileSize(attachment.file_size)}
            {attachment.metadata?.width && attachment.metadata?.height && (
              <span> • {attachment.metadata.width}x{attachment.metadata.height}</span>
            )}
            {attachment.metadata?.page_count && (
              <span> • {attachment.metadata.page_count} pages</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="text-white hover:bg-white/10"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm min-w-[50px] text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="text-white hover:bg-white/10"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-white/20 mx-2" />
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Fermer
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
        {isImage && attachment.signed_url ? (
          <img
            src={attachment.signed_url}
            alt={attachment.file_name}
            style={{ transform: `scale(${zoom / 100})` }}
            className={cn(
              'transition-transform duration-200 max-w-full h-auto',
              isLoading && 'opacity-0'
            )}
            onLoad={() => setIsLoading(false)}
          />
        ) : isPDF ? (
          <div className="max-w-2xl w-full bg-white rounded-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">{attachment.file_name}</h4>
                <p className="text-sm text-slate-600">
                  Document PDF • {formatFileSize(attachment.file_size)}
                  {attachment.metadata?.page_count && (
                    <> • {attachment.metadata.page_count} pages</>
                  )}
                </p>
              </div>
            </div>

            {attachment.extracted_text && (
              <div className="space-y-3">
                <h5 className="font-medium text-sm text-slate-700">Aperçu du contenu :</h5>
                <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {attachment.extracted_text.substring(0, 2000)}
                    {attachment.extracted_text.length > 2000 && '...'}
                  </p>
                </div>
                {attachment.extracted_text.length > 2000 && (
                  <p className="text-xs text-slate-500 text-center">
                    Téléchargez le fichier pour voir le contenu complet
                  </p>
                )}
              </div>
            )}

            {!attachment.extracted_text && (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">
                  Téléchargez le PDF pour voir son contenu complet
                </p>
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {isLoading && isImage && (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p>Chargement...</p>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="p-4 text-center">
        <p className="text-white/40 text-sm">
          Appuyez sur <kbd className="px-2 py-1 bg-white/10 rounded">Échap</kbd> pour fermer
        </p>
      </div>
    </div>
  )
}
