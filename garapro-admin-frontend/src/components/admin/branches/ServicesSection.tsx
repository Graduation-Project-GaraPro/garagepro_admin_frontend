// components/admin/branches/ServicesSection.tsx
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react'
import { CreateBranchRequest, ServiceCategory } from '@/services/branch-service'
import { Badge } from '@/components/ui/badge'

interface ServicesSectionProps {
  formData: CreateBranchRequest
  errors: Record<string, string>
  categories: ServiceCategory[]
  onServiceToggle: (serviceId: string, selected: boolean) => void
  onServiceRemove: (serviceId: string) => void
}

export const ServicesSection = ({ 
  formData, 
  errors, 
  categories, 
  onServiceToggle, 
  onServiceRemove 
}: ServicesSectionProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const selectedServiceIds = useMemo(() => 
    new Set(formData.serviceIds), 
    [formData.serviceIds]
  )

  const selectedServices = useMemo(() => {
    const allServices = categories.flatMap(category => category.services)
    return allServices.filter(service => selectedServiceIds.has(service.serviceId))
  }, [categories, selectedServiceIds])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Filter services based on search and filters
  const filteredCategories = useMemo(() => {
    return categories
      .filter(category => category.isActive)
      .map(category => ({
        ...category,
        services: category.services.filter(service => {
          // Search filter
          const matchesSearch = searchTerm === '' || 
            service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
          
          // Status filter
          const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && service.isActive) ||
            (statusFilter === 'inactive' && !service.isActive)
          
          // Price filter
          let matchesPrice = true
          if (priceFilter === 'low') {
            matchesPrice = service.price <= 500000
          } else if (priceFilter === 'medium') {
            matchesPrice = service.price > 500000 && service.price <= 2000000
          } else if (priceFilter === 'high') {
            matchesPrice = service.price > 2000000
          }
          
          return matchesSearch && matchesStatus && matchesPrice
        })
      }))
      .filter(category => category.services.length > 0)
  }, [categories, searchTerm, statusFilter, priceFilter])

  // Auto-expand categories that have matching services when searching
  useState(() => {
    if (searchTerm) {
      const matchingCategoryIds = new Set(
        filteredCategories.map(category => category.serviceCategoryId)
      )
      setExpandedCategories(matchingCategoryIds)
    } else if (!searchTerm && expandedCategories.size > 0) {
      // Collapse all when search is cleared (optional)
      // setExpandedCategories(new Set())
    }
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const getServicesInCategory = (category: ServiceCategory) => {
    return category.services.filter(service => service.isActive)
  }

  const isCategoryExpanded = (categoryId: string) => expandedCategories.has(categoryId)

  const expandAllCategories = () => {
    const allCategoryIds = new Set(categories.map(cat => cat.serviceCategoryId))
    setExpandedCategories(allCategoryIds)
  }

  const collapseAllCategories = () => {
    setExpandedCategories(new Set())
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPriceFilter('all')
    setStatusFilter('all')
  }

  // Statistics
  const totalServices = categories.flatMap(cat => cat.services).length
  const filteredServicesCount = filteredCategories.flatMap(cat => cat.services).length
  const selectedCount = selectedServices.length

  const hasActiveFilters = searchTerm || priceFilter !== 'all' || statusFilter !== 'all'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Select services by category to enable at this branch
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCount} selected
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Expand/Collapse Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={expandAllCategories}
              >
                Expand All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={collapseAllCategories}
              >
                Collapse All
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="price-filter" className="text-sm whitespace-nowrap">
                Price:
              </Label>
              <select
                id="price-filter"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Prices</option>
                <option value="low">Low (&lt; 500K)</option>
                <option value="medium">Medium (500K - 2M)</option>
                <option value="high">High (&gt; 2M)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm whitespace-nowrap">
                Status:
              </Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Stats */}
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredServicesCount} of {totalServices} services
              {searchTerm && (
                <span> matching &quot;{searchTerm}&quot;</span>
              )}
            </div>
          )}
        </div>

        {/* Services by Category */}
        <div className="space-y-4">
          <Label>Available Services by Category</Label>
          
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const servicesInCategory = getServicesInCategory(category)
              const isExpanded = isCategoryExpanded(category.serviceCategoryId)
              const selectedCount = servicesInCategory.filter(
                service => selectedServiceIds.has(service.serviceId)
              ).length

              return (
                <div key={category.serviceCategoryId} className="border rounded-lg">
                  {/* Category Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleCategory(category.serviceCategoryId)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {category.categoryName}
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {selectedCount}/{servicesInCategory.length} selected
                          </span>
                          {servicesInCategory.length !== category.services.length && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Filtered
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services List */}
                  {isExpanded && (
                    <div className="border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                        {servicesInCategory.map((service) => {
                          const isSelected = selectedServiceIds.has(service.serviceId)
                          return (
                            <label 
                              key={service.serviceId} 
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                isSelected ? 'border-blue-500 bg-blue-50' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => onServiceToggle(service.serviceId, e.target.checked)}
                                aria-describedby={`service-${service.serviceId}-desc`}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {service.serviceName}
                                  {!service.isActive && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                      Inactive
                                    </span>
                                  )}
                                  {service.isAdvanced && (
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                      Advanced
                                    </span>
                                  )}
                                </div>
                                <div id={`service-${service.serviceId}-desc`} className="text-sm text-muted-foreground">
                                  {service.description}
                                </div>
                                <div className="text-sm font-medium mt-1">
                                  {formatCurrency(service.price)} • {service.estimatedDuration}h
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Status: {service.serviceStatus}
                                </div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div>No services found</div>
              <div className="text-sm">Try adjusting your search or filters</div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Selected Services */}
        {selectedServices.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Services ({selectedServices.length})</Label>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service.serviceId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{service.serviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.description} • {formatCurrency(service.price)} • {service.estimatedDuration}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Category: {categories.find(cat => 
                        cat.services.some(s => s.serviceId === service.serviceId)
                      )?.categoryName}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onServiceRemove(service.serviceId)}
                    className="text-red-600 hover:text-red-700"
                    aria-label={`Remove ${service.serviceName} service`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {categories.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No service categories available
          </div>
        )}
        
        {errors.serviceIds && <p className="text-sm text-red-500">{errors.serviceIds}</p>}
      </CardContent>
    </Card>
  )
}