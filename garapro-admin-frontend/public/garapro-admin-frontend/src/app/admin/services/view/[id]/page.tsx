// app/dashboard/services/view/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import ServiceDetail from '@/components/admin/services/ServiceDetail';

export default function ViewServicePage() {
  const params = useParams();
  const serviceId = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <ServiceDetail serviceId={serviceId} />
    </div>
  );
}