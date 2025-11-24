/**
 * Hook pour gérer le profil utilisateur globalement
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    loadProfile()

    // Subscribe to realtime changes
    const supabase = createClient()
    const channel = supabase
      .channel('user_profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('Profile updated:', payload)
          setProfile(payload.new as UserProfile)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const loadProfile = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('Error loading user profile:', fetchError)
        setError(fetchError.message)
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadProfile()
  }

  return {
    profile,
    loading,
    error,
    refresh,
  }
}
