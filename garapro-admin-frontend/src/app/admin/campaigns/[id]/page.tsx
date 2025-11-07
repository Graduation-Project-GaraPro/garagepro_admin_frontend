'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  DollarSign,
  Users,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { campaignService, PromotionalCampaign } from '@/services/campaign-service'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // --------- Helpers ----------
  // Format tiền VND: 1.000.000đ
  const formatVND = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '0đ'
    const n = Number(amount)
    if (Number.isNaN(n)) return '0đ'
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ'
  }

  // Date hiển thị an toàn
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    // Giữ EN-US hoặc đổi sang vi-VN tuỳ ý; ở đây để EN dễ đọc
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (isActive: boolean | null | undefined) =>
    isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Inactive
      </Badge>
    )

  const getTypeBadge = (type: string | null | undefined) => {
    const t = type || 'discount'
    const typeColors: Record<string, string> = {
      discount: 'bg-blue-100 text-blue-800 border-blue-200',
      seasonal: 'bg-orange-100 text-orange-800 border-orange-200',
      loyalty: 'bg-purple-100 text-purple-800 border-purple-200',
    }
    const typeLabels: Record<string, string> = {
      discount: 'Discount',
      seasonal: 'Seasonal',
      loyalty: 'Loyalty',
    }
    return (
      <Badge className={typeColors[t] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {typeLabels[t] || t.charAt(0).toUpperCase() + t.slice(1)}
      </Badge>
    )
  }

  const getDiscountDisplay = (c: PromotionalCampaign) => {
    if (c.discountType === 'fixed') {
      return `${formatVND(c.discountValue)} off`
    }
    // default percentage
    return `${c.discountValue}% off`
  }

  // --------- Data ----------
  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await campaignService.getCampaignById(campaignId)
      setCampaign(data)
    } catch (e) {
      setError('Failed to load campaign')
      console.error('Error loading campaign:', e)
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) loadCampaign()
  }, [campaignId, loadCampaign])

  // --------- Actions ----------
  const handleDelete = async () => {
    if (!campaign) return
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        await campaignService.deleteCampaign(campaign.id)
        window.location.href = '/admin/campaigns'
      } catch (e) {
        setBanner({ type: 'error', message: 'Failed to delete campaign. Please try again.' })
      }
    }
  }

  const handleToggle = async () => {
    if (!campaign) return
    try {
      if (campaign.isActive) {
        await campaignService.deactivateCampaign(campaign.id)
        setBanner({ type: 'success', message: 'Campaign deactivated successfully.' })
      } else {
        await campaignService.activateCampaign(campaign.id)
        setBanner({ type: 'success', message: 'Campaign activated successfully.' })
      }
      await loadCampaign()
    } catch (e) {
      setBanner({ type: 'error', message: 'Failed to update campaign status. Please try again.' })
    }
  }

  // --------- UI States ----------
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error || 'Campaign not found'}</div>
          <Link href="/admin/campaigns">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // --------- Render ----------
  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`${
            banner.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          } border rounded-lg p-4`}
        >
          {banner.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-muted-foreground">View configuration and performance details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggle}>
            {campaign.isActive ? (
              <ToggleRight className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 mr-2 text-gray-600" />
            )}
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {campaign.isActive ? (
              <div className="h-2 w-2 rounded-full bg-green-600"></div>
            ) : (
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusBadge(campaign.isActive)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Type</CardTitle>
            <Badge variant="outline" className="text-xs">
              Type
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTypeBadge(campaign.type)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.usedCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {campaign.usageLimit && campaign.usageLimit !== 2147483647
                ? `of ${campaign.usageLimit} limit`
                : 'Unlimited usage'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDiscountDisplay(campaign)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Basic information and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Start Date</div>
                  <div className="font-medium">{formatDate(campaign.startDate)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">End Date</div>
                  <div className="font-medium">{formatDate(campaign.endDate)}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3">
                {campaign.description || '-'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Discount Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Discount Type</div>
                  <div className="font-medium capitalize">
                    {(campaign.discountType || 'percentage').replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Discount Value</div>
                  <div className="font-medium">
                    {campaign.discountType === 'percentage'
                      ? `${campaign.discountValue}%`
                      : campaign.discountType === 'fixed'
                      ? formatVND(campaign.discountValue)
                      : '-'}
                  </div>
                </div>

                {campaign.minimumOrderValue > 0 && (
                  <div>
                    <div className="text-muted-foreground">Minimum Order</div>
                    <div className="font-medium">{formatVND(campaign.minimumOrderValue)}</div>
                  </div>
                )}

                {campaign.maximumDiscount > 0 && (
                  <div>
                    <div className="text-muted-foreground">Maximum Discount</div>
                    <div className="font-medium">{formatVND(campaign.maximumDiscount)}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Applicable Services
            </CardTitle>
            <CardDescription>Services included in this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaign.services && campaign.services.length > 0 ? (
                campaign.services.map((service) => (
                  <div
                    key={service.serviceId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{service.serviceName}</div>
                      {service.description ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          {service.description}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {formatVND(service.price)}
                        </Badge>
                        {service.isAdvanced && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                            Advanced
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No services assigned to this campaign
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Campaign metadata and timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Campaign ID</div>
              <div className="font-mono text-xs mt-1 p-2 bg-gray-50 rounded border break-all">
                {campaign.id}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Created At</div>
              <div className="font-medium">
                {campaign.createdAt
                  ? new Date(campaign.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Last Updated</div>
              <div className="font-medium">
                {campaign.updatedAt
                  ? new Date(campaign.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
