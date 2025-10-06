// types/service.ts
export interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ServiceType {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    category?: ServiceCategory;
    estimatedDuration: number; // in minutes
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Part {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: number;
    cost: number;
    quantityInStock: number;
    minStockLevel: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Service {
    id: string;
    name: string;
    description: string;
    serviceTypeId: string;
    serviceType?: ServiceType;
    basePrice: number;
    estimatedDuration: number;
    isActive: boolean;
    branchIds: string[];
    branches?: Branch[]; // Thêm thông tin chi nhánh
    parts: PartService[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface PartService {
    id: string;
    serviceId: string;
    partId: string;
    quantity: number;
    part?: Part;
    service?: Service;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }