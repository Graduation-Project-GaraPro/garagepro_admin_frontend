// pages/financial-reports.jsx
'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { revenueService } from '@/services/revenue-service';

// Components
import DateFilter from '@/components/admin/financial-reports/DateFilter';
import RevenueSummary from '@/components/admin/financial-reports/RevenueSummary';
import ServicePerformance from '@/components/admin/financial-reports/ServicePerformance';
import ServiceTrends from '@/components/admin/financial-reports/ServiceTrends'; // New import
import TechnicianPerformance from '@/components/admin/financial-reports/TechnicianPerformance';
import BranchComparison from '@/components/admin/financial-reports/BranchComparison';
import RepairOrders from '@/components/admin/financial-reports/RepairOrders'; // New import
import ExportButton from '@/components/admin/financial-reports/ExportButton';
import LoadingSpinner from '@/components/admin/financial-reports/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FinancialReports() {
  const [filters, setFilters] = useState({
  period: 'monthly',
  startDate: '',
  endDate: '',
  branchId: '',
  serviceType: ''
});

  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await revenueService.getRevenueReport(filters);
      setReportData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load report data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (updated) => {
  const normalized = { ...updated };

  if (updated.startDate instanceof Date) {
    normalized.startDate = format(updated.startDate, 'yyyy-MM-dd');
  }
  if (updated.endDate instanceof Date) {
    normalized.endDate = format(updated.endDate, 'yyyy-MM-dd');
  }

  setFilters(prev => ({ ...prev, ...normalized }));
};


  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-destructive bg-destructive/10 rounded-lg mx-4 my-8">{error}</div>;

  return (
    <div className="min-h-screen bg-muted/40">
      <Head>
        <title>Financial Reports | AutoRepair Management</title>
        <meta name="description" content="Financial reports and analytics dashboard" />
      </Head>

      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">Analyze revenue performance across your business</p>
          </div>
          <div className="header-actions">
            <ExportButton filters={filters} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <DateFilter filters={filters} onFilterChange={handleFilterChange} />
        
        {reportData && (
          <>
            <RevenueSummary data={reportData} />
            
            <Tabs defaultValue="services" className="mt-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 max-w-2xl">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="trends">Service Trends</TabsTrigger>
                
                <TabsTrigger value="orders">Repair Orders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services" className="mt-4">
                <ServicePerformance data={reportData} />
              </TabsContent>
              
              <TabsContent value="trends" className="mt-4">
                <ServiceTrends data={reportData} />
              </TabsContent>
              
              <TabsContent value="technicians" className="mt-4">
                <TechnicianPerformance data={reportData} />
              </TabsContent>
              
              <TabsContent value="branches" className="mt-4">
                <BranchComparison data={reportData} />
              </TabsContent>
              
              <TabsContent value="orders" className="mt-4">
                <RepairOrders/>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}