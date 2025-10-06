'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { campaignService, PromotionalCampaign } from '@/services/campaign-service'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignService.getCampaignById(campaignId)
      setCampaign(data)
    } catch (e) {
      setError('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) loadCampaign()
  }, [campaignId, loadCampaign])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  const getStatusBadge = (isActive: boolean) => (
    isActive ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="secondary">Inactive</Badge>
  )

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      discount: 'bg-blue-100 text-blue-800',
      seasonal: 'bg-orange-100 text-orange-800',
      loyalty: 'bg-purple-100 text-purple-800',
    }
    return <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
  }

  const handleDelete = async () => {
    if (!campaign) return
    if (confirm('Are you sure you want to delete this campaign?')) {
      await campaignService.deleteCampaign(campaign.id)
      window.location.href = '/admin/campaigns'
    }
  }

  const handleToggle = async () => {
    if (!campaign) return
    try {
      if (campaign.isActive) {
        await campaignService.deactivateCampaign(campaign.id)
      } else {
        await campaignService.activateCampaign(campaign.id)
      }
      const updated = await campaignService.getCampaignById(campaign.id)
      setCampaign(updated)
      setBanner({ type: 'success', message: 'Status updated.' })
    } catch (e) {
      setBanner({ type: 'error', message: 'Failed to update status.' })
    }
  }

  if (loading) return <div className="space-y-6"><div className="text-center py-8">Loading campaign...</div></div>
  if (error || !campaign) return <div className="space-y-6"><div className="text-center py-8">{error || 'Campaign not found'}</div></div>

  return (
    <div className="space-y-6">
      {banner && (
        <div className={`${banner.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded p-3`}>
          {banner.message}
        </div>
      )}
      <div className="flex items-center gap-4">
        <Link href="/admin/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Campaign Details</h1>
          <p className="text-muted-foreground">View configuration and status for {campaign.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggle}>
            {campaign.isActive ? <ToggleRight className="h-4 w-4 mr-2" /> : <ToggleLeft className="h-4 w-4 mr-2" />} 
            {campaign.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Link href={`/admin/campaigns/${campaign.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Basic information and current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Campaign Name</div>
              <div className="text-lg font-semibold">{campaign.name}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Type</div>
              <div>{getTypeBadge(campaign.type)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div>{getStatusBadge(campaign.isActive)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Usage</div>
              <div className="text-lg font-semibold">{campaign.usedCount}{campaign.usageLimit ? ` / ${campaign.usageLimit}` : ''}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Discounts and conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Discount</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Type: {campaign.discountType}</div>
                  <div>
                    Value: {campaign.discountType === 'percentage' ? `${campaign.discountValue}%` : (campaign.discountType === 'fixed' ? formatCurrency(campaign.discountValue) : 'Free Service')}
                  </div>
                  {campaign.minimumOrderValue ? <div>Minimum Order: {formatCurrency(campaign.minimumOrderValue)}</div> : null}
                  {campaign.maximumDiscount ? <div>Maximum Discount: {formatCurrency(campaign.maximumDiscount)}</div> : null}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Schedule</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Start: {formatDate(campaign.startDate)}</div>
                  <div>End: {formatDate(campaign.endDate)}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Applicable Services</h4>
                <div className="flex flex-wrap gap-1">
                  {campaign.applicableServices.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


