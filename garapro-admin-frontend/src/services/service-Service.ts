// services/serviceService.ts
import {
    Service,
    ServiceType,
    ServiceCategory,
    Part,
    PartService,
    Branch
  } from '@/types/service';
  
  class ServiceService {
    private serviceCategories: ServiceCategory[] = [
      {
        id: '1',
        name: 'Maintenance',
        description: 'Regular vehicle maintenance services',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Repair',
        description: 'Vehicle repair services',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  
    private serviceTypes: ServiceType[] = [
      {
        id: '1',
        name: 'Oil Change',
        description: 'Engine oil and filter change',
        categoryId: '1',
        estimatedDuration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Tire Replacement',
        description: 'Tire replacement and balancing',
        categoryId: '1',
        estimatedDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  
    private parts: Part[] = [
      {
        id: '1',
        name: 'Engine Oil Synthetic',
        description: '5W-30 Synthetic Engine Oil',
        sku: 'OIL-SYN-5W30',
        price: 45.99,
        cost: 28.50,
        quantityInStock: 100,
        minStockLevel: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Oil Filter',
        description: 'Premium Oil Filter',
        sku: 'OF-PREM',
        price: 12.99,
        cost: 7.50,
        quantityInStock: 50,
        minStockLevel: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  
    private services: Service[] = [
      {
        id: '1',
        name: 'Standard Oil Change',
        description: 'Oil change with synthetic oil and filter replacement',
        serviceTypeId: '1',
        basePrice: 79.99,
        estimatedDuration: 30,
        isActive: true,
        branchIds: ['1', '2'],
        parts: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  
    private partServices: PartService[] = [
      {
        id: '1',
        serviceId: '1',
        partId: '1',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        serviceId: '1',
        partId: '2',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  
    private branches: Branch[] = [
      {
        id: '1',
        name: 'Downtown Branch',
        address: '123 Main St, City, State 12345',
        phone: '(555) 123-4567',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Westside Branch',
        address: '456 Oak Ave, City, State 12345',
        phone: '(555) 987-6543',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  
    // Service Categories
    async getServiceCategories(): Promise<ServiceCategory[]> {
      return this.serviceCategories;
    }
  
    async getServiceCategory(id: string): Promise<ServiceCategory | null> {
      return this.serviceCategories.find(cat => cat.id === id) || null;
    }
  
    async createServiceCategory(category: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCategory> {
      const newCategory: ServiceCategory = {
        ...category,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.serviceCategories.push(newCategory);
      return newCategory;
    }
  
    async updateServiceCategory(id: string, category: Partial<ServiceCategory>): Promise<ServiceCategory | null> {
      const index = this.serviceCategories.findIndex(cat => cat.id === id);
      if (index === -1) return null;
      
      this.serviceCategories[index] = {
        ...this.serviceCategories[index],
        ...category,
        updatedAt: new Date()
      };
      
      return this.serviceCategories[index];
    }
  
    async deleteServiceCategory(id: string): Promise<boolean> {
      const initialLength = this.serviceCategories.length;
      this.serviceCategories = this.serviceCategories.filter(cat => cat.id !== id);
      return this.serviceCategories.length < initialLength;
    }
  
    // Service Types
    async getServiceTypes(): Promise<ServiceType[]> {
      return this.serviceTypes.map(type => ({
        ...type,
        category: this.serviceCategories.find(cat => cat.id === type.categoryId)
      }));
    }
  
    async getServiceType(id: string): Promise<ServiceType | null> {
      const type = this.serviceTypes.find(t => t.id === id);
      if (!type) return null;
      
      return {
        ...type,
        category: this.serviceCategories.find(cat => cat.id === type.categoryId)
      };
    }
  
    async createServiceType(serviceType: Omit<ServiceType, 'id' | 'createdAt' | 'updatedAt' | 'category'>): Promise<ServiceType> {
      const newServiceType: ServiceType = {
        ...serviceType,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.serviceTypes.push(newServiceType);
      return newServiceType;
    }
  
    async updateServiceType(id: string, serviceType: Partial<ServiceType>): Promise<ServiceType | null> {
      const index = this.serviceTypes.findIndex(st => st.id === id);
      if (index === -1) return null;
      
      this.serviceTypes[index] = {
        ...this.serviceTypes[index],
        ...serviceType,
        updatedAt: new Date()
      };
      
      return this.serviceTypes[index];
    }
  
    async deleteServiceType(id: string): Promise<boolean> {
      const initialLength = this.serviceTypes.length;
      this.serviceTypes = this.serviceTypes.filter(st => st.id !== id);
      return this.serviceTypes.length < initialLength;
    }
  
    // Parts
    async getParts(): Promise<Part[]> {
      return this.parts;
    }
  
    async getPart(id: string): Promise<Part | null> {
      return this.parts.find(part => part.id === id) || null;
    }
  
    async createPart(part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Promise<Part> {
      const newPart: Part = {
        ...part,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.parts.push(newPart);
      return newPart;
    }
  
    async updatePart(id: string, part: Partial<Part>): Promise<Part | null> {
      const index = this.parts.findIndex(p => p.id === id);
      if (index === -1) return null;
      
      this.parts[index] = {
        ...this.parts[index],
        ...part,
        updatedAt: new Date()
      };
      
      return this.parts[index];
    }
  
    async deletePart(id: string): Promise<boolean> {
      const initialLength = this.parts.length;
      this.parts = this.parts.filter(p => p.id !== id);
      return this.parts.length < initialLength;
    }
  
    // Services
    async getServices(): Promise<Service[]> {
      return this.services.map(service => ({
        ...service,
        serviceType: this.serviceTypes.find(st => st.id === service.serviceTypeId),
        branches: this.branches.filter(branch => service.branchIds.includes(branch.id)),
        parts: this.partServices
          .filter(ps => ps.serviceId === service.id)
          .map(ps => ({
            ...ps,
            part: this.parts.find(p => p.id === ps.partId)
          }))
      }));
    }
    
    async getService(id: string): Promise<Service | null> {
      const service = this.services.find(s => s.id === id);
      if (!service) return null;
      
      return {
        ...service,
        serviceType: this.serviceTypes.find(st => st.id === service.serviceTypeId),
        branches: this.branches.filter(branch => service.branchIds.includes(branch.id)),
        parts: this.partServices
          .filter(ps => ps.serviceId === service.id)
          .map(ps => ({
            ...ps,
            part: this.parts.find(p => p.id === ps.partId)
          }))
      };
    }
  
    async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'serviceType' | 'parts'>): Promise<Service> {
      const newService: Service = {
        ...service,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        parts: []
      };
      this.services.push(newService);
      return newService;
    }
  
    async updateService(id: string, service: Partial<Service>): Promise<Service | null> {
      const index = this.services.findIndex(s => s.id === id);
      if (index === -1) return null;
      
      this.services[index] = {
        ...this.services[index],
        ...service,
        updatedAt: new Date()
      };
      
      return this.services[index];
    }
  
    async deleteService(id: string): Promise<boolean> {
      const initialLength = this.services.length;
      this.services = this.services.filter(s => s.id !== id);
      // Also remove associated part services
      this.partServices = this.partServices.filter(ps => ps.serviceId !== id);
      return this.services.length < initialLength;
    }
  
    // Part Services (linking parts to services)
    async addPartToService(serviceId: string, partId: string, quantity: number): Promise<PartService> {
      const newPartService: PartService = {
        id: Date.now().toString(),
        serviceId,
        partId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.partServices.push(newPartService);
      return newPartService;
    }
  
    async updatePartService(id: string, quantity: number): Promise<PartService | null> {
      const index = this.partServices.findIndex(ps => ps.id === id);
      if (index === -1) return null;
      
      this.partServices[index] = {
        ...this.partServices[index],
        quantity,
        updatedAt: new Date()
      };
      
      return this.partServices[index];
    }
  
    async removePartFromService(id: string): Promise<boolean> {
      const initialLength = this.partServices.length;
      this.partServices = this.partServices.filter(ps => ps.id !== id);
      return this.partServices.length < initialLength;
    }
  
    // Branches
    async getBranches(): Promise<Branch[]> {
      return this.branches;
    }
  
    async getBranch(id: string): Promise<Branch | null> {
      return this.branches.find(branch => branch.id === id) || null;
    }


    async getBranchesByIds(branchIds: string[]): Promise<Branch[]> {
      return this.branches.filter(branch => branchIds.includes(branch.id));
    }
    
    // Thêm phương thức để tính toán lợi nhuận
    async getServiceProfitability(serviceId: string): Promise<{
      totalCost: number;
      totalPrice: number;
      profit: number;
      margin: number;
    }> {
      const service = await this.getService(serviceId);
      if (!service) {
        throw new Error('Service not found');
      }
    
      const totalPartsCost = service.parts.reduce(
        (total, partService) => total + (partService.part?.cost || 0) * partService.quantity,
        0
      );
    
      const totalPartsPrice = service.parts.reduce(
        (total, partService) => total + (partService.part?.price || 0) * partService.quantity,
        0
      );
    
      const totalServiceCost = totalPartsCost;
      const totalServicePrice = service.basePrice + totalPartsPrice;
      const profit = totalServicePrice - totalServiceCost;
      const margin = totalServicePrice > 0 ? (profit / totalServicePrice) * 100 : 0;
    
      return {
        totalCost: totalServiceCost,
        totalPrice: totalServicePrice,
        profit,
        margin
      };
    }
  }
  
  export const serviceService = new ServiceService();