'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { campaignService, PromotionalCampaign } from '@/services/campaign-service'
import { DollarSign as DollarSignIcon } from 'lucide-react'
import Link from 'next/link'

export default function CampaignAnalyticsPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(null)
  const [analytics, setAnalytics] = useState<{
    totalUsage: number
    revenueGenerated: number
    averageOrderValue: number
    topCustomers: Array<{ customerId: string; customerName: string; usageCount: number }>
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCampaignData = useCallback(async () => {
    try {
      setLoading(true)
      const [campaignData, analyticsData] = await Promise.all([
        campaignService.getCampaignById(campaignId),
        campaignService.getCampaignAnalytics(campaignId)
      ])
      setCampaign(campaignData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load campaign data:', error)
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) {
      loadCampaignData()
    }
  }, [campaignId, loadCampaignData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      discount: 'bg-blue-100 text-blue-800',
      seasonal: 'bg-orange-100 text-orange-800',
      loyalty: 'bg-purple-100 text-purple-800',
    }
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading campaign analytics...</div>
      </div>
    )
  }

  if (!campaign || !analytics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Campaign not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Analytics</h1>
          <p className="text-muted-foreground">
            Performance metrics and insights for {campaign.name}
          </p>
        </div>
      </div>

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
          <CardDescription>
            Basic information and current status
          </CardDescription>
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
              <div className="text-lg font-semibold">
                {campaign.usedCount}
                {campaign.usageLimit && ` / ${campaign.usageLimit}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalUsage)}</div>
            <p className="text-xs text-muted-foreground">
              Times campaign was used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenueGenerated)}</div>
            <p className="text-xs text-muted-foreground">
              Additional revenue from campaign
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order with campaign
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.usageLimit ? 
                ((analytics.totalUsage / campaign.usageLimit) * 100).toFixed(1) : 
                'N/A'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Usage vs. limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>
            Customers who used this campaign most frequently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topCustomers.slice(0, 5).map((customer, index: number) => (
              <div key={customer.customerId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{customer.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      Customer ID: {customer.customerId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{customer.usageCount} uses</div>
                  <div className="text-sm text-muted-foreground">
                    {((customer.usageCount / analytics.totalUsage) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Configuration and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Discount Configuration</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Type: {campaign.discountType}</div>
                  <div>Value: {campaign.discountType === 'percentage' ? `${campaign.discountValue}%` : formatCurrency(campaign.discountValue)}</div>
                  {campaign.minimumOrderValue && (
                    <div>Minimum Order: {formatCurrency(campaign.minimumOrderValue)}</div>
                  )}
                  {campaign.maximumDiscount && (
                    <div>Maximum Discount: {formatCurrency(campaign.maximumDiscount)}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Schedule</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Start: {new Date(campaign.startDate).toLocaleDateString()}</div>
                  <div>End: {new Date(campaign.endDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Applicable Services</h4>
                <div className="flex flex-wrap gap-1">
                  {campaign.applicableServices.map((service: string) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
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
