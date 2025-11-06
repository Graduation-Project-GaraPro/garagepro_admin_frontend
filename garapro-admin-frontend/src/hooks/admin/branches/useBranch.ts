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

        // const [
        //   managersData, 
        //   techniciansData, 
        //   managersWithoutBranchData, 
        //   techniciansWithoutBranchData, 
        //   categoriesData,
        //   parentCategoriesData
        // ] = await Promise.all([
        //   branchService.getManagers(),
        //   branchService.getTechnicians(),
        //   branchService.getManagersWithoutBranch(),
        //   branchService.getTechniciansWithoutBranch(),
        //   branchService.getServiceCategories(),
        //   branchService.getParentServiceCategoriesForFilter()
        // ])

      const managersData = await branchService.getManagers()
      const techniciansData = await branchService.getTechnicians()
      const managersWithoutBranchData = await branchService.getManagersWithoutBranch()
      const techniciansWithoutBranchData = await branchService.getTechniciansWithoutBranch()
      const categoriesData = await branchService.getServiceCategories()
      const parentCategoriesData = await branchService.getParentServiceCategoriesForFilter()

      setManagers(managersData)
      setTechnicians(techniciansData)
      setManagersWithoutBranch(managersWithoutBranchData)
      setTechniciansWithoutBranch(techniciansWithoutBranchData)
      setCategories(categoriesData)
      setParentCategories(parentCategoriesData)


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

  // Chỉ validate khi shouldValidate thay đổi, không validate khi formData thay đổi
  useEffect(() => {
    if (shouldValidate) {
      const newErrors = validateForm(formData)
      setErrors(newErrors)
    }
  }, [shouldValidate]) // Chỉ phụ thuộc vào shouldValidate

  return errors
}

export const validateForm = (formData: CreateBranchRequest): Record<string, string> => {
  const errors: Record<string, string> = {}
  console.log('va')
  // Validate branchName
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

  // Validate phoneNumber
  if (!formData.phoneNumber?.trim()) {
    errors.phoneNumber = 'Phone number is required'
  } else {
    const phoneNumber = formData.phoneNumber.trim()
    const phoneRegex = /^(0|\+84)(\d{9,10})$/
    if (!phoneRegex.test(phoneNumber)) {
      errors.phoneNumber = 'Phone number is invalid'
    }
  }

  // Validate email
  if (!formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid'
  }

  // Validate street
  if (!formData.street?.trim()) {
    errors.street = 'Street address is required'
  }

  // Validate province
  if (!formData.province?.trim()) {
    errors.province = 'Province is required'
  }

  // Validate commune
  if (!formData.comune?.trim()) {
    errors.comune = 'Commune is required'
  }

  // Validate serviceIds
  if (formData.serviceIds.length === 0) {
    errors.serviceIds = 'At least one service must be selected'
  }

  // Validate operating hours
  const openDays = formData.operatingHours.filter(hour => hour.isOpen)
  const hasOpenDay = openDays.length > 0
  
  if (!hasOpenDay) {
    errors.operatingHours = 'At least one day must be open'
  } else {
    // Check for time errors only on open days
    let firstTimeError: string | null = null
    
    for (const hour of formData.operatingHours) {
      if (hour.isOpen) {
        if (!hour.openTime?.trim()) {
          firstTimeError = `Open time is required for ${getDayName(hour.dayOfWeek)}`
          break
        } else if (!hour.closeTime?.trim()) {
          firstTimeError = `Close time is required for ${getDayName(hour.dayOfWeek)}`
          break
        } else if (hour.openTime >= hour.closeTime) {
          firstTimeError = `Close time must be after open time for ${getDayName(hour.dayOfWeek)}`
          break
        }
      }
    }

    if (firstTimeError) {
      errors.operatingHours = firstTimeError
    }
  }

  return errors
}

// Helper function to get day name
const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || `Day ${dayOfWeek}`
}

