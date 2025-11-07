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
import { Eye } from "lucide-react";
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
} from "recharts";
import { formatCurrency } from "@/utils/formatters";
import { revenueService } from "@/services/revenue-service";

export default function RepairOrders() {
  const [repairOrders, setRepairOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const getPaidStatus = (
    status: string
  ): "Paid" | "Unpaid" | "Partial" | "Pending" => {
    if (!status) return "Pending";
    const s = status.toLowerCase();
    if (s === "paid") return "Paid";
    if (s === "unpaid") return "Unpaid";
    if (s === "partial") return "Partial";
    if (s === "pending") return "Pending";
    return "Pending";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const orders = await revenueService.getRepairOrders();
        console.log("Fetched:", orders);

        const sorted = [...orders].sort((a, b) => {
          const dateA = new Date(a.date || a.receiveDate).getTime();
          const dateB = new Date(b.date || b.receiveDate).getTime();
          return dateB - dateA;
        });

        setRepairOrders(sorted.slice(0, 5));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const loadOrderDetails = async (id: string) => {
    setLoading(true);
    try {
      const details = await revenueService.getRepairOrderDetail(id);
      setOrderDetails(details);
    } catch {
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    loadOrderDetails(order.id);
  };

  // Biểu đồ: Revenue by Payment Status
  const paymentStats = useMemo(() => {
    const stats = { Paid: 0, Unpaid: 0, Partial: 0, Pending: 0 };
    repairOrders.forEach((order) => {
      const status = getPaidStatus(order.status);
      const amount = Number(order.amount || order.estimatedAmount) || 0;
      const paid = Number(order.amount) || 0;

      if (status === "Paid") stats.Paid += amount;
      else if (status === "Partial") stats.Partial += paid;
      else stats.Unpaid += amount;
    });

    return [
      { name: "Paid", value: stats.Paid, fill: "#10b981" },
      { name: "Unpaid", value: stats.Unpaid, fill: "#ef4444" },
      { name: "Partial", value: stats.Partial, fill: "#f59e0b" },
    ];
  }, [repairOrders]);

  // Bảng: Order Count
  const paymentCountStats = useMemo(() => {
    const counts = { Paid: 0, Unpaid: 0, Partial: 0, Pending: 0 };
    repairOrders.forEach((order) => {
      counts[getPaidStatus(order.status)]++;
    });

    return [
      { status: "Paid", count: counts.Paid },
      { status: "Unpaid", count: counts.Unpaid },
      { status: "Partial", count: counts.Partial },
      { status: "Pending", count: counts.Pending },
    ];
  }, [repairOrders]);

  if (loadingOrders)
    return <div className="text-center py-20">Loading orders...</div>;
  if (!repairOrders.length)
    return <div className="text-center py-20 text-red-500">No data!</div>;

  return (
    <div className="space-y-6 p-4">
      {/* Biểu đồ */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={paymentStats}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
              <Tooltip formatter={formatCurrency} />
              <Legend />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bảng số lượng - nhỏ gọn */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order Count by Status</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24 text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentCountStats.map((item) => (
                <TableRow key={item.status}>
                  <TableCell className="text-xs font-medium">
                    {item.status === "Paid"
                      ? "Paid"
                      : item.status === "Unpaid"
                      ? "Unpaid"
                      : item.status === "Partial"
                      ? "Partial"
                      : "Pending"}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold">
                    {item.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Danh sách đơn - cột tiền đầy đủ */}
      <Card>
        <CardHeader>
          <CardTitle>Latest 5 Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Order ID</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="text-right w-32">Amount</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-24 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairOrders.map((order) => {
                  const status = getPaidStatus(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(order.date).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : status === "Partial"
                              ? "bg-amber-100 text-amber-800"
                              : status === "Pending"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {status === "Paid"
                            ? "Paid"
                            : status === "Partial"
                            ? "Partial"
                            : status === "Pending"
                            ? "Pending"
                            : "Unpaid"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="h-8 w-8 p-0"
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

      {/* Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : orderDetails ? (
            <ScrollArea className="h-96">
              <pre className="text-xs p-4 bg-gray-50 rounded">
                {JSON.stringify(orderDetails, null, 2)}
              </pre>
            </ScrollArea>
          ) : (
            <div className="py-10 text-center text-red-500">No data</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
