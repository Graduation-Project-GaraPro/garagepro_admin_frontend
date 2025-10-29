// hooks/admin/branches/useBranch.ts
import { useState, useEffect ,useCallback} from 'react'
import { branchService, CreateBranchRequest, UpdateBranchRequest, Service, User, ServiceCategory, Province, District, Ward } from '@/services/branch-service'
export const useBranchData = () => {
   const [managers, setManagers] = useState<User[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [managersWithoutBranch, setManagersWithoutBranch] = useState<User[]>([])
  const [techniciansWithoutBranch, setTechniciansWithoutBranch] = useState<User[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
   const [parentCategories, setParentCategories] = useState<ServiceCategory[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          managersData, 
          techniciansData, 
          managersWithoutBranchData, 
          techniciansWithoutBranchData, 
          categoriesData,
          parentCategoriesData
        ] = await Promise.all([
          branchService.getManagers(),
          branchService.getTechnicians(),
          branchService.getManagersWithoutBranch(),
          branchService.getTechniciansWithoutBranch(),
          branchService.getServiceCategories(),
          branchService.getParentServiceCategoriesForFilter()
        ])

        setManagers(managersData)
        setTechnicians(techniciansData)
        setManagersWithoutBranch(managersWithoutBranchData)
        setTechniciansWithoutBranch(techniciansWithoutBranchData)
        setCategories(categoriesData)
        setParentCategories(parentCategoriesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { 
    managers, 
    technicians, 
    managersWithoutBranch, 
    techniciansWithoutBranch, 
    categories,
    parentCategories,
    loading, 
    error 
  }
}

// hooks/admin/branches/useBranch.ts
export const useLocationData = () => {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProvinces = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await branchService.getProvinces()
      setProvinces(data)
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load provinces'
      setError(msg)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDistricts = useCallback(async (provinceCode: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await branchService.getDistricts(provinceCode)
      setDistricts(data)
      setWards([])
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load districts'
      setError(msg)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWards = useCallback(async (districtCode: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await branchService.getWards(districtCode)
      setWards(data)
      return data
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load wards'
      setError(msg)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProvinces()
  }, [loadProvinces])

  return {
    provinces,
    districts,
    wards,
    loading,
    error,
    loadDistricts,
    loadWards
  }
}


export const useFormValidation = (formData: CreateBranchRequest, shouldValidate: boolean) => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (shouldValidate) {
      const newErrors = validateForm(formData)
      setErrors(newErrors)
    }
  }, [formData, shouldValidate])

  return errors
}

export const validateForm = (formData: CreateBranchRequest): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!formData.branchName?.trim()) {
    errors.branchName = 'Branch name is required'
  } else {
    const branchName = formData.branchName.trim()
    if (branchName.length < 2) {
      errors.branchName = 'Branch name must be at least 2 characters long'
    } else if (branchName.length > 200) {
      errors.branchName = 'Branch name cannot exceed 200 characters'
    }
  }

  if (!formData.phoneNumber?.trim()) {
    errors.phoneNumber = 'Phone number is required'
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid'
  }

  if (!formData.street?.trim()) {
    errors.street = 'Street is required'
  }

  if (!formData.ward?.trim()) {
    errors.ward = 'Ward is required'
  }

  if (!formData.district?.trim()) {
    errors.district = 'District is required'
  }

  if (!formData.city?.trim()) {
    errors.city = 'City is required'
  }

  // Validate serviceIds - thêm validate cho services
  if (formData.serviceIds.length === 0) {
    errors.serviceIds = 'At least one service must be selected'
  }

  // Validate staffIds - thêm validate cho staff
  // if (formData.staffIds.length === 0) {
  //   errors.staffIds = 'At least one staff member must be assigned'
  // }

  // Validate operating hours
  const openDays = formData.operatingHours.filter(hour => hour.isOpen)
  const hasOpenDay = openDays.length > 0
  console.log(hasOpenDay)
  if (!hasOpenDay) {
    errors.operatingHours = 'At least one day must be open'
  }

  if (hasOpenDay) {
    let hasTimeError = false
    const timeErrors: string[] = []

    formData.operatingHours.forEach(hour => {
      if (hour.isOpen) {
        if (!hour.openTime?.trim()) {
          hasTimeError = true
          timeErrors.push(`Open time is required for ${getDayName(hour.dayOfWeek)}`)
        }
        if (!hour.closeTime?.trim()) {
          hasTimeError = true
          timeErrors.push(`Close time is required for ${getDayName(hour.dayOfWeek)}`)
        }
      }
    })

    if (hasTimeError && timeErrors.length > 0) {
      // Chỉ hiển thị lỗi đầu tiên để tránh quá nhiều thông báo
      errors.operatingHours = timeErrors[0]
    }
  }
  

  return errors
}

// Helper function to get day name
const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || `Day ${dayOfWeek}`
}