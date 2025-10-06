'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { BranchRevenue, revenueService } from '@/services/revenue-service'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

export default function BranchComparisonPage() {
  const [branchData, setBranchData] = useState<BranchRevenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    const fetchBranchData = async () => {
      setIsLoading(true)
      try {
        const data = await revenueService.getBranchRevenue(period)
        setBranchData(data)
      } catch (error) {
        console.error('Failed to fetch branch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranchData()
  }, [period])

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const filters = { period }
      const blob = await revenueService.exportRevenueReport(filters, format)
      
      // Tạo URL tải xuống
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `branch-comparison-${period}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export report. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading branch data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Branch Comparison</h1>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as 'daily' | 'monthly' | 'yearly')}
              className="border rounded-md p-2"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Branch Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Revenue Comparison</CardTitle>
          <CardDescription>Revenue by branch for {period} period</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={branchData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branchName" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth Rate Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Rate Comparison</CardTitle>
          <CardDescription>Growth rate by branch for {period} period</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={branchData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branchName" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
              <Legend />
              <Bar dataKey="growthRate" name="Growth Rate" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Branch Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Performance Details</CardTitle>
          <CardDescription>Detailed comparison of branch performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Branch</th>
                  <th className="text-right p-4">Revenue</th>
                  <th className="text-right p-4">Orders</th>
                  <th className="text-right p-4">Average Order Value</th>
                  <th className="text-right p-4">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {branchData.map((branch) => {
                  const avgOrderValue = branch.revenue / branch.orderCount
                  return (
                    <tr key={branch.branchId} className="border-b">
                      <td className="p-4 font-medium">{branch.branchName}</td>
                      <td className="p-4 text-right">${branch.revenue.toLocaleString()}</td>
                      <td className="p-4 text-right">{branch.orderCount.toLocaleString()}</td>
                      <td className="p-4 text-right">${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="p-4 text-right">
                        <div className={`flex items-center justify-end ${branch.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {branch.growthRate >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(branch.growthRate)}%
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}