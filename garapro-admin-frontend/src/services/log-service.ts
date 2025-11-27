// import { apiClient } from './api-client'

// export interface SystemLog {
//   id: number
//   timestamp: string
//   level: 'debug' | 'info' | 'warning' | 'error' | 'critical'
//   category: 'system' | 'security' | 'application' | 'database' | 'network' | 'user'
//   source: string
//   message: string
//   details: any
//   userId?: string
//   userName?: string
//   ipAddress?: string
//   userAgent?: string
//   sessionId?: string
//   requestId?: string
//   tags: string[]
// }

// export interface SecurityLog extends SystemLog {
//   category: 'security'
//   threatLevel: 'low' | 'medium' | 'high' | 'critical'
//   action: 'login' | 'logout' | 'access_denied' | 'permission_change' | 'data_access' | 'system_change'
//   resource: string
//   outcome: 'success' | 'failure' | 'blocked'
//   relatedLogs?: number[]
// }

// export interface PerformanceLog extends SystemLog {
//   category: 'performance'
//   responseTime: number
//   memoryUsage: number
//   cpuUsage: number
//   databaseQueries: number
//   cacheHits: number
//   cacheMisses: number
//   endpoint: string
//   method: string
//   statusCode: number
// }

// export interface LogFilters {
//   search?: string
//   level?: string
//   category?: string
//   source?: string
//   userId?: string
//   ipAddress?: string
//   dateRange?: {
//     start: string
//     end: string
//   }
//   tags?: string[]
//   page?: number
//   limit?: number
// }

// export interface LogResponse {
//   logs: SystemLog[]
//   total: number
//   page: number
//   limit: number
//   totalPages: number
// }

// export interface LogAnalytics {
//   totalLogs: number
//   logsByLevel: Record<string, number>
//   logsByCategory: Record<string, number>
//   logsBySource: Record<string, number>
//   logsByHour: number[]
//   logsByDay: number[]
//   topUsers: Array<{ userId: string; userName: string; count: number }>
//   topIPs: Array<{ ip: string; count: number; location?: string }>
//   errorTrend: number[]
//   securityIncidents: number
//   performanceIssues: number
// }

// export interface LogExportOptions {
//   format: 'csv' | 'json' | 'xml'
//   includeDetails: boolean
//   compression: boolean
// }

// class LogService {
//   private baseUrl = '/logs'

//   // Get all logs with filters and pagination
//   async getLogs(filters?: LogFilters): Promise<LogResponse> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.category) params.category = filters.category
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')
//       if (filters?.page) params.page = filters.page
//       if (filters?.limit) params.limit = filters.limit

//       const response = await apiClient.get<LogResponse>(this.baseUrl, params)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch logs:', error)
//       throw new Error('Failed to fetch logs. Please try again.')
//     }
//   }

//   // Get log by ID
//   async getLogById(id: number): Promise<SystemLog> {
//     try {
//       const response = await apiClient.get<SystemLog>(`${this.baseUrl}/${id}`)
//       return response.data
//     } catch (error) {
//       console.error(`Failed to fetch log ${id}:`, error)
//       throw new Error('Failed to fetch log details. Please try again.')
//     }
//   }

//   // Get logs by category
//   async getLogsByCategory(category: string, filters?: Omit<LogFilters, 'category'>): Promise<LogResponse> {
//     try {
//       const params: Record<string, unknown> = { category }
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')
//       if (filters?.page) params.page = filters.page
//       if (filters?.limit) params.limit = filters.limit

//       const response = await apiClient.get<LogResponse>(`${this.baseUrl}/category/${category}`, params)
//       return response.data
//     } catch (error) {
//       console.error(`Failed to fetch logs for category ${category}:`, error)
//       throw new Error('Failed to fetch logs for category. Please try again.')
//     }
//   }

//   // Get security logs
//   async getSecurityLogs(filters?: Omit<LogFilters, 'category'>): Promise<LogResponse> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')
//       if (filters?.page) params.page = filters.page
//       if (filters?.limit) params.limit = filters.limit

//       const response = await apiClient.get<LogResponse>(`${this.baseUrl}/security`, params)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch security logs:', error)
//       throw new Error('Failed to fetch security logs. Please try again.')
//     }
//   }

//   // Get performance logs
//   async getPerformanceLogs(filters?: Omit<LogFilters, 'category'>): Promise<LogResponse> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')
//       if (filters?.page) params.page = filters.page
//       if (filters?.limit) params.limit = filters.limit

//       const response = await apiClient.get<LogResponse>(`${this.baseUrl}/performance`, params)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch performance logs:', error)
//       throw new Error('Failed to fetch performance logs. Please try again.')
//     }
//   }

//   // Get log analytics
//   async getLogAnalytics(filters?: LogFilters): Promise<LogAnalytics> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.category) params.category = filters.category
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')

//       const response = await apiClient.get<LogAnalytics>(`${this.baseUrl}/analytics`, params)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch log analytics:', error)
//       throw new Error('Failed to fetch log analytics. Please try again.')
//     }
//   }

//   // Get real-time logs
//   async getRealTimeLogs(callback: (log: SystemLog) => void): Promise<() => void> {
//     try {
//       // Try WebSocket first
//       const wsUrl = `${this.baseUrl.replace('http', 'ws')}/realtime`
//       const ws = new WebSocket(wsUrl)
      
//       ws.onmessage = (event) => {
//         try {
//           const log = JSON.parse(event.data)
//           callback(log)
//     } catch (error) {
//           console.error('Error parsing real-time log:', error)
//         }
//       }

//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error)
//       }

//       ws.onclose = () => {
//         console.log('WebSocket connection closed')
//       }

//       return () => {
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.close()
//         }
//       }
//     } catch (error) {
//       console.warn('WebSocket not available, falling back to polling:', error)
      
//       // Fallback to polling
//       const interval = setInterval(async () => {
//         try {
//           const recentLogs = await this.getLogs({ limit: 10 })
//           recentLogs.logs.forEach(log => callback(log))
//         } catch (error) {
//           console.warn('Polling fallback failed:', error)
//         }
//       }, 5000) // Poll every 5 seconds

//       return () => clearInterval(interval)
//     }
//   }

//   // Search logs
//   async searchLogs(query: string, filters?: Omit<LogFilters, 'search'>): Promise<LogResponse> {
//     try {
//       const params: Record<string, unknown> = { search: query }
//       if (filters?.level) params.level = filters.level
//       if (filters?.category) params.category = filters.category
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')
//       if (filters?.page) params.page = filters.page
//       if (filters?.limit) params.limit = filters.limit

//       const response = await apiClient.get<LogResponse>(`${this.baseUrl}/search`, params)
//       return response.data
//     } catch (error) {
//       console.error('Failed to search logs:', error)
//       throw new Error('Failed to search logs. Please try again.')
//     }
//   }

//   // Export logs
//   async exportLogs(filters?: LogFilters, options?: LogExportOptions): Promise<Blob> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.category) params.category = filters.category
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')

//       if (options) {
//         params.format = options.format
//         params.includeDetails = options.includeDetails
//         params.compression = options.compression
//       }

//       const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
//       return response.data
//     } catch (error) {
//       console.error('Failed to export logs:', error)
//       throw new Error('Failed to export logs. Please try again.')
//     }
//   }

//   // Clear logs
//   async clearLogs(filters?: LogFilters): Promise<void> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.category) params.category = filters.category
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')

//       await apiClient.delete(`${this.baseUrl}/clear`, { body: params })
//     } catch (error) {
//       console.error('Failed to clear logs:', error)
//       throw new Error('Failed to clear logs. Please try again.')
//     }
//   }

//   // Archive logs
//   async archiveLogs(filters?: LogFilters): Promise<string> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.category) params.category = filters.category
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')

//       const response = await apiClient.post<{ archiveId: string }>(`${this.baseUrl}/archive`, params)
//       return response.data.archiveId
//     } catch (error) {
//       console.error('Failed to archive logs:', error)
//       throw new Error('Failed to archive logs. Please try again.')
//     }
//   }

//   // Get log statistics
//   async getLogStatistics(): Promise<{
//     totalLogs: number
//     logsToday: number
//     logsThisWeek: number
//     logsThisMonth: number
//     errorRate: number
//     avgResponseTime: number
//     topCategories: Array<{ category: string; count: number }>
//     topSources: Array<{ source: string; count: number }>
//     topUsers: Array<{ userId: string; userName: string; count: number }>
//   }> {
//     try {
//       const response = await apiClient.get<{
//         totalLogs: number
//         logsToday: number
//         logsThisWeek: number
//         logsThisMonth: number
//         errorRate: number
//         avgResponseTime: number
//         topCategories: Array<{ category: string; count: number }>
//         topSources: Array<{ source: string; count: number }>
//         topUsers: Array<{ userId: string; userName: string; count: number }>
//       }>(`${this.baseUrl}/statistics`)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch log statistics:', error)
//       throw new Error('Failed to fetch log statistics. Please try again.')
//     }
//   }

//   // Get log patterns
//   async getLogPatterns(filters?: LogFilters): Promise<Array<{
//     pattern: string
//     count: number
//     examples: string[]
//     severity: 'low' | 'medium' | 'high' | 'critical'
//     category: string
//     source: string
//   }>> {
//     try {
//       const params: Record<string, unknown> = {}
//       if (filters?.search) params.search = filters.search
//       if (filters?.level) params.level = filters.level
//       if (filters?.category) params.category = filters.category
//       if (filters?.source) params.source = filters.source
//       if (filters?.userId) params.userId = filters.userId
//       if (filters?.ipAddress) params.ipAddress = filters.ipAddress
//       if (filters?.dateRange) {
//         params.startDate = filters.dateRange.start
//         params.endDate = filters.dateRange.end
//       }
//       if (filters?.tags) params.tags = filters.tags.join(',')

//       const response = await apiClient.get<Array<{
//         pattern: string
//         count: number
//         examples: string[]
//         severity: 'low' | 'medium' | 'high' | 'critical'
//         category: string
//         source: string
//       }>>(`${this.baseUrl}/patterns`, params)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch log patterns:', error)
//       throw new Error('Failed to fetch log patterns. Please try again.')
//     }
//   }

//   // Get related logs
//   async getRelatedLogs(logId: number, limit: number = 10): Promise<SystemLog[]> {
//     try {
//       const response = await apiClient.get<SystemLog[]>(`${this.baseUrl}/${logId}/related`, { limit })
//       return response.data
//     } catch (error) {
//       console.error(`Failed to fetch related logs for log ${logId}:`, error)
//       throw new Error('Failed to fetch related logs. Please try again.')
//     }
//   }

//   // Add log tag
//   async addLogTag(logId: number, tag: string): Promise<void> {
//     try {
//       await apiClient.patch(`${this.baseUrl}/${logId}/tags`, { tag })
//     } catch (error) {
//       console.error(`Failed to add tag to log ${logId}:`, error)
//       throw new Error('Failed to add log tag. Please try again.')
//     }
//   }

//   // Remove log tag
//   async removeLogTag(logId: number, tag: string): Promise<void> {
//     try {
//       await apiClient.delete(`${this.baseUrl}/${logId}/tags`, { body: { tag } })
//     } catch (error) {
//       console.error(`Failed to remove tag from log ${logId}:`, error)
//       throw new Error('Failed to remove log tag. Please try again.')
//     }
//   }

//   // Get available log sources
//   async getLogSources(): Promise<string[]> {
//     try {
//       const response = await apiClient.get<string[]>(`${this.baseUrl}/sources`)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch log sources:', error)
//       throw new Error('Failed to fetch log sources. Please try again.')
//     }
//   }

//   // Get available log tags
//   async getLogTags(): Promise<string[]> {
//     try {
//       const response = await apiClient.get<string[]>(`${this.baseUrl}/tags`)
//       return response.data
//     } catch (error) {
//       console.error('Failed to fetch log tags:', error)
//       throw new Error('Failed to fetch log tags. Please try again.')
//     }
//   }
// }

// export const logService = new LogService() 