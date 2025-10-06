import { 
  MetricData, 
  ChartData, 
  RealTimeMetric, 
  LiveActivity, 
  GeographicData,
  PerformanceMetric,
  PerformanceAlert,
  PerformanceReport,
  StatisticsFilters,
  AnalyticsData
} from '@/types/statistics'
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Eye,
  BarChart3,
  Download,
  RefreshCw,
  Loader2,
  DollarSign,
  Building,
  XCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Wrench
} from 'lucide-react'
import { apiClient } from './api-client'

// Define the GarageBranch interface
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
  services: string[]
  staff: number
  operatingHours: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

class StatisticsService {
  private baseUrl = '/statistics'
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  // Cache management
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCachedData(key: string, data: any, ttl: number = 300000): void { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Overview Analytics
  async getOverviewAnalytics(filters?: StatisticsFilters): Promise<AnalyticsData> {
    const cacheKey = `overview_${JSON.stringify(filters || {})}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params: Record<string, unknown> = {}
      if (filters?.period) params.period = filters.period
      if (filters?.metric) params.metric = filters.metric
      if (filters?.category) params.category = filters.category
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<AnalyticsData>(`${this.baseUrl}/overview`, params)
      this.setCachedData(cacheKey, response.data)
      return response.data
    } catch (error) {
      console.warn('Failed to fetch overview analytics from API, using fallback data:', error)
      const fallback = this.getFallbackOverviewAnalytics()
      this.setCachedData(cacheKey, fallback, 60000) // Cache fallback for 1 minute
      return fallback
    }
  }

  async getMetrics(filters?: StatisticsFilters): Promise<MetricData[]> {
    const cacheKey = `metrics_${JSON.stringify(filters || {})}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params: Record<string, unknown> = {}
      if (filters?.period) params.period = filters.period
      if (filters?.metric) params.metric = filters.metric
      if (filters?.category) params.category = filters.category
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<MetricData[]>(`${this.baseUrl}/metrics`, params)
      this.setCachedData(cacheKey, response.data)
      return response.data
    } catch (error) {
      console.warn('Failed to fetch metrics from API, using fallback data:', error)
      const fallback = this.getFallbackMetrics()
      this.setCachedData(cacheKey, fallback, 60000) // Cache fallback for 1 minute
      return fallback
    }
  }

  // Enhanced fallback metrics (removed system metrics, focused on business metrics)
  private getFallbackMetrics(): MetricData[] {
    return [
      {
        id: 'total-users',
        title: 'Total Users',
        value: '2,847',
        change: '+12%',
        changeType: 'positive',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        trend: [2100, 2200, 2350, 2500, 2650, 2847],
        details: {
          activeUsers: '2,123',
          newThisMonth: '156',
          verifiedUsers: '2,456',
          pendingVerification: '391',
          topLocations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
          growthRate: '12%',
          avgSessionDuration: '24m 32s',
          retentionRate: '78%',
          userSegments: 'Premium (45%), Standard (35%), Free (20%)',
          registrationSource: 'Direct (60%), Social (25%), Referral (15%)'
        }
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: '$850,000',
        change: '+25%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        trend: [680000, 720000, 750000, 780000, 820000, 850000],
        details: {
          thisMonth: '$85,000',
          lastMonth: '$68,000',
          avgOrderValue: '$405',
          totalOrders: '2,100',
          conversionRate: '3.4%',
          recurringRevenue: '$234,000',
          topPayingCustomers: ['AutoFix Pro', 'QuickRepair', 'Elite Motors'],
          paymentMethods: 'Credit Card (78%), PayPal (15%), Bank Transfer (7%)',
          revenueByService: 'Repairs (60%), Maintenance (25%), Parts (15%)',
          monthlyRecurring: '$45,000'
        }
      },
      {
        id: 'garage-branches',
        title: 'Garage Branches',
        value: '15',
        change: '+3',
        changeType: 'positive',
        icon: Building,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        trend: [10, 11, 12, 13, 14, 15],
        details: {
          totalBranches: '15',
          activeBranches: '14',
          inactiveBranches: '1',
          newThisMonth: '3',
          topLocations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
          totalStaff: '245',
          totalServices: '18',
          avgStaffPerBranch: '16.3',
          upcomingOpenings: '2',
          avgRating: '4.7/5',
          totalCapacity: '450 vehicles/day'
        },
        branches: [
          {
            id: 'branch-1',
            name: 'AutoFix Downtown',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            phone: '+1 (555) 123-4567',
            email: 'downtown@autofix.com',
            managerId: 'mgr-001',
            managerName: 'John Smith',
            services: ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Repair', 'AC Service'],
            staff: 18,
            operatingHours: 'Mon-Fri: 8am-6pm, Sat: 9am-4pm',
            isActive: true,
            createdAt: '2023-01-15',
            updatedAt: '2024-02-20'
          },
          {
            id: 'branch-2',
            name: 'AutoFix Westside',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA',
            phone: '+1 (555) 987-6543',
            email: 'westside@autofix.com',
            managerId: 'mgr-002',
            managerName: 'Maria Garcia',
            services: ['Oil Change', 'Tire Service', 'AC Repair', 'Transmission', 'Diagnostics'],
            staff: 22,
            operatingHours: 'Mon-Sat: 7:30am-7pm',
            isActive: true,
            createdAt: '2023-03-10',
            updatedAt: '2024-01-15'
          },
          {
            id: 'branch-3',
            name: 'AutoFix Chicago Central',
            address: '789 Michigan Ave',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60007',
            country: 'USA',
            phone: '+1 (555) 456-7890',
            email: 'chicago@autofix.com',
            managerId: 'mgr-003',
            managerName: 'Robert Johnson',
            services: ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Repair', 'AC Repair', 'Body Work'],
            staff: 20,
            operatingHours: 'Mon-Fri: 7:30am-5:30pm, Sat: 9am-2pm',
            isActive: true,
            createdAt: '2023-05-20',
            updatedAt: '2024-02-10'
          },
          {
            id: 'branch-4',
            name: 'AutoFix Houston South',
            address: '321 Gulf Freeway',
            city: 'Houston',
            state: 'TX',
            zipCode: '77021',
            country: 'USA',
            phone: '+1 (555) 234-5678',
            email: 'houston@autofix.com',
            managerId: 'mgr-004',
            managerName: 'David Wilson',
            services: ['Oil Change', 'Brake Service', 'Transmission', 'Engine Repair'],
            staff: 16,
            operatingHours: 'Mon-Fri: 8am-6pm, Sat: 9am-3pm',
            isActive: true,
            createdAt: '2023-07-12',
            updatedAt: '2024-01-28'
          },
          {
            id: 'branch-5',
            name: 'AutoFix Miami Beach',
            address: '567 Ocean Drive',
            city: 'Miami',
            state: 'FL',
            zipCode: '33139',
            country: 'USA',
            phone: '+1 (555) 345-6789',
            email: 'miami@autofix.com',
            managerId: 'mgr-005',
            managerName: 'Sofia Rodriguez',
            services: ['Oil Change', 'Tire Service', 'AC Repair', 'Detailing'],
            staff: 14,
            operatingHours: 'Mon-Sat: 8am-6pm',
            isActive: true,
            createdAt: '2023-09-01',
            updatedAt: '2024-02-15'
          }
        ]
      },
      {
        id: 'security-alerts',
        title: 'Security Alerts',
        value: '3',
        change: '-2',
        changeType: 'negative',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        trend: [8, 6, 5, 4, 5, 3],
        details: {
          activeAlerts: '3',
          resolvedToday: '5',
          criticalAlerts: '1',
          warningAlerts: '2',
          blockedIPs: '45',
          failedLogins: '23',
          suspiciousActivities: '8',
          lastIncident: '2 hours ago',
          securityScore: '94/100',
          vulnerabilitiesPatched: '12 this month'
        }
      },
      {
        id: 'active-sessions',
        title: 'Active Sessions',
        value: '1,234',
        change: '+5%',
        changeType: 'positive',
        icon: Shield,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        trend: [1050, 1100, 1150, 1180, 1200, 1234],
        details: {
          currentSessions: '1,234',
          uniqueUsers: '987',
          avgSessionDuration: '18m 45s',
          peakConcurrent: '1,567',
          mobileSessions: '456',
          desktopSessions: '778',
          sessionGrowth: '+5%',
          topBrowsers: ['Chrome', 'Safari', 'Firefox', 'Edge'],
          bounceRate: '32%',
          avgPageViews: '4.2'
        }
      },
      {
        id: 'customer-satisfaction',
        title: 'Customer Satisfaction',
        value: '4.8/5',
        change: '+0.2',
        changeType: 'positive',
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        trend: [4.4, 4.5, 4.6, 4.7, 4.7, 4.8],
        details: {
          averageRating: '4.8/5',
          totalReviews: '1,247',
          positiveReviews: '89%',
          neutralReviews: '8%',
          negativeReviews: '3%',
          responseRate: '96%',
          avgResponseTime: '2.4 hours',
          repeatCustomers: '78%',
          referralRate: '23%'
        }
      }
    ]
  }

  // Enhanced fallback overview analytics
  private getFallbackOverviewAnalytics(): AnalyticsData {
    return {
      overview: {
        totalRevenue: 850000,
        activeUsers: 2123,
        totalOrders: 2100,
        conversionRate: 3.4
      },
      trends: {
        revenue: [680000, 720000, 750000, 780000, 820000, 850000],
        users: [2100, 2200, 2350, 2500, 2650, 2847],
        orders: [1800, 1900, 2000, 2050, 2080, 2100],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      topPerformers: [
        { name: 'AutoFix Pro', value: 125000, change: 12, category: 'Garage' },
        { name: 'QuickRepair', value: 98000, change: 8, category: 'Garage' },
        { name: 'Elite Motors', value: 87000, change: 15, category: 'Garage' },
        { name: 'Speedy Service', value: 76000, change: 22, category: 'Garage' },
        { name: 'Premium Auto', value: 65000, change: -5, category: 'Garage' }
      ],
      geographicData: [
        { country: 'USA', users: 1500, revenue: 500000, growth: 15 },
        { country: 'Canada', users: 300, revenue: 120000, growth: 8 },
        { country: 'UK', users: 200, revenue: 80000, growth: 12 },
        { country: 'Australia', users: 150, revenue: 65000, growth: 18 }
      ],
      performanceMetrics: [
        {
          id: 'service-quality',
          name: 'Service Quality Score',
          current: 95.2,
          average: 92.8,
          peak: 97.1,
          status: 'excellent',
          trend: [91.2, 92.1, 93.5, 94.2, 94.8, 95.2],
          description: 'Overall service quality rating'
        },
        {
          id: 'response-time',
          name: 'Average Response Time',
          current: 2.3,
          average: 3.1,
          peak: 1.8,
          status: 'good',
          trend: [3.5, 3.2, 2.9, 2.6, 2.4, 2.3],
          description: 'Average customer response time (hours)'
        }
      ]
    }
  }

  // Alerts and Notifications (business-focused)
  async getAlerts(): Promise<PerformanceAlert[]> {
    try {
      const response = await apiClient.get<PerformanceAlert[]>(`${this.baseUrl}/alerts`)
      return response.data
    } catch (error) {
      console.warn('Alerts API not available, using fallback:', error)
      return this.getFallbackAlerts()
    }
  }

  private getFallbackAlerts(): PerformanceAlert[] {
    return [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'High Booking Volume',
        message: 'Downtown branch has 85% booking capacity for today',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        severity: 'medium',
        isResolved: false,
        affectedMetric: 'garage-branches'
      },
      {
        id: 'alert-2',
        type: 'info',
        title: 'Monthly Revenue Target',
        message: 'Already achieved 92% of monthly revenue target',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        severity: 'low',
        isResolved: false,
        affectedMetric: 'total-revenue'
      },
      {
        id: 'alert-3',
        type: 'success',
        title: 'Security Incident Resolved',
        message: 'Suspicious login attempts from blocked IP have been resolved',
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        severity: 'low',
        isResolved: true,
        affectedMetric: 'security-alerts'
      }
    ]
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/alerts/${alertId}/resolve`)
    } catch (error) {
      console.warn('Alert resolve API not available:', error)
      // Simulate resolution in fallback mode
      console.log(`Alert ${alertId} marked as resolved (fallback mode)`)
    }
  }

  // Geographic Data for business analytics
  async getGeographicData(): Promise<GeographicData[]> {
    const cacheKey = 'geographic_data'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await apiClient.get<GeographicData[]>(`${this.baseUrl}/realtime/geographic`)
      this.setCachedData(cacheKey, response.data, 300000) // Cache for 5 minutes
      return response.data
    } catch (error) {
      console.warn('Geographic data not available, using fallback:', error)
      const fallback = this.getFallbackGeographicData()
      this.setCachedData(cacheKey, fallback, 300000)
      return fallback
    }
  }

  private getFallbackGeographicData(): GeographicData[] {
    return [
      { country: 'USA', users: 1500, revenue: 500000, growth: 15 },
      { country: 'Canada', users: 300, revenue: 120000, growth: 8 },
      { country: 'UK', users: 200, revenue: 80000, growth: 12 },
      { country: 'Australia', users: 150, revenue: 65000, growth: 18 },
      { country: 'Germany', users: 120, revenue: 55000, growth: 10 }
    ]
  }

  // Reports Generation
  async generateReport(reportType: string, filters?: StatisticsFilters): Promise<{
    reportId: string
    downloadUrl: string
    expiresAt: string
  }> {
    try {
      const response = await apiClient.post<{
        reportId: string
        downloadUrl: string
        expiresAt: string
      }>(`${this.baseUrl}/reports`, { type: reportType, filters })
      
      return response.data
    } catch (error) {
      console.warn('Report generation API not available, creating fallback:', error)
      // Generate fallback report info
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        reportId,
        downloadUrl: `/reports/${reportId}.pdf`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }
    }
  }

  async getPerformanceReports(): Promise<PerformanceReport[]> {
    try {
      const response = await apiClient.get<PerformanceReport[]>(`${this.baseUrl}/performance/reports`)
      return response.data
    } catch (error) {
      console.warn('Performance reports not available, using fallback:', error)
      return this.getFallbackPerformanceReports()
    }
  }

  private getFallbackPerformanceReports(): PerformanceReport[] {
    return [
      {
        id: 'report-1',
        title: 'Monthly Business Performance',
        type: 'monthly',
        generatedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        status: 'completed',
        downloadUrl: '/reports/monthly-performance.pdf',
        summary: {
          totalRevenue: 850000,
          customerSatisfaction: 4.8,
          serviceEfficiency: 87.2,
          keyInsights: [
            'Revenue increased by 25% compared to last month',
            'Customer satisfaction improved across all branches',
            'Service efficiency is above industry average'
          ]
        }
      },
      {
        id: 'report-2',
        title: 'Branch Performance Analysis',
        type: 'branch-analysis',
        generatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'completed',
        downloadUrl: '/reports/branch-analysis.pdf',
        summary: {
          totalRevenue: 850000,
          customerSatisfaction: 4.8,
          serviceEfficiency: 87.2,
          keyInsights: [
            'Downtown branch leads in revenue generation',
            'Miami branch has highest customer satisfaction',
            'Chicago branch shows most improvement this quarter'
          ]
        }
      }
    ]
  }

  // Custom Analytics for advanced queries
  async getCustomAnalytics(query: string, filters?: StatisticsFilters): Promise<any> {
    try {
      const response = await apiClient.post<any>(`${this.baseUrl}/custom`, { query, filters })
      return response.data
    } catch (error) {
      console.warn('Custom analytics not available, providing basic response:', error)
      return {
        query,
        result: 'Custom analytics feature is not available at this time',
        timestamp: new Date().toISOString(),
        fallback: true
      }
    }
  }

  // Business Intelligence Methods
  async getBusinessInsights(): Promise<{
    insights: string[]
    recommendations: string[]
    trends: { [key: string]: 'up' | 'down' | 'stable' }
  }> {
    try {
      const response = await apiClient.get<{
        insights: string[]
        recommendations: string[]
        trends: { [key: string]: 'up' | 'down' | 'stable' }
      }>(`${this.baseUrl}/insights`)
      return response.data
    } catch (error) {
      console.warn('Business insights not available, using fallback:', error)
      return {
        insights: [
          'Revenue growth is consistently strong across all quarters',
          'Customer satisfaction scores are above industry average',
          'Mobile bookings have increased by 45% this quarter',
          'Average service time has decreased by 15% while maintaining quality'
        ],
        recommendations: [
          'Consider expanding high-performing branches',
          'Implement loyalty program to increase customer retention',
          'Optimize staffing during peak booking hours',
          'Invest in mobile app improvements for better user experience'
        ],
        trends: {
          revenue: 'up',
          customers: 'up',
          satisfaction: 'up',
          efficiency: 'up',
          costs: 'stable'
        }
      }
    }
  }

  // Metrics Comparison
  async compareMetrics(metric1: string, metric2: string, period: string = '30d'): Promise<{
    metric1Data: { name: string; values: number[]; labels: string[] }
    metric2Data: { name: string; values: number[]; labels: string[] }
    correlation: number
    insights: string[]
  }> {
    try {
      const response = await apiClient.get<{
        metric1Data: { name: string; values: number[]; labels: string[] }
        metric2Data: { name: string; values: number[]; labels: string[] }
        correlation: number
        insights: string[]
      }>(`${this.baseUrl}/compare`, { metric1, metric2, period })
      return response.data
    } catch (error) {
      console.warn('Metrics comparison not available, using fallback:', error)
      return {
        metric1Data: {
          name: metric1,
          values: [100, 110, 105, 120, 115, 130],
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
        },
        metric2Data: {
          name: metric2,
          values: [50, 55, 52, 60, 58, 65],
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
        },
        correlation: 0.85,
        insights: [
          `Strong positive correlation (0.85) between ${metric1} and ${metric2}`,
          'Both metrics show consistent growth over the period',
          'Performance peaks align, indicating related business drivers'
        ]
      }
    }
  }

  // Real-time Analytics with enhanced functionality
  async getRealTimeMetrics(): Promise<RealTimeMetric[]> {
    const cacheKey = 'realtime_metrics'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await apiClient.get<RealTimeMetric[]>(`${this.baseUrl}/realtime/metrics`)
      this.setCachedData(cacheKey, response.data, 10000) // Cache for 10 seconds only
      return response.data
    } catch (error) {
      console.warn('Real-time metrics not available, using fallback:', error)
      const fallback = this.getFallbackRealTimeMetrics()
      this.setCachedData(cacheKey, fallback, 10000)
      return fallback
    }
  }

  private getFallbackRealTimeMetrics(): RealTimeMetric[] {
    return [
      {
        id: 'current-bookings',
        name: 'Current Bookings',
        value: 47,
        change: +3,
        changeType: 'positive',
        timestamp: new Date().toISOString()
      },
      {
        id: 'active-services',
        name: 'Active Services',
        value: 23,
        change: +1,
        changeType: 'positive',
        timestamp: new Date().toISOString()
      },
      {
        id: 'queue-waiting',
        name: 'Queue Waiting',
        value: 12,
        change: -2,
        changeType: 'negative',
        timestamp: new Date().toISOString()
      }
    ]
  }

  async getLiveActivities(): Promise<LiveActivity[]> {
    try {
      const response = await apiClient.get<LiveActivity[]>(`${this.baseUrl}/realtime/activities`)
      return response.data
    } catch (error) {
      console.warn('Live activities not available, using fallback:', error)
      return this.getFallbackLiveActivities()
    }
  }

  private getFallbackLiveActivities(): LiveActivity[] {
    return [
      {
        id: '1',
        type: 'booking',
        message: 'New booking received from John Doe',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        severity: 'info'
      },
      {
        id: '2',
        type: 'service_complete',
        message: 'Oil change service completed for Vehicle #ABC123',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        severity: 'success'
      },
      {
        id: '3',
        type: 'payment',
        message: 'Payment of $150 received from customer',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        severity: 'success'
      }
    ]
  }

  // Enhanced Charts and Visualizations
  async getChartData(chartType: string, filters?: StatisticsFilters): Promise<ChartData> {
    const cacheKey = `chart_${chartType}_${JSON.stringify(filters || {})}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params: Record<string, unknown> = { type: chartType }
      if (filters?.period) params.period = filters.period
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<ChartData>(`${this.baseUrl}/charts`, params)
      this.setCachedData(cacheKey, response.data)
      return response.data
    } catch (error) {
      console.warn('Chart data not available, using fallback:', error)
      const fallback = this.getFallbackChartData(chartType, filters)
      this.setCachedData(cacheKey, fallback, 120000) // Cache for 2 minutes
      return fallback
    }
  }

  private getFallbackChartData(chartType: string, filters?: StatisticsFilters): ChartData {
    const baseData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: []
    }

    switch (chartType) {
      case 'total-users':
        return {
          ...baseData,
          datasets: [{
            label: 'Users',
            data: [2100, 2200, 2350, 2500, 2650, 2847],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        }
      case 'total-revenue':
        return {
          ...baseData,
          datasets: [{
            label: 'Revenue ($)',
            data: [680000, 720000, 750000, 780000, 820000, 850000],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          }]
        }
      case 'garage-branches':
        return {
          ...baseData,
          datasets: [{
            label: 'Branches',
            data: [10, 11, 12, 13, 14, 15],
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)'
          }]
        }
      default:
        return {
          ...baseData,
          datasets: [{
            label: 'Data',
            data: [100, 120, 110, 130, 125, 140],
            borderColor: 'rgb(107, 114, 128)',
            backgroundColor: 'rgba(107, 114, 128, 0.1)'
          }]
        }
    }
  }

  // Enhanced Export functionality
  async exportStatistics(type: string, filters?: StatisticsFilters): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { type }
      if (filters?.period) params.period = filters.period
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.warn('Export API not available, generating fallback CSV:', error)
      return this.generateFallbackExport(type, filters)
    }
  }

  private generateFallbackExport(type: string, filters?: StatisticsFilters): Blob {
    let csvContent = ''
    
    switch (type) {
      case 'metrics':
        csvContent = 'Metric,Value,Change,Type\n'
        const metrics = this.getFallbackMetrics()
        metrics.forEach(metric => {
          csvContent += `"${metric.title}","${metric.value}","${metric.change}","${metric.changeType}"\n`
        })
        break
      case 'garage-branches':
        csvContent = 'Branch Name,City,State,Manager,Staff,Status\n'
        const garageBranches = this.getFallbackMetrics().find(m => m.id === 'garage-branches')
        if (garageBranches && garageBranches.branches) {
          garageBranches.branches.forEach(branch => {
            csvContent += `"${branch.name}","${branch.city}","${branch.state}","${branch.managerName}",${branch.staff},"${branch.isActive ? 'Active' : 'Inactive'}"\n`
          })
        }
        break
      default:
        csvContent = 'Data,Value\n'
        csvContent += `"Export Type","${type}"\n`
        csvContent += `"Generated At","${new Date().toISOString()}"\n`
    }

    return new Blob([csvContent], { type: 'text/csv' })
  }

  // Enhanced WebSocket with better error handling
  subscribeToRealTimeUpdates(callback: (data: any) => void): () => void {
    try {
      const wsUrl = `${this.baseUrl.replace('http', 'ws')}/realtime`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connection established')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          callback(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason)
      }

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
    } catch (error) {
      console.warn('WebSocket not available, falling back to polling:', error)
      
      // Enhanced polling fallback with progressive intervals
      let pollCount = 0
      const maxPollCount = 10
      
      const poll = () => {
        if (pollCount >= maxPollCount) return
        
        this.getMetrics()
          .then(metrics => {
            callback({ 
              type: 'metrics_update', 
              metrics,
              timestamp: new Date().toISOString()
            })
            pollCount++
          })
          .catch(error => console.warn('Polling fallback failed:', error))
      }
      
      // Initial poll
      poll()
      
      // Progressive intervals: start with 10s, increase to 60s
      const intervals = [10000, 20000, 30000, 60000]
      let currentInterval = 0
      
      const interval = setInterval(() => {
        poll()
        
        // Increase interval progressively
        if (currentInterval < intervals.length - 1) {
          currentInterval++
          clearInterval(interval)
          setInterval(poll, intervals[currentInterval])
        }
      }, intervals[currentInterval])

      return () => clearInterval(interval)
    }
  }

  // Enhanced Dashboard Data with better error handling
  async getDashboardData(): Promise<{
    overview: AnalyticsData['overview']
    trends: AnalyticsData['trends']
    topPerformers: AnalyticsData['topPerformers']
    recentActivity: LiveActivity[]
  }> {
    const cacheKey = 'dashboard_data'
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await apiClient.get<{
        overview: AnalyticsData['overview']
        trends: AnalyticsData['trends']
        topPerformers: AnalyticsData['topPerformers']
        recentActivity: LiveActivity[]
      }>(`${this.baseUrl}/dashboard`)
      
      this.setCachedData(cacheKey, response.data, 120000) // Cache for 2 minutes
      return response.data
    } catch (error) {
      console.warn('Dashboard API not available, using fallback:', error)
      const fallback = {
        overview: this.getFallbackOverviewAnalytics().overview,
        trends: this.getFallbackOverviewAnalytics().trends,
        topPerformers: this.getFallbackOverviewAnalytics().topPerformers,
        recentActivity: this.getFallbackLiveActivities()
      }
      this.setCachedData(cacheKey, fallback, 60000) // Cache fallback for 1 minute
      return fallback
    }
  }

  // Performance Analytics (focused on business performance, not system performance)
  async getPerformanceMetrics(): Promise<PerformanceMetric[]> {
    try {
      const response = await apiClient.get<PerformanceMetric[]>(`${this.baseUrl}/performance/metrics`)
      return response.data
    } catch (error) {
      console.warn('Performance metrics not available, using fallback:', error)
      return this.getFallbackPerformanceMetrics()
    }
  }

  private getFallbackPerformanceMetrics(): PerformanceMetric[] {
    return [
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        current: 4.8,
        average: 4.5,
        peak: 4.9,
        status: 'excellent',
        trend: [4.3, 4.4, 4.5, 4.6, 4.7, 4.8],
        description: 'Average customer rating across all services'
      },
      {
        id: 'service-efficiency',
        name: 'Service Efficiency',
        current: 87.2,
        average: 82.5,
        peak: 92.1,
        status: 'good',
        trend: [78.5, 80.1, 82.3, 84.7, 86.1, 87.2],
        description: 'Percentage of services completed on time'
      },
      {
        id: 'booking-conversion',
        name: 'Booking Conversion Rate',
        current: 68.4,
        average: 65.2,
        peak: 72.8,
        status: 'good',
        trend: [62.1, 63.8, 65.4, 66.9, 67.7, 68.4],
        description: 'Percentage of inquiries that convert to bookings'
      }
    ]
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear()
    console.log('Statistics service cache cleared')
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[]; oldestEntry: string | null } {
    const keys = Array.from(this.cache.keys())
    let oldestTimestamp = Infinity
    let oldestKey: string | null = null

    keys.forEach(key => {
      const entry = this.cache.get(key)
      if (entry && entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    })

    return {
      size: this.cache.size,
      keys,
      oldestEntry: oldestKey
    }
  }
}

export const statisticsService = new StatisticsService()