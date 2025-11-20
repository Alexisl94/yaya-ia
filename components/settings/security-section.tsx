'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Lock, Shield, Key, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SecuritySectionProps {
  userId: string
  userEmail: string
}

export function SecuritySection({ userId, userEmail }: SecuritySectionProps) {
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const handleChangePassword = async () => {
    try {
      if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
        toast.error('Veuillez remplir tous les champs')
        return
      }

      if (passwordData.new !== passwordData.confirm) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }

      if (passwordData.new.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères')
        return
      }

      setLoading(true)
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      })

      if (error) throw error

      toast.success('Mot de passe modifié avec succès')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutAllSessions = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut({ scope: 'global' })
      toast.success('Déconnecté de toutes les sessions')
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Erreur lors de la déconnexion')
    }
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>
            Mettez à jour votre mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Mot de passe actuel</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">Nouveau mot de passe</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              placeholder="••••••••"
            />
            <p className="text-xs text-muted-foreground">
              Au moins 8 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changement...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentification à deux facteurs
          </CardTitle>
          <CardDescription>
            Ajoutez une couche de sécurité supplémentaire à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="font-medium">2FA désactivée</p>
                <p className="text-sm text-muted-foreground">
                  Protégez votre compte avec un code à usage unique
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Bientôt disponible
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions actives</CardTitle>
          <CardDescription>
            Gérez les appareils connectés à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Session actuelle</p>
              <p className="text-sm text-muted-foreground">
                Dernière activité : Maintenant
              </p>
            </div>
            <Badge variant="secondary">Actif</Badge>
          </div>

          <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                Déconnecter toutes les sessions
              </p>
              <p className="text-xs text-orange-700">
                Vous serez déconnecté de tous vos appareils
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutAllSessions}
              className="border-orange-300 hover:bg-orange-100"
            >
              Déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
