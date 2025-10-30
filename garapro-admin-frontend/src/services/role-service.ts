
import { authService } from "@/services/authService"

// types/role.ts
export interface Permission {
  id: string
  name: string
  code: string
  description: string
  deprecated: boolean
}

export interface PermissionCategory {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Role {
  id: string
  name: string
  description: string
  isDefault: boolean
  users: number
  createdAt: string
  updatedAt: string | null
  permissionCategories: PermissionCategory[]
}

export interface CreateRoleRequest {
  name: string
  description: string
  permissionIds: string[]
  grantedBy: string
  GrantedUserId: string | null
}

export interface UpdateRoleRequest {
  roleId: string
  newName: string
  description: string
  permissionIds: string[]
  
  grantedBy: string
  GrantedUserId: string | null
}

export interface AuthResponseDto {
  token: string
  expiresIn: number
  userId: string
  email: string
  roles: string[]
}

// services/roleService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7113/api';

class RoleService {
  private getAuthToken(): string | null {
  return authService.getToken();
}

private getCurrentUserId(): string | null {
  return authService.getCurrentUserId();
}

private getCurrentUserEmail(): string | null {
  return authService.getCurrentUserEmail();
}

private async fetchAPI<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const token = this.getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }
  
  console.log(token);
  
  const headers: HeadersInit = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Token expired - try to refresh and retry
  if (response.status === 401 && retryCount === 0) {
    try {
      await authService.handleTokenRefresh();
      return this.fetchAPI<T>(endpoint, options, retryCount + 1);
    } catch (refreshError) {
      throw new Error('Session expired. Please login again.');
    }
  }

  // Handle no content
  if (response.status === 204) {
    return null as T
  }

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage: string

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || JSON.stringify(errorData)
    } catch {
      errorMessage = await response.text()
    }

    throw new Error(`API error ${response.status}: ${errorMessage}`)
  }

  // Detect content-type
  const contentType = response.headers.get("content-type")

  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>
  }

  // fallback: return text
  return (await response.text()) as unknown as T
}

  // Get all roles
  async getRoles(): Promise<Role[]> {
    const roles = await this.fetchAPI<Role[]>('/Roles');
    console.log(roles);
    return this.fetchAPI<Role[]>('/Roles')
  }

  // Get grouped permissions
  async getGroupedPermissions(): Promise<PermissionCategory[]> {
    return this.fetchAPI<PermissionCategory[]>('/Permissions/grouped')
  }

  // Get role by ID
  async getRoleById(id: string): Promise<Role> {
    return this.fetchAPI<Role>(`/Roles/${id}`)
  }

  // Create new role
  async createRole(roleData: Omit<CreateRoleRequest, 'grantedBy'>): Promise<Role> {
    const grantedBy = this.getCurrentUserEmail()
    const GrantedUserId = this.getCurrentUserId()

    if (!grantedBy) {
      throw new Error('User not authenticated')
    }

    const requestData: CreateRoleRequest = {
      ...roleData,
      grantedBy,
      GrantedUserId
    }

    return this.fetchAPI<Role>('/Roles', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  // Update role
  async updateRole(roleData: Omit<UpdateRoleRequest, 'grantedBy' | 'roleId'> & { id: string }): Promise<Role> {
    const grantedBy = this.getCurrentUserEmail()
    const GrantedUserId = this.getCurrentUserId()
    if (!grantedBy) {
      throw new Error('User not authenticated')
    }

    const requestData: UpdateRoleRequest = {
      roleId: roleData.id,
      newName: roleData.newName,
      description: roleData.description,
      permissionIds: roleData.permissionIds,
      
      grantedBy,
      GrantedUserId
    }

    return this.fetchAPI<Role>(`/Roles/${roleData.id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    })
  }

  // Delete role - trả về void vì API trả về 204 No Content
  async deleteRole(id: string): Promise<void> {
    await this.fetchAPI<void>(`/Roles/${id}`, {
      method: 'DELETE',
    })
    // Không cần return gì cả vì API trả về 204
  }

  // Duplicate role
  async duplicateRole(id: string, newName: string): Promise<Role> {
    const grantedBy = this.getCurrentUserId()
    if (!grantedBy) {
      throw new Error('User not authenticated')
    }

    return this.fetchAPI<Role>(`/Roles/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ 
        newName,
        grantedBy 
      }),
    })
  }

  async getUsersCountByRole(roleId: string): Promise<number> {
    try {
      const users = await this.fetchAPI<any[]>(`/Roles/${roleId}/users`)
      return users.length
    } catch (error) {
      console.error(`Failed to get users count for role ${roleId}:`, error)
      return 0
    }
  }
  // Get users with specific role
  async getUsersWithRole(roleId: string): Promise<any[]> {
    return this.fetchAPI<any[]>(`/Roles/${roleId}/users`)
  }
}

export const roleService = new RoleService()