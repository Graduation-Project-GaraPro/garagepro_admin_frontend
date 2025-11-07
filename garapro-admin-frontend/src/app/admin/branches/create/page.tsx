'use client'

import { useState, useCallback, useTransition, memo, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'

import { 
  branchService, 
  CreateBranchRequest, 
  OperatingHour
} from '@/services/branch-service'

// Import components
import { BasicInfoSection } from '@/components/admin/branches/BasicInfoSection'
import { ServicesSection } from '@/components/admin/branches/ServicesSection'
import { StaffSection } from '@/components/admin/branches/StaffSection'
import { OperatingHoursSection } from '@/components/admin/branches/OperatingHoursSection'

// Import hooks and constants
import { useBranchData } from '@/hooks/admin/branches/useBranch'
import { DEFAULT_OPERATING_HOURS } from '@/constants/branch'

const INITIAL_FORM_DATA: CreateBranchRequest = {
  branchName: '',
  phoneNumber: '',
  email: '',
  street: '',
  commune: '',
  province: '',
  description: '',
  serviceIds: [],
  staffIds: [],
  operatingHours: DEFAULT_OPERATING_HOURS,
}

const validateField = (field: string, value: any, formData?: CreateBranchRequest): string => {
  switch (field) {
    case 'branchName':
      if (!value?.trim()) {
        return 'Branch name is required'
      } else {
        const branchName = value.trim()
        if (branchName.length < 2) {
          return 'Branch name must be at least 2 characters long'
        } else if (branchName.length > 200) {
          return 'Branch name cannot exceed 200 characters'
        }
      }
      return ''

    case 'phoneNumber':
      if (!value?.trim()) {
        return 'Phone number is required'
      } else {
        const phoneNumber = value.trim()
        const phoneRegex = /^(0|\+84)(\d{9,10})$/
        if (!phoneRegex.test(phoneNumber)) {
          return 'Phone number is invalid'
        }
      }
      return ''

    case 'email':
      if (!value?.trim()) {
        return 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        return 'Email is invalid'
      }
      return ''

    case 'street':
      if (!value?.trim()) {
        return 'Street address is required'
      }
      return ''

    case 'province':
      if (!value?.trim()) {
        return 'Province is required'
      }
      return ''

    case 'commune':
      if (!value?.trim()) {
        return 'Commune is required'
      }
      return ''

    case 'serviceIds':
      if (formData && formData.serviceIds.length === 0) {
        return 'At least one service must be selected'
      }
      return ''
      
    case 'staffIds':
      if (formData && formData.staffIds.length === 0) {
        return 'At least one staff must be selected'
      }
      return ''
      
    case 'description':
      if (!value?.trim()) {
        return 'Description is required'
      }
      return ''
      
    case 'operatingHours':
      if (formData) {
        const openDays = formData.operatingHours.filter(hour => hour.isOpen)
        const hasOpenDay = openDays.length > 0
        
        if (!hasOpenDay) {
          return 'At least one day must be open'
        } else {
          for (const hour of formData.operatingHours) {
            if (hour.isOpen) {
              if (!hour.openTime?.trim()) {
                return `Open time is required for ${getDayName(hour.dayOfWeek)}`
              } else if (!hour.closeTime?.trim()) {
                return `Close time is required for ${getDayName(hour.dayOfWeek)}`
              } else if (hour.openTime >= hour.closeTime) {
                return `Close time must be after open time for ${getDayName(hour.dayOfWeek)}`
              }
            }
          }
        }
      }
      return ''

    default:
      return ''
  }
}


const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || `Day ${dayOfWeek}`
}

const validateForm = (formData: CreateBranchRequest): Record<string, string> => {
  const errors: Record<string, string> = {}

  const fieldsToValidate = [
    'branchName',
    'phoneNumber', 
    'email',
    'street',
    'province',
    'commune',
    'serviceIds',
    'staffIds',
    'operatingHours',
    'description'
  ]

  fieldsToValidate.forEach(field => {
    const error = validateField(field, formData[field as keyof CreateBranchRequest], formData)
    if (error) {
      errors[field] = error
    }
  })

  return errors
}

const LoadingSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Link href="/admin/branches">
        <Button variant="ghost" size="sm" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Branches
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
        <p className="text-muted-foreground">Loading required data...</p>
      </div>
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
))
LoadingSkeleton.displayName = 'LoadingSkeleton'

const ErrorState = memo(({ error }: { error: string }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Link href="/admin/branches">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Branches
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
        <p className="text-muted-foreground text-red-600">Failed to load required data</p>
      </div>
    </div>
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </CardContent>
    </Card>
  </div>
))
ErrorState.displayName = 'ErrorState'

export default function CreateBranchPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateBranchRequest>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { 
    managers, 
    technicians, 
    managersWithoutBranch, 
    techniciansWithoutBranch, 
    categories, 
    parentCategories,
    loading: dataLoading, 
    error: dataError 
  } = useBranchData()

  const isLoading = isPending || isSubmitting

  // CRITICAL FIX: Sử dụng useCallback với empty deps array
  // Điều này đảm bảo callback không bao giờ thay đổi reference
 


  // THÊM: Memoize formData để tránh re-render không cần thiết


const revalidateFieldIfNeeded = useCallback((
    field: string,
    nextValue: any,
    nextFormData?: CreateBranchRequest
  ) => {
    setErrors(prev => {
      if (!prev[field]) return prev // chỉ re-validate khi field đang có lỗi

      const data = nextFormData ?? formData
      const patched: CreateBranchRequest = { ...data, [field]: nextValue } as any
      const msg = validateField(field, nextValue, patched)

      if (!msg) {
        const { [field]: _, ...rest } = prev
        return rest
      }
      if (msg !== prev[field]) {
        return { ...prev, [field]: msg }
      }
      return prev
    })
  }, [formData])


 const handleInputChange = useCallback((field: string, value: string) => {
  setFormData(prev => {
    if (prev[field as keyof CreateBranchRequest] === value) return prev
    const next = { ...prev, [field]: value }
    // revalidate dựa trên next để tránh stale
    revalidateFieldIfNeeded(field, value, next)
    return next
  })
}, [revalidateFieldIfNeeded])

  const handleOperatingHoursChange = useCallback((
  day: string,
  field: keyof OperatingHour,
  value: string | boolean
) => {
  setFormData(prev => {
    const dayNum = parseInt(day as string)
    const currentHour = prev.operatingHours.find(h => h.dayOfWeek === dayNum)
    if (currentHour && currentHour[field] === value) return prev

    const next: CreateBranchRequest = {
      ...prev,
      operatingHours: prev.operatingHours.map(h =>
        h.dayOfWeek === dayNum ? { ...h, [field]: value } : h
      ),
    }

    // Sau khi có next, nếu đang có lỗi operatingHours -> re-validate
    const msg = validateField('operatingHours', next.operatingHours, next)
    setErrors(prevErr => {
      if (!prevErr.operatingHours) return prevErr
      if (!msg) {
        const { operatingHours, ...rest } = prevErr
        return rest
      }
      if (msg !== prevErr.operatingHours) return { ...prevErr, operatingHours: msg }
      return prevErr
    })

    return next
  })
}, [])

  const handleServiceToggle = useCallback((serviceId: string, selected: boolean) => {
  setFormData(prev => {
    const isSelected = prev.serviceIds.includes(serviceId)
    if (isSelected === selected) return prev

    const nextServiceIds = selected
      ? [...prev.serviceIds, serviceId]
      : prev.serviceIds.filter(id => id !== serviceId)

    const next: CreateBranchRequest = { ...prev, serviceIds: nextServiceIds }

    // clear error dựa trên next
        setErrors(prevErr => {
          if (!prevErr.serviceIds) return prevErr
          if (nextServiceIds.length > 0) {
            const { serviceIds, ...rest } = prevErr
            return rest
          }
          // còn rỗng thì giữ nguyên error
          return prevErr
        })

        return next
      })
    }, [])

  const handleServiceRemove = useCallback((serviceId: string) => {
    setFormData(prev => {
      if (!prev.serviceIds.includes(serviceId)) return prev
      
      return {
        ...prev,
        serviceIds: prev.serviceIds.filter(id => id !== serviceId),
      }
    })
  }, [])

  const handleStaffToggle = useCallback((staffId: string, selected: boolean) => {
  setFormData(prev => {
    const isSelected = prev.staffIds.includes(staffId)
    if (isSelected === selected) return prev

    const nextStaffIds = selected
      ? [...prev.staffIds, staffId]
      : prev.staffIds.filter(id => id !== staffId)

    const next: CreateBranchRequest = { ...prev, staffIds: nextStaffIds }

    setErrors(prevErr => {
      if (!prevErr.staffIds) return prevErr
      if (nextStaffIds.length > 0) {
        const { staffIds, ...rest } = prevErr
        return rest
      }
      return prevErr
    })

    return next
  })
}, [])


  const handleStaffRemove = useCallback((staffId: string) => {
    setFormData(prev => {
      if (!prev.staffIds.includes(staffId)) return prev
      
      return {
        ...prev,
        staffIds: prev.staffIds.filter(id => id !== staffId),
      }
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formErrors = validateForm(formData)
    console.log("error", formErrors)
    setErrors(formErrors)
    
    if (Object.keys(formErrors).length > 0) {
      const firstErrorField = Object.keys(formErrors)[0]
      const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                     document.querySelector(`[id="${firstErrorField}"]`)
      if (element) {
        (element as HTMLElement).focus()
      }
      
      toast.error('Please fix the validation errors before submitting')
      return
    }

    setIsSubmitting(true)
    
    try {
      await branchService.createBranch(formData)
      toast.success('Branch created successfully.')
      
      startTransition(() => {
        setTimeout(() => {
          router.push('/admin/branches')
        }, 1000)
      })
    } catch (error) {
      console.error('Failed to create branch:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create branch. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, router])

  if (dataLoading) return <LoadingSkeleton />
  if (dataError) return <ErrorState error={dataError} />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
          <p className="text-muted-foreground">
            Set up a new garage branch with location, services, and staff
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection
          branchName={formData.branchName}
          phoneNumber={formData.phoneNumber}
          email={formData.email}
          street={formData.street}
          commune={formData.commune}
          province={formData.province}
          description={formData.description}
          errors={errors}
          onChange={handleInputChange}
        />

        <ServicesSection
          selectedServiceIds={formData.serviceIds}
          categories={categories}
          parentCategories={parentCategories}
          onServiceToggle={handleServiceToggle}
          onServiceRemove={handleServiceRemove}
          errors={{ serviceIds: errors.serviceIds }}
        />

        <StaffSection
          selectedStaffIds={formData.staffIds}
          managers={managers}
          technicians={technicians}
          managersWithoutBranch={managersWithoutBranch}
          techniciansWithoutBranch={techniciansWithoutBranch}
         
          onStaffToggle={handleStaffToggle}
          onStaffRemove={handleStaffRemove}
          errors={{ staffIds: errors.staffIds }}
          />

        <OperatingHoursSection
          operatingHours={formData.operatingHours}
          onOperatingHoursChange={handleOperatingHoursChange}
          error={errors.operatingHours}
        />

        <div className="flex justify-end gap-4">
          <Link href="/admin/branches">
            <Button variant="outline" type="button" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Branch
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}