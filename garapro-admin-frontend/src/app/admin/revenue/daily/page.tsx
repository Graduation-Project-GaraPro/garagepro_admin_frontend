'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revenueService, RevenueReport } from '@/services/revenue-service'
import Link from 'next/link'

export default function DailyRevenuePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDailyRevenue()
  }, [selectedDate])

  const loadDailyRevenue = async () => {
    try {
      setLoading(true)
      const data = await revenueService.getDailyRevenue(selectedDate)
      setRevenueData(data)
    } catch (error) {
      console.error('Failed to load daily revenue:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getGrowthIcon = (growthRate: number) => {
    if (growthRate > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (growthRate < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getGrowthColor = (growthRate: number) => {
    if (growthRate > 0) return 'text-green-600'
    if (growthRate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const handleExport = async (format: "csv" | "excel") => {
  try {
    const blob = await revenueService.exportRevenueReport(
      {
        period: "daily",
        startDate: selectedDate,
        endDate: selectedDate,
      },
      format
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-revenue-${selectedDate}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Failed to export report:", error);
  }
};


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading daily revenue data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/revenue">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Revenue Reports
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Revenue Report</h1>
          <p className="text-muted-foreground">
            Detailed financial analysis for {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
            <Button onClick={loadDailyRevenue}>
              Load Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {revenueData && (
        <>
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getGrowthIcon(revenueData.growthRate ?? 0)}
                  <span className={`ml-1 ${getGrowthColor(revenueData.growthRate ?? 0)}`}>
                    {(revenueData.growthRate ?? 0) > 0 ? '+' : ''}{(revenueData.growthRate ?? 0).toFixed(1)}% from previous day
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
  <div className={`text-2xl font-bold ${getGrowthColor(revenueData.growthRate ?? 0)}`}>
    {(revenueData.growthRate ?? 0) > 0 ? "+" : ""}
    {(revenueData.growthRate ?? 0).toFixed(1)}%
  </div>

  <p className="text-xs text-muted-foreground">
    vs {formatCurrency(revenueData.previousPeriodRevenue ?? 0)}
  </p>
</CardContent>

            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedDate}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
              <CardDescription>
                Services generating the highest revenue today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(revenueData.topServices ?? []).map((service, index) => (
                    <TableRow key={service.serviceName}>
                      <TableCell>
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{service.serviceName}</TableCell>
                      <TableCell>{service.orderCount}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(service.revenue)}</TableCell>
                      <TableCell>{service.percentageOfTotal.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Report</CardTitle>
              <CardDescription>
                Download this daily report in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as Excel
                </Button>
                
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
