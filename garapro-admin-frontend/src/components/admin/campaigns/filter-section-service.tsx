'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ServiceCategory } from '@/services/campaign-service'

interface FilterSectionProps {
  selectedParentCategory: string
  onParentCategoryChange: (categoryId: string) => void
  searchTerm: string
  onSearchTermChange: (term: string) => void
  isActiveFilter: boolean
  onActiveFilterChange: (isActive: boolean) => void
  parentCategories: ServiceCategory[]
}

export function FilterSection({ 
  selectedParentCategory,
  onParentCategoryChange,
  searchTerm,
  onSearchTermChange,
  isActiveFilter,
  onActiveFilterChange,
  parentCategories
}: FilterSectionProps) {
  return (
    <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="categoryFilter">Filter by Category</Label>
          <Select
            value={selectedParentCategory}
            onValueChange={onParentCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {parentCategories.map((category) => (
                <SelectItem key={category.serviceCategoryId} value={category.serviceCategoryId}>
                  {category.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="statusFilter">Status</Label>
          <Select
            value={isActiveFilter.toString()}
            onValueChange={(value) => onActiveFilterChange(value === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}