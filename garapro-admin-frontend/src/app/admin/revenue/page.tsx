// app/revenue/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RevenueStats } from '@/components/admin/revenue/revenue-stats'
import { PeriodSelector } from '@/components/admin/revenue/period-selector'
import { RevenueCharts } from '@/components/admin/revenue/revenue-charts'
import { QuickActions } from '@/components/admin/revenue/quick-actions'
import { revenueService, RevenueReport } from '@/services/revenue-service'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

export default function RevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadRevenueData()
  }, [selectedPeriod, selectedDate, selectedYear, selectedMonth])

  const loadRevenueData = async () => {
    try {
      setLoading(true)
      let data: RevenueReport

      switch (selectedPeriod) {
        case 'daily':
          data = await revenueService.getDailyRevenue(selectedDate)
          break
        case 'monthly':
          data = await revenueService.getMonthlyRevenue(selectedYear, selectedMonth)
          break
        case 'yearly':
          data = await revenueService.getYearlyRevenue(selectedYear)
          break
        default:
          data = await revenueService.getMonthlyRevenue(selectedYear, selectedMonth)
      }

      setRevenueData(data)
    } catch (error) {
      console.error('Failed to load revenue data:', error)
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

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const filters = {
        period: selectedPeriod as 'daily' | 'monthly' | 'yearly',
        startDate: selectedDate,
        endDate: selectedDate,
      }
      
      const blob = await revenueService.exportRevenueReport(filters, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `revenue-report-${selectedPeriod}-${selectedDate}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export report:', error)
      alert('Failed to export report. Please try again.')
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.dataKey.includes('revenue') ? formatCurrency(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading revenue data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Reports</h1>
          <p className="text-muted-foreground">
            Generate real-time financial reports with interactive charts
          </p>
        </div>
        <div className="flex gap-2">
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

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {revenueData && (
        <>
          <RevenueStats
            selectedPeriod={selectedPeriod}
            selectedDate={selectedDate}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            revenueData={revenueData}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            getGrowthIcon={getGrowthIcon}
            getGrowthColor={getGrowthColor}
          />

          <RevenueCharts
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            revenueData={revenueData}
            formatCurrency={formatCurrency}
            handleExport={handleExport}
            selectedPeriod={selectedPeriod}
            CustomTooltip={CustomTooltip}
            COLORS={COLORS}
          />

          <QuickActions
            selectedPeriod={selectedPeriod}
            handleExport={handleExport}
          />
        </>
      )}
    </div>
  )
}