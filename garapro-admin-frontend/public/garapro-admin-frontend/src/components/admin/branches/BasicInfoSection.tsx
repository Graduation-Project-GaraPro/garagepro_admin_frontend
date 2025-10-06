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
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use refs to track initialization state
  const initializedRef = useRef(false)
  const prevProvinceCodeRef = useRef('')
  const prevDistrictCodeRef = useRef('')

  // Initialize only once when provinces are loaded and form data is available
  useEffect(() => {
    if (initializedRef.current || provinces.length === 0 || !formData.city) return

    const initializeLocation = async () => {
      try {
        // Find province by exact name match first, then partial match
        const province = provinces.find(p => p.name === formData.city) || 
                        provinces.find(p => p.name.toLowerCase().includes(formData.city.toLowerCase()))
        
        if (province) {
          setSelectedProvinceCode(province.code)
          prevProvinceCodeRef.current = province.code
          
          // Load districts for the province
          await loadDistricts(province.code)
          
          // Wait a bit for districts to load, then find district
          setTimeout(() => {
            if (formData.district) {
              const district = districts.find(d => d.name === formData.district) || 
                              districts.find(d => d.name.toLowerCase().includes(formData.district.toLowerCase()))
              
              if (district) {
                setSelectedDistrictCode(district.code)
                prevDistrictCodeRef.current = district.code
                
                // Load wards for the district
                loadWards(district.code)
              }
            }
            initializedRef.current = true
            setIsInitialized(true)
          }, 300)
        } else {
          initializedRef.current = true
          setIsInitialized(true)
        }
      } catch (err) {
        console.error('Error initializing location:', err)
        initializedRef.current = true
        setIsInitialized(true)
      }
    }

    initializeLocation()
  }, [provinces, formData.city, formData.district, loadDistricts, loadWards, districts])

  // Load districts when province is manually changed (after initialization)
  useEffect(() => {
    if (isInitialized && selectedProvinceCode && selectedProvinceCode !== prevProvinceCodeRef.current) {
      prevProvinceCodeRef.current = selectedProvinceCode
      loadDistricts(selectedProvinceCode)
      
      // Reset district and ward
      onChange('district', '')
      onChange('ward', '')
      setSelectedDistrictCode('')
    }
  }, [selectedProvinceCode, isInitialized, loadDistricts, onChange])

  // Load wards when district is manually changed (after initialization)
  useEffect(() => {
    if (isInitialized && selectedDistrictCode && selectedDistrictCode !== prevDistrictCodeRef.current) {
      prevDistrictCodeRef.current = selectedDistrictCode
      loadWards(selectedDistrictCode)
      
      // Reset ward
      onChange('ward', '')
    }
  }, [selectedDistrictCode, isInitialized, loadWards, onChange])

  const handleProvinceChange = useCallback((provinceCode: string) => {
    if (!isInitialized) return
    
    setSelectedProvinceCode(provinceCode)
    const province = provinces.find(p => p.code === provinceCode)
    if (province) {
      onChange('city', province.name)
    }
  }, [provinces, onChange, isInitialized])

  const handleDistrictChange = useCallback((districtCode: string) => {
    if (!isInitialized) return
    
    setSelectedDistrictCode(districtCode)
    const district = districts.find(d => d.code === districtCode)
    if (district) {
      onChange('district', district.name)
    }
  }, [districts, onChange, isInitialized])

  const handleWardChange = useCallback((wardCode: string) => {
    if (!isInitialized) return
    
    const ward = wards.find(w => w.code === wardCode)
    if (ward) {
      onChange('ward', ward.name)
    }
  }, [wards, onChange, isInitialized])

  // Get current values for dropdowns
  const getCurrentProvinceCode = () => {
    if (selectedProvinceCode) return selectedProvinceCode
    
    // Try to find province from form data
    const province = provinces.find(p => p.name === formData.city) || 
                    provinces.find(p => p.name.toLowerCase().includes(formData.city?.toLowerCase() || ''))
    return province?.code || ''
  }

  const getCurrentDistrictCode = () => {
    if (selectedDistrictCode) return selectedDistrictCode
    
    // Try to find district from form data
    const district = districts.find(d => d.name === formData.district) || 
                    districts.find(d => d.name.toLowerCase().includes(formData.district?.toLowerCase() || ''))
    return district?.code || ''
  }

  const getCurrentWardCode = () => {
    // Try to find ward from form data
    const ward = wards.find(w => w.name === formData.ward) || 
                wards.find(w => w.name.toLowerCase().includes(formData.ward?.toLowerCase() || ''))
    return ward?.code || ''
  }

  const currentProvinceCode = getCurrentProvinceCode()
  const currentDistrictCode = getCurrentDistrictCode()
  const currentWardCode = getCurrentWardCode()

  // Show loading state during initialization
  if (!isInitialized && provinces.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Loading location data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Initializing location data...</span>
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
                {loading ? (
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
            {formData.city && !currentProvinceCode && (
              <p className="text-sm text-orange-600">
                Current: {formData.city}
              </p>
            )}
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
                    <span>Loading...</span>
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
            {formData.district && !currentDistrictCode && (
              <p className="text-sm text-orange-600">
                Current: {formData.district}
              </p>
            )}
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
                    <span>Loading...</span>
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
            {formData.ward && !currentWardCode && (
              <p className="text-sm text-orange-600">
                Current: {formData.ward}
              </p>
            )}
          </div>
        </div>

        {/* Rest of the form remains the same */}
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

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Describe this branch, its services, and any special features..."
            rows={3}
          />
        </div>

        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}