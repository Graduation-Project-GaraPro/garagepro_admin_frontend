'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { campaignService, UpdateCampaignRequest, PromotionalCampaign } from '@/services/campaign-service'

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(null)
  const [formData, setFormData] = useState<UpdateCampaignRequest>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        setInitialLoading(true)
        setErrors({})
        
        if (!campaignId) {
          setErrors({ load: 'Campaign ID is missing' })
          return
        }

        console.log('Loading campaign with ID:', campaignId)
        const data = await campaignService.getCampaignById(campaignId)
        
        if (!data) {
          setErrors({ load: 'Campaign not found' })
          return
        }

        console.log('Campaign data loaded:', data)
        setCampaign(data)
        
        // Initialize form data with proper defaults
        setFormData({
          name: data.name || '',
          description: data.description || '',
          type: data.type || 'discount',
          discountType: data.discountType || 'percentage',
          discountValue: data.discountValue || 0,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          applicableServices: data.applicableServices || [],
          minimumOrderValue: data.minimumOrderValue || 0,
          maximumDiscount: data.maximumDiscount || 0,
          usageLimit: data.usageLimit || 0,
          isActive: data.isActive ?? true,
        })
      } catch (error) {
        console.error('Error loading campaign:', error)
        setErrors({ 
          load: error instanceof Error 
            ? `Failed to load campaign: ${error.message}` 
            : 'Failed to load campaign. Please try again.' 
        })
      } finally {
        setInitialLoading(false)
      }
    }

    if (campaignId) {
      load()
    }
  }, [campaignId])

  const handleInputChange = (field: keyof UpdateCampaignRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Campaign name is required'
    }

    if (!formData.type) {
      newErrors.type = 'Campaign type is required'
    }

    if (!formData.discountType) {
      newErrors.discountType = 'Discount type is required'
    }

    if (formData.discountType !== 'free_service' && (!formData.discountValue || formData.discountValue <= 0)) {
      newErrors.discountValue = 'Discount value must be greater than 0'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setErrors({})
      
      console.log('Updating campaign with data:', formData)
      await campaignService.updateCampaign(campaignId, formData)
      
      // Show success message or redirect
      router.push(`/admin/campaigns/${campaignId}`)
    } catch (error) {
      console.error('Error updating campaign:', error)
      setErrors({ 
        submit: error instanceof Error 
          ? `Failed to update campaign: ${error.message}` 
          : 'Failed to update campaign. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading campaign...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (errors.load) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{errors.load}</div>
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

  // Show form only if campaign is loaded
  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Campaign not found</p>
          <Link href="/admin/campaigns">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/campaigns/${campaignId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground">Update configuration and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update essential details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input 
                  id="name" 
                  value={formData.name || ''} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => handleInputChange('type', v)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="loyalty">Loyalty</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                rows={3}
                placeholder="Enter campaign description..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(v) => handleInputChange('discountType', v)}
                >
                  <SelectTrigger className={errors.discountType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_service">Free Service</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && <p className="text-sm text-red-500">{errors.discountType}</p>}
              </div>
              {formData.discountType !== 'free_service' && (
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.discountValue || ''} 
                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                    className={errors.discountValue ? 'border-red-500' : ''}
                  />
                  {errors.discountValue && <p className="text-sm text-red-500">{errors.discountValue}</p>}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Order Value</Label>
                <Input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.minimumOrderValue || ''} 
                  onChange={(e) => handleInputChange('minimumOrderValue', parseFloat(e.target.value) || 0)} 
                />
              </div>
              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label>Maximum Discount</Label>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.maximumDiscount || ''} 
                    onChange={(e) => handleInputChange('maximumDiscount', parseFloat(e.target.value) || 0)} 
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input 
                type="number" 
                min="0"
                value={formData.usageLimit || ''} 
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)} 
                placeholder="0 for unlimited"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule & Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  value={formData.startDate || ''} 
                  onChange={(e) => handleInputChange('startDate', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={formData.endDate || ''} 
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Applicable Services</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Oil Change',
                  'Brake Service',
                  'Tire Rotation',
                  'Engine Tune-up',
                  'AC Service',
                  'Battery Replacement',
                  'Wheel Alignment',
                  'Transmission Service'
                ].map((service) => (
                  <label key={service} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.applicableServices?.includes(service) || false}
                      onChange={(e) => {
                        const current = formData.applicableServices || []
                        if (e.target.checked) {
                          handleInputChange('applicableServices', [...current, service])
                        } else {
                          handleInputChange('applicableServices', current.filter(s => s !== service))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/admin/campaigns/${campaignId}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 text-center">{errors.submit}</div>
          </div>
        )}
      </form>
    </div>
  )
}