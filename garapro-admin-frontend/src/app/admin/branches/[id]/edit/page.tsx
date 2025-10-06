'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { branchService, GarageBranch, UpdateBranchRequest } from '@/services/branch-service'

// Import components
import { BasicInfoSection } from '@/components/admin/branches/BasicInfoSection'
import { ServicesSection } from '@/components/admin/branches/ServicesSection'
import { StaffSection } from '@/components/admin/branches/StaffSection'
import { OperatingHoursSection } from '@/components/admin/branches/OperatingHoursSection'

// Import hooks and constants
import { useBranchData, useFormValidation, validateForm } from '@/hooks/admin/branches/useBranch'

export default function EditBranchPage() {
  const params = useParams()
  const router = useRouter()
  const branchId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [shouldValidate, setShouldValidate] = useState(false)
  const [formData, setFormData] = useState<UpdateBranchRequest | null>(null)
  
  const { managers, technicians, categories, loading: dataLoading, error: dataError } = useBranchData()
  const errors = useFormValidation(formData || {} as UpdateBranchRequest, shouldValidate)

  useEffect(() => {
    const loadBranch = async () => {
      try {
        setLoading(true)
        const branch = await branchService.getBranchById(branchId)
        
        // Transform branch data to match UpdateBranchRequest
        const updateData: UpdateBranchRequest = {
          branchId: branch.branchId,
          branchName: branch.branchName,
          phoneNumber: branch.phoneNumber,
          email: branch.email,
          street: branch.street,
          ward: branch.ward,
          district: branch.district,
          city: branch.city,
          description: branch.description,
          isActive: branch.isActive,
          serviceIds: branch.services.map(s => s.serviceId),
          staffIds: branch.staffs.map(s => s.id),
          operatingHours: branch.operatingHours
        }
        
        setFormData(updateData)
      } catch (error) {
        console.error('Failed to load branch:', error)
        toast.error('Failed to load branch details')
      } finally {
        setLoading(false)
      }
    }

    if (branchId) {
      loadBranch()
    }
  }, [branchId])

  // Optimized input handler
  const handleInputChange = <K extends keyof UpdateBranchRequest>(
    field: K, 
    value: UpdateBranchRequest[K]
  ) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : prev)
    if (!shouldValidate) setShouldValidate(true)
  }

  // Optimized operating hours handler
  const handleOperatingHoursChange = (
    day: string, 
    field: keyof any, 
    value: string | boolean
  ) => {
    setFormData(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        operatingHours: prev.operatingHours.map(hour => 
          hour.dayOfWeek === parseInt(day) 
            ? { ...hour, [field]: value }
            : hour
        ),
      }
    })
  }

  // Optimized service toggle
  const handleServiceToggle = (serviceId: string, selected: boolean) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (!prev) return prev
      
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
  }

  const handleServiceRemove = (serviceId: string) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        serviceIds: prev.serviceIds.filter(id => id !== serviceId),
      }
    })
  }

  // Optimized staff toggle
  const handleStaffToggle = (staffId: string, selected: boolean) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (!prev) return prev
      
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
  }

  const handleStaffRemove = (staffId: string) => {
    if (!shouldValidate) setShouldValidate(true)
    
    setFormData(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        staffIds: prev.staffIds.filter(id => id !== staffId),
      }
    })
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    
    setShouldValidate(true)
    
    // Prevent double submission
    if (submitting) return
    
    // Validate form
    const formErrors = validateForm(formData)
    const validationErrors = Object.keys(formErrors)
    
    if (validationErrors.length > 0) {
      toast.error(`Please fix the following errors: ${validationErrors.join(', ')}`)
      return
    }

    setSubmitting(true)
    
    try {
      await branchService.updateBranch(formData.branchId, formData)
      toast.success('Branch updated successfully.')
      
      setTimeout(() => {
        router.push('/admin/branches')
      }, 1000)
    } catch (error) {
      console.error('Failed to update branch:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update branch. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading || dataLoading) {
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

  // Error state
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
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
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
          formData={formData}
          errors={errors}
          onChange={handleInputChange}
        />

        <ServicesSection
          formData={formData}
          errors={errors}
          categories={categories}
          onServiceToggle={handleServiceToggle}
          onServiceRemove={handleServiceRemove}
        />

        <StaffSection
          formData={formData}
          errors={errors}
          managers={managers}
          technicians={technicians}
          onStaffToggle={handleStaffToggle}
          onStaffRemove={handleStaffRemove}
        />

        <OperatingHoursSection
          operatingHours={formData.operatingHours}
          onOperatingHoursChange={handleOperatingHoursChange}
        />

        <div className="flex justify-end gap-4">
          <Link href="/admin/branches">
            <Button variant="outline" type="button" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={submitting}
          >
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