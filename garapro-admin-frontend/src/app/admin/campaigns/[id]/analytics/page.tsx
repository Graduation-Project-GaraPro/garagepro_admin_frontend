'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, BarChart3, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { campaignService, PromotionalCampaign, CampaignAnalytics } from '@/services/campaign-service'
import Link from 'next/link'
import * as signalR from '@microsoft/signalr'
import type { PromotionAppliedNotificationDto } from '@/services/campaign-service'
import { authService } from '@/services/authService'
export default function CampaignAnalyticsPage() {
  const params = useParams()

  const raw = params?.id
  const campaignId = Array.isArray(raw) ? raw[0] : raw
  
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(null)
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const loadCampaignData = useCallback(async () => {
    try {
      setLoading(true)
      const [campaignData, analyticsData] = await Promise.all([
        campaignService.getCampaignById(campaignId),
        campaignService.getCampaignAnalytics(campaignId),
      ])
      setCampaign(campaignData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load campaign data:', error)
      // Fallback to mock data if API fails
      try {
        const [campaignData, mockAnalytics] = await Promise.all([
          campaignService.getCampaignById(campaignId),
          campaignService.getCampaignAnalyticsMock(campaignId),
        ])
        setCampaign(campaignData)
        setAnalytics(mockAnalytics)
      } catch (fallbackError) {
        console.error('Failed to load fallback data:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) {
      loadCampaignData()
    }
  }, [campaignId, loadCampaignData])

  useEffect(() => {
      
      const hubBase = process.env.NEXT_PUBLIC_HUB_BASE_URL || 'https://localhost:7113';
      const hubUrl = `${hubBase}/hubs/promotions`;
  
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => authService.getToken() ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();
  
      setConnection(conn);
  
      return () => {
        conn.stop().catch(() => {});
      };
    }, []);
  
    useEffect(() => {
  if (!connection || !campaignId) return;

  let isMounted = true;

  const startConnection = async () => {
    try {
      await connection.start();
      console.log('Connected to PromotionalHub');

      await connection.invoke('JoinPromotionGroup', campaignId);

      connection.on('PromotionAppliedToQuotation', (payload: PromotionAppliedNotificationDto) => {
        if (!isMounted) return;

        console.log('PromotionAppliedToQuotation:', payload);
        loadCampaignData();
      });
    } catch (err) {
      console.error('Error connecting to PromotionalHub:', err);
    }
  };

  startConnection();

  return () => {
    isMounted = false;
    connection.off('PromotionAppliedToQuotation');
  };
}, [connection, loadCampaignData, campaignId]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
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
      {/* Header */}
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
            Simple overview of how this promotion is being used.
          </p>
        </div>
      </div>

      {/* Promotion Details + Total Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Details</CardTitle>
          <CardDescription>Basic information and total usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div className="text-lg font-semibold">{campaign.name}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="flex items-center gap-2">
                {getStatusBadge(campaign.isActive)}
                {getTypeBadge(campaign.type.toString())}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Total Usage</div>
              <div className="text-lg font-semibold">
                {formatNumber(analytics.totalUsage || campaign.usedCount)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Schedule</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  Start:{' '}
                  {new Date(campaign.startDate).toLocaleDateString('en-US')}
                </div>
                <div>
                  End:{' '}
                  {new Date(campaign.endDate).toLocaleDateString('en-US')}
                </div>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <p className="text-sm text-muted-foreground">
                {campaign.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Discount</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Type: {campaign.discountType}</div>
                <div>
                  Value:{' '}
                  {campaign.discountType.toString() === 'percentage'
                    ? `${campaign.discountValue}%`
                    : formatCurrency(campaign.discountValue)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Customers + Service Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Who used the campaign (customers) */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Customers who used this promotion most often
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customer data yet.</p>
            ) : (
              <div className="space-y-4">
                {analytics.topCustomers.slice(0, 5).map((customer, index) => (
                  <div
                    key={customer.customerId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {customer.customerId.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {customer.usageCount} uses
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Which services the promotion was applied to */}
        <Card>
          <CardHeader>
            <CardTitle>Service Usage</CardTitle>
            <CardDescription>
              Services where this promotion is most frequently applied
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.servicePerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No service data yet.</p>
            ) : (
              <div className="space-y-4">
                {analytics.servicePerformance.slice(0, 5).map((service) => (
                  <div
                    key={service.serviceId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.usageCount} uses
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recent usage of this promotion</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.usageByDate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {analytics.usageByDate.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{day.usageCount} uses</div>
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
