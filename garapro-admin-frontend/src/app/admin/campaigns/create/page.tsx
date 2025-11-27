// components/create-campaign-page.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useDeferredValue,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  Percent,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import {
  campaignService,
  CreateCampaignRequest,
  ServiceCategory,
} from "@/services/campaign-service";
import ServiceCategoryList from "@/components/admin/campaigns/service-category-list";
import FilterSection from "@/components/admin/campaigns/filter-section-service";
import SelectedServicesSummary from "@/components/admin/campaigns/selected-services-summary";
import Link from "next/link";
import debounce from "lodash.debounce";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    []
  );
  const [servicesLoading, setServicesLoading] = useState(true);

  const [parentCategories, setParentCategories] = useState<ServiceCategory[]>(
    []
  );
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("all");
  const [rawSearch, setRawSearch] = useState("");
  const deferredSearch = useDeferredValue(rawSearch);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean>(true);

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    description: false,
    startDate: false,
    endDate: false,
    discountValue: false,
    minimumOrderValue: false,
    maximumDiscount: false,
    usageLimit: false,
    applicableServices: false,
  });

  const [displayValues, setDisplayValues] = useState({
    discountValue: "",
    minimumOrderValue: "",
    maximumDiscount: "",
  });

  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: "",
    description: "",
    type: "discount",
    discountType: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
    applicableServices: [],
    minimumOrderValue: 0,
    maximumDiscount: 0,
    usageLimit: 0, // 0 = unlimited
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---------- Data loading ----------
  useEffect(() => {
    loadServiceCategories();
  }, []);

  const loadServiceCategories = async () => {
    try {
      setServicesLoading(true);
      const parentCategoriesData = await campaignService.getParentCategories();
      setParentCategories(parentCategoriesData);
    } catch (error) {
      console.error("Failed to load parent categories:", error);
      toast("Error", {
        description: "Failed to load categories. Please try again.",
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const loadServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const categoriesData = await campaignService.getServicesByFilter({
        parentServiceCategoryId:
          selectedParentCategory === "all" ? undefined : selectedParentCategory,
        searchTerm: deferredSearch || undefined,
        isActive: isActiveFilter,
      });
      setServiceCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load services:", error);
      toast("Error", {
        description: "Failed to load services. Please try again.",
      });
    } finally {
      setServicesLoading(false);
    }
  }, [selectedParentCategory, deferredSearch, isActiveFilter]);

  useEffect(() => {
    const run = debounce(loadServices, 300);
    run();
    return () => run.cancel();
  }, [loadServices]);

  // Clear error for services when at least one is selected
  useEffect(() => {
    if (formData.applicableServices.length > 0 && errors.applicableServices) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.applicableServices;
        return newErrors;
      });
    }
  }, [formData.applicableServices, errors.applicableServices]);

  // Khi chuyển sang fixed thì xoá lỗi maximumDiscount (field ẩn)
  useEffect(() => {
    if (formData.discountType !== "percentage") {
      setErrors((prev) => {
        if (!prev.maximumDiscount) return prev;
        const { maximumDiscount, ...rest } = prev;
        return rest;
      });
      setDisplayValues((prev) => ({ ...prev, maximumDiscount: "" }));
      // Optional: reset data gốc nếu muốn
      // setFormData(prev => ({ ...prev, maximumDiscount: 0 }))
    }
  }, [formData.discountType]);

  // ---------- Form helpers ----------
  const markFieldAsTouched = useCallback(
    (fieldName: keyof typeof touchedFields) => {
      setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    },
    []
  );

  const handleInputChange = useCallback(
    (
      field: keyof CreateCampaignRequest,
      value: string | number | boolean | string[]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field in touchedFields)
        markFieldAsTouched(field as keyof typeof touchedFields);
      setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

      // Nếu đổi discountType sang fixed thì clear lỗi maximumDiscount (backup case)
      if (field === "discountType" && value !== "percentage") {
        setErrors((prev) => {
          if (!prev.maximumDiscount) return prev;
          const { maximumDiscount, ...rest } = prev;
          return rest;
        });
      }
    },
    [markFieldAsTouched]
  );

  const handleServiceToggle = useCallback(
    (serviceId: string, checked: boolean) => {
      markFieldAsTouched("applicableServices");
      setFormData((prev) => ({
        ...prev,
        applicableServices: checked
          ? [...prev.applicableServices, serviceId]
          : prev.applicableServices.filter((id) => id !== serviceId),
      }));
    },
    [markFieldAsTouched]
  );

  const formatNumber = (value: number | undefined): string => {
    if (!value || value === 0) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleDiscountValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value.replace(/\./g, "");
    const numericValue = parseFloat(rawValue) || 0;

    let displayValue = "";
    if (formData.discountType === "percentage") {
      displayValue = rawValue;
    } else {
      displayValue = formatNumber(numericValue);
    }

    setDisplayValues((prev) => ({ ...prev, discountValue: displayValue }));
    handleInputChange("discountValue", numericValue);
  };

  const handleDiscountValueBlur = () => {
    markFieldAsTouched("discountValue");

    // đồng bộ hiển thị
    if (formData.discountValue > 0) {
      const formatted =
        formData.discountType === "percentage"
          ? formData.discountValue.toString()
          : formatNumber(formData.discountValue);
      setDisplayValues((prev) => ({ ...prev, discountValue: formatted }));
    } else {
      // user xóa hết → hiển thị rỗng
      setDisplayValues((prev) => ({ ...prev, discountValue: "" }));
    }

    // validate sau khi blur
    validateForm();
  };

  const handleMinimumOrderValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value.replace(/\./g, "");
    const numericValue = parseFloat(rawValue) || 0;

    setDisplayValues((prev) => ({
      ...prev,
      minimumOrderValue: formatNumber(numericValue),
    }));
    handleInputChange("minimumOrderValue", numericValue);
  };

  const handleMinimumOrderValueBlur = () => {
    markFieldAsTouched("minimumOrderValue");
    if (formData.minimumOrderValue && formData.minimumOrderValue > 0) {
      setDisplayValues((prev) => ({
        ...prev,
        minimumOrderValue: formatNumber(formData.minimumOrderValue),
      }));
    }
    validateForm();
  };

  const handleMaximumDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value.replace(/\./g, "");
    const numericValue = parseFloat(rawValue) || 0;

    setDisplayValues((prev) => ({
      ...prev,
      maximumDiscount: formatNumber(numericValue),
    }));
    handleInputChange("maximumDiscount", numericValue);
  };

  const handleMaximumDiscountBlur = () => {
    markFieldAsTouched("maximumDiscount");

    // Rỗng coi như 0 (unlimited)
    if (!displayValues.maximumDiscount || formData.maximumDiscount === 0) {
      setDisplayValues((prev) => ({ ...prev, maximumDiscount: "" }));
      // đảm bảo data là 0 để validate hiểu là unlimited
      if (formData.maximumDiscount !== 0) {
        setFormData((prev) => ({ ...prev, maximumDiscount: 0 }));
      }
    } else if (formData.maximumDiscount && formData.maximumDiscount > 0) {
      setDisplayValues((prev) => ({
        ...prev,
        maximumDiscount: formatNumber(formData.maximumDiscount),
      }));
    }

    validateForm();
  };


  const formatVietnameseCurrency = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // ---------- Validation ----------
  const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Name
  if (touchedFields.name && !formData.name.trim()) {
    newErrors.name = "Campaign name is required";
  }

  // Description
  if (touchedFields.description && !formData.description.trim()) {
    newErrors.description = "Description is required";
  }

  // Dates
  if (touchedFields.startDate && !formData.startDate) {
    newErrors.startDate = "Start date is required";
  }
  if (touchedFields.endDate && !formData.endDate) {
    newErrors.endDate = "End date is required";
  }
  if (
    touchedFields.startDate &&
    touchedFields.endDate &&
    formData.startDate &&
    formData.endDate &&
    new Date(formData.startDate) >= new Date(formData.endDate)
  ) {
    newErrors.endDate = "End date must be after start date";
  }

  // Discount Value (giá trị bắt buộc)
  if (touchedFields.discountValue) {
    if (formData.discountType === "percentage") {
      // Bắt buộc nhập 1..100
      if (formData.discountValue === 0 || Number.isNaN(formData.discountValue)) {
        newErrors.discountValue = "Please enter a percentage discount (1–100)";
      } else if (formData.discountValue < 1 || formData.discountValue > 100) {
        newErrors.discountValue = "Percentage must be between 1 and 100";
      }
    } else {
      // fixed: bắt buộc >= 1000
      if (formData.discountValue === 0 || Number.isNaN(formData.discountValue)) {
        newErrors.discountValue = "Please enter a discount amount ≥ 1.000đ";
      } else if (formData.discountValue < 1000) {
        newErrors.discountValue = "Discount value must be ≥ 1.000đ";
      }
    }
  }

  // Minimum Order (cho phép rỗng/0)
  if (touchedFields.minimumOrderValue) {
    const mov = formData.minimumOrderValue ?? 0;

    if (mov !== 0) {
      if (mov < 1000) {
        newErrors.minimumOrderValue =
          "Minimum order value must be ≥ 1.000đ (or Empty)";
      } else if (mov % 1000 !== 0) {
        newErrors.minimumOrderValue =
          "Minimum order value must be (1.000, 2.000, 3.000...)";
      }
    }
  }

  // Maximum Discount (chỉ áp dụng khi percentage)
  // 0 hoặc rỗng = unlimited; nếu >0 thì phải ≥ 1000
  if (formData.discountType === "percentage" && touchedFields.maximumDiscount) {
    const md = formData.maximumDiscount ?? 0;
    if (md !== 0 && md < 1000) {
      newErrors.maximumDiscount = "Maximum discount must be ≥ 1.000đ (or 0 = unlimited)";
    }
  }

  // Usage limit: 0 = unlimited; chỉ lỗi nếu < 0
  if (touchedFields.usageLimit && (formData.usageLimit ?? 0) < 0) {
    newErrors.usageLimit = "Usage limit must be ≥ 0 (0 = unlimited)";
  }

  // Services
  if (
    touchedFields.applicableServices &&
    formData.applicableServices.length === 0
  ) {
    newErrors.applicableServices = "Please select at least one service";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched khi submit
    setTouchedFields({
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      discountValue: true,
      minimumOrderValue: true,
      maximumDiscount: true,
      usageLimit: true,
      applicableServices: true,
    });

    // Validate lại form sau khi mark all fields
    const isValid = validateForm();

    if (!isValid) {
      toast.error("Validation Error", {
        description: "Please check the form for errors",
      });
      return;
    }

    try {
      setLoading(true);

      toast("Creating Campaign", {
        description: "Please wait while we create your campaign...",
      });

      await campaignService.createCampaign(formData);

      toast.success("Success", {
        description: "Campaign created successfully!",
      });

      setTimeout(() => {
        router.push("/admin/campaigns");
      }, 1500);
    } catch (error: any) {
      console.error("Failed to create campaign:", error?.message ?? error);

      toast.error("Error", {
        description:
          error?.message ?? "Failed to create campaign. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDiscountIcon = () => {
    switch (formData.discountType) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed":
        return <Banknote className="h-4 w-4" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Campaign
          </h1>
          <p className="text-muted-foreground">
            Set up a new promotional campaign to attract customers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details for your campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => {
                    markFieldAsTouched("name");
                    validateForm();
                  }}
                  placeholder="e.g., Summer Sale 2024"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                onBlur={() => {
                  markFieldAsTouched("description");
                  validateForm();
                }}
                placeholder="Describe your campaign and what customers can expect..."
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Discount Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Configuration</CardTitle>
            <CardDescription>
              Set up the discount structure and conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) =>
                    handleInputChange("discountType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₫)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {getDiscountIcon()}
                  </div>
                  <Input
                    id="discountValue"
                    type="text"
                    value={displayValues.discountValue}
                    onChange={handleDiscountValueChange}
                    onBlur={handleDiscountValueBlur}
                    placeholder={
                      formData.discountType === "percentage" ? "10" : "10.000"
                    }
                    className={`pl-10 ${
                      errors.discountValue ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.discountValue && (
                  <p className="text-sm text-red-500">{errors.discountValue}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumOrderValue">Minimum Order Value</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <Input
                    id="minimumOrderValue"
                    type="text"
                    value={displayValues.minimumOrderValue}
                    onChange={handleMinimumOrderValueChange}
                    onBlur={handleMinimumOrderValueBlur}
                    placeholder="0"
                    className={`pl-10 ${
                      errors.minimumOrderValue ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.minimumOrderValue && (
                  <p className="text-sm text-red-500">
                    {errors.minimumOrderValue}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave empty if no minimum order requirement
                </p>
              </div>

              {formData.discountType === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="maximumDiscount">Maximum Discount</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <Input
                      id="maximumDiscount"
                      type="text"
                      value={displayValues.maximumDiscount}
                      onChange={handleMaximumDiscountChange}
                      onBlur={handleMaximumDiscountBlur}
                      placeholder="100.000"
                      className={`pl-10 ${
                        errors.maximumDiscount ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.maximumDiscount && (
                    <p className="text-sm text-red-500">
                      {errors.maximumDiscount}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Maximum amount for percentage discounts (0 = unlimited)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) =>
                  handleInputChange(
                    "usageLimit",
                    Number.isNaN(parseInt(e.target.value))
                      ? 0
                      : parseInt(e.target.value)
                  )
                }
                onBlur={() => {
                  markFieldAsTouched("usageLimit");
                  validateForm();
                }}
                placeholder="0 = unlimited"
                className={errors.usageLimit ? "border-red-500" : ""}
              />
              {errors.usageLimit && (
                <p className="text-sm text-red-500">{errors.usageLimit}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Schedule</CardTitle>
            <CardDescription>
              Set when your campaign starts and ends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    onBlur={() => {
                      markFieldAsTouched("startDate");
                      validateForm();
                    }}
                    className={`pl-10 ${
                      errors.startDate ? "border-red-500" : ""
                    }`}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    onBlur={() => {
                      markFieldAsTouched("endDate");
                      validateForm();
                    }}
                    className={`pl-10 ${
                      errors.endDate ? "border-red-500" : ""
                    }`}
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Applicable Services</CardTitle>
            <CardDescription>
              Select which services this campaign applies to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FilterSection
              selectedParentCategory={selectedParentCategory}
              onParentCategoryChange={setSelectedParentCategory}
              searchTerm={rawSearch}
              onSearchTermChange={setRawSearch}
              isActiveFilter={isActiveFilter}
              onActiveFilterChange={setIsActiveFilter}
              parentCategories={parentCategories}
            />

            {servicesLoading ? (
              <div className="text-center py-4">Loading services...</div>
            ) : (
              <div className="max-h-200 overflow-y-auto">
                <ServiceCategoryList
                  categories={serviceCategories}
                  selectedServices={formData.applicableServices}
                  onServiceToggle={handleServiceToggle}
                />
              </div>
            )}

            <div className="mt-6 border-t pt-4">
              {errors.applicableServices && (
                <p className="text-sm text-red-500 mt-2">
                  {errors.applicableServices}
                </p>
              )}
              <SelectedServicesSummary
                selectedServices={formData.applicableServices}
                serviceCategories={serviceCategories}
                onServiceToggle={handleServiceToggle}
                onClearAll={() => handleInputChange("applicableServices", [])}
                formatCurrency={formatVietnameseCurrency}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/campaigns">
            <Button variant="outline" type="button" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </form>
    </div>
  );
}
