'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'

import {
  branchService,
  GarageBranch,
  OperatingHour,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@/services/branch-service'

import { BasicInfoSection } from '@/components/admin/branches/BasicInfoSection'
import { ServicesSection } from '@/components/admin/branches/ServicesSection'
import { StaffSection } from '@/components/admin/branches/StaffSection'
import { OperatingHoursSection } from '@/components/admin/branches/OperatingHoursSection'

import { useBranchData } from '@/hooks/admin/branches/useBranch'
import { DEFAULT_OPERATING_HOURS } from '@/constants/branch'

type BranchFormMode = 'create' | 'edit'

type BranchFormValues = {
  branchId?: string
  branchName: string
  phoneNumber: string
  email: string
  street: string
  commune: string
  province: string
  description: string
  isActive?: boolean
  serviceIds: string[]
  staffIds: string[]
  operatingHours: OperatingHour[]
  arrivalWindowMinutes: number
  maxBookingsPerWindow: number
  
}

const INITIAL_FORM_DATA: BranchFormValues = {
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
  arrivalWindowMinutes: 30,
  maxBookingsPerWindow: 6

}

const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || `Day ${dayOfWeek}`
}

const validateField = (
  mode: BranchFormMode,
  field: string,
  value: any,
  formData?: BranchFormValues
): string => {
  switch (field) {
    case 'branchName': {
      const v = value?.trim()
      if (!v) return 'Branch name is required'
      if (v.length < 2) return 'Branch name must be at least 2 characters long'
      if (v.length > 200) return 'Branch name cannot exceed 200 characters'
      return ''
    }
    case 'phoneNumber': {
      const v = value?.trim()
      if (!v) return 'Phone number is required'
      const phoneRegex = /^(0|\+84)(\d{9,10})$/
      if (!phoneRegex.test(v)) return 'Phone number is invalid'
      return ''
    }
    case 'email': {
      const v = value?.trim()
      if (!v) return 'Email is required'
      if (!/\S+@\S+\.\S+/.test(v)) return 'Email is invalid'
      return ''
    }
    case 'street': {
      const v = value?.trim()
      if (!v) return 'Street address is required'
      return ''
    }
    case 'province': {
      const v = value?.trim()
      if (!v) return 'Province is required'
      return ''
    }
    case 'commune': {
      const v = value?.trim()
      if (!v) return 'Commune is required'
      return ''
    }
    case 'serviceIds': {
      if (formData && formData.serviceIds.length === 0) {
        return 'At least one service must be selected'
      }
      return ''
    }
    case 'staffIds': {
      // Nếu chỉ muốn bắt buộc staff khi create:
      if ( formData && formData.staffIds.length === 0) {
        return 'At least one staff must be selected'
      }
      return ''
    }
    case 'description': {
      const v = value?.trim()
      if (!v) return 'Description is required'
      return ''
    }
    case 'operatingHours': {
      if (formData) {
        const openDays = formData.operatingHours.filter(h => h.isOpen)
        if (openDays.length === 0) return 'At least one day must be open'
        for (const hour of formData.operatingHours) {
          if (hour.isOpen) {
            if (!hour.openTime?.trim()) return `Open time is required for ${getDayName(hour.dayOfWeek)}`
            if (!hour.closeTime?.trim()) return `Close time is required for ${getDayName(hour.dayOfWeek)}`
            if (hour.openTime >= hour.closeTime) {
              return `Close time must be after open time for ${getDayName(hour.dayOfWeek)}`
            }
          }
        }
      }
      return ''
    }
    case 'arrivalWindowMinutes':
      if (value === undefined || value === null) {
        return 'Arrival window minutes is required'
      }
      if (value < 1) {
        return 'Arrival window minutes must be at least 1'
      }
      if (value % 30 !== 0) {
        return 'Arrival window minutes must be in increments of 30'
      }
      return ''
    case 'maxBookingsPerWindow':
      if (value === undefined || value === null) {
        return 'Maximum bookings per window is required'
      }
      if (value < 1) {
        return 'Maximum bookings per window must be at least 1'
      }
      return ''
    
    default:
      return ''
  }
}

const validateForm = (mode: BranchFormMode, formData: BranchFormValues): Record<string, string> => {
  const fields: string[] = [
    'branchName',
    'phoneNumber',
    'email',
    'street',
    'province',
    'commune',
    'serviceIds',
    'staffIds',
    'operatingHours',
    'description',
    'arrivalWindowMinutes',
    'maxBookingsPerWindow'
    
  ]

  const errors: Record<string, string> = {}

  fields.forEach(field => {
    const err = validateField(mode, field, (formData as any)[field], formData)
    if (err) errors[field] = err
  })
  return errors
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" disabled>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Branches
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loading branch...</h1>
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
)

const ErrorState = ({ message }: { message: string }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Link href="/admin/branches">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Branches
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branch</h1>
        <p className="text-muted-foreground text-red-600">Failed to load data</p>
      </div>
    </div>
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-red-500 mb-4">{message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </CardContent>
    </Card>
  </div>
)

interface BranchFormProps {
  mode: BranchFormMode
  branchId?: string // required nếu mode === 'edit'
}

export default function BranchForm({ mode, branchId }: BranchFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<BranchFormValues | null>(
    mode === 'create' ? INITIAL_FORM_DATA : null
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingBranch, setLoadingBranch] = useState(mode === 'edit')
  const [branchError, setBranchError] = useState<string | null>(null)
  const [currentBranchStaffIds, setCurrentBranchStaffIds] = useState<string[]>([])


  const {
    managers,
    technicians,
    managersWithoutBranch,
    techniciansWithoutBranch,
    categories,
    parentCategories,
    loading: dataLoading,
    error: dataError,
  } = useBranchData()

  // Load branch khi edit
  useEffect(() => {
    if (mode !== 'edit' || !branchId) return

    const loadBranch = async () => {
      try {
        setLoadingBranch(true)
        const b: GarageBranch = await branchService.getBranchById(branchId)

        const updateData: BranchFormValues = {
          branchId: b.branchId,
          branchName: b.branchName,
          phoneNumber: b.phoneNumber,
          email: b.email,
          street: b.street,
          commune: b.commune,
          province: b.province,
          description: b.description,
          isActive: b.isActive,
          serviceIds: b.services.map(s => s.serviceId),
          staffIds: b.staffs.map(s => s.id),
          operatingHours: b.operatingHours,
          arrivalWindowMinutes: b.arrivalWindowMinutes,
          maxBookingsPerWindow: b.maxBookingsPerWindow
          
        }

        setCurrentBranchStaffIds(b.staffs.map(s => s.id))
        setFormData(updateData)
        setBranchError(null)
      } catch (e) {
        console.error('Failed to load branch:', e)
        setBranchError('Failed to load branch details')
      } finally {
        setLoadingBranch(false)
      }
    }

    loadBranch()
  }, [mode, branchId])

  const isLoading = useMemo(
    () => dataLoading || loadingBranch || !formData,
    [dataLoading, loadingBranch, formData]
  )

  const revalidateFieldIfNeeded = useCallback(
    (field: string, nextValue: any, nextFormData?: BranchFormValues) => {
      if (!formData) return
      setErrors(prev => {
        if (!prev[field]) return prev
        const data = nextFormData ?? formData
        const patched: BranchFormValues = { ...data, [field]: nextValue }
        const msg = validateField(mode, field, nextValue, patched)
        if (!msg) {
          const { [field]: _, ...rest } = prev
          return rest
        }
        return msg !== prev[field] ? { ...prev, [field]: msg } : prev
      })
    },
    [formData, mode]
  )

  const handleInputChange = useCallback(
    (
      field:
        | 'branchName'
        | 'phoneNumber'
        | 'email'
        | 'street'
        | 'commune'
        | 'province'
        | 'description'
        | 'arrivalWindowMinutes'
        | 'maxBookingsPerWindow',
        
      value: string
    ) => {
      setFormData(prev => {
        if (!prev) return prev

        let processedValue: any = value

        if (
          field === 'arrivalWindowMinutes' ||
          field === 'maxBookingsPerWindow' 
          
        ) {
          processedValue = value === '' ? 0 : parseInt(value, 10)
          if (isNaN(processedValue)) processedValue = 0
        }

        if ((prev as any)[field] === processedValue) return prev
        const next = { ...prev, [field]: processedValue }
        revalidateFieldIfNeeded(field, processedValue, next)
        return next
      })
    },
    [revalidateFieldIfNeeded]
  )

  const handleOperatingHoursChange = useCallback(
    (day: string, field: keyof OperatingHour, value: string | boolean) => {
      setFormData(prev => {
        if (!prev) return prev
        const dayNum = parseInt(day, 10)
        const next: BranchFormValues = {
          ...prev,
          operatingHours: prev.operatingHours.map(h =>
            h.dayOfWeek === dayNum ? { ...h, [field]: value } : h
          ),
        }

        setErrors(prevErr => {
          if (!prevErr.operatingHours) return prevErr
          const msg = validateField(mode, 'operatingHours', next.operatingHours, next)
          if (!msg) {
            const { operatingHours, ...rest } = prevErr
            return rest
          }
          return msg !== prevErr.operatingHours
            ? { ...prevErr, operatingHours: msg }
            : prevErr
        })

        return next
      })
    },
    [mode]
  )

  const handleServiceToggle = useCallback(
    (serviceId: string, selected: boolean) => {
      setFormData(prev => {
        if (!prev) return prev
        const isSelected = prev.serviceIds.includes(serviceId)
        if (isSelected === selected) return prev

        const nextServiceIds = selected
          ? [...prev.serviceIds, serviceId]
          : prev.serviceIds.filter(id => id !== serviceId)

        const next: BranchFormValues = { ...prev, serviceIds: nextServiceIds }

        setErrors(prevErr => {
          if (!prevErr.serviceIds) return prevErr
          const msg = validateField(mode, 'serviceIds', nextServiceIds, next)
          if (!msg) {
            const { serviceIds, ...rest } = prevErr
            return rest
          }
          return msg !== prevErr.serviceIds ? { ...prevErr, serviceIds: msg } : prevErr
        })

        return next
      })
    },
    [mode]
  )

  const handleServiceRemove = useCallback(
    (serviceId: string) => {
      setFormData(prev => {
        if (!prev) return prev
        if (!prev.serviceIds.includes(serviceId)) return prev

        const nextServiceIds = prev.serviceIds.filter(id => id !== serviceId)
        const next: BranchFormValues = { ...prev, serviceIds: nextServiceIds }

        setErrors(prevErr => {
          if (!prevErr.serviceIds) return prevErr
          const msg = validateField(mode, 'serviceIds', nextServiceIds, next)
          if (!msg) {
            const { serviceIds, ...rest } = prevErr
            return rest
          }
          return msg !== prevErr.serviceIds ? { ...prevErr, serviceIds: msg } : prevErr
        })

        return next
      })
    },
    [mode]
  )

  const handleStaffToggle = useCallback((staffId: string, selected: boolean) => {
    setFormData(prev => {
      if (!prev) return prev
      const isSelected = prev.staffIds.includes(staffId)
      if (isSelected === selected) return prev

      const nextStaffIds = selected
        ? [...prev.staffIds, staffId]
        : prev.staffIds.filter(id => id !== staffId)

      const next: BranchFormValues = { ...prev, staffIds: nextStaffIds }

      // validate staffIds nếu đang có lỗi
      setErrors(prevErr => {
        if (!prevErr.staffIds) return prevErr
        const msg = validateField(mode, 'staffIds', nextStaffIds, next)
        if (!msg) {
          const { staffIds, ...rest } = prevErr
          return rest
        }
        return msg !== prevErr.staffIds ? { ...prevErr, staffIds: msg } : prevErr
      })

      return next
    })
  }, [mode])

  const handleStaffRemove = useCallback((staffId: string) => {
    setFormData(prev => {
      if (!prev) return prev
      if (!prev.staffIds.includes(staffId)) return prev

      const nextStaffIds = prev.staffIds.filter(id => id !== staffId)
      const next: BranchFormValues = { ...prev, staffIds: nextStaffIds }

      setErrors(prevErr => {
        if (!prevErr.staffIds) return prevErr
        const msg = validateField(mode, 'staffIds', nextStaffIds, next)
        if (!msg) {
          const { staffIds, ...rest } = prevErr
          return rest
        }
        return msg !== prevErr.staffIds ? { ...prevErr, staffIds: msg } : prevErr
      })

      return next
    })
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    const formErrors = validateForm(mode, formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      const first = Object.keys(formErrors)[0]
      const el =
        document.querySelector(`[name="${first}"]`) ||
        document.querySelector(`[id="${first}"]`)
      if (el) (el as HTMLElement).focus()
      toast.error('Please fix the validation errors before submitting')
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'create') {
        await branchService.createBranch(formData as CreateBranchRequest)
        toast.success('Branch created successfully.')
      } else {
        const payload: UpdateBranchRequest = {
          ...(formData as BranchFormValues),
          branchId: formData.branchId!,
        } as UpdateBranchRequest

        await branchService.updateBranch(payload.branchId, payload)
        toast.success('Branch updated successfully.')
      }

      setTimeout(() => {
        router.push('/admin/branches')
      }, 1000)
    } catch (err) {
      console.error('Submit branch failed:', err)
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit branch. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (dataError || branchError || !formData) {
    return <ErrorState message={dataError || branchError || 'Branch not found'} />
  }

  const title = mode === 'create' ? 'Create New Branch' : `Edit ${formData.branchName}`
  const subtitle =
    mode === 'create'
      ? 'Set up a new garage branch with location, services, and staff'
      : 'Update branch information and operations'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="ghost" size="sm" disabled={submitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
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
          arrivalWindowMinutes={formData.arrivalWindowMinutes}
          maxBookingsPerWindow={formData.maxBookingsPerWindow}         
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
          currentBranchStaffIds={mode === 'edit' ? currentBranchStaffIds : undefined}
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
            <Button variant="outline" type="button" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting || Object.keys(errors).length > 0}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Create Branch' : 'Update Branch'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
