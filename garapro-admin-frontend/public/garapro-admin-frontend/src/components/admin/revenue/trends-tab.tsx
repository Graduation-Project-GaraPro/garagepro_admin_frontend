// components/revenue/trends-tab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface TrendsTabProps {
  revenueData: any
  CustomTooltip: any
}

export function TrendsTab({ revenueData, CustomTooltip }: TrendsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend Analysis</CardTitle>
          <CardDescription>Weekly revenue progression with growth indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={revenueData.branchComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branchName" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                fill="url(#colorRevenue)" 
                strokeWidth={3}
                name="Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="orderCount" 
                stroke="#82ca9d" 
                fill="url(#colorOrders)" 
                strokeWidth={2}
                name="Orders"
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}