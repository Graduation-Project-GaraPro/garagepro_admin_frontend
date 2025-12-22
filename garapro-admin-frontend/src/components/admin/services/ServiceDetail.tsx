// components/services/ServiceDetail.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { serviceService, ApiService } from "@/services/service-Service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Edit,
  Loader2,
  Box,
  BarChart3,
  Zap,
  ChevronDown,      // ✅ thêm icon
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePermissionContext } from '@/contexts/permission-context'

interface ServiceDetailProps {
  serviceId: any;
}

// Format currency for Vietnamese Dong
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format numbers
const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("vi-VN").format(number);
};

export default function ServiceDetail({ serviceId }: ServiceDetailProps) {
  
  const [service, setService] = useState<ApiService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {hasAnyPermission} = usePermissionContext();


  
  const canEdit   = hasAnyPermission('SERVICE_UPDATE')
  const canDelete = hasAnyPermission('SERVICE_DELETE')
  const canToggle = hasAnyPermission('SERVICE_STATUS_TOGGLE')
  // ✅ state quản lý category nào đang expand
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    loadService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const loadService = async () => {
    try {
      const serviceData = await serviceService.getServiceByIdForDetails(
        serviceId
      );

      console.log("serviceData", serviceData);
      setService(serviceData);
    } catch (error) {
      console.error("Error loading service:", error);
      toast.error("Failed to load service details");
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-muted-foreground mt-1">
            The service you are looking for does not exist.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services">Back to Services List</Link>
        </Button>
      </div>
    );
  }

  // ===== flatten parts from categories (dùng cho tổng tiền + alert) =====
  const allParts =
    service.partCategories?.flatMap((cat) =>
      (cat.parts || []).map((p) => ({
        ...p,
        categoryName: cat.categoryName,
      }))
    ) ?? [];

  console.log("all parts", allParts);

  const totalPartsPrice =
    allParts.reduce((total, part) => total + part.price, 0) || 0;

  const totalServicePrice = (service.price || 0) + totalPartsPrice;

  // toggle mở/đóng 1 category
  const toggleCategory = (id: string) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
            <h2 className="text-3xl font-bold tracking-tight">
              {service.serviceName}
            </h2>
            <p className="text-muted-foreground">{service.description}</p>
          </div>
        </div>
        {canEdit && (

            <Button asChild>
            <Link href={`/admin/services/edit/${service.serviceId}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Service
            </Link>
          </Button>

        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>
              Basic information about this service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Service Category
                </p>
                <p>{service.serviceCategory?.categoryName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Base Price
                  </p>
                  <p className="font-medium">{formatCurrency(service.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Estimated Duration
                  </p>
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

            {/* Tổng tiền parts + service nếu có parts */}
            {allParts.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Parts Cost
                    </p>
                    <p className="font-medium">
                      {formatCurrency(totalPartsPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Service Price
                    </p>
                    <p className="font-semibold text-primary">
                      {formatCurrency(totalServicePrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Available Branches
              </p>
              <div className="flex flex-wrap gap-2">
                {service.branches.map((branch) => (
                  <Badge
                    key={branch.branchId}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    {branch.branchName}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Part Categories / Parts Information (accordion theo category) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Required Part Categories
              {service.partCategories && service.partCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {service.partCategories.length} categories
                </Badge>
              )}
            </CardTitle>
            {/* <CardDescription>
              Click a category to view its parts
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            {service.partCategories && service.partCategories.length > 0 ? (
              <div className="space-y-3">
                {service.partCategories.map((cat) => {
                  const isExpanded = expandedCategoryIds.includes(
                    cat.partCategoryId
                  );
                  const parts = cat.parts || [];

                  return (
                    <div
                      key={cat.partCategoryId}
                      className="border rounded-lg bg-card"
                    >
                      {/* Header category (clickable) */}
                      <button
                        type="button"
                        // onClick={() => toggleCategory(cat.partCategoryId)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {cat.categoryName}
                          </p>
                          {/* <p className="text-xs text-muted-foreground">
                            {parts.length} part{parts.length !== 1 ? "s" : ""}{" "}
                            in this category
                          </p> */}
                        </div>
                        {/* <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        /> */}
                      </button>

                      {/* Content: bảng parts nếu expand */}
                      {/* {isExpanded && (
                        <div className="border-t">
                          {parts.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Part</TableHead>
                                    <TableHead className="text-right">
                                      Unit Price
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Stock
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {parts.map((part, index) => (
                                    <TableRow key={part.partId || index}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Box className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">
                                            {part.name}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(part.price)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <span
                                          className={
                                            part.stock < 5
                                              ? "text-destructive font-medium"
                                              : "text-muted-foreground"
                                          }
                                        >
                                          {formatNumber(part.stock)}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                              No parts in this category.
                            </div>
                          )}
                        </div>
                      )} */}
                    </div>
                  );
                })}

                {/* Stock Alert (global theo allParts) */}
                
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No Part Categories Selected</p>
                <p className="text-sm mt-1">
                  This service does not require specific part categories yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/admin/services">Back to List</Link>
        </Button>
        
      </div>
    </div>
  );
}
