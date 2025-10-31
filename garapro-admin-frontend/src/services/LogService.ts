const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api'
const SignalR_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { authService } from './authService'

export interface LogEntry {
  id: number
  timestamp: string
  level: 'Error' | 'Warning' | 'Information' | 'Critical'
  source: 'System' | 'Security' | 'UserActivity' 
  userId: string | null
  userName: string
  message: string
  details: string | null
  ipAddress: string
  userAgent: string | null
  requestId: string | null
}

export interface LogStats {
  total: number
  errors: number
  warnings: number
  info: number
  debug: number
  critical: number
  today: number
  thisWeek: number
  thisMonth: number
}

export interface LogSearchRequest {
  pageNumber: number
  pageSize: number
  levels?: number[]
  sources?: number[]
  searchTerm?: string
  startDate?: string
  endDate?: string
  days?: number
}

export interface LogSearchResult {
  logs: LogEntry[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export class LogService {
  private connection: HubConnection | null = null
  private isConnected = false

  private static async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const token = await authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('No authentication token available for log service request');
    }

    return headers;
  }

  private static async authenticatedFetch(url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Token expired - try to refresh and retry
      if (response.status === 401 && retryCount === 0) {
        try {
          await authService.handleTokenRefresh();
          return this.authenticatedFetch(url, options, retryCount + 1);
        } catch (refreshError) {
          throw new Error('Session expired. Please login again.');
        }
      }
      if (response.status === 403) {
        console.log(' Access denied');
        if (typeof window !== 'undefined') {
          window.location.href = '/access-denied';
        }
        throw new Error('Access denied: You do not have permission to access this resource.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authentication required')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      throw error;
    }
  }

  // Kết nối SignalR
  static async connectToLogHub(
    onNewLog: (log: LogEntry) => void,
    onUpdateStats: () => void,
    onConnectionChange?: (connected: boolean) => void
  ): Promise<HubConnection> {
    const token = authService.getToken();
    
    const connection = new HubConnectionBuilder()
      .withUrl(`${SignalR_BASE_URL}/logHub`, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build()

    // Xử lý sự kiện nhận log mới
    connection.on('ReceiveNewLog', (log: LogEntry) => {
      onNewLog(log)
    })

    // Xử lý cập nhật thống kê
    connection.on('UpdateStats', () => {
      onUpdateStats()
    })

    // Xử lý trạng thái kết nối
    connection.onreconnecting(() => {
      onConnectionChange?.(false)
    })

    connection.onreconnected(() => {
      onConnectionChange?.(true)
    })

    try {
      await connection.start()
      onConnectionChange?.(true)
      
      // Tham gia các group (tuỳ chọn)
      await connection.invoke('JoinLogGroup', 'all-logs')
      
      console.log('SignalR Connected')
    } catch (err) {
      console.error('SignalR Connection Error: ', err)
    }

    return connection
  }

  // Ngắt kết nối
  static async disconnectLogHub(connection: HubConnection) {
    if (connection) {
      await connection.stop()
    }
  }

  // Search logs với POST
  static async searchLogs(request: LogSearchRequest): Promise<LogSearchResult> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/ActivityLogs/search`, {
      method: 'POST',
      body: JSON.stringify(request),
    })

    return response.json()
  }

  // Lấy thống kê
  static async getQuickStats(days: number = 7): Promise<LogStats> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/ActivityLogs/quick-stats?days=${days}`)
    return response.json()
  }

  // Export logs
  static async exportLogs(request: LogSearchRequest): Promise<Blob> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/ActivityLogs/export`, {
      method: 'POST',
      body: JSON.stringify(request),
    })

    return response.blob()
  }

  // Lấy log details
  static async getLogDetails(logId: number): Promise<LogEntry> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/ActivityLogs/${logId}`)
    return response.json()
  }

  // Xóa log
  static async deleteLog(logId: number): Promise<void> {
    await this.authenticatedFetch(`${API_BASE_URL}/ActivityLogs/${logId}`, {
      method: 'DELETE',
    })
  }

  // Bulk delete logs
  static async bulkDeleteLogs(logIds: number[]): Promise<void> {
    await this.authenticatedFetch(`${API_BASE_URL}/ActivityLogs/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify(logIds),
    })
  }
}

// Constants
export const logSources = [
  'System', 'Security', 'UserActivity'
]

export const environments = ['production', 'staging', 'development']
export const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']