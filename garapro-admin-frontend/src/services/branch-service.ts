// services/branch-service.ts
export interface GarageBranch {
  branchId: string
  branchName: string
  phoneNumber: string
  email: string
  street: string
  ward: string
  district: string
  city: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  services: Service[]
  staffs: Staff[]
  operatingHours: OperatingHour[]
}

export interface CreateBranchRequest {
  branchName: string
  phoneNumber: string
  email: string
  street: string
  ward: string
  district: string
  city: string
  description: string
  serviceIds: string[]
  staffIds: string[]
  operatingHours: OperatingHour[]
}
// services/branch-service.ts

export interface UpdateBranchRequest {
  branchId: string
  branchName: string
  phoneNumber: string
  email: string
  street: string
  ward: string
  district: string
  city: string
  description: string
  isActive: boolean
  serviceIds: string[]
  staffIds: string[]
  operatingHours: OperatingHour[]
}

export interface Service {
  serviceId: string
  serviceName: string
  serviceStatus: string
  description: string
  price: number
  estimatedDuration: number
  isActive: boolean
  isAdvanced: boolean
}

export interface User {
  id: string
  fullName: string
  email: string
  isActive: boolean
  createdAt: string
  lastLogin: string | null
}


export interface Service {
  serviceId: string
  serviceCategoryId: string
  serviceTypeId: string
  serviceName: string
  serviceStatus: string
  description: string
  price: number
  estimatedDuration: number
  isActive: boolean
  isAdvanced: boolean
}

export interface Staff {
  id: string
  userName: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl: string | null
  isActive: boolean
  gender: boolean
  createdAt: string
  updatedAt: string | null
  birthday: string | null
  status: string | null
  avatar: string | null
  dateOfBirth: string | null
  lastLogin: string | null
  lastPasswordChangeDate: string | null
}
export interface ServiceCategory {
  serviceCategoryId: string
  categoryName: string
  description: string
  isActive: boolean
  services: Service[]
  childCategories: ServiceCategory[] | null
}
export interface OperatingHour {
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface GetBranchesParams {
  page?: number
  pageSize?: number
  search?: string
  city?: string
  isActive?: boolean
}

export interface GetBranchesResponse {
  branches: GarageBranch[]
  totalCount: number
  page: number
  pageSize: number
}

class BranchService {
  private baseURL = 'https://localhost:7113/api'

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getBranches(
    page: number = 1,
    pageSize: number = 10,
    filters?: GetBranchesParams
  ): Promise<GetBranchesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.city && { city: filters.city }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
    })

    const url = `${this.baseURL}/Branch?${params}`
    const data = await this.request<GarageBranch[]>(url)
    console.log(data);
    return {
      branches: data.branches,
      totalCount: data.length,
      page,
      pageSize
    }
  }

  // services/branch-service.ts
  async getBranchById(id: string): Promise<GarageBranch> {
    const url = `${this.baseURL}/Branch/${id}`
    console.log('Fetching branch from:', url) // Debug URL
    const response = await this.request<GarageBranch>(url)
    console.log('Branch response:', response) // Debug response
    return response
  }
  async createBranch(branchData: CreateBranchRequest): Promise<void> {
    const url = `${this.baseURL}/Branch`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    })

    if (!response.ok) {
      const errorText = await response.json();
      throw new Error(`Failed to create branch: ${response.status} ${errorText.message ?? "Error"}`)
    }
  }
  async updateBranch(branchId: string, branchData: UpdateBranchRequest): Promise<void> {
    const url = `${this.baseURL}/Branch/${branchId}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    })

    if (!response.ok) {
      const errorText = await response.json();
      throw new Error(`Failed to create branch: ${response.status} ${errorText.message ?? "Error"}`)
    }
  }
  async getServices(): Promise<Service[]> {
    const url = `${this.baseURL}/Services`
    return this.request<Service[]>(url)
  }

  async getManagers(): Promise<User[]> {
    const url = `${this.baseURL}/Users/managers`
    return this.request<User[]>(url)
  }

  async getTechnicians(): Promise<User[]> {
    const url = `${this.baseURL}/Users/technicians`
    return this.request<User[]>(url)
  }
  async deleteBranch(id: string): Promise<void> {
    const url = `${this.baseURL}/Branch/${id}`
    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status}`)
    }
  }
  async getServiceCategories(): Promise<ServiceCategory[]> {
    const url = `${this.baseURL}/ServiceCategories`
    return this.request<ServiceCategory[]>(url)
  }
  async toggleBranchStatus(id: string, isActive: boolean): Promise<void> {
    const url = `${this.baseURL}/${id}/status`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    })

    if (!response.ok) {
      throw new Error(`Failed to toggle branch status: ${response.status}`)
    }
  }

  async exportBranches(filters: any, format: 'csv' | 'excel'): Promise<Blob> {
    // Simulate export functionality
    return new Blob(['Export data'], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' })
  }

  async bulkActivateBranches(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.toggleBranchStatus(id, true)))
  }

  async bulkDeactivateBranches(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.toggleBranchStatus(id, false)))
  }

  async bulkDeleteBranches(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.deleteBranch(id)))
  }

  // Helper methods for UI
  getFullAddress(branch: GarageBranch): string {
    return `${branch.street}, ${branch.ward}, ${branch.district}, ${branch.city}`
  }

  getManagerInfo(staffs: Staff[]): { name: string; email: string } {
    const manager = staffs.find(staff => 
      staff.userName.includes('manager') ||
      (staff.firstName === 'System' && staff.lastName === 'Manager')
    )
    return {
      name: manager ? `${manager.firstName} ${manager.lastName}` : 'No Manager',
      email: manager?.email || 'No Email'
    }
  }

  getActiveServicesCount(services: Service[]): number {
    return services.filter(service => service.isActive).length
  }

  getActiveStaffCount(staffs: Staff[]): number {
    return staffs.filter(staff => staff.isActive).length
  }

  getOpenDaysCount(operatingHours: OperatingHour[]): number {
    return operatingHours.filter(hours => hours.isOpen).length
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek - 1] || 'Unknown'
  }
}

export const branchService = new BranchService()