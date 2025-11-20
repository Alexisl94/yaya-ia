'use client'

/**
 * Agents Page Client Component
 * Interactive agents management interface
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit3,
  Sparkles,
  Target,
  Loader2,
  AlertCircle,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentWithRelations, ModelType } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getModelInfo } from '@/lib/utils/model-utils'
import { ModelSettingsModal } from '@/components/agents/model-settings-modal'
import {
  convertBudgetToDoggo,
  formatDoggo,
  getDoggoProgressColor,
  getDoggoStatusMessage,
  getModelConsumption,
  type DoggoBudget
} from '@/lib/utils/doggo-pricing'

interface AgentsPageClientProps {
  userId: string
}

interface MonthlyBudget {
  total_cost_usd: number
  total_tokens: number
  total_conversations: number
  budget_limit_usd: number
  budget_used_percent: number
}

export function AgentsPageClient({ userId }: AgentsPageClientProps) {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'companion' | 'task'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<AgentWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget | null>(null)
  const [modelSettingsOpen, setModelSettingsOpen] = useState(false)
  const [agentToOptimize, setAgentToOptimize] = useState<AgentWithRelations | null>(null)

  // Fetch agents and budget
  useEffect(() => {
    fetchAgents()
    fetchMonthlyBudget()
  }, [])

  const fetchAgents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/agents?limit=100')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement')
      }

      setAgents(result.data || [])
    } catch (err) {
      console.error('Error fetching agents:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMonthlyBudget = async () => {
    try {
      const response = await fetch('/api/budget/monthly')
      const result = await response.json()

      if (result.success) {
        setMonthlyBudget(result.data)
      }
    } catch (err) {
      console.error('Error fetching monthly budget:', err)
    }
  }

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = filterType === 'all' || agent.agent_type === filterType

    return matchesSearch && matchesType
  })

  // Handle delete
  const handleDeleteClick = (agent: AgentWithRelations) => {
    setAgentToDelete(agent)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/agents/${agentToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      // Remove from list
      setAgents(prev => prev.filter(a => a.id !== agentToDelete.id))
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
    } catch (err) {
      console.error('Error deleting agent:', err)
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle optimize click
  const handleOptimizeClick = (agent: AgentWithRelations) => {
    setAgentToOptimize(agent)
    setModelSettingsOpen(true)
  }

  // Handle model change
  const handleModelChange = async (agentId: string, newModel: ModelType) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/model`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: newModel })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      // Update the agent in the list
      setAgents(prev => prev.map(a =>
        a.id === agentId ? { ...a, model: newModel } : a
      ))

      // Refresh budget
      await fetchMonthlyBudget()
    } catch (err) {
      console.error('Error updating model:', err)
      throw err
    }
  }

  // Stats
  const stats = {
    total: agents.length,
    companion: agents.filter(a => a.agent_type === 'companion' || !a.agent_type).length,
    task: agents.filter(a => a.agent_type === 'task').length,
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mes Agents</h1>
              <p className="text-slate-600 mt-1">
                Gérez et organisez vos assistants IA
              </p>
            </div>
            <Button
              onClick={() => router.push('/onboarding')}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un agent
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Doggo Usage Bar */}
        {monthlyBudget && monthlyBudget.total_cost_usd > 0 && (() => {
          const doggo = convertBudgetToDoggo(monthlyBudget)
          const colors = getDoggoProgressColor(doggo.percentUsed)
          const status = getDoggoStatusMessage(doggo.percentUsed)

          return (
            <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🐕</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Votre Doggo du mois
                      </h3>
                      <p className="text-xs text-slate-600">
                        {status.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">
                        {doggo.percentUsed.toFixed(0)}
                      </span>
                      <span className="text-lg text-slate-600">%</span>
                    </div>
                    <span className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1",
                      colors.badge
                    )}>
                      {formatDoggo(doggo.usedDoggo, { decimals: 2 })} / {formatDoggo(doggo.limitDoggo, { decimals: 0 })}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-3">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full bg-gradient-to-r",
                      colors.gradient
                    )}
                    style={{ width: `${Math.min(doggo.percentUsed, 100)}%` }}
                  />
                </div>

                {/* Stats summary */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{doggo.totalConversations} conversations</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("font-semibold", colors.text)}>
                        {formatDoggo(doggo.remaining, { decimals: 2 })} restant{doggo.remaining !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  {status.alert && (
                    <div className="flex items-center gap-1.5 text-red-600 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>Passez au palier supérieur</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Compagnons</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.companion}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tâches</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.task}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              Tous
            </Button>
            <Button
              variant={filterType === 'companion' ? 'default' : 'outline'}
              onClick={() => setFilterType('companion')}
              size="sm"
            >
              Compagnons
            </Button>
            <Button
              variant={filterType === 'task' ? 'default' : 'outline'}
              onClick={() => setFilterType('task')}
              size="sm"
            >
              Tâches
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAgents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? 'Aucun agent trouvé' : 'Aucun agent créé'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery
                  ? 'Essayez avec un autre terme de recherche'
                  : 'Créez votre premier agent pour commencer'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push('/onboarding')}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier agent
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Agents Grid */}
        {!isLoading && !error && filteredAgents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        agent.agent_type === 'companion'
                          ? "bg-gradient-to-br from-amber-500 to-orange-600"
                          : "bg-secondary/10"
                      )}>
                        {agent.agent_type === 'companion' ? (
                          <Sparkles className="w-6 h-6 text-white" />
                        ) : (
                          <Target className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {agent.agent_type === 'companion' ? 'Compagnon' : 'Tâche'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {agent.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {agent.description}
                    </p>
                  )}

                  {/* Sector info */}
                  {agent.sector && (
                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                      <span>{agent.sector.icon}</span>
                      <span>{agent.sector.name}</span>
                    </div>
                  )}

                  {/* Model and Cost Info */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    {/* Model Badge */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                      <span className="text-sm">{getModelInfo(agent.model).emoji}</span>
                      <span className="font-medium text-slate-700">
                        {getModelInfo(agent.model).displayName}
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
                        getModelInfo(agent.model).tier === 'economy' && "bg-green-100 text-green-700",
                        getModelInfo(agent.model).tier === 'standard' && "bg-blue-100 text-blue-700",
                        getModelInfo(agent.model).tier === 'premium' && "bg-purple-100 text-purple-700",
                        getModelInfo(agent.model).tier === 'ultra' && "bg-orange-100 text-orange-700"
                      )}>
                        {getModelInfo(agent.model).tier}
                      </span>
                    </div>

                    {/* Doggo Consumption Badge */}
                    {(() => {
                      const consumption = getModelConsumption(agent.model as ModelType)
                      return (
                        <div className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md border",
                          consumption.level === 'low' && "bg-green-50 border-green-200",
                          consumption.level === 'medium' && "bg-yellow-50 border-yellow-200",
                          consumption.level === 'high' && "bg-orange-50 border-orange-200"
                        )}>
                          <span className="text-sm">{consumption.icon}</span>
                          <span className={cn(
                            "font-medium text-xs",
                            consumption.level === 'low' && "text-green-700",
                            consumption.level === 'medium' && "text-yellow-700",
                            consumption.level === 'high' && "text-orange-700"
                          )}>
                            {consumption.label}
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/chat?agent=${agent.id}`)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Discuter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOptimizeClick(agent)
                      }}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      title="Optimiser le modèle"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(agent)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'agent</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{agentToDelete?.name}</strong> ?
              Cette action est irréversible et toutes les conversations associées seront également supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Model Settings Modal */}
      <ModelSettingsModal
        agent={agentToOptimize}
        open={modelSettingsOpen}
        onOpenChange={setModelSettingsOpen}
        onModelChange={handleModelChange}
      />
    </div>
  )
}
