// components/services/ServiceCategoryDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  FolderTree, 
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api';

interface ServiceCategory {
  serviceCategoryId: string;
  categoryName: string;
  serviceTypeId: string;
  parentServiceCategoryId: string | null;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  services?: Service[];
  children?: ServiceCategory[];
}

interface Service {
  serviceId: string;
  serviceCategoryId: string;
  serviceName: string;
  description: string;
  price: number;
  estimatedDuration: number;
  isActive: boolean;
  isAdvanced: boolean;
  createdAt: string;
  updatedAt: string | null;
  serviceCategory: ServiceCategory;
  branches: any[];
  parts: any[];
}

interface CreateServiceCategoryRequest {
  categoryName: string;
  parentServiceCategoryId?: string;
  description: string;
  isActive: boolean;
}

interface UpdateServiceCategoryRequest extends CreateServiceCategoryRequest {
  serviceCategoryId: string;
}

interface ServiceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceCategoryDialog({ open, onOpenChange }: ServiceCategoryDialogProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<ServiceCategory | null>(null);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  const [touchedFields, setTouchedFields] = useState({
    categoryName: false,
    description: false
  });


  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const [availableParentCategories, setAvailableParentCategories] = useState<ServiceCategory[]>([]);
  // Form states
  const [formData, setFormData] = useState({
    categoryName: '',
    parentServiceCategoryId: 'no-parent',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

// effect cho Edit 
 useEffect(() => {
  if (editingCategory) {
    setFormData({
      categoryName: editingCategory.categoryName,
      parentServiceCategoryId: 'loading',
      description: editingCategory.description,
      isActive: editingCategory.isActive,
    });
    setTouchedFields({
      categoryName: false,
      description: false
    });
    loadAvailableParentCategories(editingCategory.serviceCategoryId);
  } else {
    setFormData({
      categoryName: '',
      parentServiceCategoryId: 'no-parent',
      description: '',
      isActive: true,
    });
    setTouchedFields({
      categoryName: false,
      description: false
    });
  }
}, [editingCategory]);






  // Thêm useEffect này để load available parent categories khi editingCategory thay đổi
useEffect(() => {
  if (open && editingCategory) {
    loadAvailableParentCategories(editingCategory.serviceCategoryId);
  } else if (open) {
    loadAvailableParentCategories(null);
  }
}, [editingCategory, open]);

// Update parentServiceCategoryId khi availableParentCategories thay đổi
useEffect(() => {
  if (editingCategory && availableParentCategories.length > 0 && !isLoadingParents) {
    // Tìm parent category hiện tại của editingCategory trong availableParentCategories
    const currentParentId = editingCategory.parentServiceCategoryId;
    const parentExists = availableParentCategories.some(
      cat => cat.serviceCategoryId === currentParentId
    );
    
    // Nếu parent tồn tại trong danh sách available thì chọn, không thì chọn "no-parent"
    const newParentValue = currentParentId && parentExists ? currentParentId : 'no-parent';
    
    setFormData(prev => ({
      ...prev,
      parentServiceCategoryId: newParentValue
    }));
  }
}, [availableParentCategories, editingCategory, isLoadingParents]);

// Thêm hàm loadAvailableParentCategories
const loadAvailableParentCategories = async (currentCategoryId: string | null) => {
  try {
    setIsLoadingParents(true);
    const url = currentCategoryId 
      ? `${API_BASE_URL}/ServiceCategories/parentValid?serviceCategoryId=${currentCategoryId}`
      : `${API_BASE_URL}/ServiceCategories/parentValid`;
    console.log(url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load parent categories: ${response.statusText}`);
    }
    const data: ServiceCategory[] = await response.json();
    console.log(data)

    setAvailableParentCategories(data);
  } catch (error) {
    console.error('Error loading parent categories:', error);
    // Fallback to empty array
    setAvailableParentCategories([]);
  } finally {
    setIsLoadingParents(false);
  }
};


  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/ServiceCategories`);
      
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.statusText}`);
      }
      
      const data: ServiceCategory[] = await response.json();
      
      // Build tree structure
      const categoryMap = new Map<string, ServiceCategory>();
      const rootCategories: ServiceCategory[] = [];
      
      // First pass: create map and copy all categories
      data.forEach(category => {
        categoryMap.set(category.serviceCategoryId, { ...category, children: [] });
      });
      
      // Second pass: build tree structure
      data.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.serviceCategoryId)!;
        
        if (category.parentServiceCategoryId && categoryMap.has(category.parentServiceCategoryId)) {
          const parent = categoryMap.get(category.parentServiceCategoryId)!;
          parent.children!.push(categoryWithChildren);
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });
      
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories', {
        description: 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      toast.error("Validation Error", {
        description: "Category name is required.",
      });
      return;
    }

    if (
      !formData.description.trim() ||
      formData.description.trim().length < 10
    ) {
      toast.error("Validation Error", {
        description:
          "Description is required and must be at least 10 characters.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData: CreateServiceCategoryRequest = {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        ...(formData.parentServiceCategoryId &&
          formData.parentServiceCategoryId !== "no-parent" && {
            parentServiceCategoryId: formData.parentServiceCategoryId,
          }),
      };

      if (editingCategory) {
        // Update
        const updateRequest: UpdateServiceCategoryRequest = {
          ...requestData,
          serviceCategoryId: editingCategory.serviceCategoryId,
        };

        const response = await fetch(
          `${API_BASE_URL}/ServiceCategories/${editingCategory.serviceCategoryId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateRequest),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              errorData.message ||
              response.statusText ||
              "Unknown error"
          );
        }

        toast.success("Category updated successfully");
      } else {
        // Create
        const response = await fetch(`${API_BASE_URL}/ServiceCategories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              errorData.message ||
              response.statusText ||
              "Unknown error"
          );
        }

        toast.success("Category created successfully");
      }

      // Reset form + reset touchedFields ở đây
      setEditingCategory(null);
      setFormData({
        categoryName: "",
        parentServiceCategoryId: "no-parent",
        description: "",
        isActive: true,
      });
      setTouchedFields({
        categoryName: false,
        description: false,
      });

      loadCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(
        `Failed to ${editingCategory ? "update" : "create"} category`,
        {
          description: error.message || "Please try again later.",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (category: ServiceCategory) => {
    console.log(category);
  setDeleteConfirm(category);
};

 const confirmDelete = async () => {
  if (!deleteConfirm) return;

  try {
    const response = await fetch(`${API_BASE_URL}/ServiceCategories/${deleteConfirm.serviceCategoryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // tránh lỗi nếu body không phải JSON
      console.error('Delete failed:', errorData);
      throw new Error(errorData.detail || errorData.message || response.statusText || 'Unknown error');
    }

    toast.success('Category deleted successfully');
    loadCategories();
  } catch (error: any) {
    console.error('Error deleting category:', error);
    toast.error('Failed to delete category', {
      description: error.message || 'Please try again later.'
    });
  } finally {
    setDeleteConfirm(null);
  }
};


  const handleEdit = (category: ServiceCategory) => {
  setEditingCategory(category);
  // Load available parent categories for editing category
  loadAvailableParentCategories(category.serviceCategoryId);
};

  const handleCreateNew = () => {
  setEditingCategory(null);
  setFormData({
    categoryName: '',
    parentServiceCategoryId: 'no-parent',
    description: '',
    isActive: true,
  });
  setTouchedFields({
    categoryName: false,
    description: false
  });
  loadAvailableParentCategories(null);
};

  const getAllCategories = (categories: ServiceCategory[]): ServiceCategory[] => {
    let all: ServiceCategory[] = [];
    categories.forEach(category => {
      all.push(category);
      if (category.children && category.children.length > 0) {
        all = all.concat(getAllCategories(category.children));
      }
    });
    return all;
  };

const renderCategoryTree = (categories: ServiceCategory[], level = 0) => {
  return categories.map(category => (
    <div key={category.serviceCategoryId}>
      {/* Category Row */}
      <div className={`flex items-center border-b hover:bg-muted/20 ${level > 0 ? 'bg-muted/10' : ''}`}>
        {/* Category Name */}
        <div 
          className="flex items-center min-w-[200px] p-4 font-medium flex-1"
          style={{ paddingLeft: `${16 + level * 20}px` }}
        >
          <div className="flex items-center space-x-2">
            {category.children && category.children.length > 0 ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleCategory(category.serviceCategoryId)}
              >
                {expandedCategories.has(category.serviceCategoryId) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            <span className="truncate">{category.categoryName}</span>
          </div>
        </div>
        
        {/* Description */}
        <div className="min-w-[200px] max-w-[300px] p-4 flex-1">
          <div className="truncate" title={category.description}>
            {category.description}
          </div>
        </div>
        
        {/* Status */}
        <div className="w-20 p-4">
          <Badge 
            variant={category.isActive ? "default" : "secondary"}
            className={category.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
          >
            {category.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        {/* Services Count */}
        <div className="w-16 p-4 text-center">
          {category.services?.length || 0}
        </div>
        
        {/* Actions */}
        <div className="w-24 p-4">
          <div className="flex space-x-1">
            <Button
      variant="outline"
      size="icon"
      onClick={() => handleEdit(category)}
      className="h-8 w-8"
    >
      <Pencil className="h-3 w-3" />
              </Button>
              {/* Chỉ hiển thị nút xóa nếu category không có con và không có services */}
              {(!category.children || category.children.length === 0) && 
              (!category.services || category.services.length === 0) && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(category)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              {/* Nếu có con hoặc có services thì hiển thị placeholder để giữ layout */}
              {((category.children && category.children.length > 0) || 
                (category.services && category.services.length > 0)) && (
                <div className="w-8 h-8" /> // Placeholder để giữ layout
              )}
          </div>
        </div>
      </div>
      
      {/* Children */}
      {category.children && 
       category.children.length > 0 &&
       expandedCategories.has(category.serviceCategoryId) && 
       renderCategoryTree(category.children, level + 1)
      }
    </div>
  ));
};



  const allCategories = getAllCategories(categories);




  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden flex flex-col p-0"
        style={{
          width: "98vw",
          height: "98vh",
          maxWidth: "98vw",
          maxHeight: "98vh",
        }}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FolderTree className="h-5 w-5" />
            Service Categories Management
          </DialogTitle>
          <DialogDescription>
            Manage service categories and subcategories. Categories help
            organize your services.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Form Section - Left Sidebar */}
          <div className="lg:col-span-1 border rounded-lg p-4 bg-card h-fit lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              {editingCategory && (
                <Button variant="outline" size="sm" onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName" className="text-sm font-medium">
                  Category Name *
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (at least 3 characters)
                  </span>
                </Label>
                <Input
                  id="categoryName"
                  value={formData.categoryName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryName: e.target.value,
                    }))
                  }
                  onBlur={() => handleBlur("categoryName")}
                  placeholder="Enter category name (minimum 3 characters)"
                  className={`h-9 ${
                    touchedFields.categoryName &&
                    formData.categoryName.length > 0 &&
                    formData.categoryName.length < 3
                      ? "border-destructive focus-visible:ring-destructive"
                      : touchedFields.categoryName &&
                        formData.categoryName.length >= 3
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }`}
                  required
                />
                {touchedFields.categoryName && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {formData.categoryName.length < 3 ? (
                        <span className="text-destructive">
                          {3 - formData.categoryName.length} more characters
                          required
                        </span>
                      ) : (
                        <span className="text-green-600">
                          ✓ Minimum length satisfied
                        </span>
                      )}
                    </span>
                    <span>{formData.categoryName.length}/3</span>
                  </div>
                )}
              </div>

              {/* Sửa phần Select parent category thành: */}
              <div className="space-y-2">
                <Label htmlFor="parentCategory" className="text-sm font-medium">
                  Parent Category
                  {isLoadingParents && (
                    <Loader2 className="h-3 w-3 animate-spin inline ml-2" />
                  )}
                </Label>
                <Select
                  value={formData.parentServiceCategoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      parentServiceCategoryId: value,
                    }))
                  }
                  disabled={isLoadingParents}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue
                      placeholder={
                        isLoadingParents
                          ? "Loading parent categories..."
                          : "Select parent category (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-parent">
                      No parent (Root category)
                    </SelectItem>
                    {availableParentCategories.map((category) => (
                      <SelectItem
                        key={category.serviceCategoryId}
                        value={category.serviceCategoryId}
                      >
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isLoadingParents && (
                  <p className="text-xs text-muted-foreground">
                    Loading available parent categories...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (at least 10 characters)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  onBlur={() => handleBlur("description")}
                  placeholder="Enter category description (minimum 10 characters)"
                  className="min-h-[80px] resize-vertical"
                  required
                />
                {touchedFields.description && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {formData.description.length < 10 ? (
                        <span className="text-destructive">
                          {10 - formData.description.length} more characters
                          required
                        </span>
                      ) : (
                        <span className="text-green-600">
                          ✓ Minimum length satisfied
                        </span>
                      )}
                    </span>
                    <span>{formData.description.length}/10</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Active
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingParents}
                  className="h-9 min-w-[140px]"
                >
                  {(isSubmitting || isLoadingParents) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>

          {/* Categories List Section - Right Content */}
          <div className="lg:col-span-2 border rounded-lg overflow-hidden bg-card flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-muted/50 shrink-0">
              <h3 className="text-lg font-semibold">Categories Tree View</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {allCategories.length} categories
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCategories}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading categories...
                    </p>
                  </div>
                </div>
              ) : categories.length > 0 ? (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center border-b bg-background sticky top-0 z-10 font-semibold">
                    <div className="min-w-[200px] p-4 flex-1">
                      Category Name
                    </div>
                    <div className="min-w-[200px] p-4 flex-1">Description</div>
                    <div className="w-20 p-4">Status</div>
                    <div className="w-16 p-4 text-center">Services</div>
                    <div className="w-24 p-4">Actions</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-auto">
                    {renderCategoryTree(categories)}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center p-6">
                  <FolderTree className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="font-medium text-muted-foreground">
                    No categories found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first category to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-background border rounded-lg shadow-lg p-6 max-w-sm mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">Delete Category</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Delete "{deleteConfirm.categoryName}"? This cannot be
                    undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}