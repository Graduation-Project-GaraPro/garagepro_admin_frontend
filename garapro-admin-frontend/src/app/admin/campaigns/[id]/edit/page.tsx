'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Calendar, DollarSign, Percent, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { campaignService, UpdateCampaignRequest, PromotionalCampaign, ServiceCategory } from '@/services/campaign-service'
import { ServiceCategoryList } from '@/components/admin/campaigns/service-category-list'

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [campaign, setCampaign] = useState<PromotionalCampaign | null>(null)
  const [formData, setFormData] = useState<UpdateCampaignRequest>({
    name: '',
    description: '',
    type: 'discount',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    minimumOrderValue: 0,
    maximumDiscount: 0,
    usageLimit: 0,
    serviceIds: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true)
        setErrors({})
        
        if (!campaignId) {
          setErrors({ load: 'Campaign ID is missing' })
          return
        }

        // Load campaign data
        console.log('Loading campaign with ID:', campaignId)
        const campaignData = await campaignService.getCampaignById(campaignId)
        
        if (!campaignData) {
          setErrors({ load: 'Campaign not found' })
          return
        }

        console.log('Campaign data loaded:', campaignData)
        setCampaign(campaignData)
        
        // Load service categories
        const categories = await campaignService.getServiceCategories()
        setServiceCategories(categories)

        // Initialize form data with campaign data
        setFormData({
          name: campaignData.name || '',
          description: campaignData.description || '',
          type: campaignData.type || 'discount',
          discountType: campaignData.discountType || 'percentage',
          discountValue: campaignData.discountValue || 0,
          startDate: campaignData.startDate ? new Date(campaignData.startDate).toISOString().split('T')[0] : '',
          endDate: campaignData.endDate ? new Date(campaignData.endDate).toISOString().split('T')[0] : '',
          isActive: campaignData.isActive ?? true,
          minimumOrderValue: campaignData.minimumOrderValue || 0,
          maximumDiscount: campaignData.maximumDiscount || 0,
          usageLimit: campaignData.usageLimit || 0,
          serviceIds: campaignData.services?.map(service => service.serviceId) || [],
        })
      } catch (error) {
        console.error('Error loading data:', error)
        const errorMessage = error instanceof Error 
          ? `Failed to load campaign: ${error.message}` 
          : 'Failed to load campaign. Please try again.'
        
        setErrors({ load: errorMessage })
        toast.error('Failed to load campaign data')
      } finally {
        setInitialLoading(false)
        setServicesLoading(false)
      }
    }

    if (campaignId) {
      loadData()
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

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    const currentServiceIds = formData.serviceIds || []
    if (checked) {
      handleInputChange('serviceIds', [...currentServiceIds, serviceId])
    } else {
      handleInputChange('serviceIds', currentServiceIds.filter(id => id !== serviceId))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Campaign name is required'
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required'
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

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.minimumOrderValue && formData.minimumOrderValue < 0) {
      newErrors.minimumOrderValue = 'Minimum order value cannot be negative'
    }

    if (formData.maximumDiscount && formData.maximumDiscount < 0) {
      newErrors.maximumDiscount = 'Maximum discount cannot be negative'
    }

    if (formData.usageLimit && formData.usageLimit < 0) {
      newErrors.usageLimit = 'Usage limit cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please check the form for errors')
      return
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        setLoading(true)
        setErrors({})

        console.log('Updating campaign with data:', formData)
        await campaignService.updateCampaign(campaignId, formData)
        resolve(true)
      } catch (error) {
        console.error('Error updating campaign:', error)
        const errorMessage = error instanceof Error 
          ? `Failed to update campaign: ${error.message}` 
          : 'Failed to update campaign. Please try again.'
        
        setErrors({ submit: errorMessage })
        reject(new Error(errorMessage))
      } finally {
        setLoading(false)
      }
    })

    toast.promise(promise, {
      loading: 'Updating campaign...',
      success: () => {
        setTimeout(() => {
          router.push(`/admin/campaigns`)
        }, 1000)
        return 'Campaign updated successfully!'
      },
      error: (error) => error.message || 'Failed to update campaign',
    })
  }

  const getDiscountIcon = () => {
    switch (formData.discountType) {
      case 'percentage':
        return <Percent className="h-4 w-4" />
      case 'fixed':
        return <DollarSign className="h-4 w-4" />
      case 'free_service':
        return <Gift className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update essential campaign details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name || ''} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="e.g., Summer Sale 2024"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => handleInputChange('type', v)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount Campaign</SelectItem>
                    <SelectItem value="seasonal">Seasonal Offer</SelectItem>
                    <SelectItem value="loyalty">Loyalty Bonus</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description"
                value={formData.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                rows={3}
                placeholder="Describe your campaign and what customers can expect..."
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active Campaign</Label>
            </div>
          </CardContent>
        </Card>

        {/* Discount Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Configuration</CardTitle>
            <CardDescription>Set up the discount structure and conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(v) => handleInputChange('discountType', v)}
                >
                  <SelectTrigger className={errors.discountType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    <SelectItem value="free_service">Free Service</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && <p className="text-sm text-red-500">{errors.discountType}</p>}
              </div>

              {formData.discountType !== 'free_service' && (
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value *</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getDiscountIcon()}
                    </div>
                    <Input 
                      id="discountValue"
                      type="number" 
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      value={formData.discountValue || ''} 
                      onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                      className={`pl-10 ${errors.discountValue ? 'border-red-500' : ''}`}
                      placeholder={formData.discountType === 'percentage' ? '10' : '25.00'}
                    />
                  </div>
                  {errors.discountValue && <p className="text-sm text-red-500">{errors.discountValue}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumOrderValue">Minimum Order Value</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <Input 
                    id="minimumOrderValue"
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.minimumOrderValue || ''} 
                    onChange={(e) => handleInputChange('minimumOrderValue', parseFloat(e.target.value) || 0)} 
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty if no minimum order requirement
                </p>
              </div>

              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="maximumDiscount">Maximum Discount</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <Input 
                      id="maximumDiscount"
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.maximumDiscount || ''} 
                      onChange={(e) => handleInputChange('maximumDiscount', parseFloat(e.target.value) || 0)} 
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum dollar amount for percentage discounts
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input 
                id="usageLimit"
                type="number" 
                min="0"
                value={formData.usageLimit || ''} 
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)} 
                placeholder="0 for unlimited"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited usage
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Schedule</CardTitle>
            <CardDescription>Set when your campaign starts and ends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <Input 
                    id="startDate"
                    type="date" 
                    value={formData.startDate || ''} 
                    onChange={(e) => handleInputChange('startDate', e.target.value)} 
                    className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <Input 
                    id="endDate"
                    type="date" 
                    value={formData.endDate || ''} 
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`pl-10 ${errors.endDate ? 'border-red-500' : ''}`}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Applicable Services</CardTitle>
            <CardDescription>Select which services this campaign applies to</CardDescription>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="text-center py-4">Loading services...</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ServiceCategoryList
                  categories={serviceCategories}
                  selectedServices={formData.serviceIds || []}
                  onServiceToggle={handleServiceToggle}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/admin/campaigns/${campaignId}`}>
            <Button variant="outline" type="button" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}