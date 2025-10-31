// services/service-Service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api';
import { authService } from "@/services/authService"

// Types (giữ nguyên)
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
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  parentServiceCategoryId:string
}

export interface Branch {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
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
  parts: Part[];
}

export interface PartService {
  partId: string;
  quantity: number;
  part?: Part;
  price: number;
}

// API Request/Response Interfaces (giữ nguyên)
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
  serviceCategory: {
    serviceCategoryId: string;
    categoryName: string;
    serviceTypeId: string;
    parentServiceCategoryId: string | null;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
  branches: ApiBranch[];
  parts?: any[];
}

interface ApiBranch {
  branchId: string;
  branchName: string;
  phoneNumber: string;
  email: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
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
  partIds: string[];
}

interface PaginatedResponse {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Service[];
}

interface ServiceFilterParams {
  searchTerm?: string;
  status?: string;
  serviceTypeId?: string;
  pageNumber: number;
  pageSize: number;
}

const getAuthToken =  (): string | null => {
  return authService.getToken();
  // return await authService.getValidToken();
};

// Helper function for making authenticated requests
const authenticatedFetch = async (url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> => {
  try {
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
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Token expired - try to refresh and retry
    if (response.status === 401 && retryCount === 0) {
      try {
        await authService.handleTokenRefresh();
        return authenticatedFetch(url, options, retryCount + 1);
      } catch (refreshError) {
        throw new Error('Session expired. Please login again.');
      }
    }
     if (response.status === 403) {
      console.log('🚫 Access denied');
      if (typeof window !== 'undefined') {
        window.location.href = '/access-denied';
      }
      window.location.href = '/access-denied';
      throw new Error('Access denied: You do not have permission to access this resource.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Authentication required')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    throw error;
  }
};

// Service functions
export const serviceService = {
  // Get all services
  async getServices(): Promise<Service[]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Services`);
      
      const data: ApiService[] = await response.json();
      
      return data.map((item): Service => ({
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
          isActive: item.serviceCategory?.isActive || false
        },
        branchIds: item.branches?.map((branch) => branch.branchId) || [],
        branches: item.branches?.map(branch => ({
          id: branch.branchId,
          name: branch.branchName,
          phoneNumber: branch.phoneNumber,
          email: branch.email,
          street: branch.street,
          ward: branch.ward,
          district: branch.district,
          city: branch.city,
          description: branch.description,
          isActive: branch.isActive,
          createdAt: branch.createdAt,
          updatedAt: branch.updatedAt
        })) || [],
        serviceStatus: item.serviceStatus,
        isAdvanced: item.isAdvanced,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        parts: item.parts || [],
        partIds: item.parts?.map((part: any) => part.partId) || []
      }));
      
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get services with pagination
  async getServicesWithPagination(params: ServiceFilterParams): Promise<PaginatedResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.status) queryParams.append('status', params.status);
      if (params.serviceTypeId) queryParams.append('serviceTypeId', params.serviceTypeId);
      queryParams.append('pageNumber', params.pageNumber.toString());
      queryParams.append('pageSize', params.pageSize.toString());

      const response = await authenticatedFetch(`${API_BASE_URL}/Services/paged?${queryParams}`);
      
      const data: PaginatedResponse = await response.json();
      console.log(data);
      console.log(queryParams);

      // Map the API response data to Service objects
      const services: Service[] = data.data.map((item: any): Service => ({
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
          isActive: item.serviceCategory?.isActive || false
        },
        branchIds: item.branches?.map((branch: any) => branch.branchId) || [],
        branches: item.branches?.map((branch: any) => ({
          id: branch.branchId,
          name: branch.branchName,
          phoneNumber: branch.phoneNumber,
          email: branch.email,
          street: branch.street,
          ward: branch.ward,
          district: branch.district,
          city: branch.city,
          description: branch.description,
          isActive: branch.isActive,
          createdAt: branch.createdAt,
          updatedAt: branch.updatedAt
        })) || [],
        serviceStatus: item.serviceStatus,
        isAdvanced: item.isAdvanced,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        parts: item.parts || [],
        partIds: item.parts?.map((part: any) => part.partId) || []
      }));

      return {
        ...data,
        data: services
      };
      
    } catch (error) {
      console.error('Error fetching services with pagination:', error);
      throw error;
    }
  },

  // Get service by ID
  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Services/${id}`);
      
      if (response.status === 404) {
        return null;
      }
      
      const item: ApiService = await response.json();
      
      return {
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
          isActive: item.serviceCategory?.isActive || false,
          parentServiceCategoryId: item.serviceCategory.parentServiceCategoryId|| ''
        },
        branchIds: item.branches?.map((branch) => branch.branchId) || [],
        branches: item.branches?.map(branch => ({
          id: branch.branchId,
          name: branch.branchName,
          phoneNumber: branch.phoneNumber,
          email: branch.email,
          street: branch.street,
          ward: branch.ward,
          district: branch.district,
          city: branch.city,
          description: branch.description,
          isActive: branch.isActive,
          createdAt: branch.createdAt,
          updatedAt: branch.updatedAt
        })) || [],
        serviceStatus: item.serviceStatus,
        isAdvanced: item.isAdvanced,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        partIds: item.parts?.map((part: any) => part.partId) || []
      };
      
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  // Get service by ID for details
  async getServiceByIdForDetails(id: string): Promise<ApiService | null> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Services/${id}`);
      
      if (response.status === 404) {
        return null;
      }

      // Trả về nguyên dữ liệu JSON từ API
      const item: ApiService = await response.json();
      return item;

    } catch (error) {
      console.error("Error fetching service by id:", error);
      throw error;
    }
  },

  // Get all service categories (types)
  async getServiceTypes(): Promise<ServiceType[]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/ServiceCategories`);
      
      const data: ApiServiceCategory[] = await response.json();
      
      return data.map((item): ServiceType => ({
        id: item.serviceCategoryId,
        name: item.categoryName,
        description: item.description,
        isActive: item.isActive
      }));
      
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  },

  async getParentCategories(): Promise<any[]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/ServiceCategories/parents`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      throw error;
    }
  },
  // Get all branches
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Branch`);
      
      const data: any = await response.json();
      
      return data.branches.map((item: ApiBranch): Branch => ({
        id: item.branchId,
        name: item.branchName,
        phoneNumber: item.phoneNumber,
        email: item.email,
        street: item.street,
        ward: item.ward,
        district: item.district,
        city: item.city,
        description: item.description,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
      
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  // Get all part categories with parts
  async getPartCategories(): Promise<PartCategory[]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/PartCategories`);
      
      const data: ApiPartCategory[] = await response.json();
      
      return data.map((category): PartCategory => ({
        partCategoryId: category.partCategoryId,
        categoryName: category.categoryName,
        parts: category.parts.map((part): Part => ({
          id: part.partId,
          name: part.name,
          description: part.description || '',
          price: part.price,
          stock: part.stock,
          isActive: true,
          partCategoryId: category.partCategoryId
        }))
      }));
      
    } catch (error) {
      console.error('Error fetching part categories:', error);
      throw error;
    }
  },

  // Get all parts (flattened from categories)
  async getParts(): Promise<Part[]> {
    try {
      const categories = await this.getPartCategories();
      const allParts: Part[] = [];
      
      categories.forEach(category => {
        allParts.push(...category.parts);
      });
      
      return allParts;
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
        serviceStatus: "Active",
        description: serviceData.description,
        price: serviceData.basePrice,
        estimatedDuration: serviceData.estimatedDuration,
        isActive: serviceData.isActive,
        isAdvanced: false,
        branchIds: serviceData.branchIds || [],
        partIds: serviceData.partIds || []
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/Services`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      
      // Chỉ trả về true nếu thành công, không cần parse response
      return true;
      
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service
  async updateService(id: string, serviceData: any): Promise<boolean> {
    try {
      console.log(serviceData);
      const requestData: CreateServiceRequest = {
        serviceCategoryId: serviceData.serviceTypeId,
        serviceName: serviceData.name,
        serviceStatus: serviceData.serviceStatus || "Active",
        description: serviceData.description,
        price: serviceData.basePrice,
        estimatedDuration: serviceData.estimatedDuration,
        isActive: serviceData.isActive,
        isAdvanced: serviceData.isAdvanced || false,
        branchIds: serviceData.branchIds || [],
        partIds: serviceData.partIds || []
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/Services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      
      // Chỉ trả về true nếu thành công, không cần parse response
      return true;
      
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Bulk update service status
  async bulkUpdateServiceStatus(serviceIds: string[], isActive: boolean): Promise<void> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/services/bulk-update-status`, {
        method: 'PATCH',
        body: JSON.stringify({ serviceIds, isActive: isActive }),
      });
    } catch (error) {
      console.error('Error bulk updating service status:', error);
      throw error;
    }
  },

  // Bulk update advance status for multiple services
  async bulkUpdateServiceAdvanceStatus(serviceIds: string[], isAdvance: boolean): Promise<void> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/services/bulk-update-advance-status`, {
        method: 'PATCH',
        body: JSON.stringify({ serviceIds, isAdvanced: isAdvance }),
      });
    } catch (error) {
      console.error('Error bulk updating service advance status:', error);
      throw error;
    }
  },

  // Delete service
  async deleteService(id: string): Promise<boolean> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/Services/${id}`, {
        method: 'DELETE',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Add part to service (legacy method - now handled in main request)
  async addPartToService(serviceId: string, partId: string, quantity: number): Promise<boolean> {
    console.warn('addPartToService is deprecated. Parts should be included in the main service request.');
    return true;
  }
};