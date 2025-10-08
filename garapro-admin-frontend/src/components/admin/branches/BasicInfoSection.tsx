import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [selectedWardCode, setSelectedWardCode] = useState('')
  
  const initializedRef = useRef(false)

  // Unified initialization logic
  useEffect(() => {
    if (initializedRef.current || provinces.length === 0) return
    
    const initializeLocationData = async () => {
      try {
        // Initialize province
        if (formData.city) {
          const province = provinces.find(p => 
            p.name === formData.city || 
            p.name.toLowerCase().includes(formData.city.toLowerCase())
          )
          
          if (province) {
            setSelectedProvinceCode(province.code)
            
            // Load and initialize district
            const districtData = await loadDistricts(province.code)
            
            if (formData.district && districtData) {
              const district = districtData.find(d => 
                d.name === formData.district || 
                d.name.toLowerCase().includes(formData.district.toLowerCase())
              )
              
              if (district) {
                setSelectedDistrictCode(district.code)
                
                // Load and initialize ward
                const wardData = await loadWards(district.code)
                
                if (formData.ward && wardData) {
                  const ward = wardData.find(w => 
                    w.name === formData.ward || 
                    w.name.toLowerCase().includes(formData.ward.toLowerCase())
                  )
                  
                  if (ward) {
                    setSelectedWardCode(ward.code)
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error initializing location data:', err)
      } finally {
        initializedRef.current = true
      }
    }

    initializeLocationData()
  }, [provinces, formData.city, formData.district, formData.ward, loadDistricts, loadWards])

  // Handle province change
  const handleProvinceChange = useCallback(async (provinceCode: string) => {
    const province = provinces.find(p => p.code === provinceCode)
    if (!province) return

    setSelectedProvinceCode(provinceCode)
    setSelectedDistrictCode('')
    setSelectedWardCode('')
    
    onChange('city', province.name)
    onChange('district', '')
    onChange('ward', '')
    
    await loadDistricts(provinceCode)
  }, [provinces, onChange, loadDistricts])

  // Handle district change
  const handleDistrictChange = useCallback(async (districtCode: string) => {
    const district = districts.find(d => d.code === districtCode)
    if (!district) return

    setSelectedDistrictCode(districtCode)
    setSelectedWardCode('')
    
    onChange('district', district.name)
    onChange('ward', '')
    
    await loadWards(districtCode)
  }, [districts, onChange, loadWards])

  // Handle ward change
  const handleWardChange = useCallback((wardCode: string) => {
    const ward = wards.find(w => w.code === wardCode)
    if (!ward) return

    setSelectedWardCode(wardCode)
    onChange('ward', ward.name)
  }, [wards, onChange])

  // Show loading during initialization
  if (!initializedRef.current && provinces.length > 0 && formData.city) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Loading location data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Initializing location data...</span>
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
              value={selectedProvinceCode}
              onValueChange={handleProvinceChange}
              disabled={loading}
            >
              <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                {loading && provinces.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
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
              value={selectedDistrictCode}
              onValueChange={handleDistrictChange}
              disabled={!selectedProvinceCode || loading}
            >
              <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
                {loading && selectedProvinceCode ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={selectedProvinceCode ? "Select District" : "Select Province First"} />
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
              value={selectedWardCode}
              onValueChange={handleWardChange}
              disabled={!selectedDistrictCode || loading}
            >
              <SelectTrigger className={errors.ward ? 'border-red-500' : ''}>
                {loading && selectedDistrictCode ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={selectedDistrictCode ? "Select Ward" : "Select District First"} />
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

        {/* Error message */}
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