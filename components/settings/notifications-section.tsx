'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Bell, Mail, MessageSquare, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface NotificationsSectionProps {
  userId: string
}

export function NotificationsSection({ userId }: NotificationsSectionProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [preferences, setPreferences] = useState({
    email_new_features: true,
    email_marketing: false,
    email_usage_alerts: true,
    email_weekly_summary: true,
    push_agent_responses: true,
    push_budget_alerts: true,
  })

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_preferences')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data?.notification_preferences) {
        setPreferences({ ...preferences, ...data.notification_preferences })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('Préférences de notifications mises à jour')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Notifications par email
          </CardTitle>
          <CardDescription>
            Choisissez les emails que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_new_features">Nouvelles fonctionnalités</Label>
              <p className="text-sm text-muted-foreground">
                Soyez informé des nouvelles fonctionnalités et mises à jour
              </p>
            </div>
            <Switch
              id="email_new_features"
              checked={preferences.email_new_features}
              onCheckedChange={() => handleToggle('email_new_features')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_marketing">Offres promotionnelles</Label>
              <p className="text-sm text-muted-foreground">
                Recevez des offres spéciales et des promotions
              </p>
            </div>
            <Switch
              id="email_marketing"
              checked={preferences.email_marketing}
              onCheckedChange={() => handleToggle('email_marketing')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_usage_alerts">Alertes d'utilisation</Label>
              <p className="text-sm text-muted-foreground">
                Soyez prévenu quand vous approchez de vos limites
              </p>
            </div>
            <Switch
              id="email_usage_alerts"
              checked={preferences.email_usage_alerts}
              onCheckedChange={() => handleToggle('email_usage_alerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_weekly_summary">Résumé hebdomadaire</Label>
              <p className="text-sm text-muted-foreground">
                Recevez un résumé de votre activité chaque semaine
              </p>
            </div>
            <Switch
              id="email_weekly_summary"
              checked={preferences.email_weekly_summary}
              onCheckedChange={() => handleToggle('email_weekly_summary')}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications dans l'application
          </CardTitle>
          <CardDescription>
            Gérez les notifications affichées dans l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_agent_responses">Réponses des agents</Label>
              <p className="text-sm text-muted-foreground">
                Notifications quand vos agents répondent
              </p>
            </div>
            <Switch
              id="push_agent_responses"
              checked={preferences.push_agent_responses}
              onCheckedChange={() => handleToggle('push_agent_responses')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_budget_alerts">Alertes de budget</Label>
              <p className="text-sm text-muted-foreground">
                Notifications sur votre consommation mensuelle
              </p>
            </div>
            <Switch
              id="push_budget_alerts"
              checked={preferences.push_budget_alerts}
              onCheckedChange={() => handleToggle('push_budget_alerts')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer les préférences'
          )}
        </Button>
      </div>
    </div>
  )
}
