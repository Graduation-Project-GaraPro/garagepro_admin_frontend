import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, XCircle, AlertTriangle, AlertCircle, Calendar } from 'lucide-react'
import { useState } from 'react'

interface LogStats {
  total: number
  errors: number
  warnings: number
  info: number
  debug: number
  
  today: number
  thisWeek: number
  thisMonth: number
}

interface LogStatisticsProps {
  stats: LogStats
  onTimeRangeChange?: (days: number) => void
}

const timeRanges = [
  { value: 1, label: '24H' },
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
  { value: 90, label: '90D' },
  { value: 365, label: '1Y' }
]

export function LogStatistics({ stats, onTimeRangeChange }: LogStatisticsProps) {
  const [selectedRange, setSelectedRange] = useState(7)

  const handleTimeRangeChange = (days: number) => {
    setSelectedRange(days)
    onTimeRangeChange?.(days)
  }

  const getRangeLabel = () => {
    const range = timeRanges.find(r => r.value === selectedRange)
    return range ? range.label : '7D'
  }

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Statistics for:</span>
        </div>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedRange === range.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
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
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Last {getRangeLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <p className="text-xs text-gray-500">
              {selectedRange === 1 ? 'Today' : selectedRange === 7 ? 'This week' : `Last ${getRangeLabel()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
            <p className="text-xs text-gray-500">
              {selectedRange === 1 ? 'Today' : selectedRange === 7 ? 'This week' : `Last ${getRangeLabel()}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Information</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
            <p className="text-xs text-gray-500">Info logs</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.critical}</div>
            <p className="text-xs text-gray-500">
              {selectedRange === 1 ? 'Today' : selectedRange === 7 ? 'This week' : `Last ${getRangeLabel()}`}
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Information</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
            <p className="text-xs text-gray-500">Info logs</p>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debug</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.debug}</div>
            <p className="text-xs text-gray-500">Debug logs</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.today}</div>
            <p className="text-xs text-gray-500">Today's total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}