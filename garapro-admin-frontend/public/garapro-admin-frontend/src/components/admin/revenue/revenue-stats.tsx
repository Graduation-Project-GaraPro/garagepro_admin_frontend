// components/revenue/revenue-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, BarChart3, Calendar, TrendingUp, TrendingDown } from "lucide-react"

interface RevenueStatsProps {
  selectedPeriod: string
  selectedDate: string
  selectedYear: number
  selectedMonth: number
  revenueData: any
  formatCurrency: (amount: number) => string
  formatNumber: (num: number) => string
  getGrowthIcon: (growthRate: number) => JSX.Element | null
  getGrowthColor: (growthRate: number) => string
}

export function RevenueStats({
  selectedPeriod,
  selectedDate,
  selectedYear,
  selectedMonth,
  revenueData,
  formatCurrency,
  formatNumber,
  getGrowthIcon,
  getGrowthColor
}: RevenueStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {getGrowthIcon(revenueData.growthRate)}
            <span className={`ml-1 ${getGrowthColor(revenueData.growthRate)}`}>
              {revenueData.growthRate > 0 ? '+' : ''}{revenueData.growthRate.toFixed(1)}% from previous period
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(revenueData.totalOrders)}</div>
          <p className="text-xs text-muted-foreground">
            Average: {formatCurrency(revenueData.averageOrderValue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getGrowthColor(revenueData.growthRate)}`}>
            {revenueData.growthRate > 0 ? '+' : ''}{revenueData.growthRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            vs {formatCurrency(revenueData.previousPeriodRevenue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Period</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{selectedPeriod}</div>
          <p className="text-xs text-muted-foreground">
            {selectedPeriod === 'daily' && selectedDate}
            {selectedPeriod === 'monthly' && `${new Date(2024, selectedMonth - 1).toLocaleString('default', { month: 'long' })} ${selectedYear}`}
            {selectedPeriod === 'yearly' && selectedYear}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}