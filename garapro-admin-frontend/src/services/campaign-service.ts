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
  Seasonal = 1,
  Loyalty = 2
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
  revenueGenerated: number;
  averageOrderValue: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    usageCount: number;
    totalSpent: number;
  }>;
  usageByDate: Array<{
    date: string;
    usageCount: number;
    revenue: number;
  }>;
  servicePerformance: Array<{
    serviceId: string;
    serviceName: string;
    usageCount: number;
    revenue: number;
  }>;
  conversionRate: number;
  redemptionRate: number;
}
class CampaignService {
   private baseURL = 'https://localhost:7113/api'

  // Map enum values to strings for display
  private campaignTypeMap = {
    [CampaignType.Discount]: 'discount',
    [CampaignType.Seasonal]: 'seasonal', 
    [CampaignType.Loyalty]: 'loyalty'
  };

  private discountTypeMap = {
    [DiscountType.Percentage]: 'percentage',
    [DiscountType.Fixed]: 'fixed',
    [DiscountType.FreeService]: 'free_service'
  };

  async getCampaigns(params: GetCampaignsParams = {}): Promise<CampaignsResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination params with defaults
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 10).toString());
    
    if (params.search) queryParams.append('search', params.search);
    
    if (params.type && params.type !== 'all') {
      const typeMap: { [key: string]: number } = {
        'discount': CampaignType.Discount,
        'seasonal': CampaignType.Seasonal,
        'loyalty': CampaignType.Loyalty
      };
      queryParams.append('type', typeMap[params.type]?.toString() || params.type);
    }
    
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/paged?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }

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
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch campaign: ${response.statusText}`);
    }

    const campaign = await response.json();
    
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
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create campaign: ${response.statusText}`);
    }

    return response.json();
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    const response = await fetch(`${this.baseURL}/ServiceCategories`);

    if (!response.ok) {
      throw new Error(`Failed to fetch service categories: ${response.statusText}`);
    }

    return response.json();
  }

  // Helper method to get all services from categories and subcategories
  getAllServicesFromCategories(categories: ServiceCategory[]): Service[] {
    const allServices: Service[] = [];

    const extractServices = (category: ServiceCategory) => {
      // Add services from current category
      if (category.services && category.services.length > 0) {
        allServices.push(...category.services);
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

    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update campaign error:', errorText);
      throw new Error(`Failed to update campaign: ${response.statusText}`);
    }

    const campaign = await response.json();
    
    // Transform the response back to frontend format
    return {
      ...campaign,
      type: this.campaignTypeMap[campaign.type as CampaignType] || 'discount',
      discountType: this.discountTypeMap[campaign.discountType as DiscountType] || 'percentage'
    };
  }


  async deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete campaign: ${response.statusText}`);
    }
  }

  async activateCampaign(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/${id}/activate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to activate campaign: ${response.statusText}`);
    }
  }

  async deactivateCampaign(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/${id}/deactivate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate campaign: ${response.statusText}`);
    }
  }

  async bulkActivateCampaigns(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/bulk/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk activate campaigns: ${response.statusText}`);
    }
  }

  async bulkDeactivateCampaigns(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/bulk/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk deactivate campaigns: ${response.statusText}`);
    }
  }

  async bulkDeleteCampaigns(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) {
    throw new Error("No campaign IDs provided for bulk delete.");
  }

  try {
    const response = await fetch(`${this.baseURL}/PromotionalCampaigns/range`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to bulk delete campaigns (${response.status}): ${errorText}`
      );
    }

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
        'discount': CampaignType.Discount,
        'seasonal': CampaignType.Seasonal,
        'loyalty': CampaignType.Loyalty
      };
      queryParams.append('type', typeMap[params.type]?.toString() || params.type);
    }
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await fetch(`${this.baseUrl}/export/${format}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Failed to export campaigns: ${response.statusText}`);
    }

    return response.blob();
  }

  // Helper methods for type conversion
  private getNumericType(typeString: string): number {
    const typeMap: { [key: string]: number } = {
      'discount': CampaignType.Discount,
      'seasonal': CampaignType.Seasonal,
      'loyalty': CampaignType.Loyalty
    };
    return typeMap[typeString] || CampaignType.Discount;
  }

  private getNumericDiscountType(discountTypeString: string): number {
    const discountTypeMap: { [key: string]: number } = {
      'percentage': DiscountType.Percentage,
      'fixed': DiscountType.Fixed,
      'free_service': DiscountType.FreeService
    };
    return discountTypeMap[discountTypeString] || DiscountType.Percentage;
  }

async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const response = await fetch(`${this.baseURL}/${campaignId}/analytics`);

    if (!response.ok) {
      throw new Error(`Failed to fetch campaign analytics: ${response.statusText}`);
    }

    const analytics = await response.json();
    
    return {
      totalUsage: analytics.totalUsage || 0,
      revenueGenerated: analytics.revenueGenerated || 0,
      averageOrderValue: analytics.averageOrderValue || 0,
      topCustomers: analytics.topCustomers || [],
      usageByDate: analytics.usageByDate || [],
      servicePerformance: analytics.servicePerformance || [],
      conversionRate: analytics.conversionRate || 0,
      redemptionRate: analytics.redemptionRate || 0
    };
  }

async getCampaignAnalyticsMock(campaignId: string): Promise<CampaignAnalytics> {
    // Giả lập dữ liệu analytics cho demo
    const mockAnalytics: CampaignAnalytics = {
      totalUsage: Math.floor(Math.random() * 500) + 100,
      revenueGenerated: Math.floor(Math.random() * 50000) + 10000,
      averageOrderValue: Math.floor(Math.random() * 200) + 50,
      topCustomers: [
        {
          customerId: 'cust-001',
          customerName: 'John Smith',
          usageCount: 15,
          totalSpent: 2500
        },
        {
          customerId: 'cust-002',
          customerName: 'Sarah Johnson',
          usageCount: 12,
          totalSpent: 1800
        },
        {
          customerId: 'cust-003',
          customerName: 'Mike Davis',
          usageCount: 8,
          totalSpent: 1200
        },
        {
          customerId: 'cust-004',
          customerName: 'Emily Wilson',
          usageCount: 6,
          totalSpent: 900
        },
        {
          customerId: 'cust-005',
          customerName: 'David Brown',
          usageCount: 5,
          totalSpent: 750
        }
      ],
      usageByDate: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          usageCount: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 500) + 100
        };
      }),
      servicePerformance: [
        {
          serviceId: 'svc-001',
          serviceName: 'Oil Change',
          usageCount: 45,
          revenue: 6750
        },
        {
          serviceId: 'svc-002',
          serviceName: 'Brake Service',
          usageCount: 32,
          revenue: 9600
        },
        {
          serviceId: 'svc-003',
          serviceName: 'Tire Rotation',
          usageCount: 28,
          revenue: 2240
        },
        {
          serviceId: 'svc-004',
          serviceName: 'AC Service',
          usageCount: 15,
          revenue: 3750
        }
      ],
      conversionRate: 0.15,
      redemptionRate: 0.08
    };

    return mockAnalytics;
  }

}

export const campaignService = new CampaignService();