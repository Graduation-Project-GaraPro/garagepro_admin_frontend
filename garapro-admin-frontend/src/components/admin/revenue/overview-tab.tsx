// components/revenue/overview-tab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface OverviewTabProps {
  revenueData: any
  CustomTooltip: any
}

export function OverviewTab({ revenueData, CustomTooltip }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Orders Trend</CardTitle>
          <CardDescription>Daily performance comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData.branchComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branchName" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              <Bar dataKey="orderCount" fill="#82ca9d" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branch Performance</CardTitle>
          <CardDescription>Revenue comparison by branch</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData.branchComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branchName" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}