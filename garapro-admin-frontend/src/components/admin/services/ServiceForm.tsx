// components/services/ServiceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service, ServiceType, Part, Branch, PartCategory } from '@/services/service-Service';
import { serviceService } from '@/services/service-Service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Search, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ServiceFormProps {
  service?: Service;
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

export default function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<any[]>([]);

  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Thêm state cho basePrice input
  const [basePriceInput, setBasePriceInput] = useState(
    service?.basePrice ? formatNumber(service.basePrice) : ''
  );

  const [touchedFields, setTouchedFields] = useState({
  name: false,
  serviceType: false,
  basePrice: false,
  branches: false,
  durationEstimate: false,
  description: false
});
  
  const [formData, setFormData] = useState({
  name: service?.name || '',
  description: service?.description || '',
  serviceTypeId: service?.serviceType?.id || '',
  basePrice: service?.basePrice || 1000,
  estimatedDuration: service?.estimatedDuration || 1,
  isActive: service?.isActive ?? true,
  isAdvanced: service?.isAdvanced ?? true,
  branchIds: service?.branchIds || [],
  partIds: service?.partIds || [] // Đảm bảo có phần này
});
// Thêm validation cho description
const isDescriptionValid = formData.description.length === 0 || 
  (formData.description.length >= 10 && formData.description.length <= 500);

// Thêm validation cho service name
const isNameValid = formData.name.length >= 3 && formData.name.length <= 100;

useEffect(() => {
  loadData();
}, []);
useEffect(() => {
  if (service && service.partIds && service.partIds.length > 0) {
    setSelectedPartIds(service.partIds);
  }
}, [service]);
// Chỉ MỘT useEffect để xử lý khi categories loaded và có service
// Sửa useEffect khởi tạo categories từ service
// Sửa useEffect khởi tạo categories từ service
useEffect(() => {
  if (categoriesLoaded && service && service.serviceType) {
    const serviceTypeId = service.serviceType.id;
    const parentCategoryId = service.serviceType.parentServiceCategoryId;
    
    console.log('Initializing from service:', {
      serviceTypeId,
      parentCategoryId,
      serviceTypeName: service.serviceType.name
    });

    if (parentCategoryId) {
      // Đặt parent category trước
      setSelectedParentCategory(parentCategoryId);
      
      // ĐỢI cho đến khi availableSubCategories được cập nhật từ parent
      // rồi mới set sub category
      const timer = setTimeout(() => {
        setSelectedSubCategory(serviceTypeId);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // ServiceType là parent category
      setSelectedParentCategory(serviceTypeId);
      setSelectedSubCategory('');
    }
  }
}, [categoriesLoaded, service, serviceCategories]);

useEffect(() => {
  if (selectedParentCategory && service && availableSubCategories.length > 0) {
    const serviceTypeId = service.serviceType?.id;
    // Kiểm tra xem serviceTypeId có trong availableSubCategories không
    const exists = availableSubCategories.some(sub => sub.serviceCategoryId === serviceTypeId);
    if (exists && !selectedSubCategory) {
      setSelectedSubCategory(serviceTypeId);
    }
  }
}, [availableSubCategories, selectedParentCategory, service, selectedSubCategory]);

// Chỉ MỘT useEffect để xử lý khi parent category thay đổi
useEffect(() => {
  if (selectedParentCategory) {
    const selectedParent = serviceCategories.find(cat => 
      cat.serviceCategoryId === selectedParentCategory
    );
    const subCategories = selectedParent?.childCategories || [];
    setAvailableSubCategories(subCategories);
    
    // LUÔN reset sub category khi parent thay đổi
    setSelectedSubCategory('');
  }
}, [selectedParentCategory, serviceCategories]);

// Chỉ MỘT useEffect để xử lý serviceTypeId
useEffect(() => {
  // Ưu tiên dùng sub category, nếu không có thì dùng parent (nếu parent không có child)
  if (selectedSubCategory) {
    setFormData(prev => ({ ...prev, serviceTypeId: selectedSubCategory }));
  } else if (selectedParentCategory && availableSubCategories.length === 0) {
    setFormData(prev => ({ ...prev, serviceTypeId: selectedParentCategory }));
  }
}, [selectedSubCategory, selectedParentCategory, availableSubCategories.length]);

const loadData = async () => {
  try {
    setIsLoading(true);
    const [categoriesData, partCategoriesData, branchesData] = await Promise.all([
      serviceService.getParentCategories(),
      serviceService.getPartCategories(),
      serviceService.getBranches()
    ]);

    setServiceCategories(categoriesData);
    setPartCategories(partCategoriesData);
    setBranches(branchesData);
    setCategoriesLoaded(true);

    toast.success('Form data loaded successfully');
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Failed to load form data', {
      description: 'Please refresh the page and try again.'
    });
  } finally {
    setIsLoading(false);
  }
};
  // Get all parts from categories
  const allParts = partCategories.flatMap(category => 
    category.parts.map(part => ({
      ...part,
      categoryName: category.categoryName
    }))
  );

  // Filter parts based on search and category
  const filteredParts = allParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           part.partCategoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [
    { partCategoryId: 'all', categoryName: 'All Categories' },
    ...partCategories
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitToast = toast.loading(
      service ? 'Updating service...' : 'Creating new service...',
      {
        description: 'Please wait while we save your changes.'
      }
    );

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        serviceTypeId: formData.serviceTypeId,
        basePrice: formData.basePrice,
        estimatedDuration: formData.estimatedDuration,
        isActive: formData.isActive,
        branchIds: formData.branchIds,
        partIds: selectedPartIds
      };

      if (service) {
        await serviceService.updateService(service.id, serviceData);
        toast.success('Service updated successfully', {
          description: `${formData.name} has been updated.`,
          id: submitToast
        });
      } else {
        await serviceService.createService(serviceData);
        toast.success('Service created successfully', {
          description: `${formData.name} has been created.`,
          id: submitToast
        });
      }

      // Delay redirect to show success message
      setTimeout(() => {
        router.push('/admin/services');
        router.refresh();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error saving service:', error);
      
      let errorDescription = 'Please check your input and try again.';
      
      if (error.message && error.message.includes('HTTP error')) {
        const errorMatch = error.message.match(/message: (.+)$/);
        const serverMessage = errorMatch ? errorMatch[1] : 'Unknown server error';
        errorDescription = serverMessage;
      }

      toast.error('Failed to save service', {
        description: errorDescription,
        id: submitToast
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePartSelection = (partId: string) => {
    setSelectedPartIds(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const removePart = (partId: string) => {
    const part = allParts.find(p => p.id === partId);
    setSelectedPartIds(prev => prev.filter(id => id !== partId));
    toast.success('Part removed', {
      description: `${part?.name} has been removed from this service.`
    });
  };

  const toggleBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    const isAdding = !formData.branchIds.includes(branchId);
    
    setFormData(prev => ({
      ...prev,
      branchIds: isAdding
        ? [...prev.branchIds, branchId]
        : prev.branchIds.filter(id => id !== branchId)
    }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    toast.info('Filters cleared');
  };

  // Get selected parts list
  const selectedParts = allParts.filter(part => selectedPartIds.includes(part.id));

  // Calculate total parts price
  const totalPartsPrice = selectedParts.reduce((total, part) => total + part.price, 0);


  // Hàm để mark field as touched
  const markFieldAsTouched = (fieldName: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, ''); // Remove existing dots
    const numericValue = parseFloat(rawValue) || 0;
    
    setBasePriceInput(formatNumber(numericValue)); // Format for display
    setFormData({ ...formData, basePrice: numericValue });
  };

  const handleBasePriceBlur = () => {
  markFieldAsTouched('basePrice');
  // Ensure minimum value
  if (formData.basePrice < 1000) {
    const minValue = 1000;
    setBasePriceInput(formatNumber(minValue));
    setFormData({ ...formData, basePrice: minValue });
  }
};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div>
            <p className="text-lg font-medium">Loading form data</p>
            <p className="text-sm text-muted-foreground">Please wait while we prepare the form</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href="/admin/services">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to services</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {service ? 'Edit Service' : 'Create New Service'}
          </h2>
          <p className="text-muted-foreground">
            {service ? 'Update your service details' : 'Add a new service to your offerings'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Service Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Service Details
              </CardTitle>
              <CardDescription>
                Basic information about the service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Service Name
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => markFieldAsTouched('name')}
                    placeholder="Enter service name"
                    required
                    className="focus-visible:ring-primary"
                  />
                  <div className="flex justify-between text-xs">
                    <span className={touchedFields.name && !isNameValid ? "text-destructive" : "text-muted-foreground"}>
                      {formData.name.length}/100 characters
                      {touchedFields.name && !isNameValid && (
                        <span className="ml-2">
                          Service name must be between 3-100 characters
                        </span>
                      )}
                    </span>
                    {formData.name.length > 0 && (
                      <span className={isNameValid ? "text-green-600" : "text-destructive"}>
                        {isNameValid ? "✓ Valid" : "✗ Invalid"}
                      </span>
                    )}
                  </div>
                </div>

              <div className="space-y-2">
                  <Label htmlFor="description">Description
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onBlur={() => markFieldAsTouched('description')}
                    placeholder="Enter service description"
                    rows={3}
                    className="resize-none focus-visible:ring-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {formData.description.length}/500 characters
                      {touchedFields.description && !isDescriptionValid && (
                        <span className="text-destructive ml-2">
                          Description must be between 10-500 characters
                        </span>
                      )}
                    </span>
                    {formData.description.length > 0 && (
                      <span className={formData.description.length < 10 || formData.description.length > 500 ? "text-destructive" : "text-green-600"}>
                        {isDescriptionValid ? "✓ Valid" : "✗ Invalid"}
                      </span>
                    )}
                  </div>
                </div>

              <div className="space-y-2">
                <Label htmlFor="serviceTypeId" className="flex items-center gap-2">
                  Service Category
                  <span className="text-destructive">*</span>
                </Label>
  
              {/* Main Category Selector */}
              <Select
                  value={selectedParentCategory}
                  onValueChange={(value) => {
                    setSelectedParentCategory(value);
                    markFieldAsTouched('serviceType');
                  }}
                  required
                >
                  <SelectTrigger className="focus-visible:ring-primary">
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories
                      .filter(cat => cat.isActive)
                      .map((category) => (
                        <SelectItem key={category.serviceCategoryId} value={category.serviceCategoryId}>
                          {category.categoryName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                  {/* Sub Category Selector - chỉ hiển thị khi có subcategories */}
                   {availableSubCategories.length > 0 && (
                      <div className="mt-3">
                        <Label htmlFor="subCategoryId" className="flex items-center gap-2 text-sm">
                          Sub Category
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={selectedSubCategory}
                          onValueChange={(value) => {
                            setSelectedSubCategory(value);
                            markFieldAsTouched('serviceType');
                          }}
                          required={availableSubCategories.length > 0}
                        >
                          <SelectTrigger className="focus-visible:ring-primary mt-1">
                            <SelectValue placeholder="Select sub category" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubCategories
                              .filter(subCat => subCat.isActive)
                              .map((subCategory) => (
                                <SelectItem key={subCategory.serviceCategoryId} value={subCategory.serviceCategoryId}>
                                  {subCategory.categoryName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Please select a specific sub-category for this service
                        </p>
                        
                      </div>
                    )}

                    {/* Validation for category selection */}
                    {touchedFields.serviceType && !selectedParentCategory && (
                      <p className="text-sm text-destructive">Main category is required</p>
                    )}
                    {touchedFields.serviceType && selectedParentCategory && availableSubCategories.length > 0 && !selectedSubCategory && (
                      <p className="text-sm text-destructive">Please select a sub category</p>
                    )}

                  {/* Hiển thị giá trị đã chọn */}
                  {formData.serviceTypeId && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm">
                      <span className="font-medium">Selected: </span>
                      {serviceCategories.find(cat => 
                        cat.serviceCategoryId === selectedParentCategory
                      )?.categoryName}
                      {selectedSubCategory && (
                        <>
                          <span className="mx-2">→</span>
                          {availableSubCategories.find(sub => 
                            sub.serviceCategoryId === selectedSubCategory
                          )?.categoryName}
                        </>
                      )}
                    </div>
                  )}
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="flex items-center gap-2">
                    Base Price
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    type="text" // Change to text to handle formatting
                    value={basePriceInput}
                    onChange={handleBasePriceChange}
                    onBlur={handleBasePriceBlur}
                    placeholder="0"
                    required
                    className="focus-visible:ring-primary  font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.basePrice)}
                  </p>
                  {touchedFields.basePrice && formData.basePrice < 1000 && (
                    <p className="text-sm text-destructive">
                      Base price must be greater than or equal to {formatCurrency(1000)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estimatedDuration" className="flex items-center gap-2">
                      Duration (minutes)
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      min="1"
                      value={formData.estimatedDuration}
                      onBlur={() => markFieldAsTouched('durationEstimate')}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value)})}
                      placeholder="30"
                      required
                      className="focus-visible:ring-primary"
                    />
                    {touchedFields.durationEstimate && formData.estimatedDuration < 1 && (
                      <p className="text-sm text-destructive">Duration must be at least 1 minute</p>
                    )}
                  </div>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  className="data-[state=checked]:bg-primary"
                />               
                <Label htmlFor="isActive" className="cursor-pointer flex-1">
                  <div className="font-medium">Active Service</div>
                  <div className="text-sm text-muted-foreground">
                    {formData.isActive 
                      ? 'This service is available for booking' 
                      : 'This service is hidden from customers'
                    }
                  </div>
                </Label>
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>


               <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
                  <Switch
                    id="isAdvanced"
                    checked={formData.isAdvanced}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAdvanced: checked })}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="isAdvanced" className="cursor-pointer flex-1">
                    <div className="font-medium">Advanced Service</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.isAdvanced
                        ? 'This is an advanced-level service available to users.'
                        : 'This is a basic service available to users.'}
                    </div>
                  </Label>
                  <Badge variant={formData.isAdvanced ? "default" : "secondary"}>
                    {formData.isAdvanced ? 'Advanced' : 'Basic'}
                  </Badge>
                </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Required Parts Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Required Parts
                </CardTitle>
                <CardDescription>
                  Select parts needed for this service (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search parts or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10 focus-visible:ring-primary"
                      />
                      {searchTerm && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-[180px] focus-visible:ring-primary">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.partCategoryId} value={category.partCategoryId}>
                            {category.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(searchTerm || selectedCategory !== 'all') && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {filteredParts.length} parts found
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </div>

                {/* Parts Selection Grid */}
                <div className="border rounded-lg bg-card">
                    <div className="max-h-48 overflow-y-auto">
                      {filteredParts.length > 0 ? (
                        <div className="p-2 space-y-2">
                          {filteredParts.map((part) => (
                            <div
                              key={part.id}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedPartIds.includes(part.id)
                                  ? 'bg-primary/10 border-primary shadow-sm'
                                  : 'hover:bg-muted/50 border-muted'
                              }`}
                              onClick={() => togglePartSelection(part.id)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  {/* Đổi thành hình vuông */}
                                  <div className={`w-4 h-4 border-2 flex items-center justify-center rounded ${
                                    selectedPartIds.includes(part.id)
                                      ? 'bg-primary border-primary'
                                      : 'border-muted-foreground'
                                  }`}>
                                    {selectedPartIds.includes(part.id) && (
                                      <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{part.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {part.categoryName} • {formatCurrency(part.price)} • Stock: {formatNumber(part.stock)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Badge 
                                variant={selectedPartIds.includes(part.id) ? "default" : "outline"}
                                className="ml-2"
                              >
                                {selectedPartIds.includes(part.id) ? 'Selected' : 'Select'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No parts found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Selected Parts Table */}
                {selectedParts.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Selected Parts ({selectedParts.length})</h4>
                      <Badge variant="secondary">
                        Parts Total: {formatCurrency(totalPartsPrice)}
                      </Badge>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedParts.map((part) => (
                            <TableRow key={part.id}>
                              <TableCell className="font-medium">
                                {part.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {part.categoryName}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(part.price)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span className={part.stock < 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                                    {formatNumber(part.stock)}
                                  </span>
                                  {part.stock < 5 && (
                                    <AlertCircle className="h-3 w-3 text-destructive" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePart(part.id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remove part</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No parts selected</p>
                    <p className="text-sm mt-1">Select parts from the list above if this service requires specific components</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Branches Card */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Available Branches
                <span className="text-destructive">*</span>
              </CardTitle>
              <CardDescription>
                Select branches where this service is offered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {branches.filter(branch => branch.isActive).length > 0 ? (
                <div 
                  className="flex flex-wrap gap-2"
                  onClick={() => markFieldAsTouched('branches')}
                >
                  {branches
                    .filter(branch => branch.isActive)
                    .map((branch) => (
                      <Badge
                        key={branch.id}
                        variant={formData.branchIds.includes(branch.id) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-2 text-sm transition-all hover:scale-105"
                        onClick={() => toggleBranch(branch.id)}
                      >
                        {branch.name}
                        {formData.branchIds.includes(branch.id) && (
                          <CheckCircle2 className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active branches available</p>
                </div>
              )}
              
              {touchedFields.branches && formData.branchIds.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select at least one branch where this service will be offered.
                  </AlertDescription>
                </Alert>
              )}

              {formData.branchIds.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Selected {formData.branchIds.length} branch{formData.branchIds.length !== 1 ? 'es' : ''}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild disabled={isSubmitting}>
            <Link href="/admin/services">
              Cancel
            </Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || 
              !isNameValid || // Thay !formData.name bằng !isNameValid
              !formData.serviceTypeId || 
              formData.branchIds.length === 0 ||
              !isDescriptionValid ||
              // Thêm validation: nếu category cha có con thì phải chọn con
              (availableSubCategories.length > 0 && 
              !availableSubCategories.some(subCat => subCat.serviceCategoryId === formData.serviceTypeId))
            }
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {service ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {service ? 'Update Service' : 'Create Service'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Package icon component
const Package = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);