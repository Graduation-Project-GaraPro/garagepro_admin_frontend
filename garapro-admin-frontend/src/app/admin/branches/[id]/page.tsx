'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail, Clock, Users, Building2, Calendar ,Edit, Trash2} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { branchService, GarageBranch, ServiceCategory } from '@/services/branch-service'
import { toast } from 'sonner'
import { usePermissionContext } from '@/contexts/permission-context'

export default function BranchDetailPage() {
  const params = useParams()
  
  const raw = params?.id
  const branchId = Array.isArray(raw) ? raw[0] : raw
  const [branch, setBranch] = useState<GarageBranch | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { hasAnyPermission } = usePermissionContext()

   const canEdit   = hasAnyPermission('BRANCH_UPDATE')
    const canDelete = hasAnyPermission('BRANCH_DELETE')
    const canToggle = hasAnyPermission('BRANCH_STATUS_TOGGLE')


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [branchData, categoriesData] = await Promise.all([
          branchService.getBranchById(branchId),
          branchService.getServiceCategories()
        ])
        setBranch(branchData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load branch:', error)
        toast.error('Failed to load branch details')
      } finally {
        setLoading(false)
      }
    }
    if (branchId) loadData()
  }, [branchId])

  const getStatusBadge = (isActive: boolean) => (
    isActive 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove seconds
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek - 1] || 'Unknown'
  }

  const getManagerInfo = () => {
    if (!branch) return 'No Manager Assigned'
    const manager = branch.staffs.find(staff => 
      staff.userName.includes('manager') || 
      (staff.firstName === 'System' && staff.lastName === 'Manager')
    )
    return manager ? `${manager.firstName} ${manager.lastName}` : 'No Manager Assigned'
  }

  const getActiveServicesCount = () => {
    return branch?.services.filter(service => service.isActive).length || 0
  }

  const getActiveStaffCount = () => {
    return branch?.staffs.filter(staff => staff.isActive).length || 0
  }

  const getOpenDaysCount = () => {
    return branch?.operatingHours.filter(hours => hours.isOpen).length || 0
  }
  const handleDelete = async () => {
      if (!branch) return
      if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
        try {
          await branchService.deleteBranch(branch.branchId)
          window.location.href = '/admin/branches'
        } catch (e) {
          toast.error('Failed to delete branch ')
        }
      }
    }

  // Get services grouped by category
  const getServicesByCategory = () => {
    if (!branch) return []
    
    return categories
      .filter(category => category.isActive)
      .map(category => ({
        ...category,
        services: category.services.filter(service => 
          branch.services.some(s => s.serviceId === service.serviceId)
        )
      }))
      .filter(category => category.services.length > 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/branches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Branches
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">Loading branch details...</div>
        </div>
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/branches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Branches
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">Branch not found</div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const servicesByCategory = getServicesByCategory()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
                <Link href="/admin/branches">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Branches
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{branch.branchName}</h1>
                  <p className="text-muted-foreground">Branch details and operations</p>
                </div>
        </div>
        
        <div className="flex gap-2">
           {canEdit && 
            ( <Link href={`/admin/branches/${branch.branchId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </Link>
            )}


           {canDelete && ( <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>)}
        </div>
        
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusBadge(branch.isActive)}</div>
            <p className="text-xs text-muted-foreground">
              {branch.isActive ? 'Operational' : 'Closed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveServicesCount()}</div>
            <p className="text-xs text-muted-foreground">
              Active services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveStaffCount()}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOpenDaysCount()}/7</div>
            <p className="text-xs text-muted-foreground">
              Days per week
            </p>
          </CardContent>
        </Card>
        

      </div>

      {/* Branch Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Branch Information</CardTitle>
            <CardDescription>Basic details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Branch Name</div>
                <div className="font-medium">{branch.branchName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Manager</div>
                <div className="font-medium">{getManagerInfo()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created Date</div>
                <div className="font-medium">{new Date(branch.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {branch.updatedAt ? new Date(branch.updatedAt).toLocaleDateString() : 'Never'}
                </div>
              </div>
              
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Description</div>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                {branch.description || 'No description provided'}
              </div>
            </div>
          </CardContent>
        </Card>

       <div className="space-y-6">
           {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Location</CardTitle>
            <CardDescription>How to reach and find us</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Address</div>
                <div className="text-sm text-muted-foreground">
                  {branch.street}<br />
                  {branch.commune}, {branch.province}<br />
                  
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">
                  {branch.phoneNumber}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground">
                  {branch.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

{/* Operational Settings - THÊM CARD MỚI */}
        <Card>
      <CardHeader>
        <CardTitle>Operational Settings</CardTitle>
        <CardDescription>Scheduling & capacity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Arrival Window:</span>
            <Badge variant="outline">{branch.arrivalWindowMinutes} min</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Max Bookings/Window:</span>
            <Badge variant="outline">{branch.maxBookingsPerWindow}</Badge>
          </div>
          
        </div>
      </CardContent>
        </Card>

       </div>

      </div>

      {/* Services by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Services by Category</CardTitle>
          <CardDescription>Services available at this branch organized by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {servicesByCategory.map((category) => (
              <div key={category.serviceCategoryId} className="border rounded-lg">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="font-medium text-lg">{category.categoryName}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.description}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {category.services.length} service{category.services.length !== 1 ? 's' : ''} in this category
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.services.map((service) => (
                      <Card key={service.serviceId} className={service.isActive ? '' : 'opacity-60'}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{service.serviceName}</CardTitle>
                            <Badge variant={service.isActive ? "default" : "secondary"}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <CardDescription>{service.serviceStatus}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            {service.description}
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{formatCurrency(service.price)}</span>
                            <span className="text-muted-foreground">
                              {service.estimatedDuration}h
                            </span>
                          </div>
                          {service.isAdvanced && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Advanced Service
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {servicesByCategory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No services available at this branch
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>Team working at this branch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branch.staffs.map((staff) => (
              <Card key={staff.id} className={staff.isActive ? '' : 'opacity-60'}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {staff.firstName} {staff.lastName}
                    </CardTitle>
                    <Badge variant={staff.isActive ? "default" : "secondary"}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>@{staff.userName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    {staff.email}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className={staff.gender ? 'text-blue-600' : 'text-pink-600'}>
                      {staff.gender ? 'Male' : 'Female'}
                    </span>
                    <span className="text-muted-foreground">
                      Joined: {new Date(staff.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {staff.lastLogin && (
                    <div className="text-xs text-muted-foreground">
                      Last login: {new Date(staff.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {branch.staffs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No staff members assigned to this branch
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Weekly schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {branch.operatingHours
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((hours) => (
                <div key={hours.dayOfWeek} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 ${hours.isOpen ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="font-medium w-32">{getDayName(hours.dayOfWeek)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {hours.isOpen ? (
                      <>
                        <span className="text-sm">{formatTime(hours.openTime)} - {formatTime(hours.closeTime)}</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Open
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Closed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}