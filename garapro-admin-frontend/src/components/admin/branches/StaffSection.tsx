import React, { useMemo, useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, AlertTriangle, UserCheck, Users } from 'lucide-react'
import { User } from '@/services/branch-service'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type StaffSectionProps = {
  /** Danh sách staffId đã chọn (từ parent) */
  selectedStaffIds: string[]
  /** Lỗi chỉ cho field staffIds (tránh truyền cả object errors lớn) */
  errors?: { staffIds?: string }
  managers: User[]
  technicians: User[]
  managersWithoutBranch: User[]
  techniciansWithoutBranch: User[]
  /** Staff hiện tại của branch (edit mode) */
  currentBranchStaffIds?: string[]
  onStaffToggle: (staffId: string, selected: boolean) => void
  onStaffRemove: (staffId: string) => void
}

function StaffSectionImpl({
  selectedStaffIds,
  errors = {},
  managers,
  technicians,
  managersWithoutBranch,
  techniciansWithoutBranch,
  onStaffToggle,
  onStaffRemove,
  currentBranchStaffIds = [],
}: StaffSectionProps) {
  const [activeTab, setActiveTab] = useState<'available' | 'all'>('available')
  const [warningMessages, setWarningMessages] = useState<Record<string, string>>({})

  // Memoized sets for O(1) lookup & stable refs
  const selectedIdsSet = useMemo(() => new Set(selectedStaffIds), [selectedStaffIds])
  const currentBranchStaffSet = useMemo(() => new Set(currentBranchStaffIds), [currentBranchStaffIds])
  const managerIdSet = useMemo(() => new Set(managers.map(m => m.id)), [managers])

  const allStaff = useMemo(() => [...managers, ...technicians], [managers, technicians])
  const availableStaff = useMemo(
    () => [...managersWithoutBranch, ...techniciansWithoutBranch],
    [managersWithoutBranch, techniciansWithoutBranch]
  )
  const availableIdSet = useMemo(() => new Set(availableStaff.map(s => s.id)), [availableStaff])

  const selectedStaff = useMemo(
    () => allStaff.filter(staff => selectedIdsSet.has(staff.id)),
    [allStaff, selectedIdsSet]
  )

  const getStaffRole = useCallback((staff: User) => (managerIdSet.has(staff.id) ? 'Manager' : 'Technician'), [managerIdSet])

  const getBranchAssignmentStatus = useCallback((staffId: string) => {
    if (currentBranchStaffSet.has(staffId)) {
      return { status: 'current' as const, message: 'Currently assigned to this branch' }
    }
    if (availableIdSet.has(staffId)) {
      return { status: 'available' as const, message: 'Available for assignment' }
    }
    return { status: 'assigned' as const, message: 'Already assigned to another branch' }
  }, [availableIdSet, currentBranchStaffSet])

  const handleStaffToggleWithWarning = useCallback((staff: User, selected: boolean) => {
    const { status } = getBranchAssignmentStatus(staff.id)

    setWarningMessages(prev => {
      const next = { ...prev }
      if (selected) {
        if (status === 'assigned') {
          next[staff.id] =
            `${staff.fullName} is already assigned to another branch. ` +
            `Assigning them here will remove them from their current branch.`
        } else {
          delete next[staff.id]
        }
      } else {
        delete next[staff.id]
      }
      return next
    })

    onStaffToggle(staff.id, selected)
  }, [getBranchAssignmentStatus, onStaffToggle])

  const StaffCheckbox = useCallback(({ staff }: { staff: User }) => {
    const isSelected = selectedIdsSet.has(staff.id)
    const { status } = getBranchAssignmentStatus(staff.id)
    const hasWarning = warningMessages[staff.id]
    const role = getStaffRole(staff)

    return (
      <label
        className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? status === 'current'
              ? 'border-blue-500 bg-blue-50'
              : status === 'available'
              ? 'border-green-500 bg-green-50'
              : 'border-orange-500 bg-orange-50'
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
            <Badge variant={role === 'Manager' ? 'default' : 'secondary'}>{role}</Badge>
            {status === 'current' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <UserCheck className="h-3 w-3 mr-1" />
                Current Staff
              </Badge>
            )}
            {status === 'available' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <UserCheck className="h-3 w-3 mr-1" />
                Available
              </Badge>
            )}
            {status === 'assigned' && isSelected && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Other Branch
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-1">{staff.email}</div>
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
  }, [getBranchAssignmentStatus, getStaffRole, handleStaffToggleWithWarning, selectedIdsSet, warningMessages])

  const availableCount = availableStaff.length
  const totalCount = allStaff.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Members</CardTitle>
        <CardDescription>Assign staff to this branch. Available staff are not assigned to any branch.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v: 'available' | 'all') => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Available Staff
              <Badge variant="secondary" className="ml-1">{availableCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Staff
              <Badge variant="secondary" className="ml-1">{totalCount}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Available Staff */}
          <TabsContent value="available" className="space-y-4">
            {managersWithoutBranch.length > 0 && (
              <div className="space-y-2">
                <Label>Available Managers</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {managersWithoutBranch.map(m => <StaffCheckbox key={m.id} staff={m} />)}
                </div>
              </div>
            )}
            {techniciansWithoutBranch.length > 0 && (
              <div className="space-y-2">
                <Label>Available Technicians</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {techniciansWithoutBranch.map(t => <StaffCheckbox key={t.id} staff={t} />)}
                </div>
              </div>
            )}
            {availableCount === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div>No available staff members</div>
                <div className="text-sm">All staff are currently assigned to branches</div>
              </div>
            )}
          </TabsContent>

          {/* All Staff */}
          <TabsContent value="all" className="space-y-4">
            {managers.length > 0 && (
              <div className="space-y-2">
                <Label>All Managers</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {managers.map(m => <StaffCheckbox key={m.id} staff={m} />)}
                </div>
              </div>
            )}
            {technicians.length > 0 && (
              <div className="space-y-2">
                <Label>All Technicians</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {technicians.map(t => <StaffCheckbox key={t.id} staff={t} />)}
                </div>
              </div>
            )}
            {totalCount === 0 && (
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
              {selectedStaff.map(staff => {
                const { status } = getBranchAssignmentStatus(staff.id)
                const role = getStaffRole(staff)
                return (
                  <div
                    key={staff.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      status === 'current'
                        ? 'border-blue-200 bg-blue-50'
                        : status === 'assigned'
                        ? 'border-orange-200 bg-orange-50'
                        : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{staff.fullName}</div>
                        <Badge variant={role === 'Manager' ? 'default' : 'secondary'}>{role}</Badge>
                        {status === 'current' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Current Staff
                          </Badge>
                        )}
                        {status === 'assigned' && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Other Branch
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{staff.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {new Date(staff.createdAt).toLocaleDateString()}
                        {!staff.isActive && ' • Inactive'}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                       onClick={() => handleStaffToggleWithWarning(staff, false)}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`Remove ${staff.fullName}`}
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
                <div className="font-medium text-orange-800">Staff Reassignment Warning</div>
                <div className="text-sm text-orange-700 mt-1">
                  You have selected {Object.keys(warningMessages).length} staff member(s) who are already assigned to other branches.
                  Saving this form will reassign them to this branch and remove them from their current assignments.
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

/** Chỉ re-render khi props thực sự đổi */
export const StaffSection = memo(
  StaffSectionImpl,
  (prev, next) =>
    prev.selectedStaffIds === next.selectedStaffIds &&
    prev.managers === next.managers &&
    prev.technicians === next.technicians &&
    prev.managersWithoutBranch === next.managersWithoutBranch &&
    prev.techniciansWithoutBranch === next.techniciansWithoutBranch &&
    prev.currentBranchStaffIds === next.currentBranchStaffIds &&
    prev.errors?.staffIds === next.errors?.staffIds &&
    prev.onStaffToggle === next.onStaffToggle &&
    prev.onStaffRemove === next.onStaffRemove
)
