// components/revenue/quick-actions.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { revenueService, RevenueFilters } from "@/services/revenue-service"
import { toast } from "sonner" // Import Toast từ Sooner

interface QuickActionsProps {
  selectedPeriod: string
  filters: RevenueFilters
}

export function QuickActions({ selectedPeriod, filters }: QuickActionsProps) {
  const [exporting, setExporting] = useState<'csv' | 'excel' | null>(null)
  

  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(format)
    try {
      const blob = await revenueService.exportRevenueReport(filters, format)
      
      // Tạo URL cho file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `revenue-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      
      // Dọn dẹp
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Sử dụng Toast của Sooner
      toast.success(`Revenue report has been exported as ${format.toUpperCase()}`, {
        description: "Your download should start shortly",
        duration: 3000,
      })
    } catch (error) {
      // Sử dụng Toast của Sooner cho lỗi
      toast.error("Export Failed", {
        description: error instanceof Error ? error.message : "Failed to export revenue report",
        duration: 5000,
      })
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>
            Access comprehensive revenue analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`/admin/revenue/${selectedPeriod}`}>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Detailed {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report
            </Button>
          </Link>
          <Link href="/admin/revenue/branches">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Branch Comparison
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Download reports in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
          >
            {exporting === 'csv' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export as CSV
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleExport('excel')}
            disabled={exporting !== null}
          >
            {exporting === 'excel' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export as Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}