'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  Shield,
  Target,
  Zap,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Filter,
  Search,
  FileText,
  BarChart,
  PieChart as PieChartIcon,
  Activity as ActivityIcon
} from 'lucide-react'

interface MetricData {
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
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

interface SystemMetric {
  name: string
  current: number
  average: number
  peak: number
  status: 'normal' | 'warning' | 'critical'
  trend: number[]
}

const mockMetrics: MetricData[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '$2,847,392',
    change: '+25.4%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    trend: [1200, 1350, 1520, 1680, 1850, 2100, 2350, 2600, 2850, 3100, 3350, 3600],
    details: {
      thisMonth: '$285,000',
      lastMonth: '$227,000',
      growth: '+25.4%',
      avgOrderValue: '$405',
      totalOrders: '7,032',
      topProducts: ['Oil Change', 'Brake Service', 'Tire Rotation'],
      revenueByCategory: {
        'Oil Change': 35,
        'Brake Service': 28,
        'Tire Rotation': 22,
        'Other': 15
      }
    }
  },
  {
    id: '2',
    title: 'Active Users',
    value: '12,847',
    change: '+18.2%',
    changeType: 'positive',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    trend: [8500, 9200, 9800, 10500, 11200, 11800, 12400, 13000, 13500, 14000, 14500, 15000],
    details: {
      newThisMonth: '1,234',
      returningUsers: '8,456',
      avgSessionTime: '24m 32s',
      bounceRate: '22%',
      topLocations: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      userGrowth: {
        'New Users': 45,
        'Returning Users': 35,
        'Inactive Users': 20
      }
    }
  },
  {
    id: '3',
    title: 'Garage Partners',
    value: '847',
    change: '+12.8%',
    changeType: 'positive',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    trend: [650, 680, 710, 740, 770, 800, 820, 840, 860, 880, 900, 920],
    details: {
      newThisMonth: '23',
      activeGarages: '789',
      avgRating: '4.6/5',
      totalServices: '15,234',
      topCategories: ['Auto Repair', 'Oil Change', 'Tire Service'],
      garagePerformance: {
        'Excellent': 45,
        'Good': 35,
        'Average': 15,
        'Poor': 5
      }
    }
  },
  {
    id: '4',
    title: 'System Performance',
    value: '98.7%',
    change: '+2.1%',
    changeType: 'positive',
    icon: Activity,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    trend: [95, 96, 97, 98, 98.5, 98.7, 98.8, 98.9, 99, 99.1, 99.2, 99.3],
    details: {
      uptime: '99.9%',
      avgResponseTime: '245ms',
      errorRate: '0.13%',
      peakLoad: '78%',
      systemHealth: {
        'CPU Usage': 45,
        'Memory Usage': 78,
        'Disk Usage': 62,
        'Network': 23
      }
    }
  }
]

const systemMetrics: SystemMetric[] = [
  {
    name: 'CPU Usage',
    current: 45,
    average: 42,
    peak: 78,
    status: 'normal',
    trend: [40, 42, 45, 43, 47, 45, 48, 46, 44, 45, 47, 45]
  },
  {
    name: 'Memory Usage',
    current: 78,
    average: 72,
    peak: 89,
    status: 'warning',
    trend: [70, 72, 75, 78, 80, 82, 85, 78, 76, 78, 80, 78]
  },
  {
    name: 'Disk Usage',
    current: 62,
    average: 58,
    peak: 75,
    status: 'normal',
    trend: [55, 57, 59, 61, 63, 62, 64, 63, 61, 62, 64, 62]
  },
  {
    name: 'Network I/O',
    current: 23,
    average: 20,
    peak: 45,
    status: 'normal',
    trend: [18, 19, 21, 23, 25, 24, 26, 25, 23, 24, 26, 23]
  }
]

const revenueChartData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Revenue',
      data: [285000, 320000, 380000, 420000, 450000, 520000, 580000, 620000, 680000, 720000, 780000, 850000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    },
    {
      label: 'Orders',
      data: [702, 789, 856, 923, 990, 1057, 1124, 1191, 1258, 1325, 1392, 1459],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true
    }
  ]
}

const userGrowthData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Active Users',
      data: [8500, 9200, 9800, 10500, 11200, 11800, 12400, 13000, 13500, 14000, 14500, 15000],
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true
    },
    {
      label: 'New Users',
      data: [1200, 1350, 1520, 1680, 1850, 2100, 2350, 2600, 2850, 3100, 3350, 3600],
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true
    }
  ]
}

const topGarages = [
  { name: 'AutoCare Pro', revenue: '$125,000', orders: 456, rating: 4.8, growth: '+15%' },
  { name: 'QuickFix Garage', revenue: '$98,000', orders: 342, rating: 4.6, growth: '+12%' },
  { name: 'Premium Auto', revenue: '$87,000', orders: 298, rating: 4.9, growth: '+18%' },
  { name: 'Express Service', revenue: '$76,000', orders: 267, rating: 4.5, growth: '+8%' },
  { name: 'Reliable Motors', revenue: '$65,000', orders: 234, rating: 4.7, growth: '+14%' }
]

const recentActivity = [
  { time: '2 minutes ago', action: 'New garage registered', user: 'AutoCare Pro', type: 'success' },
  { time: '5 minutes ago', action: 'Large order completed', user: 'QuickFix Garage', type: 'info' },
  { time: '12 minutes ago', action: 'Payment processed', user: 'Premium Auto', type: 'success' },
  { time: '18 minutes ago', action: 'System maintenance', user: 'System', type: 'warning' },
  { time: '25 minutes ago', action: 'New user registered', user: 'john.doe@email.com', type: 'info' }
]

export function AdvancedStatistics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleRefreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const exportData = (type: string) => {
    const dataStr = JSON.stringify(mockMetrics, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `statistics-${type}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChangeIcon = (changeType: string) => {
    return changeType === 'positive' ? 
      <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
      <ArrowDownRight className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Statistics</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button onClick={() => exportData('full')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 mt-2">
                {getChangeIcon(metric.changeType)}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500">from last period</span>
              </div>
              <div className="mt-4">
                <Progress value={metric.trend[metric.trend.length - 1] / 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="system">System Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Revenue Trend</span>
                </CardTitle>
                <CardDescription>Monthly revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Revenue chart would be rendered here</p>
                    <p className="text-sm text-gray-400">Using Chart.js or Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Growth</span>
                </CardTitle>
                <CardDescription>Active users and new registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">User growth chart would be rendered here</p>
                    <p className="text-sm text-gray-400">Using Chart.js or Recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Garages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Top Performing Garages</span>
              </CardTitle>
              <CardDescription>Highest revenue generating partners</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Garage Name</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topGarages.map((garage, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{garage.name}</TableCell>
                      <TableCell>{garage.revenue}</TableCell>
                      <TableCell>{garage.orders}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{garage.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {garage.growth}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Revenue by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockMetrics[0].details.revenueByCategory).map(([category, percentage]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={Number(percentage ?? 0)} className="w-20 h-2" />
                        <span className="text-sm font-medium">{Number(percentage ?? 0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-medium">{mockMetrics[0].details.thisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Month</span>
                    <span className="font-medium">{mockMetrics[0].details.lastMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Growth</span>
                    <span className="font-medium text-green-600">{mockMetrics[0].details.growth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Order Value</span>
                    <span className="font-medium">{mockMetrics[0].details.avgOrderValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="font-medium">{mockMetrics[0].details.totalOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMetrics[0].details.topProducts.map((product: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{product}</span>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ActivityIcon className="h-5 w-5" />
                  <span>User Growth Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">User growth chart would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Top Locations</h4>
                    <div className="space-y-2">
                      {mockMetrics[1].details.topLocations.map((location: string, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm">{location}</span>
                          <Badge variant="outline">{Math.floor(Math.random() * 1000) + 500} users</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">User Growth</h4>
                    <div className="space-y-2">
                      {Object.entries(mockMetrics[1].details.userGrowth).map(([type, percentage]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm">{type}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={Number(percentage ?? 0)} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Number(percentage ?? 0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Performance Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>System Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={metric.current} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{metric.current}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Avg: {metric.average}%</span>
                        <span>Peak: {metric.peak}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Details */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-medium text-green-600">{mockMetrics[3].details.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-medium">{mockMetrics[3].details.avgResponseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-medium text-red-600">{mockMetrics[3].details.errorRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Peak Load</span>
                    <span className="font-medium">{mockMetrics[3].details.peakLoad}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 