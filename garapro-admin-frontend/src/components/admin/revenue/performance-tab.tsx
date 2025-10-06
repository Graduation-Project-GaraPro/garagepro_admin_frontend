// components/revenue/performance-tab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts"

interface PerformanceTabProps {
  revenueData: any
  formatCurrency: (amount: number) => string
  CustomTooltip: any
}

export function PerformanceTab({ revenueData, formatCurrency, CustomTooltip }: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Technician Revenue</CardTitle>
            <CardDescription>Performance comparison by technician</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData.revenueByTechnician}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technicianName" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#FFBB28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch Growth Rates</CardTitle>
            <CardDescription>Growth comparison across all branches</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData.branchComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="growthRate" 
                  stroke="#FF8042" 
                  strokeWidth={3}
                  dot={{ fill: '#FF8042', strokeWidth: 2, r: 6 }}
                  name="Growth Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Performance Summary</CardTitle>
          <CardDescription>Detailed performance metrics for all team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Technician</th>
                  <th className="text-right p-4 font-medium">Revenue</th>
                  <th className="text-right p-4 font-medium">Orders</th>
                  <th className="text-right p-4 font-medium">Avg Order</th>
                  <th className="text-right p-4 font-medium">Performance</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.revenueByTechnician.map((tech: any, index: number) => (
                  <tr key={tech.technicianId} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        {tech.technicianName}
                      </div>
                    </td>
                    <td className="text-right p-4 font-medium">{formatCurrency(tech.revenue)}</td>
                    <td className="text-right p-4">{tech.orderCount}</td>
                    <td className="text-right p-4">{formatCurrency(tech.averageOrderValue)}</td>
                    <td className="text-right p-4">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index === 0 ? "Top Performer" : `#${index + 1}`}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}