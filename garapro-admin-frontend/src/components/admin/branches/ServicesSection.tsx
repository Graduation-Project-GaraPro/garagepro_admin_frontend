// components/admin/branches/ServicesSection.tsx
import React, { useState, useMemo, useEffect, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  X,
  ChevronDown,
  ChevronRight,
  Search,
  AlertCircle,
} from "lucide-react";
import { ServiceCategory } from "@/services/branch-service";
import { Badge } from "@/components/ui/badge";

type ServicesSectionProps = {
  /** Danh sách id dịch vụ đã chọn (từ parent) */
  selectedServiceIds: string[];
  /** Lỗi validation chỉ cho field này (không truyền nguyên errors object lớn) */
  errors?: { serviceIds?: string };
  categories: ServiceCategory[];
  parentCategories: ServiceCategory[];
  onServiceToggle: (serviceId: string, selected: boolean) => void;
  onServiceRemove: (serviceId: string) => void;
};

function ServicesSectionImpl({
  selectedServiceIds,
  errors = {},
  categories,
  parentCategories,
  onServiceToggle,
  onServiceRemove,
}: ServicesSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [parentCategoryFilter, setParentCategoryFilter] =
    useState<string>("all");

  /** Set tham chiếu ổn định từ mảng id đã chọn */
  const selectedIdsSet = useMemo(
    () => new Set(selectedServiceIds),
    [selectedServiceIds]
  );

  /** Danh sách dịch vụ đã chọn (phục vụ khối Selected Services) */
  const selectedServices = useMemo(() => {
    if (selectedIdsSet.size === 0) return [];
    const all = categories.flatMap((c) => c.services);
    return all.filter((s) => selectedIdsSet.has(s.serviceId));
  }, [categories, selectedIdsSet]);

  /** Lọc categories theo search + filter, chỉ giữ category còn service sau lọc */
  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const isAllParent = parentCategoryFilter === "all";
    const isAllStatus = statusFilter === "all";

    return categories
      .filter((category) => category.isActive) // chỉ hiển thị category active
      .map((category) => {
        const services = category.services.filter((service) => {
          // search
          const inSearch =
            q === "" ||
            service.serviceName.toLowerCase().includes(q) ||
            service.description.toLowerCase().includes(q) ||
            category.categoryName.toLowerCase().includes(q);

          // status
          const inStatus =
            isAllStatus ||
            (statusFilter === "active" && service.isActive) ||
            (statusFilter === "inactive" && !service.isActive);

          // parent category filter
          const inParent =
            isAllParent ||
            category.parentServiceCategoryId === parentCategoryFilter;

          return inSearch && inStatus && inParent;
        });
        return { ...category, services };
      })
      .filter((category) => category.services.length > 0);
  }, [categories, searchTerm, statusFilter, parentCategoryFilter]);

  /** Auto-expand khi có searchTerm để lộ các category khớp */
  useEffect(() => {
    if (searchTerm) {
      const ids = new Set(filteredCategories.map((c) => c.serviceCategoryId));
      setExpandedCategories(ids);
    }
    // khi clear search, không bắt buộc collapse (giữ trạng thái user)
  }, [searchTerm, filteredCategories]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });
  }, []);

  const isCategoryExpanded = useCallback(
    (categoryId: string) => expandedCategories.has(categoryId),
    [expandedCategories]
  );

  const expandAllCategories = useCallback(() => {
    setExpandedCategories(new Set(categories.map((c) => c.serviceCategoryId)));
  }, [categories]);

  const collapseAllCategories = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setParentCategoryFilter("all");
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Stats
  const totalServices = useMemo(
    () => categories.flatMap((cat) => cat.services).length,
    [categories]
  );
  const filteredServicesCount = useMemo(
    () => filteredCategories.flatMap((cat) => cat.services).length,
    [filteredCategories]
  );
  const selectedCount = selectedServices.length;
  const hasActiveFilters =
    searchTerm.length > 0 ||
    statusFilter !== "all" ||
    parentCategoryFilter !== "all";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Select services by category to enable at this branch
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCount} selected
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search + Expand/Collapse */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={expandAllCategories}
              >
                Expand All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={collapseAllCategories}
              >
                Collapse All
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="status-filter"
                className="text-sm whitespace-nowrap"
              >
                Status:
              </Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Label
                htmlFor="parent-category-filter"
                className="text-sm whitespace-nowrap"
              >
                Category:
              </Label>
              <select
                id="parent-category-filter"
                value={parentCategoryFilter}
                onChange={(e) => setParentCategoryFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm min-w-[150px]"
              >
                <option value="all">All Categories</option>
                {parentCategories.map((pc) => (
                  <option
                    key={pc.serviceCategoryId}
                    value={pc.serviceCategoryId}
                  >
                    {pc.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Stats */}
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredServicesCount} of {totalServices} services
              {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
            </div>
          )}
        </div>

        {/* Services by Category */}
        <div className="space-y-4">
          <Label>Available Services by Category</Label>

          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const isExpanded = isCategoryExpanded(category.serviceCategoryId);
              const activeServicesInThisList = category.services.filter(
                (s) => s.isActive
              );
              const selectedInThisCat = activeServicesInThisList.filter((s) =>
                selectedIdsSet.has(s.serviceId)
              ).length;

              return (
                <div
                  key={category.serviceCategoryId}
                  className="border rounded-lg"
                >
                  {/* Category Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleCategory(category.serviceCategoryId)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {category.categoryName}
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {selectedInThisCat}/
                            {activeServicesInThisList.length} selected
                          </span>
                          {activeServicesInThisList.length !==
                            category.services.length && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              Filtered
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services List */}
                  {isExpanded && (
                    <div className="border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                        {activeServicesInThisList.map((service) => {
                          const isSelected = selectedIdsSet.has(
                            service.serviceId
                          );
                          return (
                            <label
                              key={service.serviceId}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                isSelected ? "border-blue-500 bg-blue-50" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) =>
                                  onServiceToggle(
                                    service.serviceId,
                                    e.target.checked
                                  )
                                }
                                aria-describedby={`service-${service.serviceId}-desc`}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {service.serviceName}
                                  {!service.isActive && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                      Inactive
                                    </span>
                                  )}
                                  {service.isAdvanced && (
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                      Advanced
                                    </span>
                                  )}
                                </div>
                                <div
                                  id={`service-${service.serviceId}-desc`}
                                  className="text-sm text-muted-foreground"
                                >
                                  {service.description}
                                </div>
                                <div className="text-sm font-medium mt-1">
                                  {formatCurrency(service.price)} •{" "}
                                  {service.estimatedDuration}h
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Status: {service.serviceStatus}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div>No services found</div>
              <div className="text-sm">
                Try adjusting your search or filters
              </div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Selected Services */}
        {selectedServices.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Services ({selectedServices.length})</Label>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div
                  key={service.serviceId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{service.serviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.description} • {formatCurrency(service.price)} •{" "}
                      {service.estimatedDuration}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Category:{" "}
                      {
                        categories.find((cat) =>
                          cat.services.some(
                            (s) => s.serviceId === service.serviceId
                          )
                        )?.categoryName
                      }
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onServiceRemove(service.serviceId)}
                    className="text-red-600 hover:text-red-700"
                    aria-label={`Remove ${service.serviceName} service`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No service categories available
          </div>
        )}

        {errors.serviceIds && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.serviceIds}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Bọc memo + comparator để chỉ re-render khi props thực sự đổi */
export const ServicesSection = memo(
  ServicesSectionImpl,
  (prev, next) =>
    prev.selectedServiceIds === next.selectedServiceIds && // ref equality (giữ nguyên vì parent chỉ tạo mảng mới khi thực sự thay đổi)
    prev.categories === next.categories &&
    prev.parentCategories === next.parentCategories &&
    prev.errors?.serviceIds === next.errors?.serviceIds &&
    prev.onServiceToggle === next.onServiceToggle &&
    prev.onServiceRemove === next.onServiceRemove
);
