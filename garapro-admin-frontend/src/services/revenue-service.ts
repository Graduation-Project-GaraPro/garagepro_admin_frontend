/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Clean, single-file revenue service for frontend.
 * - Uses fetch
 * - Configure API base with NEXT_PUBLIC_API_BASE_URL
 * - Exports `revenueService` instance
 */

/* -------------------- Types / Interfaces -------------------- */

export type Period = "daily" | "monthly" | "yearly";

export interface RevenueFilters {
  period: Period;
  startDate?: string; // ISO date yyyy-mm-dd
  endDate?: string;
  branchId?: string;
  technicianId?: string;
  serviceType?: string;
}

export interface TopService {
  serviceName: string;
  revenue: number;
  orderCount: number;
  percentageOfTotal: number;

  [key: string]: string | number;
}

export interface TaskContribution {
  serviceName: string;
  taskCount: number;
  revenueGenerated: number;
}

export interface TechnicianRevenue {
  technicianId: string;
  technicianName: string;
  totalTasks: number;
  orderCount: number;
  averageOrderValue: number;
  taskContributions: TaskContribution[];
}

export interface BranchRevenue {
  branchId: string;
  branchName: string;
  revenue: number;
  orderCount: number;
  growthRate: number;
}

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
  [key: string]: string | number;
}

export interface ServiceTrend {
  period: string; // e.g. "2025-10" or "Week 1"
  [serviceName: string]: string | number;
}

export interface RepairOrderItem {
  id: string;
  date?: string;
  branchName?: string;
  estimatedAmount?: number;
  paidAmount?: number;
  partCount?: number;
  customerName?: string;
  vehicle?: string;
  technician?: string;
  amount?: number;
  cost?: number;
  status?: string;
  paidStatus?: number;
  note?: string;
}

export interface DetailedRepairOrder {
  repairOrderId: string;
  receiveDate: string;
  roType: number;
  estimatedCompletionDate: string;
  completionDate: string | null;
  cost: number;
  estimatedAmount: number;
  paidAmount: number;
  paidStatus: number;
  estimatedRepairTime: number;
  note: string;
  createdAt: string;
  updatedAt: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  isCancelled: boolean;
  cancelledAt: string | null;
  cancelReason: string | null;
  archivedByUserId: string | null;
  branchId: string;
  statusId: number;
  vehicleId: string;
  userId: string;
  repairRequestId: string | null;
  feedBackId: string | null;
  repairRequest: any | null;
  carPickupStatus: number;
  labelId: string | null;
  
  orderStatus: {
    orderStatusId: number;
    statusName: string;
    repairOrders: any[];
    labels: any | null;
  };
  
  branch: {
    branchId: string;
    branchName: string;
    phoneNumber: string;
    email: string;
    street: string;
    commune: string;
    province: string;
    latitude: number;
    longitude: number;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    arrivalWindowMinutes: number;
    maxBookingsPerWindow: number;
    operatingHours: any[];
    repairOrders: any[];
    repairRequests: any | null;
    staffs: any[];
    branchServices: any[];
    quotations: any[];
    partInventories: any[];
  };
  
  vehicle: {
    vehicleId: string;
    brandId: string;
    userId: string;
    modelId: string;
    colorId: string;
    licensePlate: string;
    vin: string;
    year: number;
    odometer: number;
    lastServiceDate: string;
    nextServiceDate: string | null;
    warrantyStatus: string | null;
    createdAt: string;
    updatedAt: string | null;
    brand: {
      brandID: string;
      brandName: string;
      country: string;
      createdAt: string;
      vehicleModels: any[];
      vehicles: any[];
    };
    model: {
      modelID: string;
      modelName: string;
      manufacturingYear: number;
      brandID: string;
      createdAt: string;
      updatedAt: string | null;
      brand: any | null;
      vehicles: any[];
      vehicleModelColors: any | null;
      partCategories: any[];
    };
    color: {
      colorID: string;
      colorName: string;
      hexCode: string;
      createdAt: string;
      vehicles: any[];
      vehicleModelColors: any[];
    };
    repairRequests: any[];
    repairOrders: any[];
    user: any | null;
  };
  
  user: {
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    gender: string | null;
    birthday: string | null;
    status: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    lastLogin: string | null;
    avatar: string | null;
    dateOfBirth: string | null;
    deviceId: string;
    lastPasswordChangeDate: string | null;
    systemLogs: any[];
    notifications: any[];
    technician: any | null;
    repairRequests: any[];
    feedBacks: any[];
    assignedEmergencyRequests: any[];
    branchId: string | null;
    branch: any | null;
    id: string;
    userName: string;
    normalizedUserName: string;
    email: string;
    normalizedEmail: string;
    emailConfirmed: boolean;
    passwordHash: string;
    securityStamp: string;
    concurrencyStamp: string;
    phoneNumber: string;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEnd: string | null;
    lockoutEnabled: boolean;
    accessFailedCount: number;
  };
  
  repairOrderServices: Array<{
    repairOrderServiceId: string;
    repairOrderId: string;
    serviceId: string;
    actualDuration: number;
    notes: string | null;
    createdAt: string;
    repairOrder: any | null;
    service: {
      serviceId: string;
      serviceCategoryId: string;
      serviceName: string;
      description: string;
      price: number;
      estimatedDuration: number;
      isActive: boolean;
      isAdvanced: boolean;
      branchId: string | null;
      createdAt: string;
      updatedAt: string | null;
      serviceCategory: any | null;
      repairOrderServices: any[];
      serviceInspections: any[];
      jobs: any[];
      branchServices: any[];
      promotionalCampaignServices: any[];
      quotationServices: any[];
      requestServices: any[];
      servicePartCategories: any | null;
    };
    repairOrderServiceParts: any[];
  }>;
  
  inspections: any | null;
  jobs: any[];
  payments: any[];
  feedBack: any | null;
  quotations: any[];
  voucherUsages: any[];
  label: any | null;
}
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topServices?: TopService[];
  revenueByTechnician?: TechnicianRevenue[];
  branchComparison?: BranchRevenue[];
  growthRate?: number;
  previousPeriodRevenue?: number;
  detailedServices?: ServiceDetail[];
  serviceCategories?: ServiceCategory[];
  serviceTrends?: ServiceTrend[];
  repairOrders?: RepairOrderItem[];
  orderStatusStats?: Array<{ name: string; value: number }>;
  orderValueDistribution?: Array<{ range: string; count: number }>;
}

/* -------------------- Config & helpers -------------------- */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5117"
).replace(/\/$/, "");
const BASE_PATH = `${API_BASE}/Statistics`;

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.append(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function handleFetch<T = any>(
  url: string,
  opts?: RequestInit,
  retries = 2
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(url, {
        credentials: "include",
        signal: controller.signal,
        ...opts,
        headers: {
          "Content-Type": "application/json",
          ...(opts && opts.headers ? (opts.headers as any) : {}),
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
      }

      if (res.status === 204) return undefined as unknown as T;

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // Read response as text first to detect incomplete JSON
        const text = await res.text();

        if (!text || text.trim() === "") {
          throw new Error("Empty response received");
        }

        try {
          return JSON.parse(text) as T;
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Response text:", text.substring(0, 500));
          throw new Error("Invalid JSON response from server");
        }
      }

      const txt = await res.text();
      return txt as T;
    } catch (error: any) {
      const isLastAttempt = attempt === retries;

      // Don't retry on certain errors
      if (error.name === "AbortError") {
        throw new Error("Request timeout - server took too long to respond");
      }

      if (error.message?.includes("HTTP 4")) {
        // Don't retry client errors (4xx)
        throw error;
      }

      if (isLastAttempt) {
        console.error(`Fetch failed after ${retries + 1} attempts:`, error);
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
      console.log(
        `Retrying request (attempt ${attempt + 2}/${retries + 1})...`
      );
    }
  }

  throw new Error("Request failed after all retries");
}

/* -------------------- Service class -------------------- */

class RevenueService {
  private base = BASE_PATH;

  // Main: revenue report (supports period + filters)
  async getRevenueReport(filters: RevenueFilters): Promise<RevenueReport> {
    const q = buildQuery({
      period: filters.period,
      startDate: filters.startDate,
      endDate: filters.endDate,
      branchId: filters.branchId,
      technicianId: filters.technicianId,
      serviceType: filters.serviceType,
    });
    const url = `${this.base}/revenue${q}`;
    return handleFetch<RevenueReport>(url, { method: "GET" });
  }

  // Repair orders list: lightweight projection for UI lists (supports paging & filters)
  async getRepairOrders(
    filters: Partial<RevenueFilters> = {},
    page = 0,
    pageSize = 50
  ): Promise<RepairOrderItem[]> {
    const q = buildQuery({ ...filters, page, pageSize });
    const url = `${this.base}/repairorders${q}`;

    try {
      const data = await handleFetch<any[]>(url);

      // Validate response
      if (!Array.isArray(data)) {
        console.error("Expected array, got:", typeof data);
        return [];
      }

      // Normalize shape for UI (best-effort mapping)
      return (data || [])
        .map((o: any) => {
          try {
            return {
              id: o.repairOrderId || o.id || String(o.RepairOrderId || ""),
              date: o.receiveDate || o.completionDate || o.createdAt,
              customerName: o.customerName || o.user?.fullName || undefined,
              vehicle: o.vehicle?.licensePlate || o.licensePlate || o.vehicleId,
              technician:
                (o.technicianNames && o.technicianNames.join(", ")) ||
                (o.jobs &&
                  o.jobs.map((j: any) => j.service?.serviceName).join(", ")) ||
                undefined,
              amount: Number(
                o.cost ?? 0
              ),
              paidAmount: Number(o.cost || 0),
              estimatedAmount: Number(o.estimatedAmount || 0),
              partCount:
                o.parts?.length ??
                (o.partsCount || 0) +
                  (o.partsCount2 || 0) +
                  (o.partsCount3 || 0),
              branchName: o.branchName || o.branch?.name || undefined,

              status: (
                o.paidStatus ||
                o.statusName ||
                o.status ||
                ""
              ).toString(),
              paidStatus: Number(o.paidStatus || 0),
              note: o.note,
            };
          } catch (err) {
            console.error("Error mapping order:", o, err);
            return {
              id: "",
            } satisfies RepairOrderItem;
          }
        })
        .filter(Boolean); // Remove null entries
    } catch (error: any) {
      console.error("Failed to fetch repair orders:", error);

      // Provide more helpful error message
      if (error.message?.includes("timeout")) {
        throw new Error(
          "Server timeout - try reducing page size or contact support"
        );
      } else if (error.message?.includes("JSON")) {
        throw new Error("Server returned invalid data format");
      } else if (error.message?.includes("INCOMPLETE_CHUNKED_ENCODING")) {
        throw new Error(
          "Server response was incomplete - try again or reduce page size"
        );
      }

      throw error;
    }
  }
  // Repair order detail
  async getRepairOrderDetail(id: string): Promise<DetailedRepairOrder> {
    const url = `${this.base}/repairorders/${encodeURIComponent(id)}`;
    return handleFetch<DetailedRepairOrder>(url);
  }

  // Trends for repair orders (for charts)
  async getRepairOrderTrends(filters: Partial<RevenueFilters> = {}) {
    const q = buildQuery(filters);
    const url = `${this.base}/repairorders/trends${q}`;
    return handleFetch<any>(url);
  }

  // Top services
  async getTopServices(
    period: Period = "monthly",
    limit = 10
  ): Promise<TopService[]> {
    const q = buildQuery({ period, limit });
    const url = `${this.base}/top-services${q}`;
    return handleFetch<TopService[]>(url);
  }

  // Technician revenue summary
  async getTechnicianRevenue(
    period: Period = "monthly"
  ): Promise<TechnicianRevenue[]> {
    const q = buildQuery({ period });
    const url = `${this.base}/technician-revenue${q}`;
    return handleFetch<TechnicianRevenue[]>(url);
  }

  // Branch comparison
  async getBranchRevenue(period: Period = "monthly"): Promise<BranchRevenue[]> {
    const q = buildQuery({ period });
    const url = `${this.base}/branch-revenue${q}`;
    return handleFetch<BranchRevenue[]>(url);
  }

  // Export report (csv or excel) -> returns Blob
  async exportRevenueReport(
    filters: Partial<RevenueFilters>,
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    const q = buildQuery({ ...filters, format });
    const url = `${this.base}/export${q}`;
    const res = await fetch(url, { method: "GET", credentials: "include" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Export failed: ${res.status} ${text}`);
    }
    return res.blob();
  }

  // Convenience: daily/monthly/yearly specialized (if backend supports)
  async getDailyRevenue(dateIso: string) {
    const q = buildQuery({ date: dateIso });
    return handleFetch(`${this.base}/daily${q}`);
  }
  async getMonthlyRevenue(year: number, month: number) {
    const q = buildQuery({ year, month });
    return handleFetch(`${this.base}/monthly${q}`);
  }
  async getYearlyRevenue(year: number) {
    const q = buildQuery({ year });
    return handleFetch(`${this.base}/yearly${q}`);
  }
}

/* -------------------- Export instance -------------------- */

export const revenueService = new RevenueService();
export default revenueService;
