'use client'

import { useEffect, useState, useCallback, useMemo, useDeferredValue } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Calendar, DollarSign, Percent, Banknote, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { campaignService, UpdateCampaignRequest, PromotionalCampaign, ServiceCategory } from '@/services/campaign-service'
import  ServiceCategoryList  from '@/components/admin/campaigns/service-category-list'
import  FilterSection  from '@/components/admin/campaigns/filter-section-service'
import  SelectedServicesSummary  from '@/components/admin/campaigns/selected-services-summary'
import debounce from 'lodash.debounce'

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
    maximumDiscount: 0, // 0 = unlimited khi percentage
    usageLimit: 0, // 0 = unlimited
    serviceIds: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [parentCategories, setParentCategories] = useState<ServiceCategory[]>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('all')

  // Debounce tìm kiếm dịch vụ
  const [rawSearch, setRawSearch] = useState<string>('')
  const deferredSearch = useDeferredValue(rawSearch)

  const [isActiveFilter, setIsActiveFilter] = useState<boolean>(true)

  const [touchedFields, setTouchedFields] = useState({
    discountValue: false,
    minimumOrderValue: false,
    maximumDiscount: false,
  })

  const [displayValues, setDisplayValues] = useState({
    discountValue: '',
    minimumOrderValue: '',
    maximumDiscount: '',
  })

  // ---------- Helpers ----------
  const formatNumber = (value: number | undefined): string => {
    if (!value || value === 0) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const formatVietnameseCurrency = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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

  // ---------- Load services (debounced) ----------
  const loadServices = useCallback(async () => {
    try {
      setServicesLoading(true)
      const categoriesData = await campaignService.getServicesByFilter({
        parentServiceCategoryId: selectedParentCategory === 'all' ? undefined : selectedParentCategory,
        searchTerm: deferredSearch || undefined,
        isActive: isActiveFilter
      })
      setServiceCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load services:', error)
      toast.error('Failed to load services. Please try again.')
    } finally {
      setServicesLoading(false)
    }
  }, [selectedParentCategory, deferredSearch, isActiveFilter])

  useEffect(() => {
    const run = debounce(loadServices, 300)
    run()
    return () => run.cancel()
  }, [loadServices])

  // ---------- Initial load ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true)
        setErrors({})

        if (!campaignId) {
          setErrors({ load: 'Campaign ID is missing' })
          return
        }

        const parentCategoriesData = await campaignService.getParentCategories()
        setParentCategories(parentCategoriesData)

        const campaignData = await campaignService.getCampaignById(campaignId)
        if (!campaignData) {
          setErrors({ load: 'Campaign not found' })
          return
        }
        setCampaign(campaignData)

        // kiểm tra editable
        const today = new Date()
        const endDate = campaignData?.endDate ? new Date(campaignData.endDate) : null
        const hasUsage = campaignData.usedCount > 0
        const isExpired = endDate && endDate < today

        if (hasUsage || isExpired) {
          setIsEditable(false)
          if (hasUsage) toast.error('This campaign cannot be edited because it has been used in orders.')
          else if (isExpired) toast.error('This campaign cannot be edited because it has expired.')
        }

        // init form
        setFormData({
          name: campaignData.name || '',
          description: campaignData.description || '',
          type: campaignData.type || 'discount',
          discountType: campaignData.discountType.toString() || 'percentage',
          discountValue: campaignData.discountValue || 0,
          startDate: campaignData.startDate ? new Date(campaignData.startDate).toLocaleDateString('en-CA') : '',
          endDate: campaignData.endDate ? new Date(campaignData.endDate).toLocaleDateString('en-CA') : '',
          isActive: campaignData.isActive ?? true,
          minimumOrderValue: campaignData.minimumOrderValue || 0,
          maximumDiscount: campaignData.maximumDiscount || 0, // 0 = unlimited
          usageLimit: campaignData.usageLimit || 0, // 0 = unlimited
          serviceIds: campaignData.services?.map(s => s.serviceId) || [],
        })

        // init display
        if (campaignData.discountValue > 0) {
          const formatted = campaignData.discountType.toString() === 'percentage'
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

    if (campaignId) loadData()
  }, [campaignId])

  // Clear error maximumDiscount khi đổi sang fixed (field ẩn)
  useEffect(() => {
    if (formData.discountType !== 'percentage') {
      setErrors(prev => {
        if (!prev.maximumDiscount) return prev
        const { maximumDiscount, ...rest } = prev
        return rest
      })
      setDisplayValues(prev => ({ ...prev, maximumDiscount: '' }))
    }
  }, [formData.discountType])

  // ---------- Form change helpers ----------
  const handleInputChange = useCallback((field: keyof UpdateCampaignRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // clear error của chính field
    setErrors(prev => (prev[field] ? (() => {
      const { [field]: _, ...rest } = prev
      return rest
    })() : prev))

    // clear maximumDiscount lỗi khi chuyển loại
    if (field === 'discountType' && value !== 'percentage') {
      setErrors(prev => {
        if (!prev.maximumDiscount) return prev
        const { maximumDiscount, ...rest } = prev
        return rest
      })
    }
  }, [])

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    const current = formData.serviceIds || []
    handleInputChange(
      'serviceIds',
      checked ? [...current, serviceId] : current.filter(id => id !== serviceId)
    )
  }

  const markFieldAsTouched = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  // ---------- Money/percent inputs ----------
  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '')
    const numeric = raw.trim() === '' ? 0 : Number.isNaN(parseFloat(raw)) ? 0 : parseFloat(raw)

    const display = formData.discountType === 'percentage'
      ? raw
      : formatNumber(numeric)

    setDisplayValues(prev => ({ ...prev, discountValue: display }))
    handleInputChange('discountValue', numeric)
  }

  const handleDiscountValueBlur = () => {
    markFieldAsTouched('discountValue')

    if ((formData.discountValue ?? 0)  > 0) {
      const formatted = formData.discountType === 'percentage'
        ? (formData.discountValue ?? 0).toString() 
        : formatNumber(formData.discountValue)
      setDisplayValues(prev => ({ ...prev, discountValue: formatted }))
    } else {
      setDisplayValues(prev => ({ ...prev, discountValue: '' }))
    }

    validateForm()
  }

  const handleMinimumOrderValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '')
    const numeric = raw.trim() === '' ? 0 : Number.isNaN(parseFloat(raw)) ? 0 : parseFloat(raw)
    setDisplayValues(prev => ({ ...prev, minimumOrderValue: formatNumber(numeric) }))
    handleInputChange('minimumOrderValue', numeric)
  }

  const handleMinimumOrderValueBlur = () => {
    markFieldAsTouched('minimumOrderValue')
    if (formData.minimumOrderValue && formData.minimumOrderValue > 0) {
      setDisplayValues(prev => ({ ...prev, minimumOrderValue: formatNumber(formData.minimumOrderValue) }))
    } else {
      setDisplayValues(prev => ({ ...prev, minimumOrderValue: '' }))
    }
    validateForm()
  }

  const handleMaximumDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '')
    const numeric = raw.trim() === '' ? 0 : Number.isNaN(parseFloat(raw)) ? 0 : parseFloat(raw)
    setDisplayValues(prev => ({ ...prev, maximumDiscount: formatNumber(numeric) }))
    handleInputChange('maximumDiscount', numeric)
  }

  const handleMaximumDiscountBlur = () => {
    markFieldAsTouched('maximumDiscount')

    // rỗng => coi như 0 (unlimited)
    if (!displayValues.maximumDiscount || formData.maximumDiscount === 0) {
      setDisplayValues(prev => ({ ...prev, maximumDiscount: '' }))
      if (formData.maximumDiscount !== 0) {
        setFormData(prev => ({ ...prev, maximumDiscount: 0 }))
      }
    } else if ((formData.maximumDiscount ?? 0) > 0) {
      setDisplayValues(prev => ({ ...prev, maximumDiscount: formatNumber(formData.maximumDiscount) }))
    }

    validateForm()
  }

  // ---------- Validation ----------
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const todayStr = new Date().toISOString().split('T')[0]

    // Required text
    if (!formData.name?.trim()) newErrors.name = 'Campaign name is required'
    if (!formData.description?.trim()) newErrors.description = 'Description is required'
    if (!formData.type) newErrors.type = 'Campaign type is required'
    if (!formData.discountType) newErrors.discountType = 'Discount type is required'

    // Discount value (required)
    if (touchedFields.discountValue) {
      if (formData.discountType === 'percentage') {
        if (!formData.discountValue || Number.isNaN(formData.discountValue)) {
          newErrors.discountValue = 'Please enter a percentage discount (1–100)'
        } else if (formData.discountValue < 1 || formData.discountValue > 100) {
          newErrors.discountValue = 'Percentage must be between 1 and 100'
        }
      } else {
        if (!formData.discountValue || Number.isNaN(formData.discountValue)) {
          newErrors.discountValue = 'Please enter a discount amount ≥ 1.000đ'
        } else if (formData.discountValue < 1000) {
          newErrors.discountValue = 'Discount value must be ≥ 1.000đ'
        }
      }
    }

    // Dates
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be greater than start date'
      }
      if (new Date(formData.endDate) < new Date(todayStr)) {
        newErrors.endDate = 'End date cannot be in the past'
      }
    }

    if (
      campaign &&
      formData.startDate && // 👈 thêm dòng này để đảm bảo không undefined
      formData.startDate !== campaign.startDate?.split('T')[0]
    ) {
        const originalStartCA = campaign.startDate
          ? new Date(campaign.startDate).toLocaleDateString("en-CA")
          : null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newStart = new Date(formData.startDate); 
        newStart.setHours(0, 0, 0, 0);

        if (newStart < today && formData.startDate !== originalStartCA) {
          newErrors.startDate = "Cannot change start date to a past date";
        }
      }
    // isActive cannot be true if expired
    if (formData.isActive && formData.endDate && new Date(formData.endDate) < new Date(todayStr)) {
      newErrors.isActive = 'Cannot activate a campaign that has already expired'
    }

    // Services
    if (!formData.serviceIds || formData.serviceIds.length === 0) {
      newErrors.serviceIds = 'At least one service is required'
    }

    // Numbers
    if (touchedFields.minimumOrderValue) {
        const mov = formData.minimumOrderValue ?? 0;

        if (mov !== 0) {
          if (mov < 1000) {
            newErrors.minimumOrderValue =
              'Minimum order value must be ≥ 1.000đ (or leave blank for no requirement)';
          } else if (mov % 1000 !== 0) {
            newErrors.minimumOrderValue =
              'Minimum order value must be in increments of 1.000đ (1.000, 2.000, 3.000...)';
          }
        }
      }

    // Maximum discount: chỉ áp dụng khi percentage; 0/rỗng = unlimited; >0 thì ≥ 1000
    if (formData.discountType === 'percentage' && touchedFields.maximumDiscount) {
      const md = formData.maximumDiscount ?? 0
      if (md !== 0 && md < 1000) {
        newErrors.maximumDiscount = 'Maximum discount must be ≥ 1.000đ (or 0 = unlimited)'
      }
    } else {
      // nếu fixed thì xoá lỗi cũ (nếu còn)
      if (errors.maximumDiscount) {
        // sẽ được effect phía trên xử lý; giữ an toàn:
        const { maximumDiscount, ...rest } = errors
        setErrors(rest)
      }
    }

    // Usage limit: 0 = unlimited; chỉ lỗi nếu < 0
    if ((formData.usageLimit ?? 0) < 0 ) {
      newErrors.usageLimit = 'Usage limit must be ≥ 0 (0 = unlimited)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // đánh dấu các field blur-validate
    setTouchedFields(prev => ({
      ...prev,
      discountValue: true,
      minimumOrderValue: true,
      maximumDiscount: true,
    }))

    if (!validateForm()) {
      toast.error('Please check the form for errors')
      return
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        setLoading(true)
        setErrors({})

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
        setTimeout(() => router.push('/admin/campaigns'), 1000)
        return 'Campaign updated successfully!'
      },
      error: (error) => error.message || 'Failed to update campaign',
    })
  }

  // ---------- UI states ----------
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
                  This campaign {campaign?.usedCount > 0 ? 'has been used in orders' : 'has expired'} and cannot be modified.
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
                      <SelectItem value="fixed">Fixed Amount (₫)</SelectItem>
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
                      className={`pl-10 ${errors.minimumOrderValue ? 'border-red-500' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty if no minimum order requirement
                  </p>
                  {errors.minimumOrderValue && <p className="text-sm text-red-500">{errors.minimumOrderValue}</p>}
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
                        className={`pl-10 ${errors.maximumDiscount ? 'border-red-500' : ''}`}
                        placeholder="100.000 (0 = unlimited)"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum amount for percentage discounts (0 = unlimited)
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
                  value={formData.usageLimit}
                  onChange={(e) =>
                    handleInputChange(
                      'usageLimit',
                      Number.isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
                    )
                  }
                  onBlur={() => validateForm()}
                  placeholder="0 = unlimited"
                  className={errors.usageLimit ? 'border-red-500' : ''}
                />
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
                      onBlur={() => validateForm()}
                      className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
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
                      onBlur={() => validateForm()}
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
                searchTerm={rawSearch}
                onSearchTermChange={setRawSearch}
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
              disabled={loading || !isEditable}
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
