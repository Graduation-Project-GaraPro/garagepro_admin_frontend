'use client'

import { CheckCircle2 } from 'lucide-react'
import { ServiceCategory, Service } from '@/services/campaign-service'

interface SelectedServicesSummaryProps {
  selectedServices: string[]
  serviceCategories: ServiceCategory[]
  onServiceToggle: (serviceId: string, checked: boolean) => void
  onClearAll: () => void
  formatCurrency: (price: number) => string
}

export function SelectedServicesSummary({ 
  selectedServices,
  serviceCategories,
  onServiceToggle,
  onClearAll,
  formatCurrency
}: SelectedServicesSummaryProps) {
  const selectedCount = selectedServices.length
  
  if (selectedCount === 0) {
    return null
  }

  // Lấy thông tin chi tiết của các service đã chọn
  const getSelectedServicesDetails = () => {
    const allServices: Service[] = []
    
    // Hàm đệ quy để lấy tất cả services từ categories
    const extractServices = (categories: ServiceCategory[]) => {
      categories.forEach(category => {
        if (category.services && category.services.length > 0) {
          allServices.push(...category.services)
        }
        if (category.childCategories && category.childCategories.length > 0) {
          extractServices(category.childCategories)
        }
      })
    }
    
    extractServices(serviceCategories)
    
    // Lọc ra các service đã chọn
    return allServices.filter(service => 
      selectedServices.includes(service.serviceId)
    )
  }

  const selectedServicesDetails = getSelectedServicesDetails()

  return (
    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-gray-700" />
          <span className="font-medium text-gray-900">
            {selectedCount} Services Selected
          </span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm text-gray-600 hover:text-gray-800 underline cursor-pointer"
        >
          Remove All
        </button>
      </div>
      
      {/* Danh sách services đã chọn */}
      <div className="space-y-2">
        {selectedServicesDetails.map(service => (
          <div 
            key={service.serviceId}
            className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-gray-600" />
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {service.serviceName}
                </p>
                <p className="text-xs text-gray-500">
                  {service.estimatedDuration} minutes • {service.isAdvanced ? 'Advance' : 'Standard'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 text-sm">
                {formatCurrency(service.price)}₫
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onServiceToggle(service.serviceId, false)
                }}
                className="text-xs text-gray-600 hover:text-gray-800 underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}