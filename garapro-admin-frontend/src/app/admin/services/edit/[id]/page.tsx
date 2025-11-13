// app/dashboard/services/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ServiceForm from '@/components/admin/services/ServiceForm';

import { serviceService,Service } from '@/services/service-Service';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        if (!id) return;
        const data = await serviceService.getServiceById(id);
        console.log(data);
        if (!alive) return;
        setService(data);
      } catch (e) {
        console.error('Error loading service:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return <div className="container mx-auto py-6">Loading service...</div>;
  }

  if (!service) {
    return <div className="container mx-auto py-6 text-destructive">Không tìm thấy service.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      {/* ép init chuẩn theo service vừa fetch */}
      <ServiceForm key={service.id} service={service} />
    </div>
  );
}