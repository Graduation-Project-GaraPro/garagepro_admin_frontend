import { authService } from "@/services/authService"


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
  parentServiceCategoryId:string
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
  pageSize: number,
  totalPages: number
}

export interface Province {
  code: string
  name: string
}

export interface District {
  code: string
  name: string
  province_code: string
}

export interface Ward {
  code: string
  name: string
  district_code: string
}
class BranchService {
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api'

 private async getAuthToken(): Promise<string> {
    try {
      const token = await authService.getValidToken();
      console.log('🔑 Current token:', token ? '✅ Available' : '❌ Missing');
      return token;
    } catch (error) {
      console.log('🔑 Token error:', error.message);
      throw new Error('Authentication required');
    }
  }

  private async request<T>(url: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
    console.log('🚀 Making request to:', url);
    
    try {
      const token = await this.getAuthToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 Response status:', response.status);

      // Token expired - try to refresh and retry
      if (response.status === 401 && retryCount === 0) {
        console.log('🔄 Token expired, attempting refresh...');
        try {
          await authService.handleTokenRefresh();
          return this.request(url, options, retryCount + 1);
        } catch (refreshError) {
          console.log('❌ Token refresh failed');
          throw new Error('Session expired. Please login again.');
        }
      }

      // Access denied
      if (response.status === 403) {
        console.log('🚫 Access denied');
        if (typeof window !== 'undefined') {
          window.location.href = '/access-denied';
        }
        throw new Error('Access denied: You do not have permission to access this resource.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // For responses with no content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      console.log('💥 Request failed:', error);
      if (error instanceof Error && error.message.includes('Authentication required')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      throw error;
    }
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
    const data = await this.request<GetBranchesResponse>(url)
    console.log(data)
    return {
      branches: data.branches,
      totalCount: data.totalCount,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages
    }
  }

  async getBranchById(id: string): Promise<GarageBranch> {
    const url = `${this.baseURL}/Branch/${id}`
    console.log('Fetching branch from:', url)
    const response = await this.request<GarageBranch>(url)
    console.log('Branch response:', response)
    return response
  }

  async createBranch(branchData: CreateBranchRequest): Promise<void> {
    const url = `${this.baseURL}/Branch`;
    await this.request(url, {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }

  async updateBranch(branchId: string, branchData: UpdateBranchRequest): Promise<void> {
    const url = `${this.baseURL}/Branch/${branchId}`;
    await this.request(url, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    });
  }

  async getServices(): Promise<Service[]> {
    const url = `${this.baseURL}/Services`;
    return this.request<Service[]>(url);
  }

  async getManagers(): Promise<User[]> {
    const url = `${this.baseURL}/Users/managers`;
    return this.request<User[]>(url);
  }

  async getTechnicians(): Promise<User[]> {
    const url = `${this.baseURL}/Users/technicians`;
    return this.request<User[]>(url);
  }

  async deleteBranch(id: string): Promise<void> {
    const url = `${this.baseURL}/Branch/${id}`;
    await this.request(url, {
      method: 'DELETE',
    });
  }

  // async getServiceCategories(): Promise<ServiceCategory[]> {
  //   const url = `${this.baseURL}/ServiceCategories`;
  //   return this.request<ServiceCategory[]>(url);
  // }
  async getServiceCategories(
  parentServiceCategoryId?: string,
  searchTerm?: string,
  isActive?: boolean
  ): Promise<ServiceCategory[]> {
    const params = new URLSearchParams();

    if (parentServiceCategoryId) params.append("parentServiceCategoryId", parentServiceCategoryId);
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const url = `${this.baseURL}/ServiceCategories/filter?${params.toString()}`;
    return this.request<ServiceCategory[]>(url);
  }

   async getParentServiceCategoriesForFilter(): Promise<ServiceCategory[]> {
    const url = `${this.baseURL}/ServiceCategories/parentsForFilter`;
    return this.request<ServiceCategory[]>(url);
  }

  async toggleBranchStatus(id: string, isActive: boolean): Promise<void> {
    const url = `${this.baseURL}/Branch/${id}/status`;
    await this.request(url, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async bulkActivateBranchesApi(ids: string[]): Promise<void> {
    await this.request(`${this.baseURL}/Branch/bulk-activate`, {
      method: 'PATCH',
      body: JSON.stringify(ids),
    });
  }

  async bulkDeactivateBranchesApi(ids: string[]): Promise<void> {
    await this.request(`${this.baseURL}/Branch/bulk-deactivate`, {
      method: 'PATCH',
      body: JSON.stringify(ids),
    });
  }

  async bulkDeleteBranchesApi(ids: string[]): Promise<void> {
    await this.request(`${this.baseURL}/Branch/bulk-delete`, {
      method: 'DELETE',
      body: JSON.stringify(ids),
    });
  }


  async getManagersWithoutBranch(): Promise<User[]> {
    const url = `${this.baseURL}/Users/managers/without-branch`
    return this.request<User[]>(url)
  }

  async getTechniciansWithoutBranch(): Promise<User[]> {
    const url = `${this.baseURL}/Users/technicians/without-branch`
    return this.request<User[]>(url)
  }

  async exportBranches(filters: any, format: 'csv' | 'excel'): Promise<Blob> {
    const token = this.getAuthToken()
    const headers: HeadersInit = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Thực hiện request export với token
    const response = await fetch(`${this.baseURL}/Branch/export?format=${format}`, {
      headers,
      // ... thêm các tham số filters nếu cần
    })

    if (!response.ok) {
      throw new Error('Failed to export branches')
    }

    return response.blob()
  }

  async bulkActivateBranches(ids: string[]): Promise<void> {
    await this.bulkActivateBranchesApi(ids)
  }

  async bulkDeactivateBranches(ids: string[]): Promise<void> {
    await this.bulkDeactivateBranchesApi(ids)
  }

  async bulkDeleteBranches(ids: string[]): Promise<void> {
    await this.bulkDeleteBranchesApi(ids)
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

  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/')
      if (!response.ok) throw new Error('Failed to fetch provinces')
      return response.json()
    } catch (error) {
      console.error('Failed to fetch provinces:', error)
      return [
        { code: '79', name: 'Thành phố Hồ Chí Minh' },
        { code: '01', name: 'Thành phố Hà Nội' },
        { code: '48', name: 'Thành phố Đà Nẵng' },
        { code: '31', name: 'Thành phố Hải Phòng' },
        { code: '92', name: 'Thành phố Cần Thơ' }
      ]
    }
  }

  async getDistricts(provinceCode: string): Promise<District[]> {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      if (!response.ok) throw new Error('Failed to fetch districts')
      const data = await response.json()
      return data.districts || []
    } catch (error) {
      console.error('Failed to fetch districts:', error)
      return []
    }
  }

  async getWards(districtCode: string): Promise<Ward[]> {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      if (!response.ok) throw new Error('Failed to fetch wards')
      const data = await response.json()
      return data.wards || []
    } catch (error) {
      console.error('Failed to fetch wards:', error)
      return []
    }
  }
}

export const branchService = new BranchService()