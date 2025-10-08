import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, AlertTriangle, UserCheck, Users } from 'lucide-react'
import { CreateBranchRequest, User } from '@/services/branch-service'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StaffSectionProps {
  formData: CreateBranchRequest
  errors: Record<string, string>
  managers: User[]
  technicians: User[]
  managersWithoutBranch: User[]
  techniciansWithoutBranch: User[]
  onStaffToggle: (staffId: string, selected: boolean) => void
  onStaffRemove: (staffId: string) => void
}

export const StaffSection = ({ 
  formData, 
  errors, 
  managers, 
  technicians, 
  managersWithoutBranch, 
  techniciansWithoutBranch, 
  onStaffToggle, 
  onStaffRemove 
}: StaffSectionProps) => {
  const [activeTab, setActiveTab] = useState('available')
  const [warningMessages, setWarningMessages] = useState<{ [key: string]: string }>({})

  const selectedStaffIds = useMemo(() => 
    new Set(formData.staffIds), 
    [formData.staffIds]
  )

  const allStaff = useMemo(() => [...managers, ...technicians], [managers, technicians])
  const availableStaff = useMemo(() => [
    ...managersWithoutBranch,
    ...techniciansWithoutBranch
  ], [managersWithoutBranch, techniciansWithoutBranch])

  const selectedStaff = useMemo(() => 
    allStaff.filter(staff => selectedStaffIds.has(staff.id)),
    [allStaff, selectedStaffIds]
  )

  const getStaffRole = (staff: User) => {
    return managers.some(m => m.id === staff.id) ? 'Manager' : 'Technician'
  }

  const isStaffAvailable = (staffId: string) => {
    return availableStaff.some(staff => staff.id === staffId)
  }

  const getBranchAssignmentStatus = (staffId: string) => {
    const isAvailable = isStaffAvailable(staffId)
    if (isAvailable) {
      return { status: 'available', message: 'Available for assignment' }
    } else {
      return { status: 'assigned', message: 'Already assigned to another branch' }
    }
  }

  const handleStaffToggleWithWarning = (staff: User, selected: boolean) => {
    if (selected && !isStaffAvailable(staff.id)) {
      // Show warning but still allow selection
      setWarningMessages(prev => ({
        ...prev,
        [staff.id]: `${staff.fullName} is already assigned to another branch. They can only work at one branch at a time.`
      }))
    } else {
      // Remove warning if deselected or if staff is available
      setWarningMessages(prev => {
        const newWarnings = { ...prev }
        delete newWarnings[staff.id]
        return newWarnings
      })
    }
    
    onStaffToggle(staff.id, selected)
  }

  const StaffCheckbox = ({ staff, showWarning = false }: { staff: User, showWarning?: boolean }) => {
    const isSelected = selectedStaffIds.has(staff.id)
    const { status, message } = getBranchAssignmentStatus(staff.id)
    const hasWarning = warningMessages[staff.id]

    return (
      <label 
        className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
          isSelected 
            ? status === 'available' ? 'border-blue-500 bg-blue-50' : 'border-orange-500 bg-orange-50'
            : 'hover:bg-gray-50'
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => handleStaffToggleWithWarning(staff, e.target.checked)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium">{staff.fullName}</div>
            <Badge variant={getStaffRole(staff) === 'Manager' ? 'default' : 'secondary'}>
              {getStaffRole(staff)}
            </Badge>
            {status === 'available' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <UserCheck className="h-3 w-3 mr-1" />
                Available
              </Badge>
            )}
            {status === 'assigned' && isSelected && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Already Assigned
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            {staff.email}
          </div>
          <div className="text-xs text-muted-foreground">
            Joined: {new Date(staff.createdAt).toLocaleDateString()}
            {!staff.isActive && ' • Inactive'}
          </div>
          {hasWarning && (
            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              {hasWarning}
            </div>
          )}
        </div>
      </label>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>
          Assign staff to this branch. Available staff are not assigned to any branch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Available Staff
              <Badge variant="secondary" className="ml-1">
                {availableStaff.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Staff
              <Badge variant="secondary" className="ml-1">
                {allStaff.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Available Staff Tab */}
          <TabsContent value="available" className="space-y-4">
            {/* Available Managers */}
            {managersWithoutBranch.length > 0 && (
              <div className="space-y-2">
                <Label>Available Managers</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {managersWithoutBranch.map((manager) => (
                    <StaffCheckbox key={manager.id} staff={manager} />
                  ))}
                </div>
              </div>
            )}

            {/* Available Technicians */}
            {techniciansWithoutBranch.length > 0 && (
              <div className="space-y-2">
                <Label>Available Technicians</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {techniciansWithoutBranch.map((technician) => (
                    <StaffCheckbox key={technician.id} staff={technician} />
                  ))}
                </div>
              </div>
            )}

            {availableStaff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div>No available staff members</div>
                <div className="text-sm">All staff are currently assigned to other branches</div>
              </div>
            )}
          </TabsContent>

          {/* All Staff Tab */}
          <TabsContent value="all" className="space-y-4">
            {/* All Managers */}
            {managers.length > 0 && (
              <div className="space-y-2">
                <Label>All Managers</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {managers.map((manager) => (
                    <StaffCheckbox key={manager.id} staff={manager} showWarning />
                  ))}
                </div>
              </div>
            )}

            {/* All Technicians */}
            {technicians.length > 0 && (
              <div className="space-y-2">
                <Label>All Technicians</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {technicians.map((technician) => (
                    <StaffCheckbox key={technician.id} staff={technician} showWarning />
                  ))}
                </div>
              </div>
            )}

            {allStaff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div>No staff members found</div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Selected Staff */}
        {selectedStaff.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Staff ({selectedStaff.length})</Label>
            <div className="space-y-2">
              {selectedStaff.map((staff) => {
                const { status } = getBranchAssignmentStatus(staff.id)
                return (
                  <div 
                    key={staff.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      status === 'assigned' ? 'border-orange-200 bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{staff.fullName}</div>
                        <Badge variant={getStaffRole(staff) === 'Manager' ? 'default' : 'secondary'}>
                          {getStaffRole(staff)}
                        </Badge>
                        {status === 'assigned' && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Already Assigned
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {staff.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {new Date(staff.createdAt).toLocaleDateString()}
                        {!staff.isActive && ' • Inactive'}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onStaffRemove(staff.id)}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`Remove ${staff.fullName} from staff`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Global Warning */}
        {Object.keys(warningMessages).length > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-orange-800">Staff Assignment Warning</div>
                <div className="text-sm text-orange-700 mt-1">
                  Some selected staff members are already assigned to other branches. 
                  Staff can only work at one branch at a time. Consider assigning available staff instead.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {errors.staffIds && <p className="text-sm text-red-500">{errors.staffIds}</p>}
      </CardContent>
    </Card>
  )
}