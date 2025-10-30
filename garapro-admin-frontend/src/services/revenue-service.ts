/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./api-client";

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topServices?: TopService[];
  revenueByTechnician?: TechnicianRevenue[];
  branchComparison?: BranchRevenue[];
  growthRate: number;
  previousPeriodRevenue: number;
  // New properties for detailed view
  detailedServices?: ServiceDetail[];
  serviceCategories?: ServiceCategory[];
  serviceTrends?: ServiceTrend[];
  repairOrders?: RepairOrder[];
  orderStatusStats?: OrderStatusStat[];
  orderValueDistribution?: OrderValueDistribution[];
}
export interface DetailedRepairOrder {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
    mileage: number;
  };
  technician: {
    id: string;
    name: string;
  };
  services: RepairService[];
  parts: PartItem[];
  totalAmount: number;
  status: string;
  notes: string;
  estimatedCompletion: string;
}

export interface RepairService {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  technician: string;
  duration: number;
}

export interface PartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  inStock: boolean;
}

export interface TopService {
  serviceName: string;
  revenue: number;
  orderCount: number;
  percentageOfTotal: number;
}

export interface TechnicianRevenue {
  technicianId: string;
  technicianName: string;
  totalTasks: number;
  orderCount: number;
  averageOrderValue: number;
  taskContributions: TaskContribution[];
}
export interface TaskContribution {
  serviceName: string;
  taskCount: number;
  revenueGenerated: number;
}
export interface BranchRevenue {
  branchId: string;
  branchName: string;
  revenue: number;
  orderCount: number;
  growthRate: number;
}

export interface RevenueFilters {
  period: "daily" | "monthly" | "yearly";
  startDate?: string;
  endDate?: string;
  branchId?: string;
  technicianId?: string;
  serviceType?: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growthRate: number;
  topServices: TopService[];
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
  branchPerformance: BranchRevenue[];
  technicianPerformance: TechnicianRevenue[];
}

// New interfaces for detailed data
export interface ServiceDetail {
  name: string;
  revenue: number;
  orderCount: number;
  averagePrice: number;
}

export interface ServiceCategory {
  name: string;
  revenue: number;
  percentage: number;
}

export interface ServiceTrend {
  period: string;
  [key: string]: number | string;
}

export interface RepairOrder {
  id: string;
  date: string;
  customerName: string;
  vehicle: string;
  technician: string;
  amount: number;
  status: string;
}

export interface OrderStatusStat {
  name: string;
  value: number;
}

export interface OrderValueDistribution {
  range: string;
  count: number;
}

class RevenueService {
  private baseUrl = "/Statistics";

  async getRevenueReport(filters: RevenueFilters): Promise<RevenueReport> {
    try {
      // 1️⃣ Tạo query string từ filters
      const params = new URLSearchParams({
        period: filters.period,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.branchId && { branchId: filters.branchId }),
        ...(filters.technicianId && { technicianId: filters.technicianId }),
        ...(filters.serviceType && { serviceType: filters.serviceType }),
      });

      // 2️⃣ Gọi API trực tiếp tới backend
      const response = await fetch(
        `http://localhost:5117/api/Statistics/revenue?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 3️⃣ Kiểm tra phản hồi
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 4️⃣ Trả về dữ liệu
      const data: RevenueReport = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch revenue report:", error);
      return this.getFallbackRevenueReport(filters.period);
    }
  }

  async getDailyRevenue(date: string): Promise<RevenueReport> {
    try {
      const response = await apiClient.get<RevenueReport>(
        `${this.baseUrl}/daily`,
        { date }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch daily revenue for ${date}:`, error);
      return this.getFallbackRevenueReport("daily");
    }
  }

  async getMonthlyRevenue(year: number, month: number): Promise<RevenueReport> {
    try {
      const response = await apiClient.get<RevenueReport>(
        `${this.baseUrl}/monthly`,
        { year, month }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch monthly revenue for ${year}-${month}:`,
        error
      );
      return this.getFallbackRevenueReport("monthly");
    }
  }

  async getYearlyRevenue(year: number): Promise<RevenueReport> {
    try {
      const response = await apiClient.get<RevenueReport>(
        `${this.baseUrl}/yearly`,
        { year }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch yearly revenue for ${year}:`, error);
      return this.getFallbackRevenueReport("yearly");
    }
  }

  async getRevenueAnalytics(
    filters: RevenueFilters
  ): Promise<RevenueAnalytics> {
    try {
      const params: Record<string, unknown> = { period: filters.period };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.technicianId) params.technicianId = filters.technicianId;
      if (filters.serviceType) params.serviceType = filters.serviceType;

      const response = await apiClient.get<RevenueAnalytics>(
        `${this.baseUrl}/analytics`,
        params
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch revenue analytics:", error);
      return this.getFallbackRevenueAnalytics();
    }
  }

  async getTopServices(
    period: string,
    limit: number = 10
  ): Promise<TopService[]> {
    try {
      const response = await apiClient.get<TopService[]>(
        `${this.baseUrl}/top-services`,
        { period, limit }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch top services:", error);
      return this.getFallbackTopServices();
    }
  }

  async getTechnicianRevenue(period: string): Promise<TechnicianRevenue[]> {
    try {
      const response = await apiClient.get<TechnicianRevenue[]>(
        `${this.baseUrl}/technician-revenue`,
        { period }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch technician revenue:", error);
      return this.getFallbackTechnicianRevenue();
    }
  }

  async getBranchRevenue(period: string): Promise<BranchRevenue[]> {
    try {
      const response = await apiClient.get<BranchRevenue[]>(
        `${this.baseUrl}/branch-revenue`,
        { period }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch branch revenue:", error);
      return this.getFallbackBranchRevenue();
    }
  }

  async exportRevenueReport(
    filters: RevenueFilters,
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    try {
      const params: Record<string, unknown> = {
        format,
        period: filters.period,
      };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.technicianId) params.technicianId = filters.technicianId;
      if (filters.serviceType) params.serviceType = filters.serviceType;

      const response = await apiClient.get<Blob>(
        `${this.baseUrl}/export`,
        params
      );
      return response.data;
    } catch (error) {
      console.error("Failed to export revenue report:", error);
      throw new Error("Failed to export revenue report. Please try again.");
    }
  }

  async getRepairOrderDetail(orderId: string): Promise<DetailedRepairOrder> {
    try {
      const response = await apiClient.get<DetailedRepairOrder>(
        `${this.baseUrl}/repair-orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch repair order ${orderId}:`, error);
      return this.getFallbackRepairOrderDetail(orderId);
    }
  }

  private getFallbackRepairOrderDetail(orderId: string): DetailedRepairOrder {
    // Fallback data for demonstration
    return {
      id: orderId,
      date: new Date().toISOString().split("T")[0],
      customerName: "John Doe",
      customerPhone: "(555) 123-4567",
      customerEmail: "john.doe@example.com",
      vehicle: {
        make: "Toyota",
        model: "Camry",
        year: 2020,
        vin: "4T1BF1FK5HU680351",
        licensePlate: "ABC123",
        mileage: 32500,
      },
      technician: {
        id: "t1",
        name: "John Smith",
      },
      services: [
        {
          id: "s1",
          name: "Oil Change",
          description: "Synthetic oil change with filter replacement",
          price: 89.99,
          quantity: 1,
          total: 89.99,
          technician: "John Smith",
          duration: 30,
        },
        {
          id: "s2",
          name: "Brake Inspection",
          description: "Complete brake system inspection",
          price: 29.99,
          quantity: 1,
          total: 29.99,
          technician: "John Smith",
          duration: 15,
        },
      ],
      parts: [
        {
          id: "p1",
          name: "Oil Filter",
          description: "Premium oil filter",
          price: 12.99,
          quantity: 1,
          total: 12.99,
          inStock: true,
        },
        {
          id: "p2",
          name: "Synthetic Oil",
          description: "5W-30 Full Synthetic Oil",
          price: 39.99,
          quantity: 5,
          total: 199.95,
          inStock: true,
        },
      ],
      totalAmount: 332.92,
      status: "completed",
      notes: "Customer requested extra tire pressure check",
      estimatedCompletion: new Date(
        Date.now() + 2 * 60 * 60 * 1000
      ).toISOString(), // 2 hours from now
    };
  }

  // Fallback data methods
  private getFallbackRevenueReport(period: string): RevenueReport {
    const baseRevenue =
      period === "daily" ? 5000 : period === "monthly" ? 150000 : 1800000;
    const baseOrders =
      period === "daily" ? 25 : period === "monthly" ? 750 : 9000;

    return {
      period,
      totalRevenue: baseRevenue,
      totalOrders: baseOrders,
      averageOrderValue: baseRevenue / baseOrders,
      topServices: [
        {
          serviceName: "Oil Change",
          revenue: baseRevenue * 0.3,
          orderCount: Math.floor(baseOrders * 0.4),
          percentageOfTotal: 30,
        },
        {
          serviceName: "Brake Service",
          revenue: baseRevenue * 0.25,
          orderCount: Math.floor(baseOrders * 0.2),
          percentageOfTotal: 25,
        },
        {
          serviceName: "Tire Service",
          revenue: baseRevenue * 0.2,
          orderCount: Math.floor(baseOrders * 0.15),
          percentageOfTotal: 20,
        },
      ],
      revenueByTechnician: [
        {
          technicianId: "t1",
          technicianName: "John Smith",
          totalTasks: 120,
          orderCount: Math.floor(baseOrders * 0.4),
          averageOrderValue: baseRevenue / baseOrders,
          taskContributions: [
            {
              serviceName: "Oil Change",
              taskCount: 80,
              revenueGenerated: baseRevenue * 0.2,
            },
            {
              serviceName: "Brake Service",
              taskCount: 40,
              revenueGenerated: baseRevenue * 0.2,
            },
          ],
        },
        // ... similarly for other technicians ...
      ],
      branchComparison: [
        {
          branchId: "b1",
          branchName: "Downtown",
          revenue: baseRevenue * 0.5,
          orderCount: Math.floor(baseOrders * 0.5),
          growthRate: 15,
        },
        {
          branchId: "b2",
          branchName: "Uptown",
          revenue: baseRevenue * 0.3,
          orderCount: Math.floor(baseOrders * 0.3),
          growthRate: 12,
        },
        {
          branchId: "b3",
          branchName: "Suburban",
          revenue: baseRevenue * 0.2,
          orderCount: Math.floor(baseOrders * 0.2),
          growthRate: 8,
        },
      ],
      growthRate: 12.5,
      previousPeriodRevenue: baseRevenue * 0.89,
      // New fallback data for detailed views
      detailedServices: [
        {
          name: "Oil Change",
          revenue: baseRevenue * 0.3,
          orderCount: Math.floor(baseOrders * 0.4),
          averagePrice: (baseRevenue * 0.3) / Math.floor(baseOrders * 0.4),
        },
        {
          name: "Brake Service",
          revenue: baseRevenue * 0.25,
          orderCount: Math.floor(baseOrders * 0.2),
          averagePrice: (baseRevenue * 0.25) / Math.floor(baseOrders * 0.2),
        },
        {
          name: "Tire Service",
          revenue: baseRevenue * 0.2,
          orderCount: Math.floor(baseOrders * 0.15),
          averagePrice: (baseRevenue * 0.2) / Math.floor(baseOrders * 0.15),
        },
      ],
      serviceCategories: [
        { name: "Maintenance", revenue: baseRevenue * 0.4, percentage: 40 },
        { name: "Repairs", revenue: baseRevenue * 0.35, percentage: 35 },
        { name: "Tires", revenue: baseRevenue * 0.15, percentage: 15 },
        { name: "Other", revenue: baseRevenue * 0.1, percentage: 10 },
      ],
      serviceTrends: [
        {
          period: "Week 1",
          "Oil Change": baseRevenue * 0.08,
          "Brake Service": baseRevenue * 0.06,
          "Tire Service": baseRevenue * 0.05,
        },
        {
          period: "Week 2",
          "Oil Change": baseRevenue * 0.07,
          "Brake Service": baseRevenue * 0.07,
          "Tire Service": baseRevenue * 0.05,
        },
        {
          period: "Week 3",
          "Oil Change": baseRevenue * 0.08,
          "Brake Service": baseRevenue * 0.06,
          "Tire Service": baseRevenue * 0.06,
        },
        {
          period: "Week 4",
          "Oil Change": baseRevenue * 0.07,
          "Brake Service": baseRevenue * 0.06,
          "Tire Service": baseRevenue * 0.04,
        },
      ],
      repairOrders: [
        {
          id: "1001",
          date: new Date().toISOString().split("T")[0],
          customerName: "John Doe",
          vehicle: "Toyota Camry",
          technician: "John Smith",
          amount: 200,
          status: "completed",
        },
        {
          id: "1002",
          date: new Date().toISOString().split("T")[0],
          customerName: "Jane Smith",
          vehicle: "Honda Civic",
          technician: "Mike Johnson",
          amount: 350,
          status: "in_progress",
        },
        {
          id: "1003",
          date: new Date().toISOString().split("T")[0],
          customerName: "Robert Brown",
          vehicle: "Ford F-150",
          technician: "Sarah Wilson",
          amount: 500,
          status: "pending",
        },
      ],
      orderStatusStats: [
        { name: "Completed", value: Math.floor(baseOrders * 0.7) },
        { name: "In Progress", value: Math.floor(baseOrders * 0.2) },
        { name: "Pending", value: Math.floor(baseOrders * 0.1) },
      ],
      orderValueDistribution: [
        { range: "$0-100", count: Math.floor(baseOrders * 0.2) },
        { range: "$101-250", count: Math.floor(baseOrders * 0.4) },
        { range: "$251-500", count: Math.floor(baseOrders * 0.3) },
        { range: "$500+", count: Math.floor(baseOrders * 0.1) },
      ],
    };
  }

  private getFallbackRevenueAnalytics(): RevenueAnalytics {
    return {
      totalRevenue: 150000,
      totalOrders: 750,
      averageOrderValue: 200,
      growthRate: 12.5,
      topServices: [
        {
          serviceName: "Oil Change",
          revenue: 45000,
          orderCount: 300,
          percentageOfTotal: 30,
        },
        {
          serviceName: "Brake Service",
          revenue: 37500,
          orderCount: 150,
          percentageOfTotal: 25,
        },
        {
          serviceName: "Tire Service",
          revenue: 30000,
          orderCount: 112,
          percentageOfTotal: 20,
        },
      ],
      revenueByPeriod: [
        { period: "Week 1", revenue: 37500, orders: 187 },
        { period: "Week 2", revenue: 37500, orders: 188 },
        { period: "Week 3", revenue: 37500, orders: 187 },
        { period: "Week 4", revenue: 37500, orders: 188 },
      ],
      branchPerformance: [
        {
          branchId: "b1",
          branchName: "Downtown",
          revenue: 75000,
          orderCount: 375,
          growthRate: 15,
        },
        {
          branchId: "b2",
          branchName: "Uptown",
          revenue: 45000,
          orderCount: 225,
          growthRate: 12,
        },
        {
          branchId: "b3",
          branchName: "Suburban",
          revenue: 30000,
          orderCount: 150,
          growthRate: 8,
        },
      ],
      technicianPerformance: [
        {
          technicianId: "t1",
          technicianName: "John Smith",
          totalTasks: 120,
          orderCount: 300,
          averageOrderValue: 200,
          taskContributions: [
            {
              serviceName: "Oil Change",
              taskCount: 80,
              revenueGenerated: 24000,
            },
            {
              serviceName: "Brake Service",
              taskCount: 40,
              revenueGenerated: 36000,
            },
          ],
        },
        {
          technicianId: "t2",
          technicianName: "Mike Johnson",
          totalTasks: 110,
          orderCount: 262,
          averageOrderValue: 200,
          taskContributions: [
            {
              serviceName: "Oil Change",
              taskCount: 60,
              revenueGenerated: 18000,
            },
            {
              serviceName: "Brake Service",
              taskCount: 50,
              revenueGenerated: 34500,
            },
          ],
        },
        {
          technicianId: "t3",
          technicianName: "Sarah Wilson",
          totalTasks: 100,
          orderCount: 188,
          averageOrderValue: 200,
          taskContributions: [
            {
              serviceName: "Oil Change",
              taskCount: 40,
              revenueGenerated: 12000,
            },
            {
              serviceName: "Brake Service",
              taskCount: 60,
              revenueGenerated: 25500,
            },
          ],
        },
      ],
    };
  }

  public async getRepairOrders() {
    try {
      const res = await fetch(`https://localhost:7113/api/RepairOrder`);
      if (!res.ok) throw new Error("Failed to fetch repair orders");
      const data = await res.json();

      // Chuyển đổi dữ liệu backend → frontend format cho dễ hiển thị
      return data.map((order: any) => ({
        id: order.repairOrderId,
        date: order.receiveDate,
        customerName: order.customerName || "Unknown",
        customerPhone: order.customerPhone,
        vehicle: order.vehicleId ?? "—",
        technician: order.technicianNames?.join(", ") || "—",
        amount: order.estimatedAmount ?? 0,
        status: order.paidStatus?.toLowerCase() || "unknown",
        note: order.note,
        roTypeName: order.roTypeName,
        estimatedCompletionDate: order.estimatedCompletionDate,
      }));
    } catch (error) {
      console.error("Error fetching repair orders:", error);
      throw error;
    }
  }

  private getFallbackTopServices(): TopService[] {
    return [
      {
        serviceName: "Oil Change",
        revenue: 45000,
        orderCount: 300,
        percentageOfTotal: 30,
      },
      {
        serviceName: "Brake Service",
        revenue: 37500,
        orderCount: 150,
        percentageOfTotal: 25,
      },
      {
        serviceName: "Tire Service",
        revenue: 30000,
        orderCount: 112,
        percentageOfTotal: 20,
      },
      {
        serviceName: "AC Service",
        revenue: 22500,
        orderCount: 75,
        percentageOfTotal: 15,
      },
      {
        serviceName: "Engine Repair",
        revenue: 15000,
        orderCount: 25,
        percentageOfTotal: 10,
      },
    ];
  }

  private getFallbackTechnicianRevenue(): TechnicianRevenue[] {
    return [
      {
        technicianId: "t1",
        technicianName: "John Smith",
        totalTasks: 120,
        orderCount: 300,
        averageOrderValue: 200,
        taskContributions: [
          { serviceName: "Oil Change", taskCount: 80, revenueGenerated: 24000 },
          {
            serviceName: "Brake Service",
            taskCount: 40,
            revenueGenerated: 36000,
          },
        ],
      },
      // ... similarly for other technicians ...
    ];
  }

  private getFallbackBranchRevenue(): BranchRevenue[] {
    return [
      {
        branchId: "b1",
        branchName: "Downtown",
        revenue: 75000,
        orderCount: 375,
        growthRate: 15,
      },
      {
        branchId: "b2",
        branchName: "Uptown",
        revenue: 45000,
        orderCount: 225,
        growthRate: 12,
      },
      {
        branchId: "b3",
        branchName: "Suburban",
        revenue: 30000,
        orderCount: 150,
        growthRate: 8,
      },
    ];
  }
}

export const revenueService = new RevenueService();
