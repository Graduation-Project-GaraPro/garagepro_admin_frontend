export interface LogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info' | 'debug' | 'critical'
  message: string
  source: string
  user: string
  ip: string
  details: string
  stackTrace?: string
  sessionId?: string
  requestId?: string
  duration?: number
  statusCode?: number
  userAgent?: string
  endpoint?: string
  method?: string
  responseSize?: number
  tags: string[]
  environment: 'production' | 'staging' | 'development'
  region: string
  service: string
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

export interface LogFilter {
  level?: string
  source?: string
  user?: string
  dateRange?: {
    start: string
    end: string
  }
  search?: string
  environment?: string
  service?: string
}

export interface LogConfig {
  id: string
  name: string
  level: string
  enabled: boolean
  retention: number
  maxSize: number
  format: string
  destination: string
  lastModified: string
  status: 'active' | 'inactive' | 'error'
}

export interface LogRetention {
  id: string
  policy: string
  retention: string
  size: string
  logs: number
  lastCleanup: string
  nextCleanup: string
  status: 'active' | 'scheduled' | 'completed'
}

export interface LogAnalytics {
  totalLogs: number
  errorRate: number
  warningRate: number
  averageResponseTime: number
  topErrors: Array<{
    message: string
    count: number
    percentage: number
  }>
  topSources: Array<{
    source: string
    count: number
    percentage: number
  }>
  servicePerformance: Array<{
    service: string
    totalRequests: number
    errors: number
    avgResponseTime: number
    successRate: number
  }>
}

export interface LogExportOptions {
  type: string
  dateRange: string
  format: string
  includeDetails: boolean
  includeStackTrace: boolean
}

export interface LogImportOptions {
  source: string
  format: string
  destination: string
  overwrite: boolean
} 