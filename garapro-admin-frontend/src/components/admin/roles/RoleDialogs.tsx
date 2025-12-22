import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, Users, Edit } from 'lucide-react'
import { Role, PermissionCategory, Permission } from '@/services/role-service'
import { useRoleValidation } from '@/hooks/admin/roles/useRoles'

interface RoleDialogsProps {
  
  // Create dialog
  isCreateOpen: boolean
  onCreateClose: () => void
  onCreateSubmit: (roleData: { 
    name: string; 
    description: string; 
    permissionIds: string[];
    
  }) => void
  
  // Edit dialog
  isEditOpen: boolean
  selectedRole: Role | null
  onEditClose: () => void
  onEditSubmit: (roleData: { 
    name: string; 
    description: string; 
    permissionIds: string[];
    
  }) => void
  
  // View dialog
  isViewOpen: boolean
  selectedRoleForView: Role | null
  usersWithRoleCount: number
  onViewClose: () => void
  
  // Delete dialog
  isDeleteOpen: boolean
  selectedRoleForDelete: Role | null
  onDeleteClose: () => void
  onDeleteConfirm: () => void
  
  // Duplicate dialog
  isDuplicateOpen: boolean
  selectedRoleForDuplicate: Role | null
  onDuplicateClose: () => void
  onDuplicateSubmit: (newName: string) => void
  
  // View Users dialog
  isViewUsersOpen: boolean
  onViewUsersClose: () => void
  usersWithRole: any[]
  loadingUsers: boolean
  
  // Data
  permissions: PermissionCategory[]
  loading: boolean

  // Action handlers
  onViewUsers: (role: Role) => void
  onEditRole: (role: Role) => void
}

export const RoleDialogs = ({
  isCreateOpen,
  onCreateClose,
  onCreateSubmit,
  isEditOpen,
  selectedRole,
  onEditClose,
  onEditSubmit,
  isViewOpen,
  selectedRoleForView,
   usersWithRoleCount,
  onViewClose,
  isDeleteOpen,
  selectedRoleForDelete,
  onDeleteClose,
  onDeleteConfirm,
  isDuplicateOpen,
  selectedRoleForDuplicate,
  onDuplicateClose,
  onDuplicateSubmit,
  isViewUsersOpen,
  onViewUsersClose,
  usersWithRole,
  loadingUsers,
  permissions,
  onViewUsers,        
  onEditRole,
  loading
}: RoleDialogsProps) => {
  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[]
    
  })
  const [shouldValidateCreate, setShouldValidateCreate] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    roleId: '',
    name: '',
    description: '',
    permissionIds: [] as string[]
    
  })
  const [shouldValidateEdit, setShouldValidateEdit] = useState(false)

  // Duplicate form state
  const [duplicateName, setDuplicateName] = useState('')

  // State to track where edit dialog was opened from
  const [editOpenedFrom, setEditOpenedFrom] = useState<'quick-action' | 'other' | null>(null)

  // Validation
  const createErrors = useRoleValidation(createForm, shouldValidateCreate)
  const editErrors = useRoleValidation(editForm, shouldValidateEdit)

  // Helper function to get all permission IDs from a role
  const getAllPermissionIds = (role: Role): string[] => {
    return role.permissionCategories.flatMap(category => 
      category.permissions.map(permission => permission.id)
    )
  }
  const isCustomerRole =
    selectedRoleForView?.name?.toLowerCase() === "customer" ||
    selectedRole?.name?.toLowerCase() === "customer";

  const isEditDisabled =
    loading || selectedRole?.isDefault || isCustomerRole

  // Update edit form when selected role changes
  useEffect(() => {
  if (selectedRole && isEditOpen) {
    const allPermissionIds = getAllPermissionIds(selectedRole)
    setEditForm({
      roleId: selectedRole.id,
      name: selectedRole.name,
      description: selectedRole.description,
      permissionIds: allPermissionIds
    })
  }
}, [selectedRole, isEditOpen])

  // Reset forms when dialogs close
  useEffect(() => {
  if (!isCreateOpen) {
    setCreateForm({ name: '', description: '', permissionIds: [] })
    setShouldValidateCreate(false)
  }
}, [isCreateOpen])

  useEffect(() => {
  if (!isEditOpen) {
    if (editOpenedFrom !== 'quick-action') {
      setEditForm({ roleId: '', name: '', description: '', permissionIds: [] })
    }
    setShouldValidateEdit(false)
    setEditOpenedFrom(null)
  }
}, [isEditOpen, editOpenedFrom])

  useEffect(() => {
    if (!isDuplicateOpen) {
      setDuplicateName('')
    }
  }, [isDuplicateOpen])

  const handleCreateSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setShouldValidateCreate(true)
    
    if (Object.keys(createErrors).length === 0) {
      onCreateSubmit(createForm)
    }
  }, [createForm, createErrors, onCreateSubmit])

  const handleEditSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setShouldValidateEdit(true)
    
    if (Object.keys(editErrors).length === 0) {
      onEditSubmit(editForm)
    }
  }, [editForm, editErrors, onEditSubmit])

  const handleDuplicateSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (duplicateName.trim()) {
      onDuplicateSubmit(duplicateName.trim())
    }
  }, [duplicateName, onDuplicateSubmit])


  
  
const handleCreateClearCategory = useCallback((category: PermissionCategory) => {
  setShouldValidateCreate(true)
  setCreateForm(prev => {
    const idsToRemove = new Set(category.permissions.map(p => p.id))
    return {
      ...prev,
      permissionIds: prev.permissionIds.filter(id => !idsToRemove.has(id))
    }
  })
}, [])


const handleEditClearCategory = useCallback((category: PermissionCategory) => {
  setShouldValidateEdit(true)
  setEditForm(prev => {
    const idsToRemove = new Set(category.permissions.map(p => p.id))
    return {
      ...prev,
      permissionIds: prev.permissionIds.filter(id => !idsToRemove.has(id))
    }
  })
}, [])
  const handleCreatePermissionToggle = useCallback(
  (category: PermissionCategory, permission: Permission) => {
    setShouldValidateCreate(true)

    setCreateForm(prev => {
      const currentIds = prev.permissionIds
      const isChecked = currentIds.includes(permission.id)

      const defaultPermission = category.permissions.find(p => p.isDefault)

      if (isChecked) {
        // Đang cố tắt permission
        if (permission.isDefault) {
          // Nếu còn quyền khác trong category đang bật => không cho tắt default
          const hasOtherSelected = category.permissions
            .filter(p => p.id !== permission.id)
            .some(p => currentIds.includes(p.id))

          if (hasOtherSelected) {
            // giữ nguyên, không đổi state
            return prev
          }
        }

        // Tắt bình thường
        const newIds = currentIds.filter(id => id !== permission.id)
        return { ...prev, permissionIds: newIds }
      } else {
        // Bật permission
        let newIds = [...currentIds, permission.id]

        // Đảm bảo default permission cũng được bật
        if (defaultPermission && !newIds.includes(defaultPermission.id)) {
          newIds.push(defaultPermission.id)
        }

        return { ...prev, permissionIds: newIds }
      }
    })
  },
  []
)

 const handleEditPermissionToggle = useCallback(
   (category: PermissionCategory, permission: Permission) => {
     setShouldValidateEdit(true);

     setEditForm((prev) => {
       const currentIds = prev.permissionIds;
       const isChecked = currentIds.includes(permission.id);

       const defaultPermission = category.permissions.find((p) => p.isDefault);

       if (isChecked) {
         if (permission.isDefault) {
           const hasOtherSelected = category.permissions
             .filter((p) => p.id !== permission.id)
             .some((p) => currentIds.includes(p.id));

           if (hasOtherSelected) {
             return prev;
           }
         }

         const newIds = currentIds.filter((id) => id !== permission.id);
         return { ...prev, permissionIds: newIds };
       } else {
         let newIds = [...currentIds, permission.id];

         if (defaultPermission && !newIds.includes(defaultPermission.id)) {
           newIds.push(defaultPermission.id);
         }

         return { ...prev, permissionIds: newIds };
       }
     });
   },
   []
 );

  // Handlers for Quick Actions buttons
  const handleViewUsersClick = useCallback(() => {
    if (selectedRoleForView) {
      onViewUsers(selectedRoleForView)
    }
  }, [selectedRoleForView, onViewUsers])

  const handleEditRoleClick = useCallback(() => {
    if (selectedRoleForView) {
      setEditOpenedFrom('quick-action')
      onEditRole(selectedRoleForView)
    }
  }, [selectedRoleForView, onEditRole])

  return (
    <>
      {/* Create Role Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={onCreateClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new user role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-role-name">Role Name *</Label>
                <Input
                  id="create-role-name"
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                    if (!shouldValidateCreate) setShouldValidateCreate(true);
                  }}
                  placeholder="Enter role name"
                  className={createErrors.name ? "border-red-500" : ""}
                />
                {createErrors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {createErrors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="create-role-description">Description *</Label>
                <Input
                  id="create-role-description"
                  value={createForm.description}
                  onChange={(e) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                    if (!shouldValidateCreate) setShouldValidateCreate(true);
                  }}
                  placeholder="Enter role description"
                  className={createErrors.description ? "border-red-500" : ""}
                />
                {createErrors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {createErrors.description}
                  </p>
                )}
              </div>

              {/* THÊM isDefault field */}
              {/* <div className="flex items-center space-x-2">
                <Switch
                  id="create-is-default"
                  checked={createForm.isDefault}
                  onCheckedChange={(checked) => 
                    setCreateForm(prev => ({ ...prev, isDefault: checked as boolean }))
                  }
                />
                <Label htmlFor="create-is-default" className="text-sm cursor-pointer">
                  Set as default role for new users
                </Label>
              </div> */}

              <div>
                <Label>Permissions *</Label>
                {createErrors.permissionIds && (
                  <p className="text-sm text-red-500 mt-1">
                    {createErrors.permissionIds}
                  </p>
                )}
                <div className="mt-2 space-y-4">
                 {permissions.map((category) => {
                          const hasAnySelectedInCategory = category.permissions.some(p =>
                            createForm.permissionIds.includes(p.id)
                          )
                          const containsSystemPermission = category.permissions.some(p => p.isSystem)
                          return (
                            <div key={category.id} className="border rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">{category.name}</h4>
                                  <p className="text-xs text-gray-500">{category.description}</p>
                                </div>

                                {hasAnySelectedInCategory && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleCreateClearCategory(category)}
                                    disabled={loading || containsSystemPermission}
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {category.permissions.map((permission) => {
                                  const isChecked = createForm.permissionIds.includes(permission.id);
                                  const hasOtherSelected = category.permissions
                                    .filter((p) => p.id !== permission.id)
                                    .some((p) => createForm.permissionIds.includes(p.id));

                                  return (
                                    <div
                                      key={permission.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Switch
                                        id={`create-${permission.id}`}
                                        checked={isChecked}
                                        onCheckedChange={() =>
                                          handleCreatePermissionToggle(
                                            category,
                                            permission
                                          )
                                        }
                                        disabled={
                                          loading ||
                                          permission.isSystem ||
                                          (permission.isDefault &&
                                            hasOtherSelected)
                                        }
                                      />
                                      <Label
                                        htmlFor={`create-${permission.id}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        <div className="flex flex-col">
                                            {/* NAME + BADGE */}
                                            <div className="flex items-center gap-2">
                                              <span>{permission.name}</span>

                                              
                                              {permission.isSystem ? (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                  System
                                                </span>
                                              ) : permission.isDefault ? (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                                  Default
                                                </span>
                                              ) : null}
                                            </div>

                                            {/* DESCRIPTION - luôn nằm dưới, không bị lệch */}
                                            <div className="text-xs text-gray-500 mt-0.5">
                                              {permission.description}
                                            </div>
                                          </div>
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onCreateClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Update role details and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-role-name">Role Name *</Label>
                  <Input
                    id="edit-role-name"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (!shouldValidateEdit) setShouldValidateEdit(true);
                    }}
                    className={editErrors.name ? "border-red-500" : ""}
                    disabled={isEditDisabled}
                  />
                  {editErrors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {editErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-role-description">Description *</Label>
                  <Input
                    id="edit-role-description"
                    value={editForm.description}
                    onChange={(e) => {
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                      if (!shouldValidateEdit) setShouldValidateEdit(true);
                    }}
                    disabled={isEditDisabled}
                    className={editErrors.description ? "border-red-500" : ""}
                  />
                  {editErrors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {editErrors.description}
                    </p>
                  )}
                </div>

                {/* THÊM isDefault field */}
                {/* <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is-default"
                    checked={editForm.isDefault}
                    onCheckedChange={(checked) => 
                      setEditForm(prev => ({ ...prev, isDefault: checked as boolean }))
                    }
                    disabled={selectedRole.isDefault} // Không cho phép thay đổi nếu là default role
                  />
                  <Label htmlFor="edit-is-default" className="text-sm cursor-pointer">
                    Set as default role for new users
                    {selectedRole.isDefault && (
                      <span className="text-xs text-gray-500 ml-1">(Cannot change default role)</span>
                    )}
                  </Label>
                </div> */}

                <div>
                  <Label>Permissions *</Label>
                  {editErrors.permissionIds && (
                    <p className="text-sm text-red-500 mt-1">
                      {editErrors.permissionIds}
                    </p>
                  )}
                  <div className="mt-2 space-y-4">
                   {permissions.map((category) => {
                            const hasAnySelectedInCategory = category.permissions.some(p =>
                              editForm.permissionIds.includes(p.id)
                            )
                              const containsSystemPermission = category.permissions.some(p => p.isSystem)
                            return (
                              <div key={category.id} className="border rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700">{category.name}</h4>
                                    <p className="text-xs text-gray-500">{category.description}</p>
                                  </div>

                                  {hasAnySelectedInCategory && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() => handleEditClearCategory(category)}
                                      disabled={loading || containsSystemPermission}
                                    >
                                      Clear
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {category.permissions.map((permission) => {
                                    const isChecked = editForm.permissionIds.includes(permission.id)
                                    const hasOtherSelected = category.permissions
                                      .filter(p => p.id !== permission.id)
                                      .some(p => editForm.permissionIds.includes(p.id))

                                    return (
                                      <div
                                        key={permission.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <Switch
                                          id={`edit-${permission.id}`}
                                          checked={isChecked}
                                          onCheckedChange={() =>
                                            handleEditPermissionToggle(
                                              category,
                                              permission
                                            )
                                          }
                                          disabled={
                                            loading ||
                                            permission.isSystem ||
                                            (permission.isDefault &&
                                              hasOtherSelected)
                                          }
                                        />
                                        <Label
                                          htmlFor={`edit-${permission.id}`}
                                          className="text-sm cursor-pointer"
                                        >
                                          <div className="flex flex-col">
                                            {/* NAME + BADGE */}
                                            <div className="flex items-center gap-2">
                                              <span>{permission.name}</span>

                                              {/* Ưu tiên SYSTEM → ẩn DEFAULT nếu System = true */}
                                              {permission.isSystem ? (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                  System
                                                </span>
                                              ) : permission.isDefault ? (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                                  Default
                                                </span>
                                              ) : null}
                                            </div>

                                            {/* DESCRIPTION - luôn nằm dưới, không bị lệch */}
                                            <div className="text-xs text-gray-500 mt-0.5">
                                              {permission.description}
                                            </div>
                                          </div>
                                        </Label>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )
                          })}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onEditClose}>
                  Cancel
                </Button>
                <Button type="submit"  disabled={loading }>
                  {loading ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Role Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={onViewClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Details: {selectedRoleForView?.name}</DialogTitle>
          </DialogHeader>
          {selectedRoleForView && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedRoleForView.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedRoleForView.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Users with this role
                  </label>
                  <p className="text-lg font-semibold">
                    {selectedRoleForView.users.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Role Type
                  </label>
                  <div className="mt-1">
                    {selectedRoleForView.isDefault ? (
                      <Badge className="bg-green-100 text-green-800">
                        Default
                      </Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Created Date
                  </label>
                  <p className="text-sm">
                    {new Date(
                      selectedRoleForView.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Total Permissions
                  </label>
                  <p className="text-sm">
                    {selectedRoleForView.permissionCategories.reduce(
                      (total, category) => total + category.permissions.length,
                      0
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Permissions
                </label>
                <div className="mt-2 space-y-3">
                  {selectedRoleForView.permissionCategories.map((category) => {
                    if (category.permissions.length === 0) return null;

                    return (
                      <div key={category.id}>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          {category.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {category.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {category.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div>
                                <div className="text-sm font-medium">
                                  {permission.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {permission.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {selectedRoleForView.permissionCategories.every(
                    (cat) => cat.permissions.length === 0
                  ) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No permissions assigned
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Quick Actions
                </label>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewUsersClick}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Users ({usersWithRoleCount})
                  </Button>
                  {!selectedRoleForView.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditRoleClick}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Role
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={onDeleteClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "
              {selectedRoleForDelete?.name}"?
              {selectedRoleForDelete?.users ? (
                <>
                  <br />
                  <span className="text-red-600 font-medium">
                    This role is assigned to {selectedRoleForDelete.users}{" "}
                    user(s).
                  </span>
                  They will lose access to associated permissions.
                </>
              ) : null}
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Role Dialog */}
      <Dialog open={isDuplicateOpen} onOpenChange={onDuplicateClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Role</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedRoleForDuplicate?.name}" with a new
              name.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDuplicateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="duplicate-name">New Role Name *</Label>
                <Input
                  id="duplicate-name"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  placeholder={`Copy of ${selectedRoleForDuplicate?.name}`}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onDuplicateClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !duplicateName.trim()}>
                {loading ? "Duplicating..." : "Create Copy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Users Dialog */}
      <Dialog open={isViewUsersOpen} onOpenChange={onViewUsersClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Users with Role: {selectedRoleForView?.name}
            </DialogTitle>
            <DialogDescription>
              List of users assigned to this role
            </DialogDescription>
          </DialogHeader>

          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total: {usersWithRole.length} users
                </div>
              </div>

              {usersWithRole.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No users assigned to this role</p>
                </div>
              ) : (
                <div className="border rounded-lg divide-y">
                  {usersWithRole.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.name?.charAt(0) ||
                              user.email?.charAt(0) ||
                              "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName + " "+user.lastName }
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onViewUsersClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}