// components/admin/financial-reports/ServiceTrends.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ServiceTrends({ data }) {
  if (!data?.serviceTrends) return null;

  const serviceNames = [...new Set(data.serviceTrends.flatMap(item => 
    Object.keys(item).filter(key => key !== 'period')
  ))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.serviceTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            {serviceNames.map((service, index) => (
              <Line 
                key={service}
                type="monotone"
                dataKey={service}
                stroke={`hsl(${index * 360 / serviceNames.length}, 70%, 50%)`}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}