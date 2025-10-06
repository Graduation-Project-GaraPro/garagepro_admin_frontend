import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import { CreateBranchRequest, User } from '@/services/branch-service'

interface StaffSectionProps {
  formData: CreateBranchRequest
  errors: Record<string, string>
  managers: User[]
  technicians: User[]
  onStaffToggle: (staffId: string, selected: boolean) => void
  onStaffRemove: (staffId: string) => void
}

export const StaffSection = ({ 
  formData, 
  errors, 
  managers, 
  technicians, 
  onStaffToggle, 
  onStaffRemove 
}: StaffSectionProps) => {
  const selectedStaffIds = useMemo(() => 
    new Set(formData.staffIds), 
    [formData.staffIds]
  )

  const allStaff = useMemo(() => [...managers, ...technicians], [managers, technicians])
  const selectedStaff = useMemo(() => 
    allStaff.filter(staff => selectedStaffIds.has(staff.id)),
    [allStaff, selectedStaffIds]
  )

  const getStaffRole = (staff: User) => {
    return managers.some(m => m.id === staff.id) ? 'Manager' : 'Technician'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>Select staff members to assign to this branch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Managers Section */}
        {managers.length > 0 && (
          <div className="space-y-2">
            <Label>Managers</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {managers.map((manager) => {
                const isSelected = selectedStaffIds.has(manager.id)
                return (
                  <label 
                    key={manager.id} 
                    className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onStaffToggle(manager.id, e.target.checked)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{manager.fullName}</div>
                      <div className="text-xs text-muted-foreground">{manager.email}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Technicians Section */}
        {technicians.length > 0 && (
          <div className="space-y-2">
            <Label>Technicians</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {technicians.map((technician) => {
                const isSelected = selectedStaffIds.has(technician.id)
                return (
                  <label 
                    key={technician.id} 
                    className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onStaffToggle(technician.id, e.target.checked)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{technician.fullName}</div>
                      <div className="text-xs text-muted-foreground">{technician.email}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Selected Staff */}
        {selectedStaff.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Staff ({selectedStaff.length})</Label>
            <div className="space-y-2">
              {selectedStaff.map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{staff.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {getStaffRole(staff)} • {staff.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined: {new Date(staff.createdAt).toLocaleDateString()}
                      {staff.isActive ? '' : ' • Inactive'}
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
              ))}
            </div>
          </div>
        )}

        {allStaff.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No staff members available
          </div>
        )}
        
        {errors.staffIds && <p className="text-sm text-red-500">{errors.staffIds}</p>}
      </CardContent>
    </Card>
  )
}