'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoleTable } from '@/components/admin/roles/RoleTables'
import { RoleDialogs } from '@/components/admin/roles/RoleDialogs'
import { roleService } from '@/services/role-service'
import { Role, PermissionCategory } from '@/services/role-service'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

export function UserRolesManagement() {
  // State management
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<PermissionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [permissionsLoading, setPermissionsLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [isViewUsersDialogOpen, setIsViewUsersDialogOpen] = useState(false)

  // Selected data states
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedRoleForView, setSelectedRoleForView] = useState<Role | null>(null)
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState<Role | null>(null)
  const [selectedRoleForDuplicate, setSelectedRoleForDuplicate] = useState<Role | null>(null)
  const [usersWithRole, setUsersWithRole] = useState<any[]>([])
  const [usersWithRoleCount, setUsersWithRoleCount] = useState<number>(0)

  const [loadingUsers, setLoadingUsers] = useState(false)

  // Fetch data
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const rolesData = await roleService.getRoles()
      setRoles(rolesData)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      toast.error('Failed to load roles', {
        description: 'Please try again later.'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPermissions = useCallback(async () => {
    try {
      setPermissionsLoading(true)
      const permissionsData = await roleService.getGroupedPermissions()
      setPermissions(permissionsData)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      toast.error('Failed to load permissions', {
        description: 'Please try again later.'
      })
    } finally {
      setPermissionsLoading(false)
    }
  }, [])

  // Trong page.tsx
const fetchRolesWithUserCounts = useCallback(async () => {
  try {
    setLoading(true)
    const rolesData = await roleService.getRoles()
    
    // Fetch user counts cho từng role
    const rolesWithUserCounts = await Promise.all(
      rolesData.map(async (role) => {
        try {
          const userCount = await roleService.getUsersCountByRole(role.id)
          return { ...role, users: userCount }
        } catch (error) {
          console.error(`Failed to get user count for role ${role.id}:`, error)
          return { ...role, users: 0 }
        }
      })
    )
    
    setRoles(rolesWithUserCounts)
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    toast.error('Failed to load roles', {
      description: 'Please try again later.'
    })
  } finally {
    setLoading(false)
  }
}, [])


  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Role action handlers
  const handleCreateRole = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }

  const handleViewDetails = async (role: Role) => {
    setSelectedRoleForView(role)
    const users = await roleService.getUsersCountByRole(role.id)
    setUsersWithRoleCount(users)
    setIsViewDetailsDialogOpen(true)
  }

  const handleDeleteRole = (role: Role) => {
    setSelectedRoleForDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const handleDuplicateRole = (role: Role) => {
    setSelectedRoleForDuplicate(role)
    setIsDuplicateDialogOpen(true)
  }

  const handleViewUsers = async (role: Role) => {
    try {
      setLoadingUsers(true)
      setSelectedRoleForView(role)
      const users = await roleService.getUsersWithRole(role.id)
      setUsersWithRole(users)
      setIsViewUsersDialogOpen(true)
    } catch (error) {
      console.error('Failed to fetch users with role:', error)
      toast.error('Failed to load users', {
        description: 'Could not fetch users with this role.'
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  // Dialog close handlers
  const handleCreateClose = () => {
    setIsCreateDialogOpen(false)
  }

  const handleEditClose = () => {
    setIsEditDialogOpen(false)
    setSelectedRole(null)
  }

  const handleViewClose = () => {
    setIsViewDetailsDialogOpen(false)
    setSelectedRoleForView(null)
  }

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false)
    setSelectedRoleForDelete(null)
  }

  const handleDuplicateClose = () => {
    setIsDuplicateDialogOpen(false)
    setSelectedRoleForDuplicate(null)
  }

  const handleViewUsersClose = () => {
    setIsViewUsersDialogOpen(false)
    setUsersWithRole([])
  }

  // Form submission handlers
  const handleCreateSubmit = async (roleData: any) => {
    try {
      setOperationLoading(true)
      
      const promise = roleService.createRole(roleData)
      
      toast.promise(promise, {
        loading: 'Creating role...',
        success: (data) => {
          fetchRoles() // Refresh the list
          setIsCreateDialogOpen(false)
          return `Role "${data.name}" has been created successfully`
        },
        error: (error) => {
          console.error('Failed to create role:', error.message)
          return error.message || 'Failed to create role. Please try again.'
        }
      })

      await promise
    } catch (error) {
      // Error is handled in toast.promise
    } finally {
      setOperationLoading(false)
    }
  }

  const handleEditSubmit = async (roleData: any) => {
    try {
      setOperationLoading(true)
      
      const promise = roleService.updateRole({
        ...roleData,
        id: selectedRole?.id
      })
      
      toast.promise(promise, {
        loading: 'Updating role...',
        success: (data) => {
          fetchRoles() // Refresh the list
          setIsEditDialogOpen(false)
          setSelectedRole(null)
          return `Role "${data.name}" has been updated successfully`
        },
        error: (error) => {
          console.error('Failed to update role:', error)
          return error.message || 'Failed to update role. Please try again.'
        }
      })

      await promise
    } catch (error) {
      // Error is handled in toast.promise
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRoleForDelete) return
  
    try {
      setOperationLoading(true)
      
      const deletePromise = roleService.deleteRole(selectedRoleForDelete.id)
      
      toast.promise(deletePromise, {
        loading: 'Deleting role...',
        success: () => {
          fetchRoles() // Refresh the list
          setIsDeleteDialogOpen(false)
          setSelectedRoleForDelete(null)
          return `Role "${selectedRoleForDelete.name}" has been deleted successfully`
        },
        error: (error) => {
          console.error('Failed to delete role:', error)
          return error.message || 'Failed to delete role. Please try again.'
        }
      })
  
      await deletePromise
    } catch (error) {
      // Error is handled in toast.promise
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDuplicateSubmit = async (newName: string) => {
    if (!selectedRoleForDuplicate) return

    try {
      setOperationLoading(true)
      
      const promise = roleService.duplicateRole(selectedRoleForDuplicate.id, newName)
      
      toast.promise(promise, {
        loading: 'Duplicating role...',
        success: (data) => {
          fetchRoles() // Refresh the list
          setIsDuplicateDialogOpen(false)
          setSelectedRoleForDuplicate(null)
          return `Role "${selectedRoleForDuplicate.name}" has been duplicated as "${data.name}"`
        },
        error: (error) => {
          console.error('Failed to duplicate role:', error)
          return error.message || 'Failed to duplicate role. Please try again.'
        }
      })

      await promise
    } catch (error) {
      // Error is handled in toast.promise
    } finally {
      setOperationLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Roles Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the system
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Roles</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RoleTable
            roles={filteredRoles}
            loading={loading}
            onEdit={handleEditRole}
            onView={handleViewDetails}
            onDelete={handleDeleteRole}
            onDuplicate={handleDuplicateRole}
          />
        </CardContent>
      </Card>

      <RoleDialogs
        // Create dialog
        isCreateOpen={isCreateDialogOpen}
        onCreateClose={handleCreateClose}
        onCreateSubmit={handleCreateSubmit}
        
        // Edit dialog
        isEditOpen={isEditDialogOpen}
        selectedRole={selectedRole}
        onEditClose={handleEditClose}
        onEditSubmit={handleEditSubmit}
        
        // View dialog
        isViewOpen={isViewDetailsDialogOpen}
        usersWithRoleCount={usersWithRoleCount}
        selectedRoleForView={selectedRoleForView}
        onViewClose={handleViewClose}
        
        // Delete dialog
        isDeleteOpen={isDeleteDialogOpen}
        selectedRoleForDelete={selectedRoleForDelete}
        onDeleteClose={handleDeleteClose}
        onDeleteConfirm={handleDeleteConfirm}
        
        // Duplicate dialog
        isDuplicateOpen={isDuplicateDialogOpen}
        selectedRoleForDuplicate={selectedRoleForDuplicate}
        onDuplicateClose={handleDuplicateClose}
        onDuplicateSubmit={handleDuplicateSubmit}
        
        // View Users dialog
        isViewUsersOpen={isViewUsersDialogOpen}
        onViewUsersClose={handleViewUsersClose}
        usersWithRole={usersWithRole}
        loadingUsers={loadingUsers}
        
        // Data
        permissions={permissions}
        onViewUsers={handleViewUsers}
        onEditRole={handleEditRole}
        loading={operationLoading || permissionsLoading}
      />
    </div>
  )
}