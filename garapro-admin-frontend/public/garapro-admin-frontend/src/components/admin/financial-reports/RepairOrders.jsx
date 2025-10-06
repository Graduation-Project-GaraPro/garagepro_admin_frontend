// components/admin/financial-reports/RepairOrders.jsx
'use client'
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react'; // Fixed import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { revenueService } from '@/services/revenue-service';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function RepairOrders({ data }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!data?.repairOrders) return null;

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
              {data.repairOrders.map((order) => (
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

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
  <DialogContent className="max-w-4xl max-h-[90vh]">
    <DialogHeader>
      <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
      <DialogDescription>
        Complete details for repair order
      </DialogDescription>
    </DialogHeader>

    {loading ? (
      <div className="flex items-center justify-center h-40">
        <div className="py-8 text-center">Loading order details...</div>
      </div>
    ) : orderDetails && (
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
                  <p className="font-medium">{new Date(orderDetails.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{orderDetails.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-xl">${orderDetails.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Completion</p>
                  <p className="font-medium">{new Date(orderDetails.estimatedCompletion).toLocaleString()}</p>
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
                  <p className="font-medium">{orderDetails.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{orderDetails.customerPhone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{orderDetails.customerEmail}</p>
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
                  <p className="text-sm text-muted-foreground">Make & Model</p>
                  <p className="font-medium">{orderDetails.vehicle.make} {orderDetails.vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-medium">{orderDetails.vehicle.year}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-medium">{orderDetails.vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{orderDetails.vehicle.licensePlate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mileage</p>
                <p className="font-medium">{orderDetails.vehicle.mileage.toLocaleString()} miles</p>
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
                {orderDetails.services.map((service) => (
                  <div key={service.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0">
                    <div className="col-span-5">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <p className="text-sm text-muted-foreground">Technician: {service.technician}</p>
                    </div>
                    <div className="col-span-2 text-right">${service.price.toFixed(2)}</div>
                    <div className="col-span-2 text-right">{service.quantity}</div>
                    <div className="col-span-3 text-right font-medium">${service.total.toFixed(2)}</div>
                  </div>
                ))}
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
                {orderDetails.parts.map((part) => (
                  <div key={part.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0">
                    <div className="col-span-5">
                      <p className="font-medium">{part.name}</p>
                      <p className="text-sm text-muted-foreground">{part.description}</p>
                      <div className="flex items-center mt-1">
                        <div className={`h-2 w-2 rounded-full mr-2 ${part.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-muted-foreground">
                          {part.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">${part.price.toFixed(2)}</div>
                    <div className="col-span-2 text-right">{part.quantity}</div>
                    <div className="col-span-3 text-right font-medium">${part.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {orderDetails.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{orderDetails.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    )}
  </DialogContent>
    </Dialog>
    </>
  );
}