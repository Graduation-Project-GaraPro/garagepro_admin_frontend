// app/dashboard/security/page.tsx
import SecurityPolicies from '@/components/admin/policies/SecurityPolicies';

export default function SecurityPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure security policies for your application
        </p>
      </div>
      
      <SecurityPolicies />
    </div>
  );
}