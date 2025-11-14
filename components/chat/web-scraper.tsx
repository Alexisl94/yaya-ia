'use client'

/**
 * WebScraper Component
 * Interface for scraping web pages using Jina AI Reader
 */

import { useState, useRef } from 'react'
import { Globe, X, Loader2, Link2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { extractValidUrls } from '@/lib/utils/url-detection'
import type { ConversationAttachment } from '@/types/database'

interface WebScraperProps {
  conversationId: string
  messageId?: string
  onScrapeComplete: (attachments: ConversationAttachment[]) => void
  onClose: () => void
}

interface ScrapeError {
  url: string
  error: string
}

export function WebScraper({ conversationId, messageId, onScrapeComplete, onClose }: WebScraperProps) {
  const [urlInput, setUrlInput] = useState('')
  const [detectedUrls, setDetectedUrls] = useState<string[]>([])
  const [isScraping, setIsScraping] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [scrapeErrors, setScrapeErrors] = useState<ScrapeError[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (value: string) => {
    setUrlInput(value)
    setError(null)

    // Auto-detect URLs
    const urls = extractValidUrls(value)
    setDetectedUrls(urls)
  }

  const handleScrape = async () => {
    if (detectedUrls.length === 0) {
      setError('Aucune URL valide détectée')
      return
    }

    setIsScraping(true)
    setProgress(10)
    setError(null)
    setScrapeErrors([])

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: detectedUrls,
          conversation_id: conversationId,
          message_id: messageId,
        }),
      })

      setProgress(80)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Échec du scraping')
      }

      setProgress(100)

      // Handle partial failures
      if (result.data.errors && result.data.errors.length > 0) {
        setScrapeErrors(result.data.errors)
      }

      // Call completion handler with successful attachments
      if (result.data.attachments && result.data.attachments.length > 0) {
        onScrapeComplete(result.data.attachments)

        // Close after a short delay if all succeeded
        if (!result.data.errors || result.data.errors.length === 0) {
          setTimeout(() => {
            setUrlInput('')
            setDetectedUrls([])
            setProgress(0)
            setIsScraping(false)
            onClose()
          }, 1000)
        } else {
          setIsScraping(false)
        }
      } else {
        throw new Error('Aucun contenu scrapé avec succès')
      }

    } catch (err) {
      console.error('Scraping error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du scraping')
      setIsScraping(false)
      setProgress(0)
    }
  }

  const handleRemoveUrl = (urlToRemove: string) => {
    const newUrls = detectedUrls.filter(url => url !== urlToRemove)
    setDetectedUrls(newUrls)

    // Update input to reflect removed URL
    const newInput = urlInput
      .split('\n')
      .filter(line => !line.includes(urlToRemove))
      .join('\n')
    setUrlInput(newInput)
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Scraper des pages web</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {!isScraping ? (
        <>
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              URLs à scraper (une par ligne)
            </label>
            <Textarea
              ref={textareaRef}
              value={urlInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="https://example.com/article&#10;https://docs.example.com/guide"
              className="min-h-[120px] font-mono text-sm"
              rows={5}
            />
            <p className="text-xs text-slate-500">
              Maximum 5 URLs par scraping
            </p>
          </div>

          {/* Detected URLs Preview */}
          {detectedUrls.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                URLs détectées ({detectedUrls.length})
              </label>
              <div className="space-y-2">
                {detectedUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-700 truncate flex-1">
                      {url}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUrl(url)}
                      className="h-6 w-6 p-0 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Scrape Errors from previous attempt */}
          {scrapeErrors.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    Certaines URLs n'ont pas pu être scrapées :
                  </p>
                  <ul className="mt-2 space-y-1">
                    {scrapeErrors.map((err, index) => (
                      <li key={index} className="text-xs text-amber-700">
                        <span className="font-mono">{err.url}</span>: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleScrape}
              disabled={detectedUrls.length === 0 || detectedUrls.length > 5}
              className="flex-1"
            >
              <Globe className="w-4 h-4 mr-2" />
              Scraper {detectedUrls.length > 0 && `(${detectedUrls.length})`}
            </Button>
          </div>
        </>
      ) : (
        /* Scraping Progress */
        <div className="space-y-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <Globe className="w-6 h-6 text-primary absolute top-3 left-3" />
            </div>

            <div className="text-center">
              <p className="font-medium text-slate-900 mb-1">
                Scraping en cours...
              </p>
              <p className="text-sm text-slate-600">
                {detectedUrls.length} page{detectedUrls.length > 1 ? 's' : ''} à traiter
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Progression</span>
                <span className="text-slate-600 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
