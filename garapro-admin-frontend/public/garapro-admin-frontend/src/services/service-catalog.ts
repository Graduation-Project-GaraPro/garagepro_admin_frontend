import { apiClient } from './api-client'

export interface GarageServiceCatalogItem {
  id: string
  name: string
  description: string
  basePrice: number
  duration: number
  category: string
  isActive: boolean
}

export interface ServiceCatalogFilters {
  search?: string
  category?: string
  isActive?: boolean
}

class ServiceCatalogService {
  private baseUrl = '/service-catalog'
  private storageKey = 'mock.serviceCatalog'

  private readCache(): GarageServiceCatalogItem[] {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null
      if (raw) return JSON.parse(raw)
    } catch {}
    return this.getFallback()
  }

  private writeCache(items: GarageServiceCatalogItem[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this.storageKey, JSON.stringify(items))
      }
    } catch {}
  }

  async list(filters?: ServiceCatalogFilters): Promise<GarageServiceCatalogItem[]> {
    try {
      const response = await apiClient.get<GarageServiceCatalogItem[]>(this.baseUrl, filters || {})
      return response.data
    } catch {
      let items = this.readCache()
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
      }
      if (filters?.category) items = items.filter(i => i.category === filters.category)
      if (filters?.isActive !== undefined) items = items.filter(i => i.isActive === filters.isActive)
      return items
    }
  }

  async create(data: Omit<GarageServiceCatalogItem, 'id' | 'isActive'> & { isActive?: boolean }): Promise<GarageServiceCatalogItem> {
    try {
      const response = await apiClient.post<GarageServiceCatalogItem>(this.baseUrl, data)
      return response.data
    } catch {
      const items = this.readCache()
      const newItem: GarageServiceCatalogItem = { id: Date.now().toString(), isActive: true, ...data }
      items.unshift(newItem)
      this.writeCache(items)
      return newItem
    }
  }

  async update(id: string, updates: Partial<GarageServiceCatalogItem>): Promise<GarageServiceCatalogItem> {
    try {
      const response = await apiClient.put<GarageServiceCatalogItem>(`${this.baseUrl}/${id}`, updates)
      return response.data
    } catch {
      const items = this.readCache()
      const index = items.findIndex(i => i.id === id)
      if (index === -1) throw new Error('Service not found')
      items[index] = { ...items[index], ...updates }
      this.writeCache(items)
      return items[index]
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch {
      const items = this.readCache().filter(i => i.id !== id)
      this.writeCache(items)
    }
  }

  private getFallback(): GarageServiceCatalogItem[] {
    return [
      { id: 's1', name: 'Oil Change', description: 'Full synthetic oil change', basePrice: 45, duration: 30, category: 'Maintenance', isActive: true },
      { id: 's2', name: 'Brake Service', description: 'Brake pad replacement', basePrice: 120, duration: 90, category: 'Repair', isActive: true },
      { id: 's3', name: 'Tire Rotation', description: 'Rotation and balancing', basePrice: 35, duration: 45, category: 'Maintenance', isActive: true },
      { id: 's4', name: 'Engine Diagnostics', description: 'Engine diagnostics and scan', basePrice: 80, duration: 60, category: 'Diagnostics', isActive: true },
    ]
  }
}

export const serviceCatalog = new ServiceCatalogService()


