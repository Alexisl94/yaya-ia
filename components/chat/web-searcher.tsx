'use client'

/**
 * WebSearcher Component
 * Interface for performing web searches and injecting results into conversation context
 */

import { useState } from 'react'
import { Search, X, Loader2, Globe, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ConversationAttachment } from '@/types/database'

interface WebSearcherProps {
  conversationId: string
  messageId?: string
  onSearchComplete: (attachments: ConversationAttachment[]) => void
  onClose: () => void
}

export function WebSearcher({ conversationId, messageId, onSearchComplete, onClose }: WebSearcherProps) {
  const [query, setQuery] = useState('')
  const [numResults, setNumResults] = useState(5)
  const [isSearching, setIsSearching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Veuillez entrer une requête de recherche')
      return
    }

    setIsSearching(true)
    setProgress(10)
    setError(null)
    setSearchResults([])

    try {
      setProgress(30)

      const response = await fetch('/api/websearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          numResults,
          conversation_id: conversationId,
          message_id: messageId,
        }),
      })

      setProgress(80)

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Échec de la recherche web')
      }

      setProgress(100)

      // Store preview results
      if (result.data.results) {
        setSearchResults(result.data.results)
      }

      // Call completion handler with attachments
      if (result.data.attachments && result.data.attachments.length > 0) {
        onSearchComplete(result.data.attachments)

        // Close after showing results briefly
        setTimeout(() => {
          setQuery('')
          setProgress(0)
          setIsSearching(false)
          setSearchResults([])
          onClose()
        }, 2000)
      } else {
        throw new Error('Aucun résultat trouvé')
      }

    } catch (err) {
      console.error('Web search error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche')
      setIsSearching(false)
      setProgress(0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Recherche Web</h3>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Globe className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Recherche web en temps réel</p>
            <p className="text-xs text-blue-700">
              Les résultats seront injectés dans le contexte de votre conversation pour des réponses précises et à jour.
            </p>
          </div>
        </div>
      </div>

      {!isSearching ? (
        <>
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Que voulez-vous rechercher ?
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Nouveautés React 19, tarifs AWS 2024..."
              className="text-sm"
              autoFocus
            />
            <p className="text-xs text-slate-500">
              Appuyez sur Entrée pour lancer la recherche
            </p>
          </div>

          {/* Number of Results */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Nombre de résultats
            </label>
            <div className="flex gap-2">
              {[3, 5, 10].map((num) => (
                <Button
                  key={num}
                  variant={numResults === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNumResults(num)}
                  className="flex-1"
                >
                  {num}
                </Button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Plus de résultats = contexte plus riche, mais plus de tokens utilisés
            </p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
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
              onClick={handleSearch}
              disabled={!query.trim()}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </>
      ) : (
        /* Searching Progress */
        <div className="space-y-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <Search className="w-6 h-6 text-primary absolute top-3 left-3" />
            </div>

            <div className="text-center">
              <p className="font-medium text-slate-900 mb-1">
                Recherche en cours...
              </p>
              <p className="text-sm text-slate-600 max-w-xs">
                {query}
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

            {/* Preview Results */}
            {searchResults.length > 0 && (
              <div className="w-full space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">{searchResults.length} résultats trouvés</span>
                </div>
                <div className="space-y-1.5">
                  {searchResults.slice(0, 3).map((result, index) => (
                    <div key={index} className="p-2 bg-slate-50 rounded border border-slate-200">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {result.link}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
