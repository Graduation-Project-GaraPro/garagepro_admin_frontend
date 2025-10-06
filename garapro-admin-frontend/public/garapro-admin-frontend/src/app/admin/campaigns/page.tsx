'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Eye, BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { campaignService, PromotionalCampaign } from '@/services/campaign-service'
import Link from 'next/link'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<PromotionalCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const response = await campaignService.getCampaigns({
        search: searchTerm || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,
      })
      setCampaigns(response.campaigns)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, typeFilter, statusFilter])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  const handleSearch = () => {
    loadCampaigns()
  }

  const handleStatusToggle = async (campaignId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await campaignService.deactivateCampaign(campaignId)
      } else {
        await campaignService.activateCampaign(campaignId)
      }
      loadCampaigns()
    } catch (error) {
      console.error('Failed to toggle campaign status:', error)
    }
  }

  const handleDelete = async (campaignId: string) => {
    setConfirmDeleteId(campaignId)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    const allIds = campaigns.map(c => c.id)
    const allSelected = allIds.every(id => selectedIds.includes(id))
    setSelectedIds(allSelected ? [] : allIds)
  }

  const bulkActivate = async () => {
    if (selectedIds.length === 0) return
    try {
      await campaignService.bulkActivateCampaigns(selectedIds)
      setBanner({ type: 'success', message: 'Selected campaigns activated.' })
      setSelectedIds([])
      loadCampaigns()
    } catch (e) {
      setBanner({ type: 'error', message: 'Failed to activate selected campaigns.' })
    }
  }

  const bulkDeactivate = async () => {
    if (selectedIds.length === 0) return
    try {
      await campaignService.bulkDeactivateCampaigns(selectedIds)
      setBanner({ type: 'success', message: 'Selected campaigns deactivated.' })
      setSelectedIds([])
      loadCampaigns()
    } catch (e) {
      setBanner({ type: 'error', message: 'Failed to deactivate selected campaigns.' })
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      await campaignService.bulkDeleteCampaigns(selectedIds)
      setBanner({ type: 'success', message: 'Selected campaigns deleted.' })
      setSelectedIds([])
      loadCampaigns()
    } catch (e) {
      setBanner({ type: 'error', message: 'Failed to delete selected campaigns.' })
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExporting(true)
      const blob = await campaignService.exportCampaigns({
        search: searchTerm || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,
      }, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaigns-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setBanner({ type: 'success', message: 'Export started successfully.' })
    } catch (error) {
      console.error('Export failed', error)
      setBanner({ type: 'error', message: 'Failed to export campaigns.' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotional Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage discount campaigns, seasonal offers, and loyalty bonuses
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" onClick={bulkActivate}>Activate ({selectedIds.length})</Button>
              <Button variant="outline" onClick={bulkDeactivate}>Deactivate ({selectedIds.length})</Button>
              <Button variant="destructive" onClick={bulkDelete}>Delete ({selectedIds.length})</Button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
            </>
          )}
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Link href="/admin/campaigns/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {banner && (
        <div className={`${banner.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded p-3`}> 
          {banner.message}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="loyalty">Loyalty</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Manage your promotional campaigns and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input type="checkbox" onChange={toggleSelectAll} checked={campaigns.length > 0 && campaigns.every(c => selectedIds.includes(c.id))} />
                  </TableHead>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <input type="checkbox" checked={selectedIds.includes(campaign.id)} onChange={() => toggleSelect(campaign.id)} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(campaign.type)}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {campaign.discountType === 'percentage' && `${campaign.discountValue}%`}
                        {campaign.discountType === 'fixed' && formatCurrency(campaign.discountValue)}
                        {campaign.discountType === 'free_service' && 'Free Service'}
                      </div>
                      {campaign.minimumOrderValue && (
                        <div className="text-sm text-muted-foreground">
                          Min: {formatCurrency(campaign.minimumOrderValue)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(campaign.startDate)}</div>
                        <div className="text-muted-foreground">to {formatDate(campaign.endDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.isActive)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{campaign.usedCount}</div>
                        {campaign.usageLimit && (
                          <div className="text-muted-foreground">/ {campaign.usageLimit}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/campaigns/${campaign.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/campaigns/${campaign.id}/analytics`}>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(campaign.id, campaign.isActive)}
                        >
                          {campaign.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete Campaign</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this campaign? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await campaignService.deleteCampaign(confirmDeleteId)
                    setConfirmDeleteId(null)
                    setBanner({ type: 'success', message: 'Campaign deleted.' })
                    loadCampaigns()
                  } catch (error) {
                    setBanner({ type: 'error', message: 'Failed to delete campaign.' })
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
