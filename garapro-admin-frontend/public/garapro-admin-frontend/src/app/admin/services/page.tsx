// app/dashboard/services/page.tsx
'use client';

import ServiceList from '@/components/admin/services/ServiceList';

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-6">
      <ServiceList />
    </div>
  );
}