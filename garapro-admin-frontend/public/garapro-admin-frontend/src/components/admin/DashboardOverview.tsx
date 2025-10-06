'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
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
import { MetricData } from '@/types/statistics'
import { statisticsService } from '@/services/statistics-service'

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

// Default metrics configuration
const defaultMetrics: MetricData[] = [
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
      retentionRate: '78%'
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
      paymentMethods: 'Credit Card (78%), PayPal (15%), Bank Transfer (7%)'
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
      upcomingOpenings: '2'
    },
    // Add garage branches data
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
        services: ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Repair'],
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
        services: ['Oil Change', 'Tire Service', 'AC Repair', 'Transmission'],
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
        services: ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Repair', 'AC Repair'],
        staff: 22,
        operatingHours: 'Mon-Fri: 7:30am-5:30pm, Sat: 9am-2pm',
        isActive: true,
        createdAt: '2023-05-20',
        updatedAt: '2024-02-10'
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
      lastIncident: '2 hours ago'
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
      topBrowsers: ['Chrome', 'Safari', 'Firefox', 'Edge']
    }
  }
]

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<MetricData[]>(defaultMetrics)
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const handleRefreshData = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      // Refresh data from service (will return fallback data if API unavailable)
      const data = await statisticsService.getMetrics()
      setMetrics(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.warn('Unexpected error refreshing metrics:', err)
      setError('Failed to refresh data. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch data from service (will return fallback data if API unavailable)
        const data = await statisticsService.getMetrics()
        setMetrics(data)
        setLastUpdated(new Date())
      } catch (err) {
        console.warn('Unexpected error loading metrics:', err)
        setError('Failed to load metrics. Using cached data.')
        // Keep existing metrics instead of resetting to defaults
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [])

  const handleMetricClick = useCallback((metric: MetricData) => {
    setSelectedMetric(metric)
    setIsDialogOpen(true) // Open dialog when metric is clicked
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false) // Close dialog
    setSelectedMetric(null) // Reset selected metric
  }, [])

  const handleExportData = useCallback(async () => {
    try {
      const blob = await statisticsService.exportStatistics('metrics')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-metrics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      setError('Failed to export data. Please try again.')
    }
  }, [])

  const handleExportMetric = useCallback(async (metricId: string) => {
    try {
      const blob = await statisticsService.exportStatistics(metricId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${metricId}-data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      setError(`Failed to export ${metricId} data. Please try again.`)
    }
  }, [])

  const handleViewAnalytics = useCallback(async (metricId: string) => {
    try {
      // Get detailed analytics for the specific metric
      const chartData = await statisticsService.getChartData(metricId, {
        period: '30d',
        metric: metricId
      })
      
      // Navigate to analytics view or show detailed modal
      // For now, we'll show an info message
      console.log('Analytics data for', metricId, chartData)
      
      // You could implement navigation to a detailed analytics page here
      // or show a more detailed modal with charts
      setError(`Analytics for ${metricId} - Feature coming soon!`)
      
      // Clear the message after a few seconds
      setTimeout(() => setError(null), 3000)
    } catch (error) {
      console.error('Analytics failed:', error)
      setError(`Failed to load analytics for ${metricId}. Please try again.`)
    }
  }, [])

  const handleCloseError = useCallback(() => {
    setError(null)
  }, [])

  const renderMetricDetails = useCallback((metric: MetricData) => {
    const Icon = metric.icon
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${metric.bgColor}`}>
              <Icon className={`h-6 w-6 ${metric.color}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{metric.title}</h3>
              <p className="text-sm text-gray-500">Detailed statistics and metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {metric.changeType === 'positive' ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : metric.changeType === 'negative' ? (
              <TrendingDown className="h-5 w-5 text-red-600" />
            ) : (
              <Activity className="h-5 w-5 text-gray-600" />
            )}
            <Badge 
              variant={metric.changeType === 'positive' ? 'default' : metric.changeType === 'negative' ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              {metric.change}
            </Badge>
          </div>
        </div>

        {/* Main Value */}
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <div className="text-4xl font-bold text-gray-900">{metric.value}</div>
          <div className="text-sm text-gray-500 mt-1">Current Value</div>
        </div>

        {/* Trend Visualization */}
        {metric.trend && metric.trend.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Trend Analysis</h4>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="flex items-end space-x-1 h-20">
                {metric.trend.map((value, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t"
                    style={{
                      height: `${(value / Math.max(...metric.trend)) * 80}px`,
                      width: '12px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Special handling for Garage Branches */}
        {metric.id === 'garage-branches' && metric.branches ? (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Branch Details</h4>
            <div className="grid grid-cols-1 gap-4">
              {metric.branches.map((branch: GarageBranch) => (
                <div key={branch.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{branch.name}</h5>
                      <p className="text-sm text-gray-500">{branch.address}, {branch.city}, {branch.state} {branch.zipCode}</p>
                    </div>
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Manager:</span> {branch.managerName}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Phone:</span> {branch.phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Email:</span> {branch.email}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Staff:</span> {branch.staff}
                    </div>
                    <div className="col-span-2 flex items-start">
                      <Wrench className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                      <div>
                        <span className="font-medium">Services:</span> 
                        <div className="flex flex-wrap gap-1 mt-1">
                          {branch.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Hours:</span> {branch.operatingHours}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard details grid for other metrics */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(metric.details).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  {typeof value === 'string' && value.includes('%') && (
                    <div className="w-16">
                      <Progress value={parseInt(value)} className="h-2" />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm" onClick={() => handleViewAnalytics(metric.id)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportMetric(metric.id)}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>
    )
  }, [handleRefreshData, handleExportMetric, handleViewAnalytics, isRefreshing])

  // Show loading state
  if (isLoading && metrics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading metrics...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with last updated info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData} 
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseError}
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Dialog 
              key={metric.id} 
              open={isDialogOpen && selectedMetric?.id === metric.id} // Control dialog open state
              onOpenChange={(open) => {
                if (!open) {
                  handleCloseDialog(); // Close dialog when onOpenChange is called with false
                }
              }}
            >
              <DialogTrigger asChild>
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleMetricClick(metric)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </div>
                      <div className="flex items-center space-x-1">
                        {metric.changeType === 'positive' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : metric.changeType === 'negative' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-gray-600" />
                        )}
                        <Badge 
                          variant={metric.changeType === 'positive' ? 'default' : metric.changeType === 'negative' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {metric.change}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Click to view details</span>
                      <Eye className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detailed Statistics</DialogTitle>
                  <DialogDescription>
                    Comprehensive view of {metric.title.toLowerCase()} metrics and performance data
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  {selectedMetric && renderMetricDetails(selectedMetric)}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                  <Button onClick={handleRefreshData} disabled={isRefreshing}>
                    {isRefreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Data
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        })}
      </div>
    </div>
  )
}