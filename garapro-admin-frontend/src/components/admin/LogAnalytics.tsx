'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  Server,
  Activity,
  Download,
  RefreshCw,
  Loader2,
  Globe,
  Zap,
  Target
} from 'lucide-react'

interface LogAnalytics {
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

const mockAnalytics: LogAnalytics = {
  totalLogs: 1247,
  errorRate: 3.6,
  warningRate: 9.9,
  averageResponseTime: 245,
  topErrors: [
    { message: 'Database connection failed', count: 23, percentage: 15.2 },
    { message: 'File upload failed', count: 18, percentage: 11.9 },
    { message: 'Authentication failed', count: 15, percentage: 9.9 },
    { message: 'API timeout', count: 12, percentage: 7.9 }
  ],
  topSources: [
    { source: 'Database', count: 234, percentage: 18.8 },
    { source: 'API Gateway', count: 198, percentage: 15.9 },
    { source: 'Authentication', count: 156, percentage: 12.5 },
    { source: 'File Upload', count: 134, percentage: 10.7 }
  ],
  servicePerformance: [
    { service: 'user-service', totalRequests: 234, errors: 8, avgResponseTime: 245, successRate: 96.6 },
    { service: 'auth-service', totalRequests: 198, errors: 12, avgResponseTime: 189, successRate: 93.9 },
    { service: 'api-gateway', totalRequests: 456, errors: 15, avgResponseTime: 156, successRate: 96.7 },
    { service: 'file-service', totalRequests: 123, errors: 6, avgResponseTime: 298, successRate: 95.1 }
  ]
}

export function LogAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [isLoading, setIsLoading] = useState(false)

  const handleRefreshAnalytics = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getResponseTimeColor = (time: number) => {
    if (time <= 200) return 'text-green-600'
    if (time <= 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive log analysis and performance insights</p>
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
          <Button variant="outline" onClick={handleRefreshAnalytics} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalLogs.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockAnalytics.errorRate}%</div>
            <p className="text-xs text-gray-500">Of total logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockAnalytics.warningRate}%</div>
            <p className="text-xs text-gray-500">Of total logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockAnalytics.averageResponseTime}ms</div>
            <p className="text-xs text-gray-500">Across all services</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Hourly Log Distribution</span>
            </CardTitle>
            <CardDescription>Log volume by hour over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Hourly distribution chart would be rendered here</p>
                <p className="text-sm text-gray-400">Using Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Geographic Distribution</span>
            </CardTitle>
            <CardDescription>Log volume by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">US</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">us-east-1</p>
                    <p className="text-xs text-gray-500">18 errors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">456</p>
                  <p className="text-xs text-gray-500">logs</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">EU</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">eu-west-1</p>
                    <p className="text-xs text-gray-500">8 errors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">198</p>
                  <p className="text-xs text-gray-500">logs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <XCircle className="h-5 w-5" />
            <span>Top Errors</span>
          </CardTitle>
          <CardDescription>Most frequent error messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.topErrors.map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error.message}</p>
                  <p className="text-xs text-red-600">{error.count} occurrences</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-800">{error.percentage}%</p>
                  <Progress value={error.percentage} className="w-20 h-2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Service Performance</span>
          </CardTitle>
          <CardDescription>Performance metrics by service</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Total Requests</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Avg Response Time</TableHead>
                <TableHead>Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAnalytics.servicePerformance.map((service, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{service.service}</TableCell>
                  <TableCell>{service.totalRequests.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="text-red-600 font-medium">{service.errors}</span>
                  </TableCell>
                  <TableCell>
                    <span className={getResponseTimeColor(service.avgResponseTime)}>
                      {service.avgResponseTime}ms
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getSuccessRateColor(service.successRate)}>
                      {service.successRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Recommendations</span>
          </CardTitle>
          <CardDescription>Actionable insights based on log analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">High Priority</span>
              </div>
              <p className="text-sm text-gray-600">Database connection failures are increasing. Consider implementing connection pooling.</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Medium Priority</span>
              </div>
              <p className="text-sm text-gray-600">File upload errors are common. Review file size limits and implement better error handling.</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Low Priority</span>
              </div>
              <p className="text-sm text-gray-600">Consider implementing log aggregation to improve monitoring and alerting capabilities.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 