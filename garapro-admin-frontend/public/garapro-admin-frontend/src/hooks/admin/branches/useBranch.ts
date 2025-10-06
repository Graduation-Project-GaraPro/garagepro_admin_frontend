// hooks/admin/branches/useBranch.ts
import { useState, useEffect } from 'react'
import { branchService, CreateBranchRequest, UpdateBranchRequest, Service, User, ServiceCategory, Province, District, Ward } from '@/services/branch-service'
export const useBranchData = () => {
   const [managers, setManagers] = useState<User[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [managersWithoutBranch, setManagersWithoutBranch] = useState<User[]>([])
  const [techniciansWithoutBranch, setTechniciansWithoutBranch] = useState<User[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
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
          categoriesData
        ] = await Promise.all([
          branchService.getManagers(),
          branchService.getTechnicians(),
          branchService.getManagersWithoutBranch(),
          branchService.getTechniciansWithoutBranch(),
          branchService.getServiceCategories()
        ])

        setManagers(managersData)
        setTechnicians(techniciansData)
        setManagersWithoutBranch(managersWithoutBranchData)
        setTechniciansWithoutBranch(techniciansWithoutBranchData)
        setCategories(categoriesData)
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
    loading, 
    error 
  }
}

export const useLocationData = () => {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProvinces = async () => {
    try {
      setLoading(true)
      const data = await branchService.getProvinces()
      setProvinces(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provinces')
    } finally {
      setLoading(false)
    }
  }

  const loadDistricts = async (provinceCode: string) => {
    try {
      setLoading(true)
      const data = await branchService.getDistricts(provinceCode)
      setDistricts(data)
      setWards([]) // Clear wards when province changes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load districts')
    } finally {
      setLoading(false)
    }
  }

  const loadWards = async (districtCode: string) => {
    try {
      setLoading(true)
      const data = await branchService.getWards(districtCode)
      setWards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProvinces()
  }, [])

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

  // useEffect(() => {
  //   if (shouldValidate) {
  //     const newErrors = validateForm(formData)
  //     setErrors(newErrors)
  //   }
  // }, [formData, shouldValidate])

  return errors
}

export const validateForm = (formData: CreateBranchRequest): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!formData.branchName?.trim()) {
    errors.branchName = 'Branch name is required'
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

  // Validate operating hours
  const hasOpenDay = formData.operatingHours.some(hour => hour.isOpen)
  if (!hasOpenDay) {
    errors.operatingHours = 'At least one day must be open'
  }

  return errors
}