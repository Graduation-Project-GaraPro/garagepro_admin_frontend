// app/dashboard/services/new/page.tsx
'use client';

import ServiceForm from '@/components/admin/services/ServiceForm';

export default function NewServicePage() {
  return (
    <div className="container mx-auto py-6">
      <ServiceForm />
    </div>
  );
}