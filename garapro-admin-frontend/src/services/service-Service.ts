// services/service-Service.ts

const API_BASE_URL = 'https://localhost:7113/api';

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

// Service functions
export const serviceService = {
  // Get all services (giữ nguyên)
  async getServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Services`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
        partIds: item.parts?.map((part: any) => part.partId) || []
      }));
      
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

// Add this method to serviceService object
async getServicesWithPagination(params: ServiceFilterParams): Promise<PaginatedResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.status) queryParams.append('status', params.status);
    if (params.serviceTypeId) queryParams.append('serviceTypeId', params.serviceTypeId);
    queryParams.append('pageNumber', params.pageNumber.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/Services/paged?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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

  // Get service by ID (giữ nguyên)
  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/Services/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
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
        partIds: item.parts?.map((part: any) => part.partId) || []
      };
      
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },


async getServiceByIdForDetails(id: string): Promise<ApiService | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/Services/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Trả về nguyên dữ liệu JSON từ API
    const item: ApiService = await response.json();
    return item;

  } catch (error) {
    console.error("Error fetching service by id:", error);
    throw error;
  }
},

  // Get all service categories (types) (giữ nguyên)
  async getServiceTypes(): Promise<ServiceType[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ServiceCategories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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

  // Get all branches (sửa lỗi mapping)
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Branch`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiBranch[] = await response.json();
      
      return data.branches.map((item): Branch => ({
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

  // Get all part categories with parts (giữ nguyên)
  async getPartCategories(): Promise<PartCategory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/PartCategories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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

  // Get all parts (flattened from categories) (giữ nguyên)
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

  // Create new service (chỉ trả về boolean)
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

      const response = await fetch(`${API_BASE_URL}/Services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      // Chỉ trả về true nếu thành công, không cần parse response
      return true;
      
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  // Update service (chỉ trả về boolean)
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

      const response = await fetch(`${API_BASE_URL}/Services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      // Chỉ trả về true nếu thành công, không cần parse response
      return true;
      
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete service (giữ nguyên)
  async deleteService(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/Services/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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