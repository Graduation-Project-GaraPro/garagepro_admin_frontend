import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CreateBranchRequest, UpdateBranchRequest } from '@/services/branch-service'
import { useLocationData } from '@/hooks/admin/branches/useBranch'
import { Loader2 } from 'lucide-react'

interface BasicInfoSectionProps {
  formData: CreateBranchRequest | UpdateBranchRequest
  errors: Record<string, string>
  onChange: (field: keyof (CreateBranchRequest | UpdateBranchRequest), value: string) => void
}

export const BasicInfoSection = ({ 
  formData, 
  errors, 
  onChange 
}: BasicInfoSectionProps) => {
  const { 
    provinces, 
    districts, 
    wards, 
    loading, 
    error, 
    loadDistricts, 
    loadWards 
  } = useLocationData()

  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize from form data - chỉ chạy một lần khi provinces được load
  useEffect(() => {
    if (provinces.length === 0 || !isInitializing) return

    const initializeFromFormData = async () => {
      try {
        // Tìm province từ form data
        if (formData.city) {
          const province = provinces.find(p => 
            p.name === formData.city || 
            p.name.toLowerCase().includes(formData.city.toLowerCase())
          )
          
          if (province) {
            setSelectedProvinceCode(province.code)
            await loadDistricts(province.code)
            
            // Sau khi districts được load, tìm district từ form data
            if (formData.district) {
              const district = districts.find(d => 
                d.name === formData.district || 
                d.name.toLowerCase().includes(formData.district.toLowerCase())
              )
              
              if (district) {
                setSelectedDistrictCode(district.code)
                await loadWards(district.code)
              }
            }
          }
        }
      } catch (err) {
        console.error('Error initializing location data:', err)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeFromFormData()
  }, [provinces, formData.city, formData.district, loadDistricts, loadWards, districts, isInitializing])

  // Xử lý khi chọn province
  const handleProvinceChange = useCallback(async (provinceCode: string) => {
    setSelectedProvinceCode(provinceCode)
    
    const province = provinces.find(p => p.code === provinceCode)
    if (province) {
      onChange('city', province.name)
      onChange('district', '')
      onChange('ward', '')
      setSelectedDistrictCode('')
      
      // Load districts cho province mới
      await loadDistricts(provinceCode)
    }
  }, [provinces, onChange, loadDistricts])

  // Xử lý khi chọn district
  const handleDistrictChange = useCallback(async (districtCode: string) => {
    setSelectedDistrictCode(districtCode)
    
    const district = districts.find(d => d.code === districtCode)
    if (district) {
      onChange('district', district.name)
      onChange('ward', '')
      
      // Load wards cho district mới
      await loadWards(districtCode)
    }
  }, [districts, onChange, loadWards])

  // Xử lý khi chọn ward
  const handleWardChange = useCallback((wardCode: string) => {
    const ward = wards.find(w => w.code === wardCode)
    if (ward) {
      onChange('ward', ward.name)
    }
  }, [wards, onChange])

  // Tìm giá trị hiện tại cho dropdowns
  const getCurrentProvinceCode = useCallback(() => {
    // Ưu tiên giá trị đang được chọn
    if (selectedProvinceCode) return selectedProvinceCode
    
    // Nếu không có giá trị đang chọn, tìm từ form data
    if (formData.city) {
      const province = provinces.find(p => 
        p.name === formData.city || 
        p.name.toLowerCase().includes(formData.city.toLowerCase())
      )
      return province?.code || ''
    }
    
    return ''
  }, [selectedProvinceCode, formData.city, provinces])

  const getCurrentDistrictCode = useCallback(() => {
    // Ưu tiên giá trị đang được chọn
    if (selectedDistrictCode) return selectedDistrictCode
    
    // Nếu không có giá trị đang chọn, tìm từ form data
    if (formData.district && selectedProvinceCode) {
      const district = districts.find(d => 
        d.name === formData.district || 
        d.name.toLowerCase().includes(formData.district.toLowerCase())
      )
      return district?.code || ''
    }
    
    return ''
  }, [selectedDistrictCode, formData.district, selectedProvinceCode, districts])

  const getCurrentWardCode = useCallback(() => {
    // Tìm từ form data
    if (formData.ward && selectedDistrictCode) {
      const ward = wards.find(w => 
        w.name === formData.ward || 
        w.name.toLowerCase().includes(formData.ward.toLowerCase())
      )
      return ward?.code || ''
    }
    
    return ''
  }, [formData.ward, selectedDistrictCode, wards])

  const currentProvinceCode = getCurrentProvinceCode()
  const currentDistrictCode = getCurrentDistrictCode()
  const currentWardCode = getCurrentWardCode()

  // Hiển thị loading state trong khi khởi tạo
  if (isInitializing && provinces.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Loading location data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading location data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Provide the essential details for your branch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Branch Name */}
        <div className="space-y-2">
          <Label htmlFor="branchName">Branch Name *</Label>
          <Input
            id="branchName"
            value={formData.branchName}
            onChange={(e) => onChange('branchName', e.target.value)}
            placeholder="e.g., Central Branch"
            className={errors.branchName ? 'border-red-500' : ''}
          />
          {errors.branchName && <p className="text-sm text-red-500">{errors.branchName}</p>}
        </div>

        {/* Address Details */}
        <div className="space-y-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => onChange('street', e.target.value)}
            placeholder="Số nhà, tên đường"
            className={errors.street ? 'border-red-500' : ''}
          />
          {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Province/City */}
          <div className="space-y-2">
            <Label htmlFor="city">Province/City *</Label>
            <Select 
              value={currentProvinceCode}
              onValueChange={handleProvinceChange}
              disabled={loading}
            >
              <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                {loading && provinces.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading provinces...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select Province" />
                )}
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>

          {/* District/Quận */}
          <div className="space-y-2">
            <Label htmlFor="district">District/Quận *</Label>
            <Select 
              value={currentDistrictCode}
              onValueChange={handleDistrictChange}
              disabled={!currentProvinceCode || loading}
            >
              <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading districts...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={currentProvinceCode ? "Select District" : "Select Province First"} />
                )}
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.code} value={district.code}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
          </div>

          {/* Ward/Phường */}
          <div className="space-y-2">
            <Label htmlFor="ward">Ward/Phường *</Label>
            <Select 
              value={currentWardCode}
              onValueChange={handleWardChange}
              disabled={!currentDistrictCode || loading}
            >
              <SelectTrigger className={errors.ward ? 'border-red-500' : ''}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading wards...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={currentDistrictCode ? "Select Ward" : "Select District First"} />
                )}
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.code} value={ward.code}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ward && <p className="text-sm text-red-500">{errors.ward}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => onChange('phoneNumber', e.target.value)}
              placeholder="0123456789"
              className={errors.phoneNumber ? 'border-red-500' : ''}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="branch@garage.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Describe this branch, its services, and any special features..."
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Optional: Provide details about this branch location and services
          </p>
        </div>

        {/* Error message for location data */}
        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {error}. Please refresh the page to try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}