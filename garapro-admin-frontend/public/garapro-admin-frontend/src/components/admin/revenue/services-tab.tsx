// components/revenue/services-tab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface ServicesTabProps {
  revenueData: any
  formatCurrency: (amount: number) => string
  CustomTooltip: any
  COLORS: string[]
}

export function ServicesTab({ revenueData, formatCurrency, CustomTooltip, COLORS }: ServicesTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
            <CardDescription>Distribution of revenue across services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={revenueData.topServices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({serviceName, percentageOfTotal}) => `${serviceName} (${percentageOfTotal}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueData.topServices.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Service</CardTitle>
            <CardDescription>Number of orders for each service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData.topServices} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="serviceName" type="category" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orderCount" fill="#00C49F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Performance Details</CardTitle>
          <CardDescription>Detailed breakdown of top performing services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.topServices.map((service: any, index: number) => (
              <div key={service.serviceName} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{service.serviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.orderCount} orders • Avg: {formatCurrency(service.revenue / service.orderCount)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(service.revenue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {service.percentageOfTotal.toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}