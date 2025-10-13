// components/services/ServiceList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Service } from '@/services/service-Service';
import { serviceService } from '@/services/service-Service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Clock, 
  DollarSign, 
  MapPin, 
  Eye,
  Loader2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Square,
  Play,
  Pause,
  Zap,
  FolderTree
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import  ServiceCategoryDialog from '@/components/admin/services/ServiceCategoryDialog'
import { Part } from '@/types/service';

// Currency formatting function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
const TotalPrice = (service: Service): string => {
  const totalPartsPrice = service?.parts?.reduce((t, p) => t + p.price, 0) || 0;
  const total = (service?.basePrice || 0) + totalPartsPrice;
  console.log("partPrice",totalPartsPrice)
  return `${formatCurrency(total)} (base + parts)`;
};
// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface ServiceFilterParams {
  searchTerm?: string;
  status?: string;
  serviceTypeId?: string;
  pageNumber: number;
  pageSize: number;
}

interface PaginatedResponse {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Service[];
}

interface BulkAction {
  type: 'delete' | 'activate' | 'deactivate' | 'toggle-advance';
  services: Service[];
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkAction, setIsBulkAction] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);


  // Selection states
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  
  // Pagination states
  const [pagination, setPagination] = useState<PaginationInfo>({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false
  });

  // Debounced search term - waits 500ms after user stops typing
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadServices();
    loadServiceTypes();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
    setSelectedServices(new Set());
    setIsAllSelected(false);
  }, [debouncedSearchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    loadServices();
  }, [pagination.pageNumber, pagination.pageSize, debouncedSearchTerm, statusFilter, typeFilter]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      
      const filterParams: ServiceFilterParams = {
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceTypeId: typeFilter !== 'all' ? typeFilter : undefined,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize
      };

      const response: PaginatedResponse = await serviceService.getServicesWithPagination(filterParams);
      
      setServices(response.data);
      
      // Update pagination info from API response
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        hasPrevious: response.pageNumber > 1,
        hasNext: response.pageNumber < response.totalPages
      });
      
      // Reset selection when services change
      setSelectedServices(new Set());
      setIsAllSelected(false);
      
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services', {
        description: 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceTypes = async () => {
    try {
      const types = await serviceService.getServiceTypes();
      setServiceTypes(types);
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  };

  // Selection handlers
  const toggleServiceSelection = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
    setIsAllSelected(newSelected.size === services.length && services.length > 0);
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedServices(new Set());
    } else {
      const allIds = new Set(services.map(service => service.id));
      setSelectedServices(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  const getSelectedServices = (): Service[] => {
    return services.filter(service => selectedServices.has(service.id));
  };

  // Single service actions
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
    setIsBulkAction(false);
  };

  const handleDeleteConfirm = async () => {
  if (!serviceToDelete && !bulkAction) return;

  try {
    setIsDeleting(true);
    
    if (isBulkAction && bulkAction) {
      // Bulk delete
      const promises = bulkAction.services.map(service => 
        serviceService.deleteService(service.id)
      );
      await Promise.all(promises);
      
      toast.success('Services deleted successfully', {
        description: `${bulkAction.services.length} services have been removed.`
      });
    } else if (serviceToDelete) {
      // Single delete
      await serviceService.deleteService(serviceToDelete.id);
      
      toast.success('Service deleted successfully', {
        description: `${serviceToDelete.name} has been removed.`
      });
    }
    
    loadServices(); // Reload the list
    setSelectedServices(new Set());
    setIsAllSelected(false);
    
  } catch (error: any) {
    console.error('Error deleting service:', error);
    
    if (error.message && error.message.includes('HTTP error')) {
      const errorMatch = error.message.match(/message: (.+)$/);
      const serverMessage = errorMatch ? errorMatch[1] : 'Unknown server error';
      toast.error('Failed to delete service', {
        description: serverMessage
      });
    } else {
      toast.error('Failed to delete service', {
        description: 'Please try again later.'
      });
    }
  } finally {
    // Luôn reset state trong finally block
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setBulkActionDialogOpen(false);
    setServiceToDelete(null);
    setBulkAction(null);
    setIsBulkAction(false);
  }
};

  // Bulk actions
  const handleBulkDelete = () => {
    const selected = getSelectedServices();
    if (selected.length === 0) return;
    
    setBulkAction({
      type: 'delete',
      services: selected
    });
    setBulkActionDialogOpen(true);
    setIsBulkAction(true);
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
  const selected = getSelectedServices();
  if (selected.length === 0) return;

  try {
    setIsBulkAction(true);
    
    // Chỉ sử dụng bulkUpdateServiceStatus
    const serviceIds = selected.map(service => service.id);
    await serviceService.bulkUpdateServiceStatus(serviceIds, isActive);
    
    toast.success(`Services ${isActive ? 'activated' : 'deactivated'} successfully`, {
      description: `${selected.length} services have been ${isActive ? 'activated' : 'deactivated'}.`
    });
    
    loadServices();
    setSelectedServices(new Set());
    setIsAllSelected(false);
    
  } catch (error: any) {
    console.error('Error updating services:', error);
    toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} services`, {
      description: error.message || 'Please try again later.'
    });
  } finally {
    setIsBulkAction(false);
  }
};


 const handleBulkAdvanceToggle = async (setToAdvance: boolean) => {
  const selected = getSelectedServices();
  if (selected.length === 0) return;

  try {
    setIsBulkAction(true);
    
    const serviceIds = selected.map(service => service.id);
    await serviceService.bulkUpdateServiceAdvanceStatus(serviceIds, setToAdvance);
    
    toast.success('Services updated successfully', {
      description: `${selected.length} services have been ${setToAdvance ? 'marked as' : 'removed from'} advance booking.`
    });
    
    loadServices();
    setSelectedServices(new Set());
    setIsAllSelected(false);
    
  } catch (error: any) {
    console.error('Error updating services:', error);
    toast.error('Failed to update services', {
      description: error.message || 'Please try again later.'
    });
  } finally {
    setIsBulkAction(false);
  }
};

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const selectedCount = selectedServices.size;
  const hasSelection = selectedCount > 0;

  return (
    <div className="space-y-6">    
      {/* Category management */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">
            Manage all services offered at your branches
          </p>
        </div>
        <>
        <div className="flex items-center space-x-1">
      {hasSelection && (
  <>
    {/* Chỉ hiển thị Activate nếu có ít nhất 1 service đang inactive */}
    {getSelectedServices().some(service => !service.isActive) && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleBulkStatusUpdate(true)}
        disabled={isBulkAction}
      >
        <Play className="mr-1 h-4 w-4" />
        Activate ({selectedCount})
      </Button>
    )}

    {/* Chỉ hiển thị Deactivate nếu có ít nhất 1 service đang active */}
    {getSelectedServices().some(service => service.isActive) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkStatusUpdate(false)}
          disabled={isBulkAction}
        >
          <Pause className="mr-1 h-4 w-4" />
          Deactivate ({selectedCount})
        </Button>
      )}

      {/* Hiển thị Toggle Advance với label thông minh */}
      {getSelectedServices().some(service => !service.isAdvanced) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAdvanceToggle(true)}
                disabled={isBulkAction}
              >
                <Zap className="mr-1 h-4 w-4" />
                Set Advance ({selectedCount})
              </Button>
            )}

            {getSelectedServices().some(service => service.isAdvanced) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAdvanceToggle(false)}
                disabled={isBulkAction}
              >
                <Zap className="mr-1 h-4 w-4" />
                Remove Advance ({selectedCount})
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkAction}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete ({selectedCount})
            </Button>
          </>
      )}
          </div>

        
        </>
        <div className="flex items-center gap-2">
          {/* Thêm nút Manage Categories */}
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <FolderTree className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {serviceTypes.filter(type => type.isActive).map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium invisible">Actions</label>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service List</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading services...</span>
                  </div>
                ) : (
                  `Showing ${services.length} of ${pagination.totalCount} services`
                )}
              </CardDescription>
            </div>
            {pagination.totalCount > 0 && !isLoading && (
              <Badge variant="secondary" className="text-sm">
                Page {pagination.pageNumber} of {pagination.totalPages}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && services.length === 0 ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <div>
                  <p className="text-lg font-medium">Loading services</p>
                  <p className="text-sm text-muted-foreground">Please wait while we load your services</p>
                </div>
              </div>
            </div>
          ) : services.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all services"
                        />
                      </TableHead>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Advance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id} className="group">
                        <TableCell>
                          <Checkbox
                            checked={selectedServices.has(service.id)}
                            onCheckedChange={() => toggleServiceSelection(service.id)}
                            aria-label={`Select ${service.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {service.serviceType?.name || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            {service.estimatedDuration} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm font-medium">
                            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                            
                            {TotalPrice(service)}                            
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                            {service.branchIds.length} branch{service.branchIds.length !== 1 ? 'es' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={service.isActive ? "default" : "secondary"}
                            className={service.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={service.isAdvanced ? "default" : "outline"}
                            className={service.isAdvanced ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
                          >
                            {service.isAdvanced ? "Advance" : "Regular"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/admin/services/view/${service.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/admin/services/edit/${service.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteClick(service)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Rows per page:
                  </span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {pagination.pageNumber} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.pageNumber === 1 || isLoading}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(pagination.pageNumber - 1)}
                      disabled={!pagination.hasPrevious || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(pagination.pageNumber + 1)}
                      disabled={!pagination.hasNext || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.pageNumber === pagination.totalPages || isLoading}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="space-y-4">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium">No services found</p>
                  <p className="text-muted-foreground">
                    {pagination.totalCount === 0 
                      ? "Get started by creating your first service."
                      : "Try adjusting your search or filters."
                    }
                  </p>
                </div>
                {pagination.totalCount === 0 && (
                  <Button asChild>
                    <Link href="/admin/services/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Service
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog 
          open={deleteDialogOpen} 
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              // Reset deleting state when dialog closes (including when cancel is clicked)
              setIsDeleting(false);
              setServiceToDelete(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the service
                <span className="font-semibold"> "{serviceToDelete?.name}"</span> and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Service
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog 
          open={bulkActionDialogOpen} 
          onOpenChange={(open) => {
            setBulkActionDialogOpen(open);
            if (!open) {
              // Reset deleting state when dialog closes
              setIsDeleting(false);
              setBulkAction(null);
              setIsBulkAction(false);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <span className="font-semibold">{bulkAction?.services.length} services</span>:
                <ul className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {bulkAction?.services.map(service => (
                    <li key={service.id} className="text-sm py-1">
                      • {service.name}
                    </li>
                  ))}
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete {bulkAction?.services.length} Services
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        
        <ServiceCategoryDialog 
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
        />
    </div>
    
  );
}