

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api'
const SignalR_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

export interface LogEntry {
  id: number
  timestamp: string
  level: 'Error' | 'Warning' | 'Information' | 'Debug' | 'Critical'
  source: 'System' | 'Security' | 'UserActivity' | 'Middleware' | 'Authentication' | 'ApiController' | 'Database'
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
  levels?: number[]  // Sửa thành number[]
  sources?: number[] // Sửa thành number[]
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

  // Kết nối SignalR
  static async connectToLogHub(
    onNewLog: (log: LogEntry) => void,
    onUpdateStats: () => void,
    onConnectionChange?: (connected: boolean) => void
  ): Promise<HubConnection> {
    const connection = new HubConnectionBuilder()
      .withUrl(`${SignalR_BASE_URL}/logHub`)
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
    const response = await fetch(`${API_BASE_URL}/ActivityLogs/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to search logs: ${response.statusText}`)
    }

    return response.json()
  }

  // Lấy thống kê
  static async getQuickStats(days: number = 7): Promise<LogStats> {
    const response = await fetch(`${API_BASE_URL}/ActivityLogs/quick-stats?days=${days}`)

    if (!response.ok) {
      throw new Error(`Failed to get quick stats: ${response.statusText}`)
    }

    return response.json()
  }

  // Export logs
  static async exportLogs(request: LogSearchRequest): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/ActivityLogs/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to export logs: ${response.statusText}`)
    }

    return response.blob()
  }
}

// Constants
export const logSources = [
  'System', 'Security', 'UserActivity', 'Middleware', 
  'Authentication', 'ApiController', 'Database'
]

export const environments = ['production', 'staging', 'development']
export const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']