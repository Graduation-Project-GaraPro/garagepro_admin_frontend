// components/services/ServiceDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/types/service';
import { serviceService } from '@/services/service-Service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Clock, DollarSign, MapPin, Package, Settings, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ServiceDetailProps {
  serviceId: string;
}

export default function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      const serviceData = await serviceService.getService(serviceId);
      setService(serviceData);
    } catch (error) {
      console.error('Error loading service:', error);
      toast.error('Failed to load service details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Service not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The service you are looking for does not exist.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/admin/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalPartsCost = service.parts.reduce(
    (total, partService) => total + (partService.part?.cost || 0) * partService.quantity,
    0
  );

  const totalPartsPrice = service.parts.reduce(
    (total, partService) => total + (partService.part?.price || 0) * partService.quantity,
    0
  );

  const totalServiceCost = totalPartsCost;
  const totalServicePrice = service.basePrice + totalPartsPrice;
  const profitMargin = totalServicePrice - totalServiceCost;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Service Details</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Service Information
            </CardTitle>
            <CardDescription>
              Detailed information about the service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{service.name}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Service Type</p>
                <p className="text-sm">{service.serviceType?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm">{service.serviceType?.category?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Base Price</p>
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="text-sm">{service.basePrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Duration</p>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span className="text-sm">{service.estimatedDuration} minutes</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Available at Branches</p>
              <div className="flex flex-wrap gap-2">
                {service.branchIds.map((branchId) => (
                  <Badge key={branchId} variant="outline">
                    Branch #{branchId}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Created</p>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  {new Date(service.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Profitability Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Profitability
            </CardTitle>
            <CardDescription>
              Cost breakdown and profit analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Service Price</p>
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="text-sm">{totalServicePrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Service Cost</p>
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="text-sm">{totalServiceCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Profit</p>
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span className="text-sm">{profitMargin.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Margin</p>
                <span className="text-sm">
                  {totalServicePrice > 0 
                    ? `${((profitMargin / totalServicePrice) * 100).toFixed(2)}%` 
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Cost Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Service</span>
                  <span>${service.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Parts Cost</span>
                  <span>${totalPartsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                  <span>Total Cost</span>
                  <span>${totalServiceCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Parts Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Required Parts
            </CardTitle>
            <CardDescription>
              Parts needed for this service
            </CardDescription>
          </CardHeader>
          <CardContent>
            {service.parts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {service.parts.map((partService) => {
                    const part = partService.part;
                    if (!part) return null;
                    
                    return (
                      <TableRow key={partService.id}>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell>{part.sku}</TableCell>
                        <TableCell>{partService.quantity}</TableCell>
                        <TableCell>${part.cost.toFixed(2)}</TableCell>
                        <TableCell>${part.price.toFixed(2)}</TableCell>
                        <TableCell>${(part.cost * partService.quantity).toFixed(2)}</TableCell>
                        <TableCell>${(part.price * partService.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="font-medium">
                    <TableCell colSpan={5} className="text-right">Total</TableCell>
                    <TableCell>${totalPartsCost.toFixed(2)}</TableCell>
                    <TableCell>${totalPartsPrice.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No parts required</h3>
                <p className="mt-2 text-sm text-gray-500">
                  This service doesn't require any parts.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/services">
            Back to Services
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/admin/services/edit/${service.id}`}>
            Edit Service
          </Link>
        </Button>
      </div>
    </div>
  );
}