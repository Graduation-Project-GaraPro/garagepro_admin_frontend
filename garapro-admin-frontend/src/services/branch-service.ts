import { Commune } from '@/services/location-service';
import { authService } from "@/services/authService"


// services/branch-service.ts
export interface GarageBranch {
  branchId: string
  branchName: string
  phoneNumber: string
  email: string
  street: string
  commune: string
  province: string
 
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  services: Service[]
  staffs: Staff[]
  operatingHours: OperatingHour[]
  arrivalWindowMinutes: number
  maxBookingsPerWindow: number
  maxConcurrentWip: number
}

export interface CreateBranchRequest {
  branchName: string
  phoneNumber: string
  email: string
  street: string
  commune: string
  province: string
  description: string
  serviceIds: string[]
  staffIds: string[]
  operatingHours: OperatingHour[]
  arrivalWindowMinutes: number
  maxBookingsPerWindow: number
  maxConcurrentWip: number
}

export interface UpdateBranchRequest {
  branchId: string
  branchName: string
  phoneNumber: string
  email: string
  street: string
  commune: string
  province: string
  
  description: string
  isActive: boolean
  serviceIds: string[]
  staffIds: string[]
  operatingHours: OperatingHour[]
  arrivalWindowMinutes: number
  maxBookingsPerWindow: number
  maxConcurrentWip: number
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
export interface ImportErrorDetail {
  sheetName: string
  rowNumber?: number | null
  columnName?: string | null
  message: string
  errorCode?: string | null
}

export interface ImportResult {
  success: boolean
  message: string
  errors?: ImportErrorDetail[]
}

class BranchService {
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api'
  private dbUrl = '/data/db.json'
   private getAuthToken(): string | null {
    return authService.getToken(); // CHỈ DÙNG GETTOKEN
  }

  private async request<T>(url: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
    console.log('🚀 Making request to:', url);
    
    try {
      const token = await this.getAuthToken();
    console.log('🚀 Token:', token);

       if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        throw new Error('Authentication required');
      }
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
        console.log(' Access denied');
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
    console.log("bnranch",branchData)

    const url = `${this.baseURL}/Branch`;
    await this.request(url, {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }

  async updateBranch(branchId: string, branchData: UpdateBranchRequest): Promise<void> {
    console.log("bnranch",branchData)

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

 async importMasterData(file: File): Promise<ImportResult> {
  const token = this.getAuthToken()
  if (!token) {
    throw new Error('Authentication required')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${this.baseURL}/MasterImport/excel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, // KHÔNG set Content-Type ở đây
    },
    body: formData,
  })

  const text = await response.text()

  let raw: any = {}
  try {
    raw = JSON.parse(text)
  } catch {
    raw = {}
  }

  const normalized: ImportResult = {
    success: raw.success ?? raw.Success ?? response.ok,
    message: raw.message ?? raw.Message ?? (text || (response.ok ? 'Import completed.' : 'Import failed.')),
    errors: raw.errors ?? raw.Errors ?? [],
  }

  console.log('📥 Import API raw:', raw)
  console.log('✅ Import normalized:', normalized)

  if (!response.ok || !normalized.success) {
    throw normalized
  }

  return normalized
}

}

export const branchService = new BranchService()