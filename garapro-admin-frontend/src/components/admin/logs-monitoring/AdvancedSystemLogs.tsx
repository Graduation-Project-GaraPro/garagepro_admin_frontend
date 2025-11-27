'use client'

import { useState, useEffect,useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  RefreshCw,
  Play,
  Pause,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { LogService,LogEntry, LogStats,LogSearchRequest } from '@/services/LogService'
// import { LogEntry, LogStats } from '@/services/types/log'
import { HubConnection } from '@microsoft/signalr'
import { LogStatistics } from '@/components/admin/logs-monitoring/LogStatistics'
import { LogFilters } from '@/components/admin/logs-monitoring/LogFilters'
import { LogsTable } from '@/components/admin/logs-monitoring/LogsTable'

export function AdvancedSystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef<HubConnection | null>(null)

  const [stats, setStats] = useState<LogStats>({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    debug: 0,
    critical: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  })
  const [filters, setFilters] = useState<LogSearchRequest>({
    pageNumber: 1,
    pageSize: 50,
    searchTerm: '',
    days: 30
  })
  const [selectedLevels, setSelectedLevels] = useState<number[]>([])
  const [selectedSources, setSelectedSources] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const [statsTimeRange, setStatsTimeRange] = useState(7)

  const [showDetails, setShowDetails] = useState(false)

  const [totalPages, setTotalPages] = useState(1)

  // Load initial data
  useEffect(() => {
    loadLogs()
    loadStats()
  }, [])

  useEffect(() => {
    if (isLive) {
      connectToSignalR()
    } else {
      disconnectSignalR()
    }

    return () => {
      disconnectSignalR()
    }
  }, [isLive])


  
  // Load logs khi filters thay đổi
  useEffect(() => {
    loadLogs()
  }, [filters])

 const connectToSignalR = async () => {
    try {
      const connection = await LogService.connectToLogHub(
        handleNewLog,
        handleUpdateStats,
        handleConnectionChange
      )
      connectionRef.current = connection
    } catch (error) {
      console.error('Failed to connect to SignalR:', error)
    }
  }

  const disconnectSignalR = async () => {
    if (connectionRef.current) {
      await LogService.disconnectLogHub(connectionRef.current)
      connectionRef.current = null
      setIsConnected(false)
    }
  }

  const handleNewLog = (newLog: LogEntry) => {
    setLogs(prevLogs => {
      // Thêm log mới vào đầu danh sách, giới hạn số lượng
      const updatedLogs = [newLog, ...prevLogs.slice(0, 999)]
      return updatedLogs
    })
  }
  const handleUpdateStats = () => {
    // Reload thống kê khi có log mới
    console.log("ec");
    loadStats()
  }

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected)
  }
  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const result = await LogService.searchLogs(filters)
      setLogs(result.logs)
      setTotalPages(result.totalPages || Math.ceil(result.totalCount / filters.pageSize))
    } catch (error) {
      console.error('Failed to load logs:', error)
      setLogs([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setFilters(prev => ({ ...prev, pageNumber }))
    }
  }
  const loadStats = async (days: number = statsTimeRange) => {
    try {
      const statsData = await LogService.getQuickStats(days)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats({
        total: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        debug: 0,
        critical: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      })
    }
  }
  const handleStatsTimeRangeChange = (days: number) => {
    setStatsTimeRange(days)
    loadStats(days)
  }

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setFilters(prev => ({ 
      ...prev, 
      searchTerm: newSearchTerm,
      pageNumber: 1 
    }))
  }

  const handleLevelsChange = (levels: number[]) => {
    setSelectedLevels(levels)
    setFilters(prev => ({ 
      ...prev, 
      levels: levels.length > 0 ? levels : undefined,
      pageNumber: 1 
    }))
  }

  const handleSourcesChange = (sources: number[]) => {
    setSelectedSources(sources)
    setFilters(prev => ({ 
      ...prev, 
      sources: sources.length > 0 ? sources : undefined,
      pageNumber: 1 
    }))
  }

  const handleExportLogs = async () => {
    try {
      const blob = await LogService.exportLogs(filters)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const handleRefreshLogs = async () => {
    await loadLogs()
    await loadStats()
  }

  const renderPageNumbers = () => {
    const pages = []
    const currentPage = filters.pageNumber
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-1 text-sm text-gray-500">
            ...
          </span>
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm border rounded ${
            currentPage === i
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >

          {i}
        </button>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-1 text-sm text-gray-500">
            ...
          </span>
        )
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          {totalPages}
        </button>
      )
    }

    return pages
  }

  // Helper functions để hiển thị tên
  const getLevelDisplayName = (level: number) => {
    const levelMap: Record<number, string> = {
      0: 'Information',
      1: 'Warning',
      2: 'Error',     
      4: 'Critical'
    }
    return levelMap[level] || `Level ${level}`
  }

  const getSourceDisplayName = (source: number) => {
    const sourceMap: Record<number, string> = {
      0: 'System',
      1: 'Security',
      2: 'UserActivity'
      
    }
    return sourceMap[source] || `Source ${source}`
  }

  const handleClearAllFilters = () => {
    setSelectedLevels([])
    setSelectedSources([])
    setSearchTerm('')
    setFilters({
      pageNumber: 1,
      pageSize: 50,
      searchTerm: '',
      days: 30
    })
  }
  // Fix lỗi duplicate key bằng cách thêm index
  const getLogKey = (log: LogEntry, index: number) => {
    return `${log.id}-${log.timestamp}-${index}`
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
          {/* <Button onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Statistics */}
      <LogStatistics stats={stats}  onTimeRangeChange={handleStatsTimeRangeChange} />

      {/* Filters */}
      <LogFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedLevels={selectedLevels}
        onLevelsChange={handleLevelsChange}
        selectedSources={selectedSources}
        onSourcesChange={handleSourcesChange}
        filters={filters}
        onFiltersChange={setFilters}
        onClearAllFilters={handleClearAllFilters} // Thêm prop này
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {logs.length} of {filters.pageSize * (filters.pageNumber - 1) + logs.length} logs
          {searchTerm && ` for "${searchTerm}"`}
          {selectedLevels.length > 0 && ` in ${selectedLevels.map(getLevelDisplayName).join(', ')}`}
          {selectedSources.length > 0 && ` from ${selectedSources.map(getSourceDisplayName).join(', ')}`}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            disabled={filters.pageNumber <= 1}
            onClick={() => handlePageChange(filters.pageNumber - 1)}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {renderPageNumbers()}
          </div>

          {/* Page Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Page</span>
            <select
              value={filters.pageNumber}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
            <span>of {totalPages}</span>
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            disabled={filters.pageNumber >= totalPages}
            onClick={() => handlePageChange(filters.pageNumber + 1)}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading logs...</span>
        </div>
      ) : (
        <LogsTable
          logs={logs}
          showDetails={showDetails}
          onClearLogs={handleClearLogs}
          onToggleDetails={() => setShowDetails(!showDetails)}
          getLogKey={getLogKey}
        />
      )}
    </div>
  )
}