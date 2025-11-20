'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSection } from '@/components/settings/profile-section'
import { CompanySection } from '@/components/settings/company-section'
import { SubscriptionSection } from '@/components/settings/subscription-section'
import { BillingSection } from '@/components/settings/billing-section'
import { SecuritySection } from '@/components/settings/security-section'
import { NotificationsSection } from '@/components/settings/notifications-section'

interface SettingsClientProps {
  userId: string
  userEmail: string
}

export function SettingsClient({ userId, userEmail }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
            <p className="text-slate-600 mt-1">
              Gérez votre compte et vos préférences
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="company">Entreprise</TabsTrigger>
            <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection userId={userId} userEmail={userEmail} />
          </TabsContent>

          <TabsContent value="company">
            <CompanySection userId={userId} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionSection userId={userId} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingSection userId={userId} />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySection userId={userId} userEmail={userEmail} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsSection userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
