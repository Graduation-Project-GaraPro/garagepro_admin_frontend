// services/service-Service.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api';

import { authService } from '@/services/authService';

// =======================
// Domain Types
// =======================

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: number;
  isActive: boolean;
  serviceType: ServiceType;
  branchIds: string[];
  branches: Branch[];
  serviceStatus: string;
  isAdvanced: boolean;
  createdAt: string;
  updatedAt: string | null;
  parts?: PartService[];
  partIds?: string[];
  partCategoryIds?: string[];
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  parentServiceCategoryId?: string;
}

export interface Branch {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  street: string;
  province: string;
  commune: string;
  description: string;
  isActive: boolean;
  
}

export interface Part {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  partCategoryId?: string;
}

export interface PartCategory {
  partCategoryId: string;
  categoryName: string;
  parts?: Part[];
}

export interface PartService {
  partId: string;
  quantity: number;
  part?: Part;
  price: number;
}

// =======================
// API DTOs
// =======================

export interface ApiService {
  serviceId: string;
  serviceCategoryId: string;
  serviceName: string;
  serviceStatus: string;
  description: string;
  price: number;
  estimatedDuration: number;
  isActive: boolean;
  isAdvanced: boolean;
  createdAt: string;
  updatedAt: string | null;
  serviceCategory: ApiServiceCategory;
  branches: ApiBranch[];
  partCategories?: PartCategoryWithParts[];
}

// dùng thêm type này cho các nơi trả về phần `parts` phẳng
type ApiServiceWithParts = ApiService & {
  parts?: ApiPart[];
};

interface PartCategoryWithParts {
  partCategoryId: string;
  categoryName: string;
  parts: ApiPart[];
}

interface ApiBranch {
  branchId: string;
  branchName: string;
  phoneNumber: string;
  email: string;
  street: string;
  province: string;
  commune: string;
  description: string;
  isActive: boolean;
  
}

interface ApiServiceCategory {
  serviceCategoryId: string;
  categoryName: string;
  serviceTypeId: string;
  parentServiceCategoryId: string | null;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface ApiPartCategory {
  partCategoryId: string;
  categoryName: string;
  parts: ApiPart[];
}

interface ApiPart {
  partId: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
}

interface CreateServiceRequest {
  serviceCategoryId: string;
  serviceName: string;
  serviceStatus: string;
  description: string;
  price: number;
  estimatedDuration: number;
  isActive: boolean;
  isAdvanced: boolean;
  branchIds: string[];
  partCategoryIds: string[];
}

interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}

export interface ServiceFilterParams {
  searchTerm?: string;
  status?: string;
  serviceTypeId?: string;
  pageNumber: number;
  pageSize: number;
}

// =======================
// Auth helper
// =======================

const getAuthToken = (): string | null => {
  return authService.getToken();
  // hoặc dùng: return await authService.getValidToken();
};

// Helper function cho fetch có auth + refresh token
const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> => {
  const token = getAuthToken();

  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    throw new Error('Authentication required');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Token hết hạn → refresh 1 lần
  if (response.status === 401 && retryCount === 0) {
    try {
      await authService.handleTokenRefresh();
      return authenticatedFetch(url, options, retryCount + 1);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new Error('Session expired. Please login again.');
    }
  }

  // Không có quyền
  if (response.status === 403) {
    if (typeof window !== 'undefined') {
      window.location.href = '/access-denied';
    }
    throw new Error(
      'Access denied: You do not have permission to access this resource.'
    );
  }

  if (!response.ok) {
    let message = `HTTP error! status: ${response.status}`;
    try {
      const errorBody = await response.json();
      message += `, message: ${
        errorBody.detail || errorBody.message || 'Unknown error'
      }`;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return response;
};

// =======================
// Mapping helpers
// =======================

const mapApiBranchToBranch = (item: ApiBranch): Branch => ({
  id: item.branchId,
  name: item.branchName,
  phoneNumber: item.phoneNumber,
  email: item.email,
  street: item.street,
  province: item.province,
  commune: item.commune,
  description: item.description,
  isActive: item.isActive,
  
});

const mapApiServiceToService = (
  item: ApiService | ApiServiceWithParts
): Service => ({
  id: item.serviceId,
  name: item.serviceName,
  description: item.description,
  basePrice: item.price,
  estimatedDuration: item.estimatedDuration,
  isActive: item.isActive,
  serviceType: {
    id: item.serviceCategory?.serviceCategoryId || '',
    name: item.serviceCategory?.categoryName || 'Uncategorized',
    description: item.serviceCategory?.description || '',
    isActive: item.serviceCategory?.isActive ?? false,
    parentServiceCategoryId: item.serviceCategory?.parentServiceCategoryId ?? undefined,
  },
  branchIds: item.branches?.map((b) => b.branchId) || [],
  branches: item.branches?.map(mapApiBranchToBranch) || [],
  serviceStatus: item.serviceStatus,
  isAdvanced: item.isAdvanced,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  // phần này tùy backend bạn:
  // - Nếu API trả về parts phẳng → dùng item.parts
  // - Nếu chỉ có partCategories → chỉ lưu id
  parts:
    'parts' in item && item.parts
      ? item.parts.map<PartService>((p) => ({
          partId: p.partId,
          quantity: 1,
          price: p.price,
          part: {
            id: p.partId,
            name: p.name,
            description: p.description || '',
            price: p.price,
            stock: p.stock,
            isActive: true,
          },
        }))
      : undefined,
  partIds:
    'parts' in item && item.parts
      ? item.parts.map((p) => p.partId)
      : undefined,
  partCategoryIds: item.partCategories?.map((pc) => pc.partCategoryId) || [],
});

// =======================
// Service functions
// =======================

export const serviceService = {
  // Get all services
  async getServices(): Promise<Service[]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Services`);
      const data: ApiService[] = await response.json();

      return data.map(mapApiServiceToService);
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get services with pagination
  async getServicesWithPagination(
    params: ServiceFilterParams
  ): Promise<PaginatedResponse<Service>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.status) queryParams.append('status', params.status);
      if (params.serviceTypeId)
        queryParams.append('serviceTypeId', params.serviceTypeId);
      queryParams.append('pageNumber', String(params.pageNumber));
      queryParams.append('pageSize', String(params.pageSize));

      const response = await authenticatedFetch(
        `${API_BASE_URL}/Services/paged?${queryParams.toString()}`
      );

      const rawData: PaginatedResponse<ApiServiceWithParts> =
        await response.json();

      const services = rawData.data.map(mapApiServiceToService);

      return {
        ...rawData,
        data: services,
      };
    } catch (error) {
      console.error('Error fetching services with pagination:', error);
      throw error;
    }
  },

  // Get service by ID (domain Service)
  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Services/${id}`);

      if (response.status === 404) {
        return null;
      }

      const item: ApiService = await response.json();
      return mapApiServiceToService(item);
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  // Get service by ID for details (raw API)
  async getServiceByIdForDetails(id: string): Promise<ApiService | null> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Services/${id}`);

      if (response.status === 404) {
        return null;
      }

      const item: ApiService = await response.json();
      return item;
    } catch (error) {
      console.error('Error fetching service by id:', error);
      throw error;
    }
  },

  // Get all service categories (types)
  async getServiceTypes(): Promise<ServiceType[]> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/ServiceCategories`
      );

      const data: ApiServiceCategory[] = await response.json();

      return data.map((item): ServiceType => ({
        id: item.serviceCategoryId,
        name: item.categoryName,
        description: item.description,
        isActive: item.isActive,
        parentServiceCategoryId: item.parentServiceCategoryId ?? undefined,
      }));
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  },

  async getParentCategories(): Promise<any[]> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/ServiceCategories/parents`
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      throw error;
    }
  },

  // Get all branches
  async getBranches(): Promise<Branch[]> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/Branch/GetAllBranchesBasis`
    );

    const data: any[] = await response.json();

    return data.map((item) => ({
      id: item.branchId,
      name: item.branchName,
      phoneNumber: item.phoneNumber,
      email: item.email,
      street: item.street,
      province: item.province,
      commune: item.commune,
      description: item.description,
      isActive: item.isActive
      
    }));
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
},

  // Get all part categories with parts
  async getPartCategories(): Promise<PartCategory[]> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/PartCategories`
      );

      const data: ApiPartCategory[] = await response.json();

      return data.map(
        (category): PartCategory => ({
          partCategoryId: category.partCategoryId,
          categoryName: category.categoryName,
          parts: category.parts.map(
            (part): Part => ({
              id: part.partId,
              name: part.name,
              description: part.description || '',
              price: part.price,
              stock: part.stock,
              isActive: true,
              partCategoryId: category.partCategoryId,
            })
          ),
        })
      );
    } catch (error) {
      console.error('Error fetching part categories:', error);
      throw error;
    }
  },

  // Get all parts (flattened from categories)
  async getParts(): Promise<Part[]> {
    try {
      const categories = await this.getPartCategories();
      return categories.flatMap((c) => c.parts || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
      return [];
    }
  },

  // Create new service
  async createService(serviceData: any): Promise<boolean> {
    try {
      const requestData: CreateServiceRequest = {
        serviceCategoryId: serviceData.serviceTypeId,
        serviceName: serviceData.name,
        serviceStatus: 'Active',
        description: serviceData.description,
        price: serviceData.basePrice,
        estimatedDuration: serviceData.estimatedDuration,
        isActive: serviceData.isActive,
        isAdvanced: serviceData.isAdvanced ,
        branchIds: serviceData.branchIds || [],
        partCategoryIds: serviceData.partCategoryIds || serviceData.partIds || [],
      };
      console.log(requestData)
      await authenticatedFetch(`${API_BASE_URL}/Services`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      return true;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service
  async updateService(id: string, serviceData: any): Promise<boolean> {
    try {
      const requestData: CreateServiceRequest = {
        serviceCategoryId: serviceData.serviceTypeId,
        serviceName: serviceData.name,
        serviceStatus: serviceData.serviceStatus || 'Active',
        description: serviceData.description,
        price: serviceData.basePrice,
        estimatedDuration: serviceData.estimatedDuration,
        isActive: serviceData.isActive,
        isAdvanced: serviceData.isAdvanced || false,
        branchIds: serviceData.branchIds || [],
        partCategoryIds: serviceData.partCategoryIds ,
      };

      console.log(requestData)
      await authenticatedFetch(`${API_BASE_URL}/Services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });

      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Bulk update service status
  async bulkUpdateServiceStatus(
    serviceIds: string[],
    isActive: boolean
  ): Promise<void> {
    try {
      await authenticatedFetch(
        `${API_BASE_URL}/services/bulk-update-status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ serviceIds, isActive }),
        }
      );
    } catch (error) {
      console.error('Error bulk updating service status:', error);
      throw error;
    }
  },

  // Bulk update advance status for multiple services
  async bulkUpdateServiceAdvanceStatus(
    serviceIds: string[],
    isAdvance: boolean
  ): Promise<void> {
    try {
      await authenticatedFetch(
        `${API_BASE_URL}/services/bulk-update-advance-status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ serviceIds, isAdvanced: isAdvance }),
        }
      );
    } catch (error) {
      console.error('Error bulk updating service advance status:', error);
      throw error;
    }
  },

  // Delete service
  async deleteService(id: string): Promise<boolean> {
    try {
      await authenticatedFetch(`${API_BASE_URL}/Services/${id}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Legacy: Add part to service (để lại cho đủ interface)
  async addPartToService(
    _serviceId: string,
    _partId: string,
    _quantity: number
  ): Promise<boolean> {
    console.warn(
      'addPartToService is deprecated. Parts should be included in the main service request.'
    );
    return true;
  },
};
