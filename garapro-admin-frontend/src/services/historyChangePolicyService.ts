export interface AuditHistory {
  historyId: string;
  policyId: string;
  policy: string | null;       // chuỗi (tên hoặc mô tả policy), không phải any
  changedBy: string | null;
  changedByUser: string | null;
  changedAt: string;           // ISO date string
  changeSummary: string | null;
  previousValues: string | null;
  newValues: string | null;
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
    private baseUrl = 'https://localhost:7113/api/SecurityPolicy';
  
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
  
        const response = await fetch(`${this.baseUrl}/history?${queryParams}`);
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
  
        const response = await fetch(`${this.baseUrl}/audit-history/${policyId}?${queryParams}`);
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
         
         
    
          const responseRevert = await fetch(`${this.baseUrl}/revert-to-previous/${historyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
           
          });
    
          if (!responseRevert.ok) throw new Error('Failed to apply reverted policy');
        } 
        else if (type === 'snapshot') {
          // Gọi thẳng API revert-to-snapshot (không cần lấy previousValues)
          const responseRevert = await fetch(`${this.baseUrl}/revert-to-snapshot/${historyId}`, {
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
  