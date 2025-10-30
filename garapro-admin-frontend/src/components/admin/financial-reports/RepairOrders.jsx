'use client'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { revenueService } from '@/services/revenue-service';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function RepairOrders() {
  const [repairOrders, setRepairOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch repair orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const orders = await revenueService.getRepairOrders(); // Gọi API
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
       // orders.slide(0, 5); // Giới hạn hiển thị 5 đơn hàng gần nhất
        setRepairOrders(orders);
      } catch (error) {
        console.error('Failed to fetch repair orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  const loadOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const details = await revenueService.getRepairOrderDetail(orderId);
      setOrderDetails(details);
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    loadOrderDetails(order.id);
  };

  if (loadingOrders) {
    return <div className="text-center py-20">Loading repair orders...</div>;
  }

  if (!repairOrders || repairOrders.length === 0) {
    return <div className="text-center py-20">No repair orders found.</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Repair Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.vehicle}</TableCell>
                  <TableCell>{order.technician}</TableCell>
                  <TableCell>${order.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Details */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Complete details for repair order</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="py-8 text-center">Loading order details...</div>
            </div>
          ) : orderDetails && (
            <ScrollArea className="max-h-[80vh] pr-4">
              {/* Nội dung chi tiết order giữ nguyên */}
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
