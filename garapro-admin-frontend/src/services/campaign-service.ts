
// services/campaign-service.ts
export interface PromotionalCampaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
  services: Service[];
  voucherUsages: VoucherUsageDto;
}

export interface Service {
  serviceId: string;
  serviceCategoryId: string;
  serviceName: string;
  description: string;
  price: number;
  estimatedDuration: number;
  isActive: boolean;
  isAdvanced: boolean;
}

export enum CampaignType {
  Discount = 0,
}

export enum DiscountType {
  Percentage = 0,
  Fixed = 1,
  FreeService = 2
}

export interface GetCampaignsParams {
  search?: string;
  type?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CampaignsResponse {
  campaigns: PromotionalCampaign[];
  
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// services/campaign-service.ts
export interface CreateCampaignRequest {
  name: string;
  description: string;
  type: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  applicableServices: string[];
  minimumOrderValue?: number;
  maximumDiscount?: number;
  usageLimit?: number;
}
export interface UpdateCampaignRequest {
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  discountType?: string;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  serviceIds?: string[];

}
export interface VoucherUsageDto {
  id: string;
  customerId: string;
  campaignId: string;
  repairOrderId: string;
  usedAt?: string | null;
  customer?: CustomerDto;
  repairOrder?: RepairOrderDto;
}

export interface CustomerDto {
  customerId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

export interface RepairOrderDto {
  repairOrderId: string;
 
}

export interface ServiceCategory {
  serviceCategoryId: string;
  categoryName: string;
  serviceTypeId: string;
  parentServiceCategoryId: string | null;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  services: Service[];
  childCategories?: ServiceCategory[] | null;
}

export interface Service {
  serviceId: string;
  serviceCategoryId: string;
  serviceName: string;
  description: string;
  price: number;
  estimatedDuration: number;
  isActive: boolean;
  isAdvanced: boolean;
  createdAt: string;
  updatedAt: string | null;
  serviceCategory: ServiceCategory;
  branches: any[];
  parts: any[];
}
export interface CampaignAnalytics {
  totalUsage: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    usageCount: number;
  }>;
  usageByDate: Array<{
    date: string;
    usageCount: number;
  }>;
  servicePerformance: Array<{
    serviceId: string;
    serviceName: string;
    usageCount: number;
  }>;
}

export interface PromotionAppliedServiceDto {
  quotationServiceId: string;
  appliedPromotionId: string | null;
  promotionName?: string | null;
}

export interface PromotionAppliedNotificationDto {
  quotationId: string;
  userId: string;
  services: PromotionAppliedServiceDto[];
}

import { authService } from "@/services/authService"

class CampaignService {
   private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api'

  // Map enum values to strings for display
  private campaignTypeMap = {
    [CampaignType.Discount]: 'discount'
    
  };

  private discountTypeMap = {
    [DiscountType.Percentage]: 'percentage',
    [DiscountType.Fixed]: 'fixed',
    [DiscountType.FreeService]: 'free_service'
  };

 private getAuthToken(): string | null {
    return authService.getToken(); // CHỈ DÙNG GETTOKEN
  }

private async authenticatedFetch(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const MAX_RETRIES = 2;

  try {
    const token = await this.getAuthToken();

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Authentication required");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 401 -> thử refresh token 1 lần
    if (response.status === 401 && retryCount === 0) {
      try {
        await authService.handleTokenRefresh();
        return this.authenticatedFetch(url, options, retryCount + 1);
      } catch {
        throw new Error("Session expired. Please login again.");
      }
    }

    
    if (response.status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/access-denied";
      }
      throw new Error("Access denied: You do not have permission to access this resource.");
    }

    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage =
          (errorData.message
            ? errorData.message + (errorData.detail ? " " + errorData.detail : "")
            : errorData.error) || errorMessage;
        console.log("error", errorMessage)
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response;
  } catch (error: any) {
    const msg = error?.message || "";

    
    const isNetworkError =
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("ERR_HTTP2") ||
      msg.includes("HTTP2") ||
      msg.includes("stream") ||
      msg.includes("ECONNRESET");

    if (isNetworkError && retryCount < MAX_RETRIES) {
      const delay = 150 + retryCount * 150; // 150ms, 300ms
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.authenticatedFetch(url, options, retryCount + 1);
    }

    if (msg.includes("Authentication required")) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    throw error;
  }
}


  async getCampaigns(params: GetCampaignsParams = {}): Promise<CampaignsResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination params with defaults
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 10).toString());
    
    if (params.search) queryParams.append('search', params.search);
    
    if (params.type && params.type !== 'all') {
      const typeMap: { [key: string]: number } = {
        'discount': CampaignType.Discount
        
      };
      queryParams.append('type', typeMap[params.type]?.toString() || params.type);
    }
    
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/paged?${queryParams}`);

    const data = await response.json();
    
    // Transform the data to match the frontend expectations
    const transformedCampaigns = data.data.map((campaign: any) => ({
      ...campaign,
      // Convert numeric type to string for frontend display
      type: this.campaignTypeMap[campaign.type as CampaignType] || 'discount',
      // Convert numeric discountType to string for frontend display  
      discountType: this.discountTypeMap[campaign.discountType as DiscountType] || 'percentage'
    }));

    return {
      campaigns: transformedCampaigns,
      pagination: data.pagination
    };
  }

  async getCampaignById(id: string): Promise<PromotionalCampaign> {
    const response = await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/${id}`);

    const campaign = await response.json();
    console.log("get",campaign)
    return {
      ...campaign,
      type: this.campaignTypeMap[campaign.type as CampaignType] || 'discount',
      discountType: this.discountTypeMap[campaign.discountType as DiscountType] || 'percentage'
    };
  }

  async createCampaign(campaignData: CreateCampaignRequest): Promise<PromotionalCampaign> {
    // Transform data for API
    const payload = {
      name: campaignData.name,
      description: campaignData.description,
      type: this.getNumericType(campaignData.type),
      discountType: this.getNumericDiscountType(campaignData.discountType),
      discountValue: campaignData.discountValue,
      startDate: new Date(campaignData.startDate).toISOString(),
      endDate: new Date(campaignData.endDate).toISOString(),
      isActive: true, // Default to active when creating
      minimumOrderValue: campaignData.minimumOrderValue || 0,
      maximumDiscount: campaignData.maximumDiscount || 0,
      usageLimit: campaignData.usageLimit || 2147483647,
      serviceIds: campaignData.applicableServices
    };

    console.log(payload);
    const response = await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    const response = await this.authenticatedFetch(`${this.baseURL}/ServiceCategories`);
    return response.json();
  }

  async getParentCategories(): Promise<ServiceCategory[]> {
    const response = await this.authenticatedFetch(`${this.baseURL}/ServiceCategories/parentsForFilter`);
    return response.json();
  }

  async getServicesByFilter(params: {
    parentServiceCategoryId?: string;
    searchTerm?: string;
    isActive?: boolean;
  }): Promise<ServiceCategory[]> { // Đổi từ Service[] sang ServiceCategory[]
    const queryParams = new URLSearchParams();
    if (params.parentServiceCategoryId) queryParams.append('parentServiceCategoryId', params.parentServiceCategoryId);
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await this.authenticatedFetch(`${this.baseURL}/ServiceCategories/filter?${queryParams}`);
    console.log(`${this.baseURL}/ServiceCategories/filter?${queryParams}`);

    return response.json();
  }


  // Helper method to get all services from categories and subcategories
  getAllServicesFromCategories(categories: ServiceCategory[]): Service[] {
  const allServices: Service[] = [];

  const extractServices = (category: ServiceCategory) => {
    // Add services from current category
    if (category.services && category.services.length > 0) {
      allServices.push(...category.services.map(service => ({
        ...service,
       
      })));
    }

    // Recursively extract services from child categories
    if (category.childCategories && category.childCategories.length > 0) {
      category.childCategories.forEach(extractServices);
    }
  };

  categories.forEach(extractServices);
  return allServices;
}

  async updateCampaign(id: string, campaignData: UpdateCampaignRequest): Promise<PromotionalCampaign> {
    // Transform data for API
    const payload: any = {
      id: id,
    };

    // Only include fields that are provided in campaignData
    if (campaignData.name !== undefined) payload.name = campaignData.name;
    if (campaignData.description !== undefined) payload.description = campaignData.description;
    if (campaignData.type !== undefined) payload.type = this.getNumericType(campaignData.type);
    if (campaignData.discountType !== undefined) payload.discountType = this.getNumericDiscountType(campaignData.discountType);
    if (campaignData.discountValue !== undefined) payload.discountValue = campaignData.discountValue;
    if (campaignData.startDate !== undefined) payload.startDate = new Date(campaignData.startDate).toISOString();
    if (campaignData.endDate !== undefined) payload.endDate = new Date(campaignData.endDate).toISOString();
    if (campaignData.isActive !== undefined) payload.isActive = campaignData.isActive;
    if (campaignData.minimumOrderValue !== undefined) payload.minimumOrderValue = campaignData.minimumOrderValue;
    if (campaignData.maximumDiscount !== undefined) payload.maximumDiscount = campaignData.maximumDiscount;
    if (campaignData.usageLimit !== undefined) payload.usageLimit = campaignData.usageLimit;
    if (campaignData.serviceIds !== undefined) payload.serviceIds = campaignData.serviceIds;

    console.log('Update payload:', payload);

    const response = await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const campaign = await response.json();
    
    // Transform the response back to frontend format
    return {
      ...campaign,
      type: this.campaignTypeMap[campaign.type as CampaignType] || 'discount',
      discountType: this.discountTypeMap[campaign.discountType as DiscountType] || 'percentage'
    };
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async activateCampaign(id: string): Promise<void> {
    await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateCampaign(id: string): Promise<void> {
    await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async bulkActivateCampaigns(ids: string[]): Promise<void> {
    await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/bulk/activate`, {
      method: 'POST',
      body: JSON.stringify(ids),
    });
  }

  async bulkDeactivateCampaigns(ids: string[]): Promise<void> {
    await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/bulk/deactivate`, {
      method: 'POST',
      body: JSON.stringify(ids),
    });
  }

  async bulkDeleteCampaigns(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new Error("No campaign IDs provided for bulk delete.");
    }

    try {
      await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/range`, {
        method: "DELETE",
        body: JSON.stringify(ids),
      });

      console.log(`✅ Successfully deleted ${ids.length} campaigns`);
    } catch (error) {
      console.error("❌ bulkDeleteCampaigns error:", error);
      throw error;
    }
  }

  async exportCampaigns(params: GetCampaignsParams, format: 'csv' | 'excel'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.type && params.type !== 'all') {
      const typeMap: { [key: string]: number } = {
        'discount': CampaignType.Discount
        
      };
      queryParams.append('type', typeMap[params.type]?.toString() || params.type);
    }
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await this.authenticatedFetch(`${this.baseURL}/export/${format}?${queryParams}`);
    return response.blob();
  }

  // Helper methods for type conversion
private getNumericType(typeString: string): number {
  const typeMap: { [key: string]: number } = {
    'discount': CampaignType.Discount
    // Xóa 'seasonal' và 'loyalty'
  };
  return typeMap[typeString] || CampaignType.Discount;
}

private getNumericDiscountType(discountTypeString: string): number {
  const discountTypeMap: { [key: string]: number } = {
    'percentage': DiscountType.Percentage,
    'fixed': DiscountType.Fixed
    // Xóa 'free_service'
  };
  return discountTypeMap[discountTypeString] || DiscountType.Percentage;
}

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
  const response = await this.authenticatedFetch(`${this.baseURL}/PromotionalCampaigns/${campaignId}/analytics`);
  const analytics = await response.json();

  return {
    totalUsage: analytics.totalUsage || 0,
    topCustomers: analytics.topCustomers || [],
    usageByDate: analytics.usageByDate || [],
    servicePerformance: analytics.servicePerformance || [],
  };
}

  async getCampaignAnalyticsMock(campaignId: string): Promise<CampaignAnalytics> {
  const mockAnalytics: CampaignAnalytics = {
    totalUsage: Math.floor(Math.random() * 500) + 50,

    topCustomers: [
      { customerId: 'cust-001', customerName: 'John Smith', usageCount: 15 },
      { customerId: 'cust-002', customerName: 'Sarah Johnson', usageCount: 12 },
      { customerId: 'cust-003', customerName: 'Mike Davis', usageCount: 8 },
      { customerId: 'cust-004', customerName: 'Emily Wilson', usageCount: 6 },
      { customerId: 'cust-005', customerName: 'David Brown', usageCount: 5 }
    ],

    usageByDate: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        usageCount: Math.floor(Math.random() * 10) + 1,
      };
    }),

    servicePerformance: [
      { serviceId: 'svc-001', serviceName: 'Oil Change', usageCount: 45 },
      { serviceId: 'svc-002', serviceName: 'Brake Service', usageCount: 32 },
      { serviceId: 'svc-003', serviceName: 'Tire Rotation', usageCount: 28 },
      { serviceId: 'svc-004', serviceName: 'AC Service', usageCount: 15 }
    ]
  };

  return mockAnalytics;
}

}

export const campaignService = new CampaignService();