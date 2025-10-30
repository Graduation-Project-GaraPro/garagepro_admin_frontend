// components/service-category-list.tsx
'use client'

import { ServiceCategory } from '@/services/campaign-service';
import { ServiceCategoryItem } from './service-category-item';

interface ServiceCategoryListProps {
  categories: ServiceCategory[];
  selectedServices: string[];
  onServiceToggle: (serviceId: string, checked: boolean) => void;
}

export function ServiceCategoryList({ 
  categories, 
  selectedServices, 
  onServiceToggle 
}: ServiceCategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No service categories available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <ServiceCategoryItem
          key={category.serviceCategoryId}
          category={category}
          selectedServices={selectedServices}
          onServiceToggle={onServiceToggle}
        />
      ))}
    </div>
  );
}