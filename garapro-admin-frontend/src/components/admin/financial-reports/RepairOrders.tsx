/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "recharts";
import { formatCurrency } from "@/utils/formatters";
import { RepairOrderItem, revenueService } from "@/services/revenue-service";

// type RepairOrderItem = {
//   id: string;
//   date?: string;
//   customerName?: string;
//   vehicle?: string;
//   technician?: string;
//   amount?: number;
//   status?: string;
//   note?: string;
// };

type DetailedRepairOrder = any;

const STATUS_COLORS = {
  Paid: "#10b981",
  Partial: "#f59e0b",
  Pending: "#6366f1",
};

const PIE_COLORS = ["#10b981", "#f59e0b", "#6366f1"];

export default function RepairOrders() {
  const [repairOrders, setRepairOrders] = useState<RepairOrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrderItem | null>(
    null
  );
  const [orderDetails, setOrderDetails] = useState<DetailedRepairOrder | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [error, setError] = useState<string | null>(null);

  const getPaidStatus = (status?: number): "Paid" | "Partial" | "Pending" => {
    if (!status) return "Pending";
    if (status === 1) return "Paid";
    return "Pending";
  };

  const fetchOrders = async (p = 0) => {
    try {
      setLoadingOrders(true);
      setError(null);
      const orders = await revenueService.getRepairOrders(
        { period: "monthly" },
        p,
        pageSize
      );
      // console.log("Fetched orders:", orders);
      const sorted = (orders || []).sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });
      console.log("Sorted orders:", sorted);
      setRepairOrders(sorted);
      setPage(p);
    } catch (err: any) {
      console.error("Error fetching repair orders:", err);
      setError("Error fetching repair orders.");
      setRepairOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const loadOrderDetails = async (id: string) => {
    setLoading(true);
    setOrderDetails(null);
    try {
      const details = await revenueService.getRepairOrderDetail(id);
      setOrderDetails(details);
    } catch (err) {
      console.error("Failed to load order details:", err);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: RepairOrderItem) => {
    setSelectedOrder(order);
    loadOrderDetails(order.id);
  };

  // Thống kê doanh thu thực tế
  const revenueStats = useMemo(() => {
    const stats = {
      totalRevenue: 0,
      paidRevenue: 0,
      partialRevenue: 0,
      pendingRevenue: 0,
      paidCount: 0,
      partialCount: 0,
      pendingCount: 0,
    };

    repairOrders.forEach((order) => {
      const status = getPaidStatus(order.paidStatus);
      const amount = Number(order.amount ?? 0);
      const partialAmount = Number(order.paidAmount ?? 0);
      const estimatedAmount = Number(order.estimatedAmount ?? 0);

      stats.totalRevenue += amount;

      if (status === "Paid") {
        stats.paidRevenue += amount;
        stats.paidCount++;
      } else if (status === "Partial") {
        stats.partialRevenue += partialAmount;
        stats.partialCount++;
      } else {
        stats.pendingRevenue += estimatedAmount;
        stats.pendingCount++;
      }
    });

    return stats;
  }, [repairOrders]);

  const chartData = useMemo(() => {
    return [
      {
        name: "Paid",
        revenue: revenueStats.paidRevenue,
        count: revenueStats.paidCount,
      },
      {
        name: "Partial",
        revenue: revenueStats.partialRevenue,
        count: revenueStats.partialCount,
      },
      {
        name: "Pending",
        revenue: revenueStats.pendingRevenue,
        count: revenueStats.pendingCount,
      },
    ];
  }, [revenueStats]);

  const pieData = useMemo(() => {
    return chartData
      .filter((item) => item.revenue > 0)
      .map((item) => ({ name: item.name, value: item.revenue }));
  }, [chartData]);

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const onPrevPage = () => {
    if (page <= 0) return;
    fetchOrders(page - 1);
  };

  const onNextPage = () => {
    fetchOrders(page + 1);
  };

  if (loadingOrders)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 m-6 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );

  if (!repairOrders.length)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">No orders found</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Repair Orders</h1>
            <p className="text-slate-600 mt-1">
              Manage and track repair orders
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <Button
              size="sm"
              variant="ghost"
              onClick={onPrevPage}
              disabled={page <= 0}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">Page {page + 1}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onNextPage}
              className="h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(revenueStats.totalRevenue)}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">
                    {repairOrders.length} orders
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Paid</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(revenueStats.paidRevenue)}
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    {revenueStats.paidCount} orders
                  </p>
                </div>
                <Receipt className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">
                    Partial Payment
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(revenueStats.partialRevenue)}
                  </p>
                  <p className="text-amber-100 text-xs mt-1">
                    {revenueStats.partialCount} orders
                  </p>
                </div>
                <Clock className="w-10 h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(revenueStats.pendingRevenue)}
                  </p>
                  <p className="text-indigo-100 text-xs mt-1">
                    {revenueStats.pendingCount} orders
                  </p>
                </div>
                <Clock className="w-10 h-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const pct = Number(percent ?? 0) * 100;
                      return `${String(name)}: ${pct.toFixed(0)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg">Order List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="text-right font-semibold">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-center font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairOrders.map((order) => {
                    const status = getPaidStatus(order.paidStatus);
                    return (
                      <TableRow
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          #{String(order.id).slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.date
                            ? new Date(order.date).toLocaleDateString("en-GB")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {order.customerName ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900">
                          {status === "Partial"
                            ? formatCurrency(order.paidAmount ?? 0)
                            : status === "Pending"
                            ? formatCurrency(order.estimatedAmount ?? 0)
                            : formatCurrency(order.amount ?? 0)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : status === "Partial"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            className="h-9 w-9 p-0 hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Order Details
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : orderDetails ? (
            <ScrollArea className="h-[calc(85vh-120px)] pr-4">
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-slate-600 font-medium">
                        Order ID
                      </div>
                      <div className="font-bold text-2xl text-slate-900 mt-1">
                        #
                        {String(
                          orderDetails.repairOrderId ??
                            orderDetails.id ??
                            selectedOrder?.id
                        ).slice(0, 12)}
                      </div>
                      <div className="text-sm text-slate-600 mt-2">
                        {orderDetails.receiveDate ??
                          orderDetails.completionDate ??
                          orderDetails.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 font-medium">
                        Total Amount
                      </div>
                      <div className="font-bold text-2xl text-green-600 mt-1">
                        {formatCurrency(
                          orderDetails.paidAmount ??
                            orderDetails.estimatedAmount ??
                            orderDetails.totalAmount ??
                            0
                        )}
                      </div>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          getPaidStatus(
                            orderDetails.paidStatus ??
                              orderDetails.statusName ??
                              orderDetails.status
                          ) === "Paid"
                            ? "bg-green-100 text-green-800"
                            : getPaidStatus(
                                orderDetails.paidStatus ??
                                  orderDetails.statusName ??
                                  orderDetails.status
                              ) === "Partial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {orderDetails.paidStatus ??
                          orderDetails.statusName ??
                          orderDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Customer Information
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-lg text-slate-900">
                        {orderDetails.customerName ??
                          orderDetails.user?.fullName ??
                          "—"}
                      </div>
                      {orderDetails.customerPhone && (
                        <div className="text-sm text-slate-600">
                          📞 {orderDetails.customerPhone}
                        </div>
                      )}
                      {orderDetails.customerEmail && (
                        <div className="text-sm text-slate-600">
                          ✉️ {orderDetails.customerEmail}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Vehicle Information
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-lg text-slate-900">
                        {orderDetails.vehicle?.licensePlate ??
                          orderDetails.licensePlate ??
                          "—"}
                      </div>
                      <div className="text-sm text-slate-600">
                        {orderDetails.vehicle?.model ??
                          orderDetails.vehicleId ??
                          ""}
                      </div>
                      {orderDetails.vehicle?.vin && (
                        <div className="text-sm text-slate-600">
                          VIN: {orderDetails.vehicle.vin}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                    Services
                  </div>
                  {(
                    orderDetails.jobs ||
                    orderDetails.repairOrderServices ||
                    orderDetails.services ||
                    []
                  ).length === 0 ? (
                    <div className="text-sm text-slate-500 italic">
                      No services recorded
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(
                        orderDetails.jobs ??
                        orderDetails.repairOrderServices ??
                        orderDetails.services
                      ).map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2 border-b last:border-b-0"
                        >
                          <div className="text-sm font-medium text-slate-900">
                            {s.service?.serviceName ??
                              s.serviceName ??
                              s.name ??
                              "—"}
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrency(
                              s.totalAmount ?? s.price ?? s.total ?? 0
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {(orderDetails.note || orderDetails.notes) && (
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                      Notes
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {orderDetails.note ?? orderDetails.notes}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-12 text-center text-red-600">
              No detail data available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
