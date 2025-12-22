import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'

// Map level number to display name
const levelMap = {
  2: 'Information',
  3: 'Warning', 
  4: 'Error',
  
} as const

// Map source number to display name  
const sourceMap = {
  0: 'System',
  1: 'Security',
  2: 'UserActivity'
} as const

interface LogFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedLevels: number[]
  onLevelsChange: (levels: number[]) => void
  selectedSources: number[]
  onSourcesChange: (sources: number[]) => void
  filters: any
  onFiltersChange: (filters: any) => void
  onClearAllFilters: () => void
}

export function LogFilters({
  searchTerm,
  onSearchChange,
  selectedLevels,
  onLevelsChange,
  selectedSources,
  onSourcesChange,
  filters,
  onFiltersChange,
  onClearAllFilters
}: LogFiltersProps) {
  const [tempLevels, setTempLevels] = useState<number[]>(selectedLevels)
  const [tempSources, setTempSources] = useState<number[]>(selectedSources)
  const [isOpen, setIsOpen] = useState(true) // 🔹 trạng thái đóng/mở filter

  // Sync temp states with props
  useEffect(() => {
    setTempLevels(selectedLevels)
  }, [selectedLevels])

  useEffect(() => {
    setTempSources(selectedSources)
  }, [selectedSources])

  const handleLevelCheckboxChange = (levelNum: number, checked: boolean) => {
    const newLevels = checked
      ? [...tempLevels, levelNum]
      : tempLevels.filter(l => l !== levelNum)
    setTempLevels(newLevels)
  }

  const handleSourceCheckboxChange = (sourceNum: number, checked: boolean) => {
    const newSources = checked
      ? [...tempSources, sourceNum]
      : tempSources.filter(s => s !== sourceNum)
    setTempSources(newSources)
  }

  const handleSelectAllLevels = () => {
    const allLevelNumbers = Object.keys(levelMap).map(Number)
    setTempLevels(allLevelNumbers)
  }

  const handleClearAllLevels = () => {
    setTempLevels([])
  }

  const handleSelectAllSources = () => {
    const allSourceNumbers = Object.keys(sourceMap).map(Number)
    setTempSources(allSourceNumbers)
  }

  const handleClearAllSources = () => {
    setTempSources([])
  }

  const handleApplyFilters = () => {
    onLevelsChange(tempLevels)
    onSourcesChange(tempSources)
  }

  const handleClearFilters = () => {
    onClearAllFilters()
  }

  const getLevelDisplayName = (level: number) => {
    return levelMap[level as keyof typeof levelMap] || `Level ${level}`
  }

  const getSourceDisplayName = (source: number) => {
    return sourceMap[source as keyof typeof sourceMap] || `Source ${source}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>

            {/* Nhỏ nhỏ: hiện tóm tắt filter khi đóng */}
            {!isOpen && (
              <span className="text-xs text-gray-500">
                {tempLevels.length > 0 || tempSources.length > 0 || searchTerm
                  ? ' (active)'
                  : ' (none)'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(o => !o)}
              aria-label={isOpen ? 'Collapse filters' : 'Expand filters'}
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search in message, details, user..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Levels Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Levels</label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllLevels}
                      className="text-xs h-6"
                    >
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllLevels}
                      className="text-xs h-6 text-red-600"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 p-3 border border-gray-200 rounded-md">
                  {Object.entries(levelMap).map(([key, value]) => {
                    const levelNum = parseInt(key)
                    const isChecked = tempLevels.includes(levelNum)
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`level-${key}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleLevelCheckboxChange(levelNum, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`level-${key}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                        >
                          {value}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sources Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Sources</label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllSources}
                      className="text-xs h-6"
                    >
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllSources}
                      className="text-xs h-6 text-red-600"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 p-3 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {Object.entries(sourceMap).map(([key, value]) => {
                    const sourceNum = parseInt(key)
                    const isChecked = tempSources.includes(sourceNum)
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${key}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleSourceCheckboxChange(sourceNum, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`source-${key}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                        >
                          {value}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Page Size & Days Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Page Size</label>
                <select
                  value={filters.pageSize || 50}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      pageSize: parseInt(e.target.value),
                      pageNumber: 1,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                  <option value="200">200 per page</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Time Range</label>
                <select
                  value={filters.days || 30}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      days: parseInt(e.target.value),
                      pageNumber: 1,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary + Apply */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-gray-600">
                {tempLevels.length > 0 || tempSources.length > 0 || searchTerm ? (
                  <>
                    Active filters:
                    {searchTerm && ` Search: "${searchTerm}"`}
                    {tempLevels.length > 0 &&
                      ` • Levels: ${tempLevels.map(getLevelDisplayName).join(', ')}`}
                    {tempSources.length > 0 &&
                      ` • Sources: ${tempSources.map(getSourceDisplayName).join(', ')}`}
                  </>
                ) : (
                  <>No active filters</>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
