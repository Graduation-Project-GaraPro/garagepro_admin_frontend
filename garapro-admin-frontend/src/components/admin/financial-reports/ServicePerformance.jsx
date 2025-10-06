// components/ServicePerformance.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ServicePerformance({ data }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
          <CardDescription>Revenue distribution by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topServices}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="serviceName"
                  label={({ serviceName, percentageOfTotal }) => 
                    `${serviceName}: ${percentageOfTotal}%`}
                >
                  {data.topServices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 space-y-4">
            {data.topServices.map((service, index) => (
              <div key={service.serviceName} className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{service.serviceName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(service.revenue)} • {service.orderCount} orders • {service.percentageOfTotal}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }