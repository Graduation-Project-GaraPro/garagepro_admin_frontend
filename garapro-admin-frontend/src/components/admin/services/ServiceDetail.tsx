// components/services/ServiceDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { serviceService } from '@/services/service-Service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Clock, DollarSign, MapPin, Package, Edit, Loader2, Box, Hash, BarChart3 ,Zap} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ServiceDetailProps {
  serviceId: string;
}

interface ApiService {
  serviceId: string;
  serviceCategoryId: string;
  serviceName: string;
  serviceStatus: string;
  description: string;
  price: number;
  estimatedDuration: number;
  isActive: boolean;
  isAdvanced: boolean;
  createdAt: string;
  updatedAt: string | null;
  serviceCategory: {
    serviceCategoryId: string;
    categoryName: string;
    serviceTypeId: string;
    parentServiceCategoryId: string | null;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
  branches: Array<{
    branchId: string;
    branchName: string;
    phoneNumber: string;
    email: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
  }>;
  parts?: Array<{
    partId: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sku?: string;
    category?: string;
    unit?: string;
    minStockLevel?: number;
    isActive?: boolean;
  }>;
}

// Format currency for Vietnamese Dong
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Format numbers
const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('vi-VN').format(number);
};

export default function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const router = useRouter();
  const [service, setService] = useState<ApiService | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      const serviceData = await serviceService.getServiceByIdForDetails(serviceId);
      setService(serviceData);
    } catch (error) {
      console.error('Error loading service:', error);
      toast.error('Failed to load service details');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total parts price
  const totalPartsPrice = service?.parts?.reduce((total, part) => total + part.price, 0) || 0;
  const totalServicePrice = (service?.price || 0) + totalPartsPrice;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center space-y-4 py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-medium">Service Not Found</h3>
          <p className="text-muted-foreground mt-1">The service you are looking for does not exist.</p>
        </div>
        <Button asChild>
          <Link href="/admin/services">
            Back to Services List
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{service.serviceName}</h2>
            <p className="text-muted-foreground">{service.description}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/services/edit/${service.serviceId}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Service
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Basic information about this service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Category</p>
                <p>{service.serviceCategory?.categoryName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                  <p className="font-medium">{formatCurrency(service.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Duration</p>
                  <p>{service.estimatedDuration} minutes</p>
                </div>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
              
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <p
                  className={`px-2 py-1 rounded-md text-sm font-medium ${
                    service.isAdvanced
                      ? "bg-blue-100 text-blue-800"
                      : "border border-gray-300 text-gray-700"
                  }`}
                >
                  {service.isAdvanced ? "Advanced Service" : "Regular Service"}
                </p>
              </div>

            </div>

            {/* {service.parts && service.parts.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Parts Cost</p>
                    <p className="font-medium">{formatCurrency(totalPartsPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Service Price</p>
                    <p className="font-semibold text-primary">{formatCurrency(totalServicePrice)}</p>
                  </div>
                </div>
              </div>
            )} */}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Available Branches</p>
              <div className="flex flex-wrap gap-2">
                {service.branches.map((branch) => (
                  <Badge key={branch.branchId} variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {branch.branchName}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Required Parts
              {service.parts && service.parts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {service.parts.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Parts needed for this service</CardDescription>
          </CardHeader>
          <CardContent>
            {service.parts && service.parts.length > 0 ? (
              <div className="space-y-4">
                {/* Parts Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Information</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {service.parts.map((part, index) => (
                        <TableRow key={part.partId || index}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Box className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{part.name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {part.sku && (
                                  <div className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    <span>SKU: {part.sku}</span>
                                  </div>
                                )}
                                {part.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {part.category}
                                  </Badge>
                                )}
                              </div>
                              {part.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {part.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(part.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={part.stock < (part.minStockLevel || 5) ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                                {formatNumber(part.stock)}
                              </span>
                              {part.unit && (
                                <span className="text-xs text-muted-foreground">{part.unit}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant={part.isActive === false ? "secondary" : part.stock === 0 ? "destructive" : "outline"}
                              className="text-xs"
                            >
                              {part.isActive === false ? 'Discontinued' : part.stock === 0 ? 'Out of Stock' : 'Available'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary */}
                

                {/* Stock Alert */}
                {service.parts.some(part => part.stock < (part.minStockLevel || 5)) && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <BarChart3 className="h-4 w-4" />
                      <p className="text-sm font-medium">Low Stock Alert</p>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Some parts are running low on stock. Consider restocking.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No Parts Required</p>
                <p className="text-sm mt-1">This service does not require additional parts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/admin/services">
            Back to List
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/admin/services/edit/${service.serviceId}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Service
          </Link>
        </Button>
      </div>
    </div>
  );
}