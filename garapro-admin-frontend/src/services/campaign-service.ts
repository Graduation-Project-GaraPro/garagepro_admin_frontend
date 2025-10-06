import { apiClient } from './api-client'

export interface PromotionalCampaign {
  id: string
  name: string
  description: string
  type: 'discount' | 'seasonal' | 'loyalty'
  discountType: 'percentage' | 'fixed' | 'free_service'
  discountValue: number
  startDate: string
  endDate: string
  isActive: boolean
  applicableServices: string[]
  minimumOrderValue?: number
  maximumDiscount?: number
  usageLimit?: number
  usedCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCampaignRequest {
  name: string
  description: string
  type: 'discount' | 'seasonal' | 'loyalty'
  discountType: 'percentage' | 'fixed' | 'free_service'
  discountValue: number
  startDate: string
  endDate: string
  applicableServices: string[]
  minimumOrderValue?: number
  maximumDiscount?: number
  usageLimit?: number
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  isActive?: boolean
}

export interface CampaignFilters {
    type?: string
    isActive?: boolean
  dateRange?: {
    start: string
    end: string
  }
    search?: string
  page?: number
  limit?: number
}

export interface CampaignResponse {
  campaigns: PromotionalCampaign[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class CampaignService {
  private baseUrl = '/api/campaigns'
  private storageKey = 'mock.campaigns'
  private initialized = false

  private initializeFallbackData(): void {
    if (this.initialized) return
    
    try {
      const existing = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null
      if (!existing) {
        // Initialize with fallback data
        const fallbackData = this.getFallbackCampaigns()
        this.writeCache(fallbackData.campaigns)
        console.log('Initialized campaign fallback data')
      }
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize fallback data:', error)
    }
  }

  private readCache(): PromotionalCampaign[] {
    this.initializeFallbackData()
    
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null
      if (raw) {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      }
    } catch (error) {
      console.error('Failed to read cache:', error)
    }
    
    return this.getFallbackCampaigns().campaigns
  }

  private writeCache(campaigns: PromotionalCampaign[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this.storageKey, JSON.stringify(campaigns))
      }
    } catch (error) {
      console.error('Failed to write cache:', error)
    }
  }

  async getCampaigns(filters?: CampaignFilters): Promise<CampaignResponse> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.type) params.type = filters.type
      if (filters?.isActive !== undefined) params.isActive = filters.isActive
      if (filters?.search) params.search = filters.search
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<CampaignResponse>(this.baseUrl, params)
      return response.data
    } catch (error) {
      console.log('API failed, using fallback data for campaigns')
      
      // Use fallback data
      const campaigns = this.readCache()
      let result = [...campaigns]
      
      // Apply filters
      if (filters?.type) {
        result = result.filter(c => c.type === filters.type)
      }
      if (filters?.isActive !== undefined) {
        result = result.filter(c => c.isActive === filters.isActive)
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase()
        result = result.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.description.toLowerCase().includes(query)
        )
      }
      if (filters?.dateRange) {
        const start = new Date(filters.dateRange.start).getTime()
        const end = new Date(filters.dateRange.end).getTime()
        result = result.filter(c => {
          const campaignStart = new Date(c.startDate).getTime()
          const campaignEnd = new Date(c.endDate).getTime()
          return campaignEnd >= start && campaignStart <= end
        })
      }
      
      // Apply pagination
      const page = filters?.page ?? 1
      const limit = filters?.limit ?? 10
      const total = result.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const startIndex = (page - 1) * limit
      const pageItems = result.slice(startIndex, startIndex + limit)
      
      return { 
        campaigns: pageItems, 
        total, 
        page, 
        limit, 
        totalPages 
      }
    }
  }

  async getCampaignById(id: string): Promise<PromotionalCampaign> {
    try {
      const response = await apiClient.get<PromotionalCampaign>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.log(`API failed for campaign ${id}, using fallback data`)
      
      // Try to get from cache/fallback data
      const campaigns = this.readCache()
      const campaign = campaigns.find(c => c.id === id)
      
      if (campaign) {
        console.log(`Found campaign ${id} in fallback data:`, campaign)
        return campaign
      }
      
      console.error(`Campaign ${id} not found in fallback data`)
      throw new Error(`Campaign with ID ${id} not found`)
    }
  }

  async createCampaign(campaign: CreateCampaignRequest): Promise<PromotionalCampaign> {
    try {
      const response = await apiClient.post<PromotionalCampaign>(this.baseUrl, campaign)
      return response.data
    } catch (error) {
      console.log('API failed for create campaign, using fallback')
      
      // Create campaign in local storage
      const campaigns = this.readCache()
      const nowIso = new Date().toISOString()
      const newCampaign: PromotionalCampaign = {
        id: `campaign_${Date.now()}`,
        usedCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
        isActive: true,
        minimumOrderValue: 0,
        maximumDiscount: 0,
        usageLimit: 0,
        ...campaign,
      }
      
      campaigns.unshift(newCampaign)
      this.writeCache(campaigns)
      console.log('Created campaign in fallback data:', newCampaign)
      
      return newCampaign
    }
  }

  async updateCampaign(id: string, updates: UpdateCampaignRequest): Promise<PromotionalCampaign> {
    try {
      const response = await apiClient.put<PromotionalCampaign>(`${this.baseUrl}/${id}`, updates)
      return response.data
    } catch (error) {
      console.log(`API failed for update campaign ${id}, using fallback`)
      
      // Update campaign in local storage
      const campaigns = this.readCache()
      const index = campaigns.findIndex(c => c.id === id)
      
      if (index === -1) {
        throw new Error(`Campaign with ID ${id} not found`)
      }
      
      const existingCampaign = campaigns[index]
      const updatedCampaign: PromotionalCampaign = {
        ...existingCampaign,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      
      campaigns[index] = updatedCampaign
      this.writeCache(campaigns)
      console.log('Updated campaign in fallback data:', updatedCampaign)
      
      return updatedCampaign
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.log(`API failed for delete campaign ${id}, using fallback`)
      
      // Remove campaign from local storage
      const campaigns = this.readCache().filter(c => c.id !== id)
      this.writeCache(campaigns)
      console.log(`Deleted campaign ${id} from fallback data`)
    }
  }

  async activateCampaign(id: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/activate`)
    } catch (error) {
      console.log(`API failed for activate campaign ${id}, using fallback`)
      await this.updateCampaign(id, { isActive: true })
    }
  }

  async deactivateCampaign(id: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/deactivate`)
    } catch (error) {
      console.log(`API failed for deactivate campaign ${id}, using fallback`)
      await this.updateCampaign(id, { isActive: false })
    }
  }

  async toggleCampaignStatus(id: string, isActive: boolean): Promise<void> {
    if (isActive) {
      return this.activateCampaign(id)
    }
    return this.deactivateCampaign(id)
  }

  async getCampaignAnalytics(id: string): Promise<{
    totalUsage: number
    totalDiscount: number
    averageOrderValue: number
    conversionRate: number
    topUsers: Array<{ userId: string; userName: string; usageCount: number; totalDiscount: number }>
  }> {
    try {
      const response = await apiClient.get<{
        totalUsage: number
        totalDiscount: number
        averageOrderValue: number
        conversionRate: number
        topUsers: Array<{ userId: string; userName: string; usageCount: number; totalDiscount: number }>
      }>(`${this.baseUrl}/${id}/analytics`)
      return response.data
    } catch (error) {
      console.log(`API failed for analytics ${id}, using fallback`)
      return this.getFallbackAnalytics()
    }
  }

  async exportCampaigns(filters?: CampaignFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format }
      if (filters?.type) params.type = filters.type
      if (filters?.isActive !== undefined) params.isActive = filters.isActive
      if (filters?.search) params.search = filters.search
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export campaigns:', error)
      throw new Error('Failed to export campaigns. Please try again.')
    }
  }

  // Bulk operations
  async bulkUpdateCampaigns(campaignIds: string[], updates: Partial<UpdateCampaignRequest>): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-update`, { campaignIds, updates })
    } catch (error) {
      console.error('Failed to bulk update campaigns:', error)
      throw new Error('Failed to bulk update campaigns. Please try again.')
    }
  }

  async bulkDeleteCampaigns(campaignIds: string[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk-delete`, { body: { campaignIds } })
    } catch (error) {
      console.error('Failed to bulk delete campaigns:', error)
      throw new Error('Failed to bulk delete campaigns. Please try again.')
    }
  }

  async bulkActivateCampaigns(campaignIds: string[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-activate`, { campaignIds })
    } catch (error) {
      console.error('Failed to bulk activate campaigns:', error)
      throw new Error('Failed to bulk activate campaigns. Please try again.')
    }
  }

  async bulkDeactivateCampaigns(campaignIds: string[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-deactivate`, { campaignIds })
    } catch (error) {
      console.error('Failed to bulk deactivate campaigns:', error)
      throw new Error('Failed to bulk deactivate campaigns. Please try again.')
    }
  }

  // Search campaigns
  async searchCampaigns(query: string, filters?: Omit<CampaignFilters, 'search'>): Promise<CampaignResponse> {
    try {
      const params: Record<string, unknown> = { search: query }
      if (filters?.type) params.type = filters.type
      if (filters?.isActive !== undefined) params.isActive = filters.isActive
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      const response = await apiClient.get<CampaignResponse>(`${this.baseUrl}/search`, params)
      return response.data
    } catch (error) {
      console.error('Failed to search campaigns:', error)
      throw new Error('Failed to search campaigns. Please try again.')
    }
  }

  // Fallback data methods
  private getFallbackCampaigns(): CampaignResponse {
    return {
      campaigns: [
        {
          id: '1',
          name: 'Summer Service Discount',
          description: 'Get 20% off on all summer services including oil change, AC service, and tire rotation',
          type: 'seasonal',
          discountType: 'percentage',
          discountValue: 20,
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          isActive: true,
          applicableServices: ['Oil Change', 'AC Service', 'Tire Rotation'],
          minimumOrderValue: 100,
          maximumDiscount: 200,
          usageLimit: 1000,
          usedCount: 156,
          createdAt: '2024-05-01T00:00:00Z',
          updatedAt: '2024-05-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'New Customer Welcome',
          description: 'Free diagnostic service for new customers to welcome them to our service center',
          type: 'loyalty',
          discountType: 'free_service',
          discountValue: 0,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
          applicableServices: ['Engine Tune-up'],
          minimumOrderValue: 0,
          maximumDiscount: 0,
          usageLimit: 500,
          usedCount: 89,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Spring Maintenance Special',
          description: 'Fixed $50 discount on comprehensive spring maintenance package',
          type: 'discount',
          discountType: 'fixed',
          discountValue: 50,
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          isActive: false,
          applicableServices: ['Oil Change', 'Brake Service', 'Battery Replacement'],
          minimumOrderValue: 200,
          maximumDiscount: 50,
          usageLimit: 200,
          usedCount: 45,
          createdAt: '2024-02-15T00:00:00Z',
          updatedAt: '2024-02-15T00:00:00Z'
        }
      ],
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  }

  private getFallbackAnalytics(): {
    totalUsage: number
    totalDiscount: number
    averageOrderValue: number
    conversionRate: number
    topUsers: Array<{ userId: string; userName: string; usageCount: number; totalDiscount: number }>
  } {
    return {
      totalUsage: 245,
      totalDiscount: 12500,
      averageOrderValue: 350,
      conversionRate: 12.5,
      topUsers: [
        { userId: 'u1', userName: 'John Doe', usageCount: 5, totalDiscount: 250 },
        { userId: 'u2', userName: 'Jane Smith', usageCount: 3, totalDiscount: 180 },
        { userId: 'u3', userName: 'Mike Johnson', usageCount: 2, totalDiscount: 120 }
      ]
    }
  }
}

export const campaignService = new CampaignService()