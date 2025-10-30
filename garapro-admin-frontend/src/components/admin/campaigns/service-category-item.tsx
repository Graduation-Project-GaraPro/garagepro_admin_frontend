// components/service-category-item.tsx
'use client'

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ServiceCategory, Service } from '@/services/campaign-service';

interface ServiceCategoryItemProps {
  category: ServiceCategory;
  level?: number;
  selectedServices: string[];
  onServiceToggle: (serviceId: string, checked: boolean) => void;
}

export function ServiceCategoryItem({ 
  category, 
  level = 0,
  selectedServices,
  onServiceToggle
}: ServiceCategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const paddingLeft = level * 16;

  const activeServices = category.services?.filter(service => service.isActive) || [];
  const hasChildCategories = category.childCategories && category.childCategories.length > 0;
  const hasActiveServices = activeServices.length > 0;

  // Count selected services in this category
  const selectedServicesInCategory = activeServices.filter(service => 
    selectedServices.includes(service.serviceId)
  ).length;

  if (!hasActiveServices && !hasChildCategories) {
    return null;
  }

  const handleServiceClick = (serviceId: string) => {
    const isCurrentlySelected = selectedServices.includes(serviceId);
    onServiceToggle(serviceId, !isCurrentlySelected);
  };

  // Format tiền Việt Nam
  const formatVietnameseCurrency = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="border rounded-lg mb-3" style={{ marginLeft: paddingLeft }}>
      {/* Category Header */}
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className={`transform transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <h3 className="font-medium text-gray-900">
            {category.categoryName}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {selectedServicesInCategory}/{activeServices.length} selected
          </span>
        </div>
      </div>

      {/* Services List */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {hasActiveServices && activeServices.map(service => (
            <ServiceItem
              key={service.serviceId}
              service={service}
              isSelected={selectedServices.includes(service.serviceId)}
              onClick={() => handleServiceClick(service.serviceId)}
              formatCurrency={formatVietnameseCurrency}
            />
          ))}
          
          {/* Child Categories */}
          {hasChildCategories && category.childCategories!.map(childCategory => (
            <ServiceCategoryItem 
              key={childCategory.serviceCategoryId}
              category={childCategory} 
              level={0}
              selectedServices={selectedServices}
              onServiceToggle={onServiceToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Service Item Component
interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onClick: () => void;
  formatCurrency: (price: number) => string;
}

function ServiceItem({ service, isSelected, onClick, formatCurrency }: ServiceItemProps) {
  return (
    <div 
      className={`flex items-start space-x-3 p-3 rounded border cursor-pointer transition-all ${
        isSelected 
          ? 'border-gray-400 bg-gray-100 hover:bg-gray-200' 
          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className={`mt-1 ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}>
        {isSelected ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
              {service.serviceName}
            </p>
            {service.description && (
              <p className="text-xs text-gray-500 mt-1">
                {service.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
              {formatCurrency(service.price)}₫
            </p>
            <p className="text-xs text-gray-400">
              {service.estimatedDuration} phút
            </p>
          </div>
        </div>
        {service.isAdvanced && (
          <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
            Nâng cao
          </span>
        )}
      </div>
    </div>
  );
}