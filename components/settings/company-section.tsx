'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CompanySectionProps {
  userId: string
}

export function CompanySection({ userId }: CompanySectionProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [sectors, setSectors] = useState<any[]>([])
  const [company, setCompany] = useState({
    company_name: '',
    company_size: '',
    sector_id: '',
    website: '',
    description: '',
  })

  useEffect(() => {
    loadCompanyData()
    loadSectors()
  }, [userId])

  const loadCompanyData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setCompany({
          company_name: data.company_name || '',
          company_size: data.company_size || '',
          sector_id: data.sector_id || '',
          website: data.website || '',
          description: data.description || '',
        })
      }
    } catch (error) {
      console.error('Error loading company:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadSectors = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name')

      if (error) throw error
      setSectors(data || [])
    } catch (error) {
      console.error('Error loading sectors:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Check if business profile exists
      const { data: existing } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        // Update
        const { error } = await supabase
          .from('business_profiles')
          .update({
            ...company,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('business_profiles')
          .insert({
            user_id: userId,
            ...company,
          })

        if (error) throw error
      }

      toast.success('Informations entreprise mises à jour')
    } catch (error) {
      console.error('Error saving company:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Informations entreprise
        </CardTitle>
        <CardDescription>
          Gérez les informations de votre entreprise pour personnaliser vos agents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">Nom de l'entreprise</Label>
          <Input
            id="company_name"
            value={company.company_name}
            onChange={(e) => setCompany(prev => ({ ...prev, company_name: e.target.value }))}
            placeholder="Doggo SAS"
          />
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <Label htmlFor="sector">Secteur d'activité</Label>
          <Select
            value={company.sector_id}
            onValueChange={(value) => setCompany(prev => ({ ...prev, sector_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre secteur" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.icon} {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Company Size */}
        <div className="space-y-2">
          <Label htmlFor="company_size">Taille de l'entreprise</Label>
          <Select
            value={company.company_size}
            onValueChange={(value) => setCompany(prev => ({ ...prev, company_size: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la taille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Indépendant / Freelance</SelectItem>
              <SelectItem value="2-10">2-10 employés</SelectItem>
              <SelectItem value="11-50">11-50 employés</SelectItem>
              <SelectItem value="51-200">51-200 employés</SelectItem>
              <SelectItem value="201-500">201-500 employés</SelectItem>
              <SelectItem value="500+">500+ employés</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Site web (optionnel)</Label>
          <Input
            id="website"
            type="url"
            value={company.website}
            onChange={(e) => setCompany(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://doggo.com"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            value={company.description}
            onChange={(e) => setCompany(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Décrivez votre activité..."
            rows={4}
          />
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
