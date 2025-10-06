'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Network, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  RefreshCw,
  BarChart3,
  Download,
  Clock,
  Info,
  Zap,
  Shield,
  Database,
  Globe,
  Loader2
} from 'lucide-react'


const performanceData = [
  { 
    label: 'Response Time', 
    value: '120ms', 
    status: 'good',
    details: {
      avg: '120ms',
      min: '45ms',
      max: '890ms',
      p95: '245ms',
      p99: '567ms'
    }
  },
  { 
    label: 'Uptime', 
    value: '99.9%', 
    status: 'excellent',
    details: {
      current: '99.9%',
      lastDowntime: '2024-02-15 03:30-04:15',
      totalDowntime: '2h 15m',
      longestUptime: '45 days'
    }
  },
  { 
    label: 'Error Rate', 
    value: '0.1%', 
    status: 'good',
    details: {
      rate: '0.1%',
      totalErrors: '23',
      errorTypes: ['404', '500', 'Timeout'],
      mostCommon: '404 Not Found'
    }
  },
  { 
    label: 'Active Connections', 
    value: '1,234', 
    status: 'normal',
    details: {
      current: '1,234',
      max: '2,000',
      avg: '1,100',
      peak: '1,567',
      byType: {
        'HTTP': '456',
        'HTTPS': '678',
        'WebSocket': '100'
      }
    }
  }
]

const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'High Memory Usage',
    description: 'Memory usage is at 78%, consider optimization',
    time: '5 minutes ago',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    details: {
      currentUsage: '78%',
      threshold: '80%',
      recommendation: 'Consider restarting non-essential services',
      affectedServices: ['nginx', 'mysql'],
      actionTaken: 'None'
    }
  },
  {
    id: 2,
    type: 'success',
    title: 'Backup Completed',
    description: 'Daily backup completed successfully',
    time: '2 hours ago',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    details: {
      backupType: 'Full System',
      size: '2.5 GB',
      duration: '45 minutes',
      location: 'AWS S3',
      verification: 'Passed'
    }
  },
  {
    id: 3,
    type: 'info',
    title: 'New User Registration',
    description: 'New user john.doe@example.com registered',
    time: '15 minutes ago',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    details: {
      user: 'john.doe@example.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'New York, NY',
      verificationStatus: 'Pending'
    }
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
    case 'good':
      return 'text-green-600'
    case 'normal':
      return 'text-blue-600'
    case 'warning':
      return 'text-yellow-600'
    case 'error':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const getProgressColor = (value: number) => {
  if (value >= 80) return 'bg-red-500'
  if (value >= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function SystemStats() {
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleMetricClick = (metric: any) => {
    setSelectedMetric(metric)
  }

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert)
  }

  const handleRefreshMetrics = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const renderMetricDetails = (metric: any) => {
    const Icon = metric.icon
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${metric.status === 'warning' ? 'bg-orange-50' : 'bg-blue-50'}`}>
              <Icon className={`h-6 w-6 ${metric.color}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{metric.title}</h3>
              <p className="text-sm text-gray-500">Current: {metric.value}{metric.unit}</p>
            </div>
          </div>
          <Badge 
            variant={metric.status === 'warning' ? 'destructive' : 'secondary'}
            className="text-sm"
          >
            {metric.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Usage</span>
            <span>{metric.value}%</span>
          </div>
          <Progress 
            value={metric.value} 
            className="h-3"
            style={{
              '--progress-color': getProgressColor(metric.value)
            } as React.CSSProperties}
          />
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
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
    )
  }

  const renderAlertDetails = (alert: any) => {
    const Icon = alert.icon
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${alert.bgColor}`}>
              <Icon className={`h-6 w-6 ${alert.color}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{alert.title}</h3>
              <p className="text-sm text-gray-500">{alert.description}</p>
            </div>
          </div>
          <Badge 
            variant={alert.type === 'warning' ? 'destructive' : alert.type === 'success' ? 'default' : 'secondary'}
            className="text-sm"
          >
            {alert.type}
          </Badge>
        </div>

        {/* Time */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{alert.time}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(alert.details).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          {alert.type === 'warning' && (
            <>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Take Action
              </Button>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-2" />
            View Logs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.value}
                    </span>
                    {item.status === 'excellent' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {item.status === 'good' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                    {item.status === 'normal' && <Activity className="h-4 w-4 text-gray-600" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>System Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => {
                const Icon = alert.icon
                return (
                  <Dialog key={alert.id} open={selectedAlert?.id === alert.id} onOpenChange={() => setSelectedAlert(null)}>
                    <DialogTrigger asChild>
                      <div className={`flex items-center justify-between p-3 ${alert.bgColor} rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}>
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-4 w-4 ${alert.color}`} />
                          <span className="text-sm font-medium text-gray-800">{alert.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={alert.type === 'warning' ? 'destructive' : alert.type === 'success' ? 'default' : 'secondary'} className="text-xs">
                            {alert.type}
                          </Badge>
                          <Eye className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Alert Details</DialogTitle>
                        <DialogDescription>
                          Detailed information about this system alert
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4">
                        {selectedAlert && renderAlertDetails(selectedAlert)}
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedAlert(null)}>
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
    </div>
  )
} 