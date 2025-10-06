'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Activity, 
  Clock, 
  Zap, 
  Target, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Calendar,
  Filter
} from 'lucide-react'

interface PerformanceMetric {
  id: string
  name: string
  current: number
  average: number
  peak: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: number[]
  description: string
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

interface PerformanceReport {
  id: string
  name: string
  score: number
  status: 'pass' | 'fail' | 'warning'
  details: string
  recommendations: string[]
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: '1',
    name: 'Page Load Time',
    current: 1.2,
    average: 1.5,
    peak: 3.2,
    status: 'excellent',
    trend: [1.8, 1.6, 1.4, 1.3, 1.2, 1.2],
    description: 'Average time to load pages'
  },
  {
    id: '2',
    name: 'API Response Time',
    current: 245,
    average: 280,
    peak: 850,
    status: 'good',
    trend: [320, 300, 280, 260, 250, 245],
    description: 'Average API response time in milliseconds'
  },
  {
    id: '3',
    name: 'Database Query Time',
    current: 45,
    average: 52,
    peak: 120,
    status: 'excellent',
    trend: [60, 55, 50, 48, 46, 45],
    description: 'Average database query execution time'
  },
  {
    id: '4',
    name: 'Memory Usage',
    current: 78,
    average: 72,
    peak: 89,
    status: 'warning',
    trend: [70, 72, 75, 78, 80, 78],
    description: 'Current memory utilization percentage'
  },
  {
    id: '5',
    name: 'CPU Usage',
    current: 45,
    average: 42,
    peak: 78,
    status: 'good',
    trend: [40, 42, 45, 43, 47, 45],
    description: 'Current CPU utilization percentage'
  },
  {
    id: '6',
    name: 'Error Rate',
    current: 0.13,
    average: 0.15,
    peak: 0.45,
    status: 'excellent',
    trend: [0.18, 0.16, 0.15, 0.14, 0.13, 0.13],
    description: 'Percentage of failed requests'
  }
]

const performanceAlerts: PerformanceAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'High Memory Usage',
    description: 'Memory usage has reached 78% - consider optimization',
    timestamp: '2 minutes ago',
    severity: 'medium',
    resolved: false
  },
  {
    id: '2',
    type: 'error',
    title: 'Database Connection Pool Exhausted',
    description: 'Database connection pool is at 95% capacity',
    timestamp: '5 minutes ago',
    severity: 'high',
    resolved: true
  },
  {
    id: '3',
    type: 'info',
    title: 'Scheduled Maintenance Completed',
    description: 'Database optimization completed successfully',
    timestamp: '15 minutes ago',
    severity: 'low',
    resolved: true
  },
  {
    id: '4',
    type: 'warning',
    title: 'Slow API Endpoint Detected',
    description: 'User authentication endpoint is taking longer than usual',
    timestamp: '8 minutes ago',
    severity: 'medium',
    resolved: false
  }
]

const performanceReports: PerformanceReport[] = [
  {
    id: '1',
    name: 'Overall Performance Score',
    score: 92,
    status: 'pass',
    details: 'Excellent performance across all metrics',
    recommendations: [
      'Monitor memory usage closely',
      'Consider implementing caching for frequently accessed data',
      'Optimize database queries for better performance'
    ]
  },
  {
    id: '2',
    name: 'Frontend Performance',
    score: 95,
    status: 'pass',
    details: 'Fast page load times and smooth user experience',
    recommendations: [
      'Implement lazy loading for images',
      'Use CDN for static assets',
      'Optimize bundle size'
    ]
  },
  {
    id: '3',
    name: 'Backend Performance',
    score: 88,
    status: 'pass',
    details: 'Good API performance with room for improvement',
    recommendations: [
      'Implement API response caching',
      'Optimize database queries',
      'Consider horizontal scaling'
    ]
  },
  {
    id: '4',
    name: 'Database Performance',
    score: 85,
    status: 'warning',
    details: 'Database performance needs attention',
    recommendations: [
      'Add database indexes for slow queries',
      'Implement query optimization',
      'Consider database partitioning'
    ]
  }
]

const topSlowQueries = [
  { query: 'SELECT * FROM users WHERE status = ?', avgTime: 245, count: 1250, impact: 'high' },
  { query: 'SELECT * FROM orders WHERE date > ?', avgTime: 189, count: 890, impact: 'medium' },
  { query: 'SELECT * FROM garages WHERE city = ?', avgTime: 156, count: 567, impact: 'medium' },
  { query: 'SELECT * FROM services WHERE category = ?', avgTime: 134, count: 432, impact: 'low' },
  { query: 'SELECT * FROM reviews WHERE rating > ?', avgTime: 98, count: 234, impact: 'low' }
]

export function PerformanceAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'fail': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed performance monitoring and optimization insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <Badge className={getStatusColor(metric.status)}>
                {metric.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.name.includes('Time') || metric.name.includes('Response') || metric.name.includes('Query') 
                  ? `${metric.current}ms` 
                  : metric.name.includes('Usage') || metric.name.includes('Rate')
                  ? `${metric.current}%`
                  : metric.current}
              </div>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Current</span>
                  <span>Average</span>
                  <span>Peak</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{metric.current}</span>
                  <span>{metric.average}</span>
                  <span>{metric.peak}</span>
                </div>
                <Progress value={metric.current / metric.peak * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance Reports</span>
          </CardTitle>
          <CardDescription>Comprehensive performance analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {performanceReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{report.name}</h3>
                  <Badge className={getReportStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl font-bold">{report.score}</div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{report.details}</p>
                <div>
                  <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Performance Alerts</span>
          </CardTitle>
          <CardDescription>Active performance issues and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                alert.resolved ? 'bg-gray-50' : 'bg-white'
              }`}>
                <div className={`p-2 rounded-full ${getAlertColor(alert.type)}`}>
                  {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                  {alert.type === 'info' && <CheckCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{alert.title}</h3>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    {alert.resolved && (
                      <Badge variant="outline" className="text-xs">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slow Queries Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Slow Queries Analysis</span>
          </CardTitle>
          <CardDescription>Database queries that need optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Avg Time (ms)</TableHead>
                <TableHead>Execution Count</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSlowQueries.map((query, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs max-w-xs truncate">
                    {query.query}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{query.avgTime}ms</span>
                  </TableCell>
                  <TableCell>{query.count.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={
                      query.impact === 'high' ? 'bg-red-100 text-red-800' :
                      query.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {query.impact}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Response Time Trend</span>
            </CardTitle>
            <CardDescription>API response time over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Response time chart would be rendered here</p>
                <p className="text-sm text-gray-400">Using Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Error Rate Trend</span>
            </CardTitle>
            <CardDescription>Error rate percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Error rate chart would be rendered here</p>
                <p className="text-sm text-gray-400">Using Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Performance Recommendations</span>
          </CardTitle>
          <CardDescription>Actionable insights to improve system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">High Priority</span>
              </div>
              <p className="text-sm text-gray-600">Optimize database queries to reduce response time</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Server className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Medium Priority</span>
              </div>
              <p className="text-sm text-gray-600">Implement caching for frequently accessed data</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="font-medium">Low Priority</span>
              </div>
              <p className="text-sm text-gray-600">Add database indexes for better query performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 