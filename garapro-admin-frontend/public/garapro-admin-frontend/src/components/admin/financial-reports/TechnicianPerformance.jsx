// components/TechnicianPerformance.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function TechnicianPerformance({ data }) {
    // Transform data for the chart
    const chartData = data.revenueByTechnician.map(tech => ({
      name: tech.technicianName,
      revenue: tech.revenue,
      tasks: tech.totalTasks
    }));
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>Revenue and tasks by technician</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={formatCurrency} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
                <Tooltip 
                  formatter={(value, name) => 
                    name === 'revenue' ? formatCurrency(value) : formatNumber(value)
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar yAxisId="right" dataKey="tasks" fill="#82ca9d" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 space-y-4">
            {data.revenueByTechnician.map(tech => (
              <div key={tech.technicianId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">{tech.technicianName}</div>
                  <div className="text-xs text-muted-foreground">ID: {tech.technicianId}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                    <div className="text-sm font-medium">{formatCurrency(tech.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                    <div className="text-sm font-medium">{formatNumber(tech.totalTasks)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Avg. Order</div>
                    <div className="text-sm font-medium">{formatCurrency(tech.averageOrderValue)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }