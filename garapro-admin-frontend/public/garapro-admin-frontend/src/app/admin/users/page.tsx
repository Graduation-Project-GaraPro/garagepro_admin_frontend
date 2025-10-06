import { UserManagement } from '@/components/admin/UserManagement'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all registered users and their accounts</p>
        </div>
      </div>

      <UserManagement />
    </div>
  )
} 