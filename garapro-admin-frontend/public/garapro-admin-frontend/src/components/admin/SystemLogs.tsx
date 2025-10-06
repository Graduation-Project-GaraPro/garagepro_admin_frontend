'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Trash2
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const logLevels = [
  { label: 'All Levels', value: 'all', color: 'bg-gray-100' },
  { label: 'Error', value: 'error', color: 'bg-red-100 text-red-800' },
  { label: 'Warning', value: 'warning', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Info', value: 'info', color: 'bg-blue-100 text-blue-800' },
  { label: 'Debug', value: 'debug', color: 'bg-green-100 text-green-800' }
]

const logEntries = [
  {
    id: 1,
    timestamp: '2024-03-20 16:45:23',
    level: 'error',
    message: 'Database connection failed: Connection timeout',
    source: 'Database',
    user: 'system',
    ip: '192.168.1.100',
    details: 'Connection attempt to MySQL database failed after 30 seconds'
  },
  {
    id: 2,
    timestamp: '2024-03-20 16:44:15',
    level: 'warning',
    message: 'High memory usage detected',
    source: 'System Monitor',
    user: 'admin',
    ip: '192.168.1.101',
    details: 'Memory usage reached 85% of available capacity'
  },
  {
    id: 3,
    timestamp: '2024-03-20 16:43:42',
    level: 'info',
    message: 'User login successful',
    source: 'Authentication',
    user: 'john.doe@example.com',
    ip: '192.168.1.102',
    details: 'User john.doe@example.com logged in successfully'
  },
  {
    id: 4,
    timestamp: '2024-03-20 16:42:18',
    level: 'debug',
    message: 'API request processed',
    source: 'API Gateway',
    user: 'system',
    ip: '192.168.1.103',
    details: 'GET /api/users processed in 120ms'
  },
  {
    id: 5,
    timestamp: '2024-03-20 16:41:55',
    level: 'error',
    message: 'File upload failed',
    source: 'File Upload',
    user: 'jane.smith@example.com',
    ip: '192.168.1.104',
    details: 'File upload exceeded maximum size limit of 10MB'
  },
  {
    id: 6,
    timestamp: '2024-03-20 16:40:30',
    level: 'info',
    message: 'Garage account created',
    source: 'Garage Management',
    user: 'admin',
    ip: '192.168.1.105',
    details: 'New garage "AutoFix Pro" registered successfully'
  }
]

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'error':
      return XCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    case 'debug':
      return CheckCircle
    default:
      return Info
  }
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    case 'debug':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

export function SystemLogs() {
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)

  const filteredLogs = logEntries.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesLevel && matchesSearch
  })

  const handleExportLogs = () => {
    console.log('Exporting logs...')
  }

  const handleClearLogs = () => {
    console.log('Clearing logs...')
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Log Filters</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearLogs}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {logLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedLevel === level.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level.value)}
                  className={selectedLevel === level.value ? '' : level.color}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Log Entries ({filteredLogs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const Icon = getLevelIcon(log.level)
              return (
                <div 
                  key={log.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon className={`h-5 w-5 mt-1 ${getLevelColor(log.level)}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{log.message}</span>
                          <Badge variant="secondary" className="text-xs">
                            {log.level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Source:</span> {log.source} | 
                          <span className="font-medium ml-2">User:</span> {log.user} | 
                          <span className="font-medium ml-2">IP:</span> {log.ip}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Log Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Timestamp</label>
                  <p className="text-sm">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Level</label>
                  <Badge className={`text-xs ${logLevels.find(l => l.value === selectedLog.level)?.color}`}>
                    {selectedLog.level.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Source</label>
                  <p className="text-sm">{selectedLog.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-sm">{selectedLog.user}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">IP Address</label>
                  <p className="text-sm">{selectedLog.ip}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedLog.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Details</label>
                <p className="text-sm bg-gray-50 p-3 rounded mt-1">{selectedLog.details}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Live log streaming active</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Auto-refresh:</span>
              <Switch
                checked={isAutoRefresh}
                onCheckedChange={setIsAutoRefresh}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 