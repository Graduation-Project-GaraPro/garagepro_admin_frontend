// hooks/admin/branches/useBranch.ts
import { useState, useEffect } from 'react'
import { branchService, CreateBranchRequest, Service, ServiceCategory, User } from '@/services/branch-service'

export const useBranchData = () => {
  const [managers, setManagers] = useState<User[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [managersData, techniciansData, categoriesData] = await Promise.all([
          branchService.getManagers(),
          branchService.getTechnicians(),
          branchService.getServiceCategories()
        ])

        setManagers(managersData)
        setTechnicians(techniciansData)
        setCategories(categoriesData)
        
        // Extract all services from categories
        const allServices = categoriesData.flatMap(category => category.services)
        setServices(allServices)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { managers, technicians, services, categories, loading, error }
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