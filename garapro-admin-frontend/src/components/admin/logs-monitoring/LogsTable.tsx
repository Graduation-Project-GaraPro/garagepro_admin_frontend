import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Eye, 
  Trash2, 
  Copy,
  XCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { LogEntry } from '@/services/LogService'

interface LogsTableProps {
  logs: LogEntry[]
  showDetails: boolean
  onClearLogs: () => void
  onToggleDetails: () => void
  getLogKey?: (log: LogEntry, index: number) => string
}

export function LogsTable({ logs, showDetails, onClearLogs, onToggleDetails, getLogKey }: LogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'Information':
        return <Info className="h-4 w-4 text-blue-600" />
      case 'Debug':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Critical':
        return <AlertCircle className="h-4 w-4 text-red-800" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Error':
        return 'bg-red-100 text-red-800'
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'Information':
        return 'bg-blue-100 text-blue-800'
      case 'Debug':
        return 'bg-green-100 text-green-800'
      case 'Critical':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('vi-VN')
    } catch {
      return timestamp
    }
  }

  // Hàm truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return 'No details'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>System Logs</span>
              </CardTitle>
              <CardDescription>Showing {logs.length} logs</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              
              <Button variant="outline" size="sm" onClick={onToggleDetails}>
                <Eye className="h-4 w-4 mr-2" />
                {showDetails ? "Hide" : "Show"} Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Level</TableHead>
                  <TableHead className="w-40">Timestamp</TableHead>
                  <TableHead className="min-w-60">Message</TableHead>
                  <TableHead className="w-24">Source</TableHead>
                  <TableHead className="w-32">User</TableHead>
                  <TableHead className="w-32">IP</TableHead>
                  {showDetails && (
                    <TableHead className="min-w-60">Details</TableHead>
                  )}
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={getLogKey ? getLogKey(log, index) : log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getLevelIcon(log.level)}
                        <Badge className={getLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate-text" title={log.message}>
                        {truncateText(log.message, 80)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="truncate max-w-20"
                        title={log.source}
                      >
                        {truncateText(log.source, 15)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-32" title={log.userName}>
                        {truncateText(log.userName, 20)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress}
                    </TableCell>
                    {showDetails && (
                      <TableCell className="align-top max-w-lg">
                        <div
                          className="text-xs text-gray-600 details-text"
                          title={log.details || "No details"}
                        >
                          {log.details || "No details"}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                       <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[80vh] overflow-y-auto">
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

                          {selectedLog && (
                            <div className="space-y-6 break-words break-all">
                              {/* Basic Information */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">
                                  Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      Timestamp
                                    </label>
                                    <p className="text-sm font-mono">
                                      {formatTimestamp(selectedLog.timestamp)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      Level
                                    </label>
                                    <Badge
                                      className={getLevelColor(
                                        selectedLog.level
                                      )}
                                    >
                                      {selectedLog.level}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      Source
                                    </label>
                                    <p className="text-sm">
                                      {selectedLog.source}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      User
                                    </label>
                                    <p className="text-sm">
                                      {selectedLog.userName}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      User ID
                                    </label>
                                    <p className="text-sm">
                                      {selectedLog.userId || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      IP Address
                                    </label>
                                    <p className="text-sm font-mono">
                                      {selectedLog.ipAddress}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Message and Details */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">
                                  Message & Details
                                </h3>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      Message
                                    </label>
                                    <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap break-words">
                                      {selectedLog.message}
                                    </p>
                                  </div>
                                  {selectedLog.details && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Details
                                      </label>
                                      <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap break-words">
                                        {selectedLog.details}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Technical Details */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">
                                  Technical Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  {selectedLog.requestId && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Request ID
                                      </label>
                                      <p className="text-sm font-mono break-all">
                                        {selectedLog.requestId}
                                      </p>
                                    </div>
                                  )}
                                  {selectedLog.userAgent && (
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium text-gray-600">
                                        User Agent
                                      </label>
                                      <p className="text-sm bg-gray-50 p-3 rounded break-all">
                                        {selectedLog.userAgent}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
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

      {/* Thêm CSS cho text truncation */}
      <style jsx>{`
        .truncate-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .details-text {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 4; /* số dòng tối đa muốn hiển thị */
          -webkit-box-orient: vertical;
          white-space: normal; /* cho phép xuống dòng */
          word-break: break-word; /* cắt từ dài nếu cần */
        }

        @media (max-width: 768px) {
          .truncate-text {
            max-width: 150px;
          }

          .details-text {
            -webkit-line-clamp: 3;
          }
        }
      `}</style>
    </>
  );
}