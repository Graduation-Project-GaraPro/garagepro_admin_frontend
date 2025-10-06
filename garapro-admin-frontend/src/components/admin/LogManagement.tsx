'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Settings,
  Archive,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Database,
  Server,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react'

interface LogConfig {
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

interface LogRetention {
  id: string
  policy: string
  retention: string
  size: string
  logs: number
  lastCleanup: string
  nextCleanup: string
  status: 'active' | 'scheduled' | 'completed'
}

const mockLogConfigs: LogConfig[] = [
  {
    id: '1',
    name: 'Application Logs',
    level: 'info',
    enabled: true,
    retention: 30,
    maxSize: 100,
    format: 'json',
    destination: '/var/log/app',
    lastModified: '2024-03-20 10:30:00',
    status: 'active'
  },
  {
    id: '2',
    name: 'Error Logs',
    level: 'error',
    enabled: true,
    retention: 90,
    maxSize: 50,
    format: 'json',
    destination: '/var/log/errors',
    lastModified: '2024-03-20 09:15:00',
    status: 'active'
  },
  {
    id: '3',
    name: 'Security Logs',
    level: 'warning',
    enabled: true,
    retention: 365,
    maxSize: 200,
    format: 'json',
    destination: '/var/log/security',
    lastModified: '2024-03-20 08:45:00',
    status: 'active'
  },
  {
    id: '4',
    name: 'Debug Logs',
    level: 'debug',
    enabled: false,
    retention: 7,
    maxSize: 500,
    format: 'text',
    destination: '/var/log/debug',
    lastModified: '2024-03-19 16:20:00',
    status: 'inactive'
  }
]

const mockRetentionPolicies: LogRetention[] = [
  {
    id: '1',
    policy: 'Application Logs',
    retention: '30 days',
    size: '2.1 GB',
    logs: 1247,
    lastCleanup: '2024-03-20 02:00:00',
    nextCleanup: '2024-03-21 02:00:00',
    status: 'active'
  },
  {
    id: '2',
    policy: 'Error Logs',
    retention: '90 days',
    size: '856 MB',
    logs: 456,
    lastCleanup: '2024-03-20 02:00:00',
    nextCleanup: '2024-03-21 02:00:00',
    status: 'active'
  },
  {
    id: '3',
    policy: 'Security Logs',
    retention: '365 days',
    size: '1.2 GB',
    logs: 892,
    lastCleanup: '2024-03-19 02:00:00',
    nextCleanup: '2024-03-20 02:00:00',
    status: 'active'
  }
]

export function LogManagement() {
  const [configs, setConfigs] = useState<LogConfig[]>(mockLogConfigs)
  const [retentionPolicies, setRetentionPolicies] = useState<LogRetention[]>(mockRetentionPolicies)
  const [selectedConfig, setSelectedConfig] = useState<LogConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleToggleConfig = (id: string) => {
    setConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, enabled: !config.enabled } : config
    ))
  }

  const handleDeleteConfig = (id: string) => {
    setConfigs(prev => prev.filter(config => config.id !== id))
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'debug':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Management</h1>
          <p className="text-gray-600 mt-1">Configure and manage system logging</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Configs</CardTitle>
            <Settings className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.filter(c => c.enabled).length}</div>
            <p className="text-xs text-gray-500">of {configs.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <Database className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.1 GB</div>
            <p className="text-xs text-gray-500">Across all logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Policies</CardTitle>
            <Archive className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionPolicies.length}</div>
            <p className="text-xs text-gray-500">Active policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Cleanup</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-gray-500">Next in 22h</p>
          </CardContent>
        </Card>
      </div>

      {/* Log Configurations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Log Configurations</span>
              </CardTitle>
              <CardDescription>Manage log collection and storage settings</CardDescription>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <Badge className={getLevelColor(config.level)}>
                    {config.level}
                  </Badge>
                  <Badge variant="outline">{config.format}</Badge>
                  <span className="text-sm text-gray-500">{config.destination}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Retention: {config.retention} days
                  </span>
                  <span className="text-sm text-gray-500">
                    Max: {config.maxSize} MB
                  </span>
                  <Badge className={getStatusColor(config.status)}>
                    {config.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleConfig(config.id)}
                  >
                    {config.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedConfig(config)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConfig(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Retention Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="h-5 w-5" />
            <span>Retention Policies</span>
          </CardTitle>
          <CardDescription>Manage log retention and cleanup schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Retention</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Logs</TableHead>
                <TableHead>Last Cleanup</TableHead>
                <TableHead>Next Cleanup</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retentionPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.policy}</TableCell>
                  <TableCell>{policy.retention}</TableCell>
                  <TableCell>{policy.size}</TableCell>
                  <TableCell>{policy.logs.toLocaleString()}</TableCell>
                  <TableCell>{policy.lastCleanup}</TableCell>
                  <TableCell>{policy.nextCleanup}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(policy.status)}>
                      {policy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Export/Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Logs</span>
            </CardTitle>
            <CardDescription>Export logs for analysis or backup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Log Type</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select log type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Logs</SelectItem>
                    <SelectItem value="errors">Error Logs</SelectItem>
                    <SelectItem value="security">Security Logs</SelectItem>
                    <SelectItem value="application">Application Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Format</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import Logs</span>
            </CardTitle>
            <CardDescription>Import logs from external sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Source</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">File Upload</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="api">API Endpoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">File</label>
                <Input type="file" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Format</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Dialog */}
      {selectedConfig && (
        <Dialog open={!!selectedConfig} onOpenChange={() => setSelectedConfig(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Log Configuration</DialogTitle>
              <DialogDescription>
                Modify settings for {selectedConfig.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={selectedConfig.name} />
              </div>
              <div>
                <label className="text-sm font-medium">Log Level</label>
                <Select value={selectedConfig.level}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Retention (days)</label>
                <Input type="number" value={selectedConfig.retention} />
              </div>
              <div>
                <label className="text-sm font-medium">Max Size (MB)</label>
                <Input type="number" value={selectedConfig.maxSize} />
              </div>
              <div>
                <label className="text-sm font-medium">Destination</label>
                <Input value={selectedConfig.destination} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedConfig(null)}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 