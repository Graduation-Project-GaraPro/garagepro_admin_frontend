import { DashboardOverview } from '@/components/admin/DashboardOverview'
import { QuickActions } from '@/components/admin/QuickActions'
// import { RecentActivity } from '@/components/admin/RecentActivity'
// import { SystemStats } from '@/components/admin/SystemStats'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      

      <DashboardOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        {/* <RecentActivity /> */}
      </div>

    
    </div>
  )
} 