'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Calendar, DollarSign, Percent, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { campaignService, CreateCampaignRequest } from '@/services/campaign-service'
import Link from 'next/link'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    description: '',
    type: 'discount',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    applicableServices: [],
    minimumOrderValue: 0,
    maximumDiscount: 0,
    usageLimit: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof CreateCampaignRequest, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
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

    if (formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0'
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%'
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
      return
    }

    try {
      setLoading(true)
      await campaignService.createCampaign(formData)
      router.push('/admin/campaigns')
    } catch (error) {
      console.error('Failed to create campaign:', error)
      setErrors({ submit: 'Failed to create campaign. Please try again.' })
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Set up a new promotional campaign to attract customers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details for your campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Summer Sale 2024"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount Campaign</SelectItem>
                    <SelectItem value="seasonal">Seasonal Offer</SelectItem>
                    <SelectItem value="loyalty">Loyalty Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your campaign and what customers can expect..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Discount Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Configuration</CardTitle>
            <CardDescription>
              Set up the discount structure and conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) => handleInputChange('discountType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    <SelectItem value="free_service">Free Service</SelectItem>
                  </SelectContent>
                </Select>
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
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                      placeholder={formData.discountType === 'percentage' ? '10' : '25.00'}
                      className={`pl-10 ${errors.discountValue ? 'border-red-500' : ''}`}
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
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
                    value={formData.minimumOrderValue}
                    onChange={(e) => handleInputChange('minimumOrderValue', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`pl-10 ${errors.minimumOrderValue ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.minimumOrderValue && <p className="text-sm text-red-500">{errors.minimumOrderValue}</p>}
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
                      value={formData.maximumDiscount}
                      onChange={(e) => handleInputChange('maximumDiscount', parseFloat(e.target.value) || 0)}
                      placeholder="100.00"
                      className={`pl-10 ${errors.maximumDiscount ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.maximumDiscount && <p className="text-sm text-red-500">{errors.maximumDiscount}</p>}
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
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)}
                placeholder="1000"
                className={errors.usageLimit ? 'border-red-500' : ''}
                min="0"
              />
              {errors.usageLimit && <p className="text-sm text-red-500">{errors.usageLimit}</p>}
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
            <CardDescription>
              Set when your campaign starts and ends
            </CardDescription>
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
                    value={formData.startDate}
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
                    value={formData.endDate}
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
            <CardDescription>
              Select which services this campaign applies to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Services</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Tune-up',
                  'AC Service', 'Battery Replacement', 'Wheel Alignment', 'Transmission Service'
                ].map((service) => (
                  <label key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.applicableServices.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('applicableServices', [...formData.applicableServices, service])
                        } else {
                          handleInputChange('applicableServices', formData.applicableServices.filter(s => s !== service))
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

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/campaigns">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>

        {errors.submit && (
          <div className="text-center text-red-500">
            {errors.submit}
          </div>
        )}
      </form>
    </div>
  )
}
