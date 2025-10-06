import { StatisticsDashboard } from '@/components/admin/StatisticsDashboard'

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
          <p className="text-gray-600">View detailed system metrics and performance data</p>
        </div>
      </div>

      <StatisticsDashboard />
    </div>
  )
} 