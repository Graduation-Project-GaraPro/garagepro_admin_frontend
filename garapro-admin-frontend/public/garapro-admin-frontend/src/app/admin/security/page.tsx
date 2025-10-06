import { SecurityManagement } from '@/components/admin/SecurityManagement'

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Management</h1>
          <p className="text-gray-600">Manage system security policies and settings</p>
        </div>
      </div>

      <SecurityManagement />
    </div>
  )
} 