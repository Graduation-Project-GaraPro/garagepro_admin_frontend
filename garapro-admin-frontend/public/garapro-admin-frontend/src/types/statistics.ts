export interface MetricData {
  id: string
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  bgColor: string
  trend: number[]
  details: Record<string, any>
  branches?: GarageBranch[] // Add optional branches property
}

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
  services: string[] // Simplified from BranchServiceType[]
  staff: number // Simplified from BranchStaff[]
  operatingHours: string // Simplified from OperatingHours
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

export interface SystemMetric {
  name: string
  current: number
  average: number
  peak: number
  status: 'normal' | 'warning' | 'critical'
  trend: number[]
}

export interface RealTimeMetric {
  id: string
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  bgColor: string
  trend: number[]
  isLive: boolean
}

export interface LiveActivity {
  id: string
  timestamp: string
  user: string
  action: string
  location: string
  value: string
  status: 'success' | 'pending' | 'error'
}

export interface GeographicData {
  country: string
  users: number
  revenue: number
  growth: number
}

export interface PerformanceMetric {
  id: string
  name: string
  current: number
  average: number
  peak: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: number[]
  description: string
}

export interface PerformanceAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

export interface PerformanceReport {
  id: string
  name: string
  score: number
  status: 'pass' | 'fail' | 'warning'
  details: string
  recommendations: string[]
}

export interface StatisticsFilters {
  period?: string
  metric?: string
  category?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface AnalyticsData {
  overview: {
    totalRevenue: number
    activeUsers: number
    totalOrders: number
    conversionRate: number
  }
  trends: {
    revenue: number[]
    users: number[]
    orders: number[]
    labels: string[]
  }
  topPerformers: Array<{
    name: string
    value: number
    change: number
    category: string
  }>
  geographicData: GeographicData[]
  performanceMetrics: PerformanceMetric[]
}