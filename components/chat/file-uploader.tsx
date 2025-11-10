'use client'

/**
 * FileUploader Component
 * Drag & drop zone for file upload with preview and progress
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ConversationAttachment } from '@/types/database'

interface FileUploaderProps {
  conversationId: string
  messageId?: string
  onUploadComplete: (attachment: ConversationAttachment) => void
  onClose: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

export function FileUploader({ conversationId, messageId, onUploadComplete, onClose }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WEBP ou PDF.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Fichier trop volumineux. Taille maximum : ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
    return null
  }

  const handleFile = (file: File) => {
    setError(null)
    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      return
    }

    setSelectedFile(file)

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(10)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('conversation_id', conversationId)
      if (messageId) {
        formData.append('message_id', messageId)
      }

      setUploadProgress(30)

      const response = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData
      })

      setUploadProgress(80)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      setUploadProgress(100)
      onUploadComplete(result.data)

      // Reset state
      setTimeout(() => {
        setSelectedFile(null)
        setPreview(null)
        setUploadProgress(0)
        setIsUploading(false)
        onClose()
      }, 500)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Ajouter un fichier</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {!selectedFile ? (
        /* Drop Zone */
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-slate-300 hover:border-primary hover:bg-slate-50'
          )}
        >
          <Upload className={cn(
            'w-12 h-12 mx-auto mb-4 transition-colors',
            isDragging ? 'text-primary' : 'text-slate-400'
          )} />
          <p className="text-lg font-medium text-slate-900 mb-2">
            Glissez un fichier ici
          </p>
          <p className="text-sm text-slate-600 mb-4">
            ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-slate-500">
            JPG, PNG, GIF, WEBP, PDF • Max 10MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        /* File Preview */
        <div className="space-y-4">
          {preview ? (
            /* Image Preview */
            <div className="relative rounded-lg overflow-hidden bg-slate-100">
              <img
                src={preview}
                alt={selectedFile.name}
                className="w-full h-48 object-contain"
              />
            </div>
          ) : (
            /* PDF Preview */
            <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-lg">
              <FileText className="w-12 h-12 text-red-500" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-600">Document PDF</p>
              </div>
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{selectedFile.name}</span>
            <span className="text-slate-500">{formatFileSize(selectedFile.size)}</span>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Upload en cours...</span>
                <span className="text-slate-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </Card>
  )
}
