// components/BranchComparison.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function BranchComparison({ data }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branch Comparison</CardTitle>
          <CardDescription>Performance across different locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branchComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {data.branchComparison.map(branch => (
              <div key={branch.branchId} className="border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">{branch.branchName}</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Revenue:</span>
                    <span className="text-sm font-medium">{formatCurrency(branch.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Orders:</span>
                    <span className="text-sm font-medium">{formatNumber(branch.orderCount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Growth:</span>
                    <span className={`text-sm font-medium flex items-center ${branch.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {branch.growthRate >= 0 ? (
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(branch.growthRate)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }