/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Download,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Building,
  Wrench,
  Car,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  RevenueReport,
  revenueService,
  RevenueFilters,
  DetailedRepairOrder,
} from "@/services/revenue-service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#FF6B6B",
  "#48DBFB",
  "#1DD1A1",
];

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage
const formatPercentage = (value: number) => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    completed: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    in_progress: {
      color: "bg-blue-100 text-blue-800",
      icon: <Clock className="h-3 w-3" />,
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="h-3 w-3" />,
    },
    cancelled: {
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {status.replace("_", " ").toUpperCase()}
    </Badge>
  );
};

// Custom Date Picker Component
const DateRangePicker = ({
  date,
  onDateChange,
}: {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[240px] justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default function RevenuePage() {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [period, setPeriod] = useState<string>("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] =
    useState<DetailedRepairOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    summary: true,
    charts: true,
    services: true,
    orders: true,
  });

  // Fetch report data
  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const filters: RevenueFilters = {
        period: period as "daily" | "monthly" | "yearly",
      };

      if (selectedBranch !== "all") {
        filters.branchId = selectedBranch;
      }

      // Add date range filtering if selected
      if (dateRange?.from) {
        filters.startDate = dateRange.from.toISOString().split("T")[0];
      }

      if (dateRange?.to) {
        filters.endDate = dateRange.to.toISOString().split("T")[0];
      }

      const data = await revenueService.getRevenueReport(filters);
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch revenue report:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, selectedBranch]);

  useEffect(() => {
    if (dateRange?.from && dateRange.to) {
      fetchReport();
    }
  }, [dateRange]);

  const handleExport = async (format: "csv" | "excel") => {
    setIsExporting(true);
    try {
      const filters: RevenueFilters = {
        period: period as "daily" | "monthly" | "yearly",
      };

      if (selectedBranch !== "all") {
        filters.branchId = selectedBranch;
      }

      if (dateRange?.from) {
        filters.startDate = dateRange.from.toISOString().split("T")[0];
      }

      if (dateRange?.to) {
        filters.endDate = dateRange.to.toISOString().split("T")[0];
      }

      const blob = await revenueService.exportRevenueReport(filters, format);

      // Create download URL
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `revenue-report-${period}-${
        new Date().toISOString().split("T")[0]
      }.${format === "csv" ? "csv" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const handleOrderClick = async (orderId: string) => {
    setIsLoadingOrder(true);
    setIsDialogOpen(true);
    try {
      const orderDetail = await revenueService.getRepairOrderDetail(orderId);
      setSelectedOrder(orderDetail);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-24 mb-2" />
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (!report) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="text-destructive text-lg">
            Failed to load revenue report
          </div>
          <Button onClick={fetchReport}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {`Comprehensive analysis of your garage's financial performance`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="b1">Downtown</SelectItem>
                <SelectItem value="b2">Uptown</SelectItem>
                <SelectItem value="b3">Suburban</SelectItem>
              </SelectContent>
            </Select>

            {period === "custom" && (
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "CSV"}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Excel"}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <Card>
        <CardHeader className="pb-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("summary")}
          >
            <CardTitle className="text-xl">Performance Summary</CardTitle>
            {expandedSections.summary ? <ChevronUp /> : <ChevronDown />}
          </div>
          <CardDescription>
            Key revenue metrics for the selected period
          </CardDescription>
        </CardHeader>
        {expandedSections.summary && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(report.totalRevenue)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {(report.growthRate ?? 0) >= 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span
                      className={
                        (report.growthRate ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {formatPercentage(report.growthRate ?? 0)} from previous
                      period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {report.totalOrders.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(
                      report.totalOrders /
                        (period === "daily"
                          ? 1
                          : period === "monthly"
                          ? 30
                          : 365)
                    )}{" "}
                    avg per day
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Order Value
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(report.averageOrderValue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(report.totalRevenue / report.totalOrders).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}{" "}
                    per order
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Growth Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      (report.growthRate ?? 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(report.growthRate ?? 0) >= 0 ? "+" : ""}
                    {report.growthRate}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Compared to previous period
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Charts Section */}
      <Card>
        <CardHeader className="pb-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("charts")}
          >
            <CardTitle className="text-xl">Performance Visualization</CardTitle>
            {expandedSections.charts ? <ChevronUp /> : <ChevronDown />}
          </div>
          <CardDescription>
            Visual representation of revenue data
          </CardDescription>
        </CardHeader>
        {expandedSections.charts && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                  <CardDescription>
                    Top revenue generating services
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.topServices}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props) => {
                          // nếu dùng recharts: props.name hoặc props.payload?.serviceName
                          const serviceName =
                            (props as any).name ??
                            (props as any).payload?.serviceName ??
                            "Unknown";
                          const percentage =
                            typeof (props as any).percent === "number"
                              ? Math.round((props as any).percent * 100)
                              : (props as any).percentageOfTotal ?? 0;
                          return `${serviceName}: ${percentage}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="serviceName"
                      >
                        {report.topServices &&
                          report.topServices.length > 0 && (
                            <PieChart>
                              <Pie
                                data={report.topServices}
                                dataKey="revenue"
                                nameKey="serviceName"
                              />
                            </PieChart>
                          )}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Revenue",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technician Performance</CardTitle>
                  <CardDescription>Revenue by technician</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.revenueByTechnician}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="technicianName"
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Revenue",
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Branch Comparison */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Branch Performance Comparison</CardTitle>
                <CardDescription>
                  Revenue metrics across all branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                    <div className="col-span-4">Branch</div>
                    <div className="col-span-2 text-right">Revenue</div>
                    <div className="col-span-2 text-right">Orders</div>
                    <div className="col-span-2 text-right">Avg Order</div>
                    <div className="col-span-2 text-right">Growth</div>
                  </div>
                  {(report.branchComparison ?? []).map((branch) => (
                    <div
                      key={branch.branchId}
                      className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0"
                    >
                      <div className="col-span-4 font-medium flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        {branch.branchName}
                      </div>
                      <div className="col-span-2 text-right">
                        {formatCurrency(branch.revenue)}
                      </div>
                      <div className="col-span-2 text-right">
                        {branch.orderCount.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right">
                        {formatCurrency(branch.revenue / branch.orderCount)}
                      </div>
                      <div className="col-span-2 text-right">
                        <div
                          className={`flex items-center justify-end ${
                            branch.growthRate >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {branch.growthRate >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(branch.growthRate)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>

      {/* Services Section */}
      <Card>
        <CardHeader className="pb-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("services")}
          >
            <CardTitle className="text-xl">Service Analytics</CardTitle>
            {expandedSections.services ? <ChevronUp /> : <ChevronDown />}
          </div>
          <CardDescription>
            Detailed breakdown of services performance
          </CardDescription>
        </CardHeader>
        {expandedSections.services && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Categories</CardTitle>
                  <CardDescription>Revenue by service category</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.serviceCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // thay thế label={({ name, percentage }) => `${name}: ${percentage}%`}
                        label={(props) => {
                          const p = props as any; // tránh lỗi kiểu từ thư viện
                          // nhiều lib chart expose .name, .percent, và .payload (original datum)
                          const serviceName =
                            p.name ?? p.payload?.serviceName ?? "Unknown";
                          // percent thường là fraction (0..1) in recharts; nếu bạn stored percentageOfTotal in payload, fallback to it
                          const percentage =
                            typeof p.percent === "number"
                              ? Math.round((p.percent ?? 0) * 100)
                              : p.payload?.percentageOfTotal ?? 0;
                          return `${serviceName}: ${percentage}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="name"
                      >
                        {(report.serviceCategories ?? []).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Revenue",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Trends</CardTitle>
                  <CardDescription>
                    Service performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.serviceTrends}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Revenue",
                        ]}
                      />
                      <Legend />
                      {(report.topServices ?? [])
                        .slice(0, 3)
                        .map((service, index) => (
                          <Bar
                            key={service.serviceName}
                            dataKey={service.serviceName}
                            name={service.serviceName}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>
                  Detailed breakdown of all services performed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                    <div className="col-span-5">Service</div>
                    <div className="col-span-2 text-right">Revenue</div>
                    <div className="col-span-2 text-right">Orders</div>
                    <div className="col-span-3 text-right">Avg. Price</div>
                  </div>
                  {report.detailedServices &&
                  report.detailedServices.length > 0 ? (
                    report.detailedServices.map((service, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0"
                      >
                        <div className="col-span-5 font-medium flex items-center">
                          <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                          {service.name}
                        </div>
                        <div className="col-span-2 text-right">
                          {formatCurrency(service.revenue)}
                        </div>
                        <div className="col-span-2 text-right">
                          {service.orderCount}
                        </div>
                        <div className="col-span-3 text-right">
                          {formatCurrency(service.averagePrice)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No service data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>

      {/* Orders Section */}
      <Card>
        <CardHeader className="pb-3">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("orders")}
          >
            <CardTitle className="text-xl">Repair Orders</CardTitle>
            {expandedSections.orders ? <ChevronUp /> : <ChevronDown />}
          </div>
          <CardDescription>Detailed list of all repair orders</CardDescription>
        </CardHeader>
        {expandedSections.orders && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of orders by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.orderStatusStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {(report.orderStatusStats ?? []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Value Distribution</CardTitle>
                  <CardDescription>
                    Distribution of order values
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.orderValueDistribution}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [value, "Number of Orders"]}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Orders" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Repair Orders List</CardTitle>
                <CardDescription>
                  Detailed list of all repair orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                    <div className="col-span-2">Order ID</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Customer</div>
                    <div className="col-span-2">Vehicle</div>
                    <div className="col-span-2">Technician</div>
                    <div className="col-span-1 text-right">Amount</div>
                    <div className="col-span-1 text-right">Status</div>
                  </div>
                  {report.repairOrders && report.repairOrders.length > 0 ? (
                    report.repairOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <div className="col-span-2 font-medium">
                          #{order.id}
                        </div>
                        <div className="col-span-2">
                          {formatDate(order.date ?? "")}
                        </div>
                        <div className="col-span-2">{order.customerName}</div>
                        <div className="col-span-2 flex items-center">
                          <Car className="h-4 w-4 mr-1 text-muted-foreground" />
                          {order.vehicle}
                        </div>
                        <div className="col-span-2">{order.technician}</div>
                        <div className="col-span-1 text-right">
                          {formatCurrency(order.amount ?? 0)}
                        </div>
                        <div className="col-span-1 text-right">
                          <StatusBadge status={order.status ?? "unknown"} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No order data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {isLoadingOrder ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedOrder ? (
            <>
              <DialogHeader>
                <DialogTitle>Repair Order #{selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Detailed information for this repair order
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[80vh] pr-4">
                <div className="grid gap-6">
                  {/* Order Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {formatDate(selectedOrder.date ?? "")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <StatusBadge
                            status={selectedOrder.status ?? "unknown"}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Amount
                          </p>
                          <p className="font-medium text-xl">
                            {formatCurrency(selectedOrder.totalAmount ?? 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Estimated Completion
                          </p>
                          <p className="font-medium">
                            {formatDate(
                              selectedOrder.estimatedCompletion ?? ""
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">
                            {selectedOrder.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">
                            {selectedOrder.customerPhone}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {selectedOrder.customerEmail}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vehicle Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Vehicle Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Make & Model
                          </p>
                          <p className="font-medium">
                            {selectedOrder.vehicle?.make ?? "N/A"}{" "}
                            {selectedOrder.vehicle?.model ?? ""}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Year</p>
                          <p className="font-medium">
                            {selectedOrder.vehicle?.year ?? "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">VIN</p>
                          <p className="font-medium">
                            {selectedOrder.vehicle?.vin ?? "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            License Plate
                          </p>
                          <p className="font-medium">
                            {selectedOrder.vehicle?.licensePlate ?? "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Mileage</p>
                        <p className="font-medium">
                          {selectedOrder.vehicle?.mileage
                            ? `${selectedOrder.vehicle.mileage.toLocaleString()} miles`
                            : "N/A"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Services */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                          <div className="col-span-5">Service</div>
                          <div className="col-span-2 text-right">Price</div>
                          <div className="col-span-2 text-right">Quantity</div>
                          <div className="col-span-3 text-right">Total</div>
                        </div>

                        {(selectedOrder.services ?? []).map(
                          (service, index) => {
                            const price = service.price ?? 0;
                            const quantity = service.quantity ?? 0;
                            const total = service.total ?? price * quantity;
                            const technician = service.technician ?? "N/A";
                            const duration = service.durationMinutes ?? 0;

                            return (
                              <div
                                key={service.id ?? index}
                                className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0"
                              >
                                <div className="col-span-5">
                                  <p className="font-medium">
                                    {service.name ?? "Unnamed service"}
                                  </p>
                                  {service.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {service.description}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    Technician: {technician}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Duration: {duration} min
                                  </p>
                                </div>

                                <div className="col-span-2 text-right">
                                  {formatCurrency(price)}
                                </div>

                                <div className="col-span-2 text-right">
                                  {quantity}
                                </div>

                                <div className="col-span-3 text-right font-medium">
                                  {formatCurrency(total)}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parts */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Parts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                          <div className="col-span-5">Part</div>
                          <div className="col-span-2 text-right">Price</div>
                          <div className="col-span-2 text-right">Quantity</div>
                          <div className="col-span-3 text-right">Total</div>
                        </div>

                        {(selectedOrder.parts ?? []).map((part, index) => {
                          const price = part.price ?? 0;
                          const qty = part.quantity ?? 0;
                          const total = part.total ?? price * qty;
                          const inStock = part.inStock ?? false;

                          return (
                            <div
                              key={part.id ?? index}
                              className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0"
                            >
                              <div className="col-span-5">
                                <p className="font-medium">
                                  {part.name ?? "Unnamed part"}
                                </p>

                                {/* {part.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {part.description}
                                  </p>
                                )} */}

                                <div className="flex items-center mt-1">
                                  <div
                                    className={`h-2 w-2 rounded-full mr-2 ${
                                      inStock ? "bg-green-500" : "bg-red-500"
                                    }`}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {inStock ? "In Stock" : "Out of Stock"}
                                  </span>
                                </div>
                              </div>

                              <div className="col-span-2 text-right">
                                {formatCurrency(price)}
                              </div>

                              <div className="col-span-2 text-right">{qty}</div>

                              <div className="col-span-3 text-right font-medium">
                                {formatCurrency(total)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedOrder.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p>Failed to load order details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
