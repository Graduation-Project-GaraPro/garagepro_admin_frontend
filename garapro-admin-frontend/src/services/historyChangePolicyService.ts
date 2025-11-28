import { authService } from './authService';

export interface AuditHistory {
  historyId: string;
  policyId: string;
  policy: string | null;
  changedBy: string | null;
  changedByUser: User | null;
  changedAt: string;
  changeSummary: string | null;
  previousValues: string | null;
  newValues: string | null;
}
export interface User {
    id: string;
    userName: string;
    normalizedUserName: string;
    email: string;
      
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  changedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class HistoryChangePolicyService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ||'https://localhost:7113/api';

  private async makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const MAX_RETRIES = 2;

  try {
    const token = authService.getToken();

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
      credentials: "include",
    });

    // 401 -> thử refresh token 1 lần
    if (response.status === 401 && retryCount === 0) {
      try {
        await authService.handleTokenRefresh();
        return this.makeAuthenticatedRequest(url, options, retryCount + 1);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw new Error("Session expired. Please login again.");
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return response;
  } catch (error: any) {
    const msg = error?.message || "";

    // Lỗi mạng / HTTP2 / stream reset -> retry
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
      return this.makeAuthenticatedRequest(url, options, retryCount + 1);
    }

    if (msg.includes("Authentication required")) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    throw error;
  }
}


  async getAuditHistory(params: PaginationParams): Promise<PaginatedResponse<AuditHistory>> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
        ...(params.search && { search: params.search }),
        ...(params.changedBy && { changedBy: params.changedBy }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
      });

      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/SecurityPolicy/history?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit history');
      }
      
      const policies = await response.json();
      console.log(policies);
      return policies;
    } catch (error) {
      console.error('Error fetching audit history:', error);
      throw error;
    }
  }

  async getAuditHistoryByPolicyId(policyId: string, params: PaginationParams): Promise<PaginatedResponse<AuditHistory>> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
        ...(params.search && { search: params.search }),
        ...(params.changedBy && { changedBy: params.changedBy }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
      });

      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/audit-history/${policyId}?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching audit history:', error);
      throw error;
    }
  }

  async revertPolicy(historyId: string, type: 'previous' | 'snapshot'): Promise<void> {
    try {
      console.log('Reverting:', historyId, type);

      if (type === 'previous') {
        const responseRevert = await this.makeAuthenticatedRequest(`${this.baseUrl}/SecurityPolicy/revert-to-previous/${historyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!responseRevert.ok) throw new Error('Failed to apply reverted policy');
      } 
      else if (type === 'snapshot') {
        const responseRevert = await this.makeAuthenticatedRequest(`${this.baseUrl}/SecurityPolicy/revert-to-snapshot/${historyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!responseRevert.ok) throw new Error('Failed to revert to snapshot');
      }

      return;
    } catch (error) {
      console.error(`Error reverting policy to ${type}:`, error);
      throw error;
    }
  }
}

export const historyChangePolicyService = new HistoryChangePolicyService();