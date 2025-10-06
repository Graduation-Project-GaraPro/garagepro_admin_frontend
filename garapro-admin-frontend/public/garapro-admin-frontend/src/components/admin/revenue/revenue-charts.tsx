// components/revenue/revenue-charts.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Activity, PieChart, TrendingUp } from "lucide-react"
import { OverviewTab } from "./overview-tab"
import { TrendsTab } from "./trends-tab"
import { ServicesTab } from "./services-tab"
import { PerformanceTab } from "./performance-tab"

interface RevenueChartsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  revenueData: any
  formatCurrency: (amount: number) => string
  handleExport: (format: 'csv' | 'excel') => void
  selectedPeriod: string
  CustomTooltip: any
  COLORS: string[]
}

export function RevenueCharts({
  activeTab,
  setActiveTab,
  revenueData,
  formatCurrency,
  handleExport,
  selectedPeriod,
  CustomTooltip,
  COLORS
}: RevenueChartsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="trends" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Trends
        </TabsTrigger>
        <TabsTrigger value="services" className="flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Services
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Performance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <OverviewTab revenueData={revenueData} CustomTooltip={CustomTooltip} />
      </TabsContent>

      <TabsContent value="trends" className="space-y-6">
        <TrendsTab revenueData={revenueData} CustomTooltip={CustomTooltip} />
      </TabsContent>

      <TabsContent value="services" className="space-y-6">
        <ServicesTab 
          revenueData={revenueData} 
          formatCurrency={formatCurrency} 
          CustomTooltip={CustomTooltip} 
          COLORS={COLORS} 
        />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceTab 
          revenueData={revenueData} 
          formatCurrency={formatCurrency} 
          CustomTooltip={CustomTooltip} 
        />
      </TabsContent>
    </Tabs>
  )
}