'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Upload, User, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProfileSectionProps {
  userId: string
  userEmail: string
}

export function ProfileSection({ userId, userEmail }: ProfileSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
  })
  const [avatarKey, setAvatarKey] = useState(0) // Pour forcer le refresh de l'avatar

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setInitializing(true)
      const supabase = createClient()

      // Essayer de charger depuis public.users
      const { data, error } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single()

      if (error) {
        // Si l'utilisateur n'existe pas (code PGRST116)
        if (error.code === 'PGRST116') {
          console.log('User not found in public.users, creating entry...')

          // Créer l'utilisateur dans public.users
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: userEmail,
              full_name: userEmail.split('@')[0], // Utiliser la partie avant @ comme nom par défaut
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('Error creating user:', insertError)
            toast.error('Impossible de créer le profil utilisateur')
          } else {
            toast.success('Profil créé avec succès')
            // Recharger le profil
            await loadProfile()
          }
          return
        }

        // Autre erreur
        console.error('Error loading profile:', error)
        toast.error(`Erreur: ${error.message}`)
        return
      }

      // Profil chargé avec succès
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
        })
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error)
      toast.error('Erreur inattendue lors du chargement')
    } finally {
      setInitializing(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image')
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 2MB')
        return
      }

      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Delete old avatar if exists
      if (profile.avatar_url) {
        try {
          const oldPath = profile.avatar_url.split('/avatars/').pop()
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath])
          }
        } catch (err) {
          console.log('No old avatar to delete or error deleting:', err)
        }
      }

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Erreur d'upload: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Save to database first
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw new Error(`Erreur de mise à jour: ${updateError.message}`)
      }

      // Update profile in state immediately
      const newProfile = { ...profile, avatar_url: publicUrl }
      setProfile(newProfile)

      // Force avatar refresh with cache busting
      setAvatarKey(prev => prev + 1)

      // Show success message
      toast.success('Photo de profil mise à jour')

      // Force a hard refresh of the page to update avatar everywhere
      // This ensures the header and all components get the new avatar
      setTimeout(() => {
        window.location.href = window.location.href
      }, 500)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      toast.error(`Erreur: ${errorMessage}`)
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Loading state pendant l'initialisation
  if (initializing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">Chargement du profil...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Gérez vos informations de profil visibles par votre équipe
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadProfile}
            title="Actualiser le profil"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24" key={avatarKey}>
            <AvatarImage
              src={profile.avatar_url ? `${profile.avatar_url}?v=${avatarKey}` : undefined}
              alt={profile.full_name || userEmail}
            />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              {profile.full_name ? getInitials(profile.full_name) : <User />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Changer la photo
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG ou GIF. Max 2MB.
            </p>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
            id="full_name"
            value={profile.full_name}
            onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Jean Dupont"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="bg-slate-50"
          />
          <p className="text-xs text-muted-foreground">
            L'email ne peut pas être modifié pour des raisons de sécurité
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
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
              'Enregistrer les modifications'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
