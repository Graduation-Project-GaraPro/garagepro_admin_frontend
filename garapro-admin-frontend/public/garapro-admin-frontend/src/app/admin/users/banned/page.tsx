import { BannedUsersManagement } from '@/components/admin/BannedUsersManagement'

export default function BannedUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banned Users</h1>
          <p className="text-gray-600">Manage banned user accounts and review ban reasons</p>
        </div>
      </div>

      <BannedUsersManagement />
    </div>
  )
} 