/**
 * Model Settings Modal
 * Modal pour gérer les paramètres du modèle d'un agent avec recommandations
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { AgentWithRelations, ModelType } from '@/types/database'
import {
  getModelInfo,
  getModelRecommendation,
  calculatePotentialSavings,
  formatCostEUR,
  MODELS
} from '@/lib/utils/model-utils'
import { ArrowRight, TrendingDown, Sparkles, Zap, Loader2 } from 'lucide-react'

interface ModelSettingsModalProps {
  agent: AgentWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onModelChange: (agentId: string, newModel: ModelType) => Promise<void>
}

export function ModelSettingsModal({
  agent,
  open,
  onOpenChange,
  onModelChange
}: ModelSettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  if (!agent) return null

  const currentModelInfo = getModelInfo(agent.model)
  const recommendation = getModelRecommendation(
    agent.functional_type,
    agent.model,
    agent.total_cost_usd
  )

  const handleModelChange = async () => {
    if (!selectedModel) return

    try {
      setIsUpdating(true)
      await onModelChange(agent.id, selectedModel)
      onOpenChange(false)
      setSelectedModel(null)
    } catch (error) {
      console.error('Error updating model:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const potentialSavings = recommendation.suggestedModel && recommendation.shouldOptimize
    ? calculatePotentialSavings(agent.model, recommendation.suggestedModel, agent.total_cost_usd)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Optimiser le modèle - {agent.name}
          </DialogTitle>
          <DialogDescription>
            Choisissez le meilleur modèle pour votre agent selon vos besoins
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Model */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-slate-700">Modèle actuel</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentModelInfo.emoji}</span>
                <div>
                  <p className="font-semibold text-slate-900">{currentModelInfo.name}</p>
                  <p className="text-sm text-slate-600">{currentModelInfo.description}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn(
                currentModelInfo.tier === 'economy' && "bg-green-50 text-green-700 border-green-200",
                currentModelInfo.tier === 'standard' && "bg-blue-50 text-blue-700 border-blue-200",
                currentModelInfo.tier === 'premium' && "bg-purple-50 text-purple-700 border-purple-200",
                currentModelInfo.tier === 'ultra' && "bg-orange-50 text-orange-700 border-orange-200"
              )}>
                {currentModelInfo.tier}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Coût mensuel : {formatCostEUR(agent.total_cost_usd)}
            </p>
          </div>

          {/* Recommendation */}
          {recommendation.suggestedModel && recommendation.shouldOptimize && (
            <Alert className="border-amber-200 bg-amber-50">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900">
                <p className="font-semibold mb-1">Recommandation d'optimisation</p>
                <p className="text-sm">{recommendation.reason}</p>
                {potentialSavings && (
                  <p className="text-sm mt-2 font-semibold">
                    Économie potentielle : {formatCostEUR(potentialSavings.savingsUSD)}
                    ({potentialSavings.savingsPercent}%)
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Model Selection */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-slate-700">Choisir un modèle</h3>
            <div className="grid gap-3">
              {Object.values(MODELS)
                .filter(m => !['claude', 'gpt'].includes(m.id)) // Exclure les legacy
                .map((modelInfo) => {
                  const isRecommended = modelInfo.id === recommendation.suggestedModel
                  const isCurrent = modelInfo.id === agent.model
                  const isSelected = modelInfo.id === selectedModel

                  return (
                    <button
                      key={modelInfo.id}
                      onClick={() => setSelectedModel(modelInfo.id)}
                      disabled={isCurrent}
                      className={cn(
                        "relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                        isCurrent && "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200",
                        !isCurrent && !isSelected && "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
                        isSelected && "border-primary bg-primary/5",
                        isRecommended && !isCurrent && "border-amber-300 bg-amber-50"
                      )}
                    >
                      {isRecommended && !isCurrent && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          Recommandé
                        </div>
                      )}
                      <span className="text-2xl">{modelInfo.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{modelInfo.displayName}</p>
                          <Badge variant="outline" className="text-xs">
                            {modelInfo.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{modelInfo.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Vitesse: {modelInfo.speed}/5
                          </span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Qualité: {modelInfo.quality}/5
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <Badge variant="secondary">Actuel</Badge>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleModelChange}
            disabled={!selectedModel || isUpdating}
            className="gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                Appliquer
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
