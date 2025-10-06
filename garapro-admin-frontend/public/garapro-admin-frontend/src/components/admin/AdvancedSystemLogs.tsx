'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  Trash2,
  Settings,
  Database,
  Server,
  Shield,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  MapPin,
  User,
  Globe,
  Zap,
  Target,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Archive,
  AlertCircle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Copy,
  ExternalLink
} from 'lucide-react'

interface LogEntry {
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

interface LogStats {
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

interface LogFilter {
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

const mockLogEntries: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-03-20 16:45:23',
    level: 'error',
    message: 'Database connection failed: Connection timeout',
    source: 'Database',
    user: 'system',
    ip: '192.168.1.100',
    details: 'Connection attempt to MySQL database failed after 30 seconds. Retry attempts: 3. Last successful connection: 2024-03-20 16:30:15',
    stackTrace: 'Error: Connection timeout\n    at Database.connect (/app/database.js:45:12)\n    at async Server.start (/app/server.js:23:8)',
    sessionId: 'sess_123456789',
    requestId: 'req_987654321',
    duration: 30000,
    statusCode: 500,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    endpoint: '/api/users',
    method: 'GET',
    responseSize: 0,
    tags: ['database', 'connection', 'timeout'],
    environment: 'production',
    region: 'us-east-1',
    service: 'user-service'
  },
  {
    id: '2',
    timestamp: '2024-03-20 16:44:15',
    level: 'warning',
    message: 'High memory usage detected',
    source: 'System Monitor',
    user: 'admin',
    ip: '192.168.1.101',
    details: 'Memory usage reached 85% of available capacity. Current usage: 8.5GB/10GB. Threshold: 80%',
    sessionId: 'sess_123456790',
    requestId: 'req_987654322',
    duration: 150,
    statusCode: 200,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    endpoint: '/admin/dashboard',
    method: 'GET',
    responseSize: 2048,
    tags: ['memory', 'monitoring', 'performance'],
    environment: 'production',
    region: 'us-east-1',
    service: 'admin-service'
  },
  {
    id: '3',
    timestamp: '2024-03-20 16:43:42',
    level: 'info',
    message: 'User login successful',
    source: 'Authentication',
    user: 'john.doe@example.com',
    ip: '192.168.1.102',
    details: 'User john.doe@example.com logged in successfully from IP 192.168.1.102. Session created with ID: sess_123456791',
    sessionId: 'sess_123456791',
    requestId: 'req_987654323',
    duration: 250,
    statusCode: 200,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    endpoint: '/api/auth/login',
    method: 'POST',
    responseSize: 512,
    tags: ['authentication', 'login', 'success'],
    environment: 'production',
    region: 'us-east-1',
    service: 'auth-service'
  },
  {
    id: '4',
    timestamp: '2024-03-20 16:42:18',
    level: 'debug',
    message: 'API request processed',
    source: 'API Gateway',
    user: 'system',
    ip: '192.168.1.103',
    details: 'GET /api/users processed in 120ms. Response size: 2.1KB. Cache hit: false',
    sessionId: 'sess_123456792',
    requestId: 'req_987654324',
    duration: 120,
    statusCode: 200,
    userAgent: 'Mozilla/5.0 (Linux x86_64) AppleWebKit/537.36',
    endpoint: '/api/users',
    method: 'GET',
    responseSize: 2150,
    tags: ['api', 'gateway', 'performance'],
    environment: 'production',
    region: 'us-east-1',
    service: 'api-gateway'
  },
  {
    id: '5',
    timestamp: '2024-03-20 16:41:55',
    level: 'error',
    message: 'File upload failed',
    source: 'File Upload',
    user: 'jane.smith@example.com',
    ip: '192.168.1.104',
    details: 'File upload exceeded maximum size limit of 10MB. File size: 15.2MB. File type: image/jpeg',
    sessionId: 'sess_123456793',
    requestId: 'req_987654325',
    duration: 5000,
    statusCode: 413,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    endpoint: '/api/upload',
    method: 'POST',
    responseSize: 128,
    tags: ['file-upload', 'validation', 'size-limit'],
    environment: 'production',
    region: 'us-east-1',
    service: 'file-service'
  },
  {
    id: '6',
    timestamp: '2024-03-20 16:40:30',
    level: 'info',
    message: 'Garage account created',
    source: 'Garage Management',
    user: 'admin',
    ip: '192.168.1.105',
    details: 'New garage "AutoFix Pro" registered successfully. Garage ID: GAR_12345. Owner: John Smith',
    sessionId: 'sess_123456794',
    requestId: 'req_987654326',
    duration: 800,
    statusCode: 201,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    endpoint: '/api/garages',
    method: 'POST',
    responseSize: 1024,
    tags: ['garage', 'registration', 'success'],
    environment: 'production',
    region: 'us-east-1',
    service: 'garage-service'
  },
  {
    id: '7',
    timestamp: '2024-03-20 16:39:15',
    level: 'critical',
    message: 'Security breach attempt detected',
    source: 'Security Monitor',
    user: 'unknown',
    ip: '192.168.1.106',
    details: 'Multiple failed login attempts detected from IP 192.168.1.106. Account locked for 30 minutes.',
    sessionId: 'sess_123456795',
    requestId: 'req_987654327',
    duration: 100,
    statusCode: 429,
    userAgent: 'Mozilla/5.0 (Unknown) AppleWebKit/537.36',
    endpoint: '/api/auth/login',
    method: 'POST',
    responseSize: 256,
    tags: ['security', 'breach', 'lockout'],
    environment: 'production',
    region: 'us-east-1',
    service: 'security-service'
  },
  {
    id: '8',
    timestamp: '2024-03-20 16:38:42',
    level: 'warning',
    message: 'Slow database query detected',
    source: 'Database Monitor',
    user: 'system',
    ip: '192.168.1.107',
    details: 'Query execution time exceeded threshold. Query: SELECT * FROM users WHERE status = ?. Duration: 2.5s. Threshold: 1s',
    sessionId: 'sess_123456796',
    requestId: 'req_987654328',
    duration: 2500,
    statusCode: 200,
    userAgent: 'Mozilla/5.0 (Linux x86_64) AppleWebKit/537.36',
    endpoint: '/api/users',
    method: 'GET',
    responseSize: 4096,
    tags: ['database', 'performance', 'slow-query'],
    environment: 'production',
    region: 'us-east-1',
    service: 'user-service'
  }
]

const logStats: LogStats = {
  total: 1247,
  errors: 45,
  warnings: 123,
  info: 856,
  debug: 223,
  critical: 2,
  today: 156,
  thisWeek: 892,
  thisMonth: 3247
}

const logSources = [
  'Database', 'System Monitor', 'Authentication', 'API Gateway', 
  'File Upload', 'Garage Management', 'Security Monitor', 'Database Monitor'
]

const logServices = [
  'user-service', 'auth-service', 'api-gateway', 'file-service', 
  'garage-service', 'security-service', 'admin-service'
]

const environments = ['production', 'staging', 'development']
const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']

export function AdvancedSystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogEntries)
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogEntries)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState<LogFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate new log entries
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          level: ['info', 'debug', 'warning'][Math.floor(Math.random() * 3)] as any,
          message: 'Live log entry generated',
          source: logSources[Math.floor(Math.random() * logSources.length)],
          user: 'system',
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          details: 'Automatically generated live log entry for monitoring',
          sessionId: `sess_${Date.now()}`,
          requestId: `req_${Date.now()}`,
          duration: Math.floor(Math.random() * 1000),
          statusCode: 200,
          userAgent: 'System Monitor',
          endpoint: '/api/monitor',
          method: 'GET',
          responseSize: Math.floor(Math.random() * 1000),
          tags: ['live', 'monitoring'],
          environment: 'production',
          region: 'us-east-1',
          service: 'monitor-service'
        }
        setLogs(prev => [newLog, ...prev.slice(0, 99)])
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isLive])

  useEffect(() => {
    let filtered = logs

    // Filter by level
    if (selectedLevels.length > 0 && !selectedLevels.includes('all')) {
      filtered = filtered.filter(log => selectedLevels.includes(log.level))
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(log => log.level === activeTab)
    }

    setFilteredLogs(filtered)
  }, [logs, selectedLevels, searchTerm, activeTab])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      case 'debug':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-800" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
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
      case 'critical':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearLogs = () => {
    setLogs([])
    setFilteredLogs([])
  }

  const handleRefreshLogs = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600 mt-1">Comprehensive system monitoring and log management</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">{isLive ? 'Live' : 'Static'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isLive ? 'Pause' : 'Live'}
          </Button>
          <Button variant="outline" onClick={handleRefreshLogs} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total.toLocaleString()}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logStats.errors}</div>
            <p className="text-xs text-gray-500">Today: {logStats.today}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{logStats.warnings}</div>
            <p className="text-xs text-gray-500">This week: {logStats.thisWeek}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{logStats.critical}</div>
            <p className="text-xs text-gray-500">This month: {logStats.thisMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Level</label>
              <Select value={selectedLevels[0] || 'all'} onValueChange={(value) => setSelectedLevels(value === 'all' ? [] : [value])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Source</label>
              <Select value={filters.source || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value === 'all' ? undefined : value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {logSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Environment</label>
              <Select value={filters.environment || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, environment: value === 'all' ? undefined : value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  {environments.map(env => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System Logs</span>
              </CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {logs.length} logs
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleClearLogs}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                <Eye className="h-4 w-4 mr-2" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP</TableHead>
                  {showDetails && <TableHead>Details</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getLevelIcon(log.level)}
                        <Badge className={getLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.source}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.user}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip}
                    </TableCell>
                    {showDetails && (
                      <TableCell className="max-w-xs">
                        <div className="text-xs text-gray-600 truncate">
                          {log.details}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              {getLevelIcon(log.level)}
                              <span>Log Details</span>
                              <Badge className={getLevelColor(log.level)}>
                                {log.level}
                              </Badge>
                            </DialogTitle>
                            <DialogDescription>
                              Detailed information about this log entry
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Timestamp</label>
                                  <p className="text-sm font-mono">{log.timestamp}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Level</label>
                                  <Badge className={getLevelColor(log.level)}>
                                    {log.level}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Source</label>
                                  <p className="text-sm">{log.source}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">User</label>
                                  <p className="text-sm">{log.user}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">IP Address</label>
                                  <p className="text-sm font-mono">{log.ip}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Environment</label>
                                  <Badge variant="outline">{log.environment}</Badge>
                                </div>
                              </div>
                            </div>

                            {/* Message and Details */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Message & Details</h3>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Message</label>
                                  <p className="text-sm bg-gray-50 p-3 rounded">{log.message}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Details</label>
                                  <p className="text-sm bg-gray-50 p-3 rounded">{log.details}</p>
                                </div>
                              </div>
                            </div>

                            {/* Request Information */}
                            {log.endpoint && (
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Request Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Endpoint</label>
                                    <p className="text-sm font-mono">{log.method} {log.endpoint}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Status Code</label>
                                    <p className="text-sm">{log.statusCode}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Duration</label>
                                    <p className="text-sm">{log.duration}ms</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Response Size</label>
                                    <p className="text-sm">{log.responseSize} bytes</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Technical Details */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Technical Details</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Session ID</label>
                                  <p className="text-sm font-mono">{log.sessionId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Request ID</label>
                                  <p className="text-sm font-mono">{log.requestId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Service</label>
                                  <p className="text-sm">{log.service}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Region</label>
                                  <p className="text-sm">{log.region}</p>
                                </div>
                              </div>
                            </div>

                            {/* Tags */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Tags</h3>
                              <div className="flex flex-wrap gap-2">
                                {log.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Stack Trace */}
                            {log.stackTrace && (
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Stack Trace</h3>
                                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-x-auto">
                                  <pre>{log.stackTrace}</pre>
                                </div>
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy JSON
                            </Button>
                            <Button variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View in External Tool
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 