// app/dashboard/services/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Service } from '@/types/service';
import { serviceService } from '@/services/service-Service';
import ServiceForm from '@/components/admin/services/ServiceForm';

export default function EditServicePage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [params.id]);

  const loadService = async () => {
    try {
      if (params.id) {
        const serviceData = await serviceService.getServiceById(params.id as string);
        setService(serviceData);
      }
    } catch (error) {
      console.error('Error loading service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading service...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <ServiceForm service={service} />
    </div>
  );
}