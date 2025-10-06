export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateOrderRequest {
  customerName: string
  deviceType: string
  issue: string
  priority: "low" | "medium" | "high"
  estimatedDelivery: string
  assignedTechnician?: string
}

export interface UpdateOrderRequest extends CreateOrderRequest {
  status: "waiting" | "in-progress" | "completed"
}

export interface OrderFilters {
  search?: string
  priority?: string
  status?: string
  technician?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

// Promotional Campaigns
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

// Revenue Reports
export interface RevenueReport {
  period: string
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topServices: TopService[]
  revenueByTechnician: TechnicianRevenue[]
  branchComparison: BranchRevenue[]
  growthRate: number
  previousPeriodRevenue: number
}

export interface TopService {
  serviceName: string
  revenue: number
  orderCount: number
  percentageOfTotal: number
}

export interface TechnicianRevenue {
  technicianId: string
  technicianName: string
  revenue: number
  orderCount: number
  averageOrderValue: number
}

export interface BranchRevenue {
  branchId: string
  branchName: string
  revenue: number
  orderCount: number
  growthRate: number
}

export interface RevenueFilters {
  period: 'daily' | 'monthly' | 'yearly'
  startDate?: string
  endDate?: string
  branchId?: string
  technicianId?: string
  serviceType?: string
}

// Garage Branches
export interface GarageBranch {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  managerId: string
  managerName: string
  services: BranchService[]
  staff: BranchStaff[]
  operatingHours: OperatingHours
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BranchService {
  id: string
  name: string
  description: string
  price: number
  duration: number
  isAvailable: boolean
}

export interface BranchStaff {
  id: string
  name: string
  role: 'technician' | 'receptionist' | 'manager'
  email: string
  phone: string
  isActive: boolean
}

export interface OperatingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface CreateBranchRequest {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
  managerId: string
  services: Omit<BranchService, 'id'>[]
  staff: Omit<BranchStaff, 'id'>[]
  operatingHours: OperatingHours
}

export interface UpdateBranchRequest extends Partial<CreateBranchRequest> {
  isActive?: boolean
}
