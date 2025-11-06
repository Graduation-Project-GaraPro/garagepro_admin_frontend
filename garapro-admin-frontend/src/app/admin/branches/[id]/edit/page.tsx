'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { branchService, GarageBranch, UpdateBranchRequest, OperatingHour } from '@/services/branch-service'

// Components
import { BasicInfoSection } from '@/components/admin/branches/BasicInfoSection'
import { ServicesSection } from '@/components/admin/branches/ServicesSection'
import { StaffSection } from '@/components/admin/branches/StaffSection'
import { OperatingHoursSection } from '@/components/admin/branches/OperatingHoursSection'

// Hooks
import { useBranchData } from '@/hooks/admin/branches/useBranch'

// ====== Validation helpers (giữ scope module) ======
const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || `Day ${dayOfWeek}`
}

const validateField = (field: string, value: any, formData?: UpdateBranchRequest): string => {
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
    case 'operatingHours': {
      if (formData) {
        const openDays = formData.operatingHours.filter(h => h.isOpen)
        if (openDays.length === 0) return 'At least one day must be open'
        for (const hour of formData.operatingHours) {
          if (hour.isOpen) {
            if (!hour.openTime?.trim()) return `Open time is required for ${getDayName(hour.dayOfWeek)}`
            if (!hour.closeTime?.trim()) return `Close time is required for ${getDayName(hour.dayOfWeek)}`
            if (hour.openTime >= hour.closeTime) return `Close time must be after open time for ${getDayName(hour.dayOfWeek)}`
          }
        }
      }
      return ''
    }
    default:
      return ''
  }
}

const validateForm = (formData: UpdateBranchRequest): Record<string, string> => {
  const fields: (keyof UpdateBranchRequest | 'serviceIds' | 'operatingHours')[] = [
    'branchName', 'phoneNumber', 'email', 'street', 'province', 'commune', 'serviceIds', 'operatingHours'
  ]
  const errors: Record<string, string> = {}
  fields.forEach((field) => {
    const err = validateField(field, (formData as any)[field], formData)
    if (err) errors[field] = err
  })
  return errors
}

// ====== Page ======
export default function EditBranchPage() {
  const params = useParams()
  const router = useRouter()
  const branchId = params.id as string

  const [listCurrentStaffIds, setListCurrentStaffIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [branch, setBranch] = useState<GarageBranch | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdateBranchRequest | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  

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

  // Load branch
  useEffect(() => {
    const loadBranch = async () => {
      try {
        setLoading(true)
        const b = await branchService.getBranchById(branchId)
        const updateData: UpdateBranchRequest = {
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
        }
        setListCurrentStaffIds(b.staffs.map((s: { id: string }) => s.id))
        setBranch(b)
        setFormData(updateData)
      } catch (e) {
        console.error('Failed to load branch:', e)
        toast.error('Failed to load branch details')
      } finally {
        setLoading(false)
      }
    }
    if (branchId) loadBranch()
  }, [branchId])

  // ==== Re-validate 1 field (đặt trong component, dùng next) ====
  const revalidateFieldIfNeeded = useCallback((
  field: string,
  nextValue: any,
  nextFormData?: UpdateBranchRequest
) => {
  if (!formData) return
  setErrors(prev => {
    if (!prev[field]) return prev
    const data = nextFormData ?? formData
    const patched: UpdateBranchRequest = { ...data, [field]: nextValue } as any
    const msg = validateField(field, nextValue, patched)
    if (!msg) {
      const { [field]: _, ...rest } = prev
      return rest
    }
    return msg !== prev[field] ? { ...prev, [field]: msg } : prev
  })
}, [formData])

  // Validate on blur
  

  // Input change (dùng next + revalidateFieldIfNeeded)
 const handleInputChange = useCallback((
  field: 'branchName' | 'phoneNumber' | 'email' | 'street' | 'commune' | 'province' | 'description',
  value: string
) => {
  setFormData(prev => {
    if (!prev) return prev
    if (prev[field] === value) return prev
    const next = { ...prev, [field]: value }
    // auto-clear lỗi nếu field này đang có lỗi
    revalidateFieldIfNeeded(field, value, next)
    return next
  })
}, [revalidateFieldIfNeeded])

  // Operating hours change (validate theo next)
  const handleOperatingHoursChange = useCallback((
  day: string,
  field: keyof OperatingHour,
  value: string | boolean
) => {
  setFormData(prev => {
    if (!prev) return prev
    const dayNum = parseInt(day, 10)
    const next: UpdateBranchRequest = {
      ...prev,
      operatingHours: prev.operatingHours.map(h =>
        h.dayOfWeek === dayNum ? { ...h, [field]: value } : h
      ),
    }

    // Chỉ re-validate nếu đang có lỗi operatingHours
    setErrors(prevErr => {
      if (!prevErr.operatingHours) return prevErr
      const msg = validateField('operatingHours', next.operatingHours, next)
      if (!msg) {
        const { operatingHours, ...rest } = prevErr
        return rest
      }
      return msg !== prevErr.operatingHours ? { ...prevErr, operatingHours: msg } : prevErr
    })

    return next
  })
}, [])


  // Service toggle/remove (clear lỗi dựa trên next)
  const handleServiceToggle = useCallback((serviceId: string, selected: boolean) => {
  setFormData(prev => {
    if (!prev) return prev
    const isSelected = prev.serviceIds.includes(serviceId)
    if (isSelected === selected) return prev

    const nextServiceIds = selected
      ? [...prev.serviceIds, serviceId]
      : prev.serviceIds.filter(id => id !== serviceId)

    const next: UpdateBranchRequest = { ...prev, serviceIds: nextServiceIds }

    setErrors(prevErr => {
      if (!prevErr.serviceIds) return prevErr
      const msg = validateField('serviceIds', nextServiceIds, next)
      if (!msg) {
        const { serviceIds, ...rest } = prevErr
        return rest
      }
      return msg !== prevErr.serviceIds ? { ...prevErr, serviceIds: msg } : prevErr
    })

    return next
  })
}, [])

  const handleServiceRemove = useCallback((serviceId: string) => {
  setFormData(prev => {
    if (!prev) return prev
    if (!prev.serviceIds.includes(serviceId)) return prev

    const nextServiceIds = prev.serviceIds.filter(id => id !== serviceId)
    const next: UpdateBranchRequest = { ...prev, serviceIds: nextServiceIds }

    setErrors(prevErr => {
      if (!prevErr.serviceIds) return prevErr
      const msg = validateField('serviceIds', nextServiceIds, next)
      if (!msg) {
        const { serviceIds, ...rest } = prevErr
        return rest
      }
      return msg !== prevErr.serviceIds ? { ...prevErr, serviceIds: msg } : prevErr
    })

    return next
  })
}, [])

  // Staff toggle/remove (không có validate riêng)
  const handleStaffToggle = useCallback((staffId: string, selected: boolean) => {
    setFormData(prev => {
      if (!prev) return prev
      const isSelected = prev.staffIds.includes(staffId)
      if (isSelected === selected) return prev
      const nextStaffIds = selected
        ? [...prev.staffIds, staffId]
        : prev.staffIds.filter(id => id !== staffId)
      return { ...prev, staffIds: nextStaffIds }
    })
  }, [])

  const handleStaffRemove = useCallback((staffId: string) => {
    setFormData(prev => {
      if (!prev) return prev
      if (!prev.staffIds.includes(staffId)) return prev
      return { ...prev, staffIds: prev.staffIds.filter(id => id !== staffId) }
    })
  }, [])

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    
   

    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      const first = Object.keys(formErrors)[0]
      const el = document.querySelector(`[name="${first}"]`) || document.querySelector(`[id="${first}"]`)
      if (el) (el as HTMLElement).focus()
      toast.error('Please fix the validation errors before submitting')
      return
    }

    setSubmitting(true)
    try {
      await branchService.updateBranch(formData.branchId, formData)
      toast.success('Branch updated successfully.')
      setTimeout(() => router.push('/admin/branches'), 1000)
    } catch (err) {
      console.error('Failed to update branch:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update branch. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isLoading = useMemo(() => loading || dataLoading, [loading, dataLoading])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/branches">
            <Button variant="ghost" size="sm" disabled>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Branches
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Branch</h1>
            <p className="text-muted-foreground">Loading branch data...</p>
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
  }

  if (dataError || !formData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/branches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Branches
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Branch</h1>
            <p className="text-muted-foreground text-red-600">Failed to load branch data</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{dataError || 'Branch not found'}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit {formData.branchName}</h1>
          <p className="text-muted-foreground">Update branch information and operations</p>
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
          currentBranchStaffIds={listCurrentStaffIds}
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
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Branch
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
