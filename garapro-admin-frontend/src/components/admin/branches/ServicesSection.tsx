// components/admin/branches/ServicesSection.tsx
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { CreateBranchRequest, ServiceCategory } from '@/services/branch-service'

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>Select services by category to enable at this branch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Services by Category */}
        <div className="space-y-4">
          <Label>Available Services by Category</Label>
          {categories.filter(category => category.isActive).map((category) => {
            const servicesInCategory = getServicesInCategory(category)
            const isExpanded = isCategoryExpanded(category.serviceCategoryId)
            const selectedCount = servicesInCategory.filter(
              service => selectedServiceIds.has(service.serviceId)
            ).length

            if (servicesInCategory.length === 0) return null

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
          })}
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