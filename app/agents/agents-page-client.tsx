'use client'

/**
 * Agents Page Client Component
 * Interactive agents management interface
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentWithRelations } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AgentsPageClientProps {
  userId: string
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

  // Fetch agents
  useEffect(() => {
    fetchAgents()
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

  // Stats
  const stats = {
    total: agents.length,
    companion: agents.filter(a => a.agent_type === 'companion').length,
    task: agents.filter(a => a.agent_type === 'task').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                      <span>{agent.sector.icon}</span>
                      <span>{agent.sector.name}</span>
                    </div>
                  )}

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
    </div>
  )
}
