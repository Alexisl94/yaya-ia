'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getModelById, calculateCost } from '@/lib/pricing/model-pricing'
import { Activity, DollarSign, MessageSquare, Zap, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalAgents: number
  totalConversations: number
  totalMessages: number
  totalTokensUsed: number
  totalCostUSD: number
  monthlyTokensUsed: number
  monthlyCostUSD: number
  usageLogs: Array<{
    id: string
    created_at: string
    model_used: string
    tokens_used: number
    metadata: any
  }>
  agentStats: Array<{
    agent_id: string
    agent_name: string
    model: string
    total_messages: number
    total_cost: number
  }>
}

interface DashboardClientProps {
  userId: string
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [monthlyLimit] = useState(10.00) // Limite mensuelle en USD (configurable selon le plan)

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient()

        // Load agents
        const { data: agents } = await supabase
          .from('agents')
          .select('id, name, model, total_conversations, total_tokens_used, total_cost_usd')
          .eq('user_id', userId)
          .eq('is_active', true)

        // Load usage logs (this month)
        const firstDayOfMonth = new Date()
        firstDayOfMonth.setDate(1)
        firstDayOfMonth.setHours(0, 0, 0, 0)

        const { data: usageLogs } = await supabase
          .from('usage_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', firstDayOfMonth.toISOString())
          .order('created_at', { ascending: false })
          .limit(100)

        // Calculate monthly cost
        let monthlyCostUSD = 0
        let monthlyTokensUsed = 0

        if (usageLogs) {
          usageLogs.forEach(log => {
            const inputTokens = log.metadata?.input_tokens || 0
            const outputTokens = log.metadata?.output_tokens || 0
            const cost = calculateCost(log.model_used, inputTokens, outputTokens)
            monthlyCostUSD += cost
            monthlyTokensUsed += log.tokens_used || 0
          })
        }

        // Calculate total stats
        const totalAgents = agents?.length || 0
        const totalConversations = agents?.reduce((sum, a) => sum + (a.total_conversations || 0), 0) || 0
        const totalTokensUsed = agents?.reduce((sum, a) => sum + (a.total_tokens_used || 0), 0) || 0
        const totalCostUSD = agents?.reduce((sum, a) => sum + (a.total_cost_usd || 0), 0) || 0

        // Count messages from usage logs
        const totalMessages = usageLogs?.filter(log => log.event_type === 'message').length || 0

        // Agent stats
        const agentStats = agents?.map(agent => ({
          agent_id: agent.id,
          agent_name: agent.name,
          model: agent.model,
          total_messages: agent.total_conversations || 0,
          total_cost: agent.total_cost_usd || 0,
        })) || []

        setStats({
          totalAgents,
          totalConversations,
          totalMessages,
          totalTokensUsed,
          totalCostUSD,
          monthlyTokensUsed,
          monthlyCostUSD,
          usageLogs: usageLogs || [],
          agentStats,
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [userId])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Impossible de charger les statistiques</p>
      </div>
    )
  }

  const usagePercentage = (stats.monthlyCostUSD / monthlyLimit) * 100
  const isNearLimit = usagePercentage >= 80

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre utilisation et de vos agents IA
        </p>
      </div>

      {/* Monthly Usage Progress */}
      <Card className={cn(
        "border-2",
        isNearLimit && "border-orange-500 bg-orange-50/50"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Utilisation mensuelle
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </div>
            <Badge variant={isNearLimit ? "destructive" : "secondary"} className="text-lg px-4 py-2">
              {formatCurrency(stats.monthlyCostUSD)} / {formatCurrency(monthlyLimit)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {usagePercentage.toFixed(1)}% utilisé
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(monthlyLimit - stats.monthlyCostUSD)} restant
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className={cn(
                "h-3",
                isNearLimit && "bg-orange-200"
              )}
            />
          </div>

          {isNearLimit && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
              <Zap className="h-4 w-4" />
              <span>Vous approchez de votre limite mensuelle. Envisagez de passer à un plan supérieur.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Messages ce mois</p>
              <p className="text-2xl font-bold">{stats.usageLogs.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens utilisés</p>
              <p className="text-2xl font-bold">{stats.monthlyTokensUsed.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agents actifs
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              Créés et prêts à l'emploi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Total depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Coût total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCostUSD)}</div>
            <p className="text-xs text-muted-foreground">
              Depuis la création du compte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tokens totaux
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalTokensUsed / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">
              Tokens utilisés au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Stats */}
      {stats.agentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Utilisation par agent</CardTitle>
            <CardDescription>
              Détail de la consommation pour chaque agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.agentStats.map(agent => {
                const modelConfig = getModelById(agent.model)
                return (
                  <div key={agent.agent_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{agent.agent_name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {modelConfig?.displayName || agent.model}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {agent.total_messages} messages
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(agent.total_cost)}</p>
                      <p className="text-xs text-muted-foreground">coût total</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activité récente
          </CardTitle>
          <CardDescription>
            Dernières requêtes effectuées ce mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.usageLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune activité ce mois-ci
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stats.usageLogs.slice(0, 20).map(log => {
                const cost = calculateCost(
                  log.model_used,
                  log.metadata?.input_tokens || 0,
                  log.metadata?.output_tokens || 0
                )
                return (
                  <div key={log.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <span className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{getModelById(log.model_used)?.displayName || log.model_used}</Badge>
                      <span className="text-muted-foreground">{log.tokens_used.toLocaleString()} tokens</span>
                      <span className="font-medium">{formatCurrency(cost)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
