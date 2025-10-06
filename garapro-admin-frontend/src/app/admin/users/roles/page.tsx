import { UserRolesManagement } from '@/components/admin/roles/UserRolesManagement'

export default function UserRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Roles & Permissions</h1>
          <p className="text-gray-600">Manage user roles and assign permissions</p>
        </div>
      </div>

      <UserRolesManagement />
    </div>
  )
} 