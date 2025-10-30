'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Calendar, DollarSign, Percent, Banknote,TriangleAlert } from 'lucide-react'
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
import { FilterSection } from '@/components/admin/campaigns/filter-section-service'
import { SelectedServicesSummary } from '@/components/admin/campaigns/selected-services-summary'

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)

   const [isEditable, setIsEditable] = useState(true)
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

  const [parentCategories, setParentCategories] = useState<ServiceCategory[]>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean>(true)

  const [touchedFields, setTouchedFields] = useState({
    discountValue: false,
    minimumOrderValue: false,
    maximumDiscount: false
  })

  const [displayValues, setDisplayValues] = useState({
    discountValue: '',
    minimumOrderValue: '', 
    maximumDiscount: ''
  })

  const formatNumber = (value: number | undefined): string => {
    if (!value || value === 0) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const formatVietnameseCurrency = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const getDiscountIcon = () => {
    switch (formData.discountType) {
      case 'percentage':
        return <Percent className="h-4 w-4" />
      case 'fixed':
        return <Banknote className="h-4 w-4" />
      default:
        return <Banknote className="h-4 w-4" />
    }
  }

  const loadServices = async () => {
    try {
      setServicesLoading(true)
      const categoriesData = await campaignService.getServicesByFilter({
        parentServiceCategoryId: selectedParentCategory === 'all' ? undefined : selectedParentCategory,
        searchTerm: searchTerm || undefined,
        isActive: isActiveFilter
      })
      setServiceCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load services:', error)
      toast.error("Failed to load services. Please try again.")
    } finally {
      setServicesLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true)
        setErrors({})
        
        if (!campaignId) {
          setErrors({ load: 'Campaign ID is missing' })
          return
        }

        // Load parent categories
        const parentCategoriesData = await campaignService.getParentCategories()
        setParentCategories(parentCategoriesData)

        // Load campaign data
        const campaignData = await campaignService.getCampaignById(campaignId)
        
        if (!campaignData) {
          setErrors({ load: 'Campaign not found' })
          return
        }

        setCampaign(campaignData)
        

         // 🔹 Check campaign có thể edit được không
        const today = new Date()
        const endDate = campaignData?.endDate ? new Date(campaignData.endDate) : null
        const hasUsage = campaignData?.voucherUsages && campaignData.voucherUsages.length > 0
        const isExpired = endDate && endDate < today
        
        if (hasUsage || isExpired) {
          setIsEditable(false)
          if (hasUsage) {
            toast.error('This campaign cannot be edited because it has been used in orders.')
          } else if (isExpired) {
            toast.error('This campaign cannot be edited because it has expired.')
          }
        }

        // Load service categories với filter
        await loadServices()

        // Initialize form data với campaign data
        setFormData({
          name: campaignData.name || '',
          description: campaignData.description || '',
          type: campaignData.type || 'discount',
          discountType: campaignData.discountType || 'percentage',
          discountValue: campaignData.discountValue || 0,
          startDate: campaignData.startDate ? new Date(campaignData.startDate).toLocaleDateString('en-CA') : '',
          endDate: campaignData.endDate ? new Date(campaignData.endDate).toLocaleDateString('en-CA') : '',
          isActive: campaignData.isActive ?? true,
          minimumOrderValue: campaignData.minimumOrderValue || 0,
          maximumDiscount: campaignData.maximumDiscount || 0,
          usageLimit: campaignData.usageLimit || 0,
          serviceIds: campaignData.services?.map(service => service.serviceId) || [],
        })

        console.log("start date",new Date(campaignData.startDate).toLocaleDateString('en-CA'))
        // Set display values
        if (campaignData.discountValue > 0) {
          const formatted = campaignData.discountType === 'percentage' 
            ? campaignData.discountValue.toString()
            : formatNumber(campaignData.discountValue)
          setDisplayValues(prev => ({ ...prev, discountValue: formatted }))
        }
        
        if (campaignData.minimumOrderValue && campaignData.minimumOrderValue > 0) {
          setDisplayValues(prev => ({ ...prev, minimumOrderValue: formatNumber(campaignData.minimumOrderValue) }))
        }
        
        if (campaignData.maximumDiscount && campaignData.maximumDiscount > 0) {
          setDisplayValues(prev => ({ ...prev, maximumDiscount: formatNumber(campaignData.maximumDiscount) }))
        }
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

  useEffect(() => {
    loadServices()
  }, [selectedParentCategory, searchTerm, isActiveFilter])


    useEffect(() => {
      if (isEditable) {
        validateForm();
      } else {
        // Clear errors khi không editable
        setErrors({});
      }
    }, [formData, isEditable]);
  
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

  const markFieldAsTouched = (fieldName: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }))
  }

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '')
    const numericValue = parseFloat(rawValue) || 0
    
    let displayValue = ''
    if (formData.discountType === 'percentage') {
      displayValue = rawValue
    } else {
      displayValue = formatNumber(numericValue)
    }
    
    setDisplayValues(prev => ({ ...prev, discountValue: displayValue }))
    handleInputChange('discountValue', numericValue)
  }

  const handleDiscountValueBlur = () => {
    markFieldAsTouched('discountValue')
    if (formData.discountValue && formData.discountValue > 0) {
      const formatted = formData.discountType === 'percentage' 
        ? formData.discountValue.toString()
        : formatNumber(formData.discountValue)
      setDisplayValues(prev => ({ ...prev, discountValue: formatted }))
    }
  }

  const handleMinimumOrderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '')
    const numericValue = parseFloat(rawValue) || 0
    
    setDisplayValues(prev => ({ ...prev, minimumOrderValue: formatNumber(numericValue) }))
    handleInputChange('minimumOrderValue', numericValue)
  }

  const handleMinimumOrderValueBlur = () => {
    markFieldAsTouched('minimumOrderValue')
    if (formData.minimumOrderValue && formData.minimumOrderValue > 0) {
      setDisplayValues(prev => ({ 
        ...prev, 
        minimumOrderValue: formatNumber(formData.minimumOrderValue) 
      }))
    }
  }

  const handleMaximumDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '')
    const numericValue = parseFloat(rawValue) || 0
    
    setDisplayValues(prev => ({ ...prev, maximumDiscount: formatNumber(numericValue) }))
    handleInputChange('maximumDiscount', numericValue)
  }

  const handleMaximumDiscountBlur = () => {
    markFieldAsTouched('maximumDiscount')
    if (formData.maximumDiscount && formData.maximumDiscount > 0) {
      setDisplayValues(prev => ({ 
        ...prev, 
        maximumDiscount: formatNumber(formData.maximumDiscount) 
      }))
    }
  }

  const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}
  const today = new Date().toISOString().split('T')[0]

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

  // 🔹 Validate discount value theo BE
  if (formData.discountValue <= 0) {
    newErrors.discountValue = 'Discount value must be greater than 0'
  } else if (formData.discountType === 'percentage') {
    if (formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%'
    }
  } else if (formData.discountType === 'fixed') {
    if (formData.discountValue < 1000) {
      newErrors.discountValue = 'Fixed amount discount must be at least 1000 VND'
    }
  }

  // 🔹 Validate dates theo BE
  if (!formData.startDate) {
    newErrors.startDate = 'Start date is required'
  }

  if (!formData.endDate) {
    newErrors.endDate = 'End date is required'
  }

  if (formData.startDate && formData.endDate) {
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be greater than start date'
    }
    
    if (new Date(formData.endDate) < new Date(today)) {
      newErrors.endDate = 'End date cannot be in the past'
    }
  }

  //  Validate start date không được sửa về quá khứ (chỉ cho edit)
    if (campaign && formData.startDate !== campaign.startDate?.split('T')[0]) {
      // Nếu đang thay đổi start date
      const originalStartDate = campaign.startDate
        ? new Date(campaign.startDate).toLocaleDateString('en-CA') // YYYY-MM-DD (local)
        : null;

      // Lấy ngày hôm nay (chỉ phần date)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Chuyển formData.startDate thành date object local
      const newStartDate = new Date(formData.startDate);
      newStartDate.setHours(0, 0, 0, 0);

      //  Chỉ validate nếu start date mới là quá khứ VÀ khác với start date cũ
      if (newStartDate < today && formData.startDate !== originalStartDate) {
        newErrors.startDate = 'Cannot change start date to a past date';
      }
    }


  // 🔹 Validate không cho bật campaign đã hết hạn
  if (formData.isActive && formData.endDate && new Date(formData.endDate) < new Date(today)) {
    newErrors.isActive = 'Cannot activate a campaign that has already expired'
  }

  // 🔹 Validate serviceIds
  if (!formData.serviceIds || formData.serviceIds.length === 0) {
    newErrors.serviceIds = 'At least one service is required'
  }

  // 🔹 Validate các giá trị số không âm
  if (formData.minimumOrderValue && formData.minimumOrderValue < 0) {
    newErrors.minimumOrderValue = 'Minimum order value cannot be negative'
  }

  if (formData.maximumDiscount && formData.maximumDiscount < 1000) {
    newErrors.maximumDiscount = 'Maximum discount Must be greater than 1.000đ'
  }

  if (formData.usageLimit && formData.usageLimit < 1) {
    newErrors.usageLimit = 'Usage limit must be greater than 0'
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
          router.push('/admin/campaigns')
        }, 1000)
        return 'Campaign updated successfully!'
      },
      error: (error) => error.message || 'Failed to update campaign',
    })
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
        <Link href={`/admin/campaigns`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground">Update configuration and settings</p>
        </div>
      </div>

      {!isEditable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <TriangleAlert className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Campaign cannot be edited
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This campaign {campaign?.voucherUsages && campaign.voucherUsages.length > 0 ? 'has been used in orders' : 'has expired'} and cannot be modified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={!isEditable} className="space-y-6">
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
              {errors.isActive && <p className="text-sm text-red-500">{errors.isActive}</p>}
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
                    </SelectContent>
                  </Select>
                  {errors.discountType && <p className="text-sm text-red-500">{errors.discountType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value *</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getDiscountIcon()}
                    </div>
                    <Input 
                      id="discountValue"
                      type="text"
                      value={displayValues.discountValue}
                      onChange={handleDiscountValueChange}
                      onBlur={handleDiscountValueBlur}
                      className={`pl-10 ${errors.discountValue ? 'border-red-500' : ''}`}
                      placeholder={formData.discountType === 'percentage' ? '10' : '10.000'}
                    />
                  </div>
                  {errors.discountValue && <p className="text-sm text-red-500">{errors.discountValue}</p>}
                </div>
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
                      type="text"
                      value={displayValues.minimumOrderValue}
                      onChange={handleMinimumOrderValueChange}
                      onBlur={handleMinimumOrderValueBlur}
                      className="pl-10"
                      placeholder="0"
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
                        <Banknote className="h-4 w-4" />
                      </div>
                      <Input 
                        id="maximumDiscount"
                        type="text"
                        value={displayValues.maximumDiscount}
                        onChange={handleMaximumDiscountChange}
                        onBlur={handleMaximumDiscountBlur}
                        className="pl-10"
                        placeholder="100.000"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum amount for percentage discounts
                    </p>
                     {errors.maximumDiscount && <p className="text-sm text-red-500">{errors.maximumDiscount}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input 
                  id="usageLimit"
                  type="number" 
                  min="1"
                  value={formData.usageLimit || ''} 
                  onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) )} 
                  placeholder="Must be greater than 0"
                />
                <p className="text-xs text-muted-foreground">
                  {/* Leave empty for unlimited usage */}
                </p>
                 {errors.usageLimit && <p className="text-sm text-red-500">{errors.usageLimit}</p>}
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
                      // min={new Date().toISOString().split('T')[0]}
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
              <FilterSection
                selectedParentCategory={selectedParentCategory}
                onParentCategoryChange={setSelectedParentCategory}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                isActiveFilter={isActiveFilter}
                onActiveFilterChange={setIsActiveFilter}
                parentCategories={parentCategories}
              />
              
              {servicesLoading ? (
                <div className="text-center py-4">Loading services...</div>
              ) : (
                <>
                  <div className="max-h-96 overflow-y-auto">
                    <ServiceCategoryList
                      categories={serviceCategories}
                      selectedServices={formData.serviceIds || []}
                      onServiceToggle={handleServiceToggle}
                    />
                  </div>
                  
                  <div className="mt-6 border-t pt-4">
                    <SelectedServicesSummary
                      selectedServices={formData.serviceIds || []}
                      serviceCategories={serviceCategories}
                      onServiceToggle={handleServiceToggle}
                      onClearAll={() => handleInputChange('serviceIds', [])}
                      formatCurrency={formatVietnameseCurrency}
                    />
                  </div>
                  {errors.serviceIds && (
                    <p className="text-sm text-red-500 mt-2">{errors.serviceIds}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/admin/campaigns/${campaignId}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
           <Button 
                type="submit" 
                disabled={loading || !isEditable || Object.keys(errors).length > 0}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}