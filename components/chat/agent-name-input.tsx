/**
 * Agent Name Input Component
 * Smart input field for agent naming with validation and AI-powered suggestions
 */

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sparkles, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentNameInputProps {
  value: string
  onChange: (value: string) => void
  agentType?: 'companion' | 'task'
  sectorName?: string
  description?: string
  className?: string
}

const AGENT_NAME_REGEX = /^[a-zA-Z0-9_-]*$/
const MAX_LENGTH = 25
const MIN_LENGTH = 3

// Fonction utilitaire pour nettoyer et normaliser les noms
const cleanName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, MAX_LENGTH)
}

// Fonction pour créer des portmanteaux créatifs
const createPortmanteau = (word1: string, word2: string): string => {
  const clean1 = cleanName(word1)
  const clean2 = cleanName(word2)

  if (!clean1 || !clean2) return clean1 + clean2

  // Trouver une syllabe de coupure intéressante
  const mid = Math.floor(clean1.length * 0.6)
  const part1 = clean1.slice(0, mid)

  // Créer le portmanteau
  return (part1 + clean2).slice(0, MAX_LENGTH)
}

// Fonction pour extraire les initiales + un mot
const createInitialsCombo = (businessName: string, suffix: string): string => {
  const words = businessName.split(/\s+/)
  if (words.length === 1) return cleanName(businessName + suffix)

  const initials = words.map(w => w[0]).join('')
  return cleanName(initials + suffix)
}

export function AgentNameInput({
  value,
  onChange,
  agentType = 'companion',
  sectorName,
  description,
  className,
}: AgentNameInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Validation du nom
  const isValid = value.length >= MIN_LENGTH && value.length <= MAX_LENGTH && AGENT_NAME_REGEX.test(value)
  const remainingChars = MAX_LENGTH - value.length

  // Extraire les mots importants d'une description
  const extractKeyWords = (text: string, count: number = 2): string[] => {
    if (!text) return []

    // Mots à ignorer (stop words)
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'pour', 'et', 'ou', 'dans', 'sur', 'avec', 'mon', 'ma', 'mes', 'ce', 'cet', 'cette', 'ces', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'à', 'au', 'aux', 'qui', 'que', 'quoi']

    // Nettoyer et split
    const words = text
      .toLowerCase()
      .replace(/[^a-zàâäéèêëïîôùûüÿæœç\s]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.includes(w))

    // Prendre les premiers mots significatifs
    return words.slice(0, count).map(w => w.charAt(0).toUpperCase() + w.slice(1))
  }

  // Générer des jeux de mots créatifs basés sur Doggo ou la tâche
  const generateCreativeSuggestions = () => {
    const newSuggestions: string[] = []
    const cleanSector = sectorName ? cleanName(sectorName) : ''

    if (agentType === 'companion') {
      // JEUX DE MOTS pour agents compagnons - basés sur "Doggo"

      // 1. Doggo + Secteur
      if (cleanSector) {
        newSuggestions.push(cleanName('Doggo' + cleanSector))
      }

      // 2. Doggo + Rôle
      const roles = ['Helper', 'Guide', 'Pro', 'Expert', 'Buddy', 'Mate', 'Assistant']
      roles.forEach(role => {
        const suggestion = cleanName('Doggo' + role)
        if (suggestion.length >= MIN_LENGTH && suggestion.length <= MAX_LENGTH) {
          newSuggestions.push(suggestion)
        }
      })

      // 3. Préfixes + Doggo
      const prefixes = ['My', 'Smart', 'Super', 'The']
      prefixes.forEach(prefix => {
        const suggestion = cleanName(prefix + 'Doggo')
        if (suggestion.length >= MIN_LENGTH && suggestion.length <= MAX_LENGTH) {
          newSuggestions.push(suggestion)
        }
      })

      // 4. Doggo + Secteur court
      if (cleanSector && cleanSector.length > 5) {
        const shortSector = cleanSector.slice(0, 5)
        newSuggestions.push(cleanName('Doggo' + shortSector))
      }

      // 5. Variations compactes
      newSuggestions.push(
        'DoggoPro',
        'DoggoAI',
        'MyDoggo'
      )

    } else {
      // JEUX DE MOTS pour agents de tâche - basés sur la description

      // Extraire 2 mots clés de la description
      const keyWords = extractKeyWords(description || sectorName || '', 2)

      if (keyWords.length >= 2) {
        // 1. Mot1 + Mot2
        newSuggestions.push(cleanName(keyWords[0] + keyWords[1]))

        // 2. Mot1 + Bot
        newSuggestions.push(cleanName(keyWords[0] + 'Bot'))

        // 3. Mot2 + Auto
        newSuggestions.push(cleanName(keyWords[1] + 'Auto'))

        // 4. Mot1 + Task
        newSuggestions.push(cleanName(keyWords[0] + 'Task'))
      } else if (keyWords.length === 1) {
        // Si on n'a qu'un mot, faire des variations
        newSuggestions.push(
          cleanName(keyWords[0] + 'Bot'),
          cleanName(keyWords[0] + 'Auto'),
          cleanName(keyWords[0] + 'Task')
        )
      }

      // 5. Fallback avec le secteur
      if (cleanSector) {
        newSuggestions.push(
          cleanName(cleanSector + 'Bot'),
          cleanName(cleanSector + 'Task'),
          cleanName(cleanSector + 'Auto')
        )
      }
    }

    // Filtrer les doublons et les suggestions invalides
    const uniqueSuggestions = Array.from(new Set(newSuggestions))
      .filter(s => s.length >= MIN_LENGTH && s.length <= MAX_LENGTH && AGENT_NAME_REGEX.test(s))
      .slice(0, 8)

    setSuggestions(uniqueSuggestions)
    return uniqueSuggestions
  }

  // Générer ET remplir automatiquement avec une suggestion aléatoire
  const generateAndFill = () => {
    const newSuggestions = generateCreativeSuggestions()

    if (newSuggestions.length > 0) {
      // Choisir une suggestion aléatoire
      const randomIndex = Math.floor(Math.random() * newSuggestions.length)
      const selectedSuggestion = newSuggestions[randomIndex]

      // Remplir automatiquement le champ
      onChange(selectedSuggestion)

      // Afficher toutes les suggestions pour que l'utilisateur puisse en choisir une autre
      setShowSuggestions(true)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Autoriser seulement les caractères valides
    if (newValue === '' || AGENT_NAME_REGEX.test(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="agent-name" className="flex items-center gap-2">
          Nom de l'agent
          {isValid && (
            <Check className="w-3 h-3 text-green-600 dark:text-green-500" />
          )}
        </Label>
        <span className={cn(
          'text-xs',
          remainingChars < 5 ? 'text-orange-500 font-medium' : 'text-muted-foreground'
        )}>
          {remainingChars} caractères restants
        </span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            id="agent-name"
            value={value}
            onChange={handleInputChange}
            placeholder="MonAgent_Pro"
            maxLength={MAX_LENGTH}
            className={cn(
              'font-mono',
              !isValid && value.length > 0 && 'border-orange-500 focus-visible:ring-orange-500',
              isValid && 'border-green-500/50'
            )}
          />
          {!isValid && value.length > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
              {value.length < MIN_LENGTH
                ? `Minimum ${MIN_LENGTH} caractères requis`
                : 'Uniquement lettres, chiffres, - et _'
              }
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={generateAndFill}
          title="Générer un nom créatif automatiquement"
          className="shrink-0"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Suggestions créatives
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateAndFill}
              className="h-6 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Autre idée
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-all',
                  'bg-background border hover:border-primary hover:bg-primary/5',
                  'hover:shadow-sm active:scale-95',
                  value === suggestion && 'border-primary bg-primary/10'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Astuce :</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Cliquez sur le bouton Sparkles pour générer automatiquement un nom pertinent</li>
          <li>
            {agentType === 'companion'
              ? 'Jeux de mots basés sur "Doggo" pour votre compagnon IA'
              : 'Basé sur les mots-clés de votre tâche pour rester précis'
            }
          </li>
          <li>Vous pouvez choisir parmi les suggestions ou créer le vôtre</li>
        </ul>
      </div>
    </div>
  )
}
