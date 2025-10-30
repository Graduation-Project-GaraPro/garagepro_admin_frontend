// components/service-category-item.tsx
'use client'

import { useState } from 'react';
import { ChevronRight, Wrench, Clock, FolderTree, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  const paddingLeft = level * 20;
  
  const activeServices = category.services.filter(service => service.isActive);
  const hasChildCategories = category.childCategories && category.childCategories.length > 0;
  const hasActiveServices = activeServices.length > 0;
  const shouldRender = hasActiveServices || hasChildCategories;

  // Early return for categories with no content
  if (!shouldRender) {
    return null;
  }

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleServiceCheck = (serviceId: string, checked: boolean) => {
    onServiceToggle(serviceId, checked);
  };

  return (
    <div 
      className="border-l-2 border-gray-100 pl-4"
      style={{ marginLeft: paddingLeft }}
    >
      {/* Category Header with Expand/Collapse */}
      <div 
        className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900">
              {category.categoryName}
            </h4>
            {category.description && (
              <p className="text-xs text-gray-500 mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {hasActiveServices && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {activeServices.length} service{activeServices.length !== 1 ? 's' : ''}
            </span>
          )}
          {hasChildCategories && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {category.childCategories!.length} categor{category.childCategories!.length !== 1 ? 'ies' : 'y'}
            </span>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Services Section */}
          {hasActiveServices ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Services
                </span>
              </div>
              <div className="grid gap-2">
                {activeServices.map(service => (
                  <ServiceItem
                    key={service.serviceId}
                    service={service}
                    isSelected={selectedServices.includes(service.serviceId)}
                    onToggle={handleServiceCheck}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <ClipboardList className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No services available in this category</p>
            </div>
          )}

          {/* Child Categories Section */}
          {hasChildCategories && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FolderTree className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Subcategories
                </span>
              </div>
              <div className="space-y-3">
                {category.childCategories!.map(childCategory => (
                  <ServiceCategoryItem 
                    key={childCategory.serviceCategoryId}
                    category={childCategory} 
                    level={level + 1}
                    selectedServices={selectedServices}
                    onServiceToggle={onServiceToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Separate component for individual service items
interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onToggle: (serviceId: string, checked: boolean) => void;
}

function ServiceItem({ service, isSelected, onToggle }: ServiceItemProps) {
  const handleCheckboxChange = (checked: boolean) => {
    onToggle(service.serviceId, checked);
  };

  return (
    <label 
      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleCheckboxChange}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 truncate">
            {service.serviceName}
          </span>
          <span className="text-sm font-semibold text-green-600 ml-2 whitespace-nowrap">
            ${service.price.toLocaleString()}
          </span>
        </div>
        {service.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {service.description}
          </p>
        )}
        <div className="flex items-center space-x-3 mt-2">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{service.estimatedDuration} min</span>
          </div>
          {service.isAdvanced && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              Advanced
            </Badge>
          )}
        </div>
      </div>
    </label>
  );
}