'use client'

import { useState, useCallback, useMemo, useTransition } from 'react'
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
import { useBranchData, useFormValidation, validateForm } from '@/hooks/admin/branches/useBranch'
import { DEFAULT_OPERATING_HOURS } from '@/constants/branch'

// Move initial state outside component to prevent recreating on each render
const INITIAL_FORM_DATA: CreateBranchRequest = {
  branchName: '',
  phoneNumber: '',
  email: '',
  street: '',
  ward: '',
  district: '',
  city: '',
  description: '',
  serviceIds: [],
  staffIds: [],
  operatingHours: DEFAULT_OPERATING_HOURS,
}

export default function CreateBranchPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldValidate, setShouldValidate] = useState(false)
  const [formData, setFormData] = useState<CreateBranchRequest>(INITIAL_FORM_DATA)
  
  const { 
  managers, 
  technicians, 
  managersWithoutBranch, 
  techniciansWithoutBranch, 
  categories, 
  parentCategories, // Thêm parentCategories
  loading: dataLoading, 
  error: dataError 
} = useBranchData()

  const errors = useFormValidation(formData, shouldValidate)

  // Memoize loading state to prevent unnecessary renders
  const isLoading = useMemo(() => isPending || isSubmitting, [isPending, isSubmitting])

  // Optimized input handler with better type safety
  const handleInputChange = useCallback(<K extends keyof CreateBranchRequest>(
    field: K, 
    value: CreateBranchRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (!shouldValidate) setShouldValidate(true)
  }, [shouldValidate])

  // Optimized operating hours handler
  const handleOperatingHoursChange = useCallback((
    day: keyof any, 
    field: keyof OperatingHour, 
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: prev.operatingHours.map(hour => 
        hour.dayOfWeek === parseInt(day as string) 
          ? { ...hour, [field]: value }
          : hour
      ),
    }))
  }, [])

  // Optimized service toggle
  const handleServiceToggle = useCallback((serviceId: string, selected: boolean) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (selected) {
        // Check if service already exists to prevent duplicates
        const exists = prev.serviceIds.includes(serviceId)
        if (exists) return prev
        
        return { ...prev, serviceIds: [...prev.serviceIds, serviceId] }
      } else {
        return { 
          ...prev, 
          serviceIds: prev.serviceIds.filter(id => id !== serviceId) 
        }
      }
    })
  }, [shouldValidate])

  const handleServiceRemove = useCallback((serviceId: string) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.filter(id => id !== serviceId),
    }))
  }, [shouldValidate])

  // Optimized staff toggle
  const handleStaffToggle = useCallback((staffId: string, selected: boolean) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (selected) {
        // Check if staff member already exists
        const exists = prev.staffIds.includes(staffId)
        if (exists) return prev
        
        return { ...prev, staffIds: [...prev.staffIds, staffId] }
      } else {
        return { 
          ...prev, 
          staffIds: prev.staffIds.filter(id => id !== staffId) 
        }
      }
    })
  }, [shouldValidate])

  const handleStaffRemove = useCallback((staffId: string) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => ({
      ...prev,
      staffIds: prev.staffIds.filter(id => id !== staffId),
    }))
  }, [shouldValidate])

  // Improved form submission with better error handling
 // Improved form submission with better error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    setShouldValidate(true)
    
    // Prevent double submission
    if (isLoading) return
    
    // Validate form
    const formErrors = validateForm(formData)
    
    // Check if there are any errors
    if (Object.keys(formErrors).length > 0) {
      // Focus on first error field
      const firstErrorField = Object.keys(formErrors)[0]
      const element = document.querySelector(`[name="${firstErrorField}"]`)
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
      
      // Use startTransition for navigation to prevent blocking UI
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
  }, [formData, isLoading, router])

  // Memoized loading skeleton to prevent recreating on each render
  const LoadingSkeleton = useMemo(() => (
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
  ), [])

  // Memoized error state
  const ErrorState = useMemo(() => (
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
          <p className="text-red-500 mb-4">{dataError}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  ), [dataError])

  // Early returns for loading and error states
  if (dataLoading) return LoadingSkeleton
  if (dataError) return ErrorState

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
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
        />

        
        <ServicesSection
          formData={formData}
          errors={errors}
          categories={categories}
          parentCategories={parentCategories} // Truyền parentCategories
          onServiceToggle={handleServiceToggle}
          onServiceRemove={handleServiceRemove}
        />

        <StaffSection
          formData={formData}
          errors={errors}
          managers={managers}
          technicians={technicians}
          managersWithoutBranch={managersWithoutBranch}
          techniciansWithoutBranch={techniciansWithoutBranch}
          onStaffToggle={handleStaffToggle}
          onStaffRemove={handleStaffRemove}
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
            disabled={isLoading || Object.keys(validateForm(formData)).length > 0}
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