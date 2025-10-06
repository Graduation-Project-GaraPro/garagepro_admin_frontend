'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Activity, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Eye,
  Settings,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Star,
  MessageSquare,
  Globe,
  Shield
} from 'lucide-react'

const chartData = {
  userGrowth: [
    { month: 'Jan', users: 1200, growth: 12 },
    { month: 'Feb', users: 1350, growth: 15 },
    { month: 'Mar', users: 1520, growth: 18 },
    { month: 'Apr', users: 1680, growth: 16 },
    { month: 'May', users: 1850, growth: 17 },
    { month: 'Jun', users: 2100, growth: 25 }
  ],
  revenueData: [
    { month: 'Jan', revenue: 45000, orders: 120 },
    { month: 'Feb', revenue: 52000, orders: 135 },
    { month: 'Mar', revenue: 58000, orders: 152 },
    { month: 'Apr', revenue: 65000, orders: 168 },
    { month: 'May', revenue: 72000, orders: 185 },
    { month: 'Jun', revenue: 85000, orders: 210 }
  ],
  systemMetrics: {
    cpu: { current: 45, average: 42, peak: 78 },
    memory: { current: 78, average: 72, peak: 89 },
    disk: { current: 62, average: 58, peak: 75 },
    network: { current: 23, average: 20, peak: 45 }
  }
}

const topMetrics = [
  {
    title: 'Total Revenue',
    value: '$850,000',
    change: '+25%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    details: {
      thisMonth: '$85,000',
      lastMonth: '$68,000',
      growth: '+25%',
      avgOrderValue: '$405',
      totalOrders: '2,100'
    }
  },
  {
    title: 'Active Users',
    value: '2,847',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    details: {
      newThisMonth: '156',
      returningUsers: '2,123',
      avgSessionTime: '24m 32s',
      bounceRate: '22%',
      topLocations: ['New York', 'Los Angeles', 'Chicago']
    }
  },
  {
    title: 'Garage Registrations',
    value: '156',
    change: '+8%',
    changeType: 'positive',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    details: {
      newThisMonth: '23',
      pendingApproval: '12',
      avgRating: '4.2/5',
      totalServices: '1,234',
      revenuePerGarage: '$5,448'
    }
  },
  {
    title: 'System Performance',
    value: '99.9%',
    change: '+0.1%',
    changeType: 'positive',
    icon: Activity,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    details: {
      uptime: '99.9%',
      avgResponseTime: '245ms',
      errorRate: '0.1%',
      activeConnections: '1,234',
      serverLoad: '67%'
    }
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'revenue',
    title: 'New Order Completed',
    description: 'Order #ORD-2024-001 for $299.99',
    time: '2 minutes ago',
    value: '+$299.99',
    icon: ShoppingCart,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'user',
    title: 'New User Registration',
    description: 'john.doe@example.com joined',
    time: '5 minutes ago',
    value: '+1 user',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    id: 3,
    type: 'garage',
    title: 'Garage Registration',
    description: 'AutoFix Garage joined platform',
    time: '15 minutes ago',
    value: '+1 garage',
    icon: Building2,
    color: 'text-purple-600'
  },
  {
    id: 4,
    type: 'review',
    title: 'New Review Posted',
    description: '5-star review for AutoFix Garage',
    time: '1 hour ago',
    value: '+5 stars',
    icon: Star,
    color: 'text-yellow-600'
  }
]

export function StatisticsDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')

  const handleRefreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const renderMetricDetails = (metric: any) => {
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
              <p className="text-sm text-gray-500">Detailed statistics and trends</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {metric.changeType === 'positive' ? (
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            )}
            <Badge 
              variant={metric.changeType === 'positive' ? 'default' : 'destructive'}
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metric.details).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Trend Analysis</h4>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500 ml-2">Chart visualization</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>
    )
  }

  const renderActivityDetails = (activity: any) => {
    const Icon = activity.icon
    
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${activity.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
              <Icon className={`h-5 w-5 ${activity.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
              <p className="text-sm text-gray-500">{activity.description}</p>
            </div>
          </div>
          <Badge className="text-sm">
            {activity.value}
          </Badge>
        </div>

        {/* Time */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{activity.time}</span>
        </div>

        {/* Impact Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Impact Analysis</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Revenue Impact</div>
              <div className="text-lg font-semibold text-gray-900">+$299.99</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">User Engagement</div>
              <div className="text-lg font-semibold text-gray-900">+15%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h2>
          <p className="text-gray-600">Comprehensive overview of system performance and metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            {isLoading ? (
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
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Dialog key={metric.title} open={selectedMetric?.title === metric.title} onOpenChange={() => setSelectedMetric(null)}>
              <DialogTrigger asChild>
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => setSelectedMetric(metric)}
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
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <Badge 
                          variant={metric.changeType === 'positive' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {metric.change}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Click for details</span>
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
                  <Button variant="outline" onClick={() => setSelectedMetric(null)}>
                    Close
                  </Button>
                  <Button onClick={handleRefreshData} disabled={isLoading}>
                    {isLoading ? (
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>User Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">2,847</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+12%</div>
                  <div className="text-xs text-gray-500">vs last month</div>
                </div>
              </div>
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <LineChart className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 ml-2">Growth chart</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Revenue Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">$850,000</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+25%</div>
                  <div className="text-xs text-gray-500">vs last month</div>
                </div>
              </div>
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 ml-2">Revenue chart</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <Dialog key={activity.id} open={selectedActivity?.id === activity.id} onOpenChange={() => setSelectedActivity(null)}>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${activity.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-500">{activity.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="text-xs">{activity.value}</Badge>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                      <DialogTitle>Activity Details</DialogTitle>
                      <DialogDescription>
                        Detailed information about this activity
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                      {selectedActivity && renderActivityDetails(selectedActivity)}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSelectedActivity(null)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 