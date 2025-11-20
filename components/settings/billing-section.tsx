'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BillingSectionProps {
  userId: string
}

export function BillingSection({ userId }: BillingSectionProps) {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<any>(null)

  useEffect(() => {
    loadBillingData()
  }, [userId])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      // TODO: Fetch from Stripe API
      // For now, mock data
      setInvoices([])
      setPaymentMethod(null)
    } catch (error) {
      console.error('Error loading billing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPaymentMethod = () => {
    // TODO: Implement Stripe payment method addition
    alert('La fonctionnalité Stripe sera bientôt disponible !')
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    console.log('Download invoice:', invoiceId)
  }

  if (loading) {
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
      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Moyen de paiement
          </CardTitle>
          <CardDescription>
            Gérez vos moyens de paiement pour les abonnements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethod ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• {paymentMethod.last4}</p>
                  <p className="text-sm text-muted-foreground">
                    Expire {paymentMethod.exp_month}/{paymentMethod.exp_year}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Modifier
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Aucun moyen de paiement enregistré
              </p>
              <Button
                onClick={handleAddPaymentMethod}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                Ajouter un moyen de paiement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historique de facturation
          </CardTitle>
          <CardDescription>
            Consultez et téléchargez vos factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aucune facture pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(invoice.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Plan {invoice.plan} - {invoice.amount}€
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{invoice.status}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
