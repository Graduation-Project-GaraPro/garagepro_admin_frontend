"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { serviceService } from "@/services/service-Service";
import type { Service, ServiceType, PartCategory, Branch } from "@/services/service-Service";
import { formatCurrency, formatNumber } from "@/utils/format";
import { ServiceCategory } from "@/services/branch-service";

export type Touched = {
  name: boolean;
  serviceType: boolean;
  basePrice: boolean;
  branches: boolean;
  durationEstimate: boolean;
  description: boolean;
};

export const useServiceForm = (service?: Service) => {
  const router = useRouter();
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // UI vẫn chọn theo ID (để dùng PartsPicker như cũ)
  const [selectedPartCategoryIds, setSelectedPartCategoryIds] = useState<string[]>(
    (service as any)?.partCategoryIds ?? []
  );

  // NEW: nếu backend trả về tên partCategory thì dùng để map ngược ra ids khi edit
  const initialPartCategoryNamesRef = useRef<string[]>(
    (service as any)?.partCategoryNames ??
      (service as any)?.parts?.map((p: any) => p?.categoryName || p?.partCategoryName || p?.name).filter(Boolean) ??
      []
  );

  const initParentDoneRef = useRef(false);
  const initSubDoneRef = useRef(false);

  const initialServiceTypeId = service?.serviceType?.parentServiceCategoryId
    ? service?.serviceType?.id
    : service?.serviceType?.id ?? "";

  const [selectedParentCategory, setSelectedParentCategory] = useState<string>(() => {
    const st = service?.serviceType;
    if (st?.parentServiceCategoryId) return st.parentServiceCategoryId;
    if (st?.id) return st.id;
    return "";
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    const st = service?.serviceType;
    if (st?.parentServiceCategoryId && st?.id) return st.id;
    return "";
  });

  const NAME_MIN = 3;
  const NAME_MAX = 100;
  const DESC_MIN = 10;
  const DESC_MAX = 500;

  const [formData, setFormData] = useState({
    name: service?.name || "",
    description: service?.description || "",
    serviceTypeId: initialServiceTypeId,
    basePrice: service?.basePrice || 1000,
    estimatedDuration: service?.estimatedDuration || 1,
    isActive: service?.isActive ?? true,
    isAdvanced: service?.isAdvanced ?? true,
    branchIds: service?.branchIds || [],
  });

  const [basePriceInput, setBasePriceInput] = useState(
    service?.basePrice ? formatNumber(service.basePrice) : ""
  );

  const [touched, setTouched] = useState<Touched>({
    name: false,
    serviceType: false,
    basePrice: false,
    branches: false,
    durationEstimate: false,
    description: false,
  });

  const availableSubCategories = useMemo(() => {
    const parent = serviceCategories.find((c) => c.serviceCategoryId === selectedParentCategory);
    return parent?.childCategories ?? [];
  }, [serviceCategories, selectedParentCategory]);

  const inRange = (n: number, min: number, max: number) => n >= min && n <= max;

  const hasSubChoice = (subs: Array<{ serviceCategoryId: string }>, id?: string) =>
    !!id && subs.some((s) => s.serviceCategoryId === id);

  const nameLen = formData.name.trim().length;
  const descLen = formData.description.trim().length;

  const { isNameValid, isDescriptionValid, hasValidCategory } = useMemo(() => {
    const mustChoose = availableSubCategories.length > 0;

    return {
      isNameValid: inRange(nameLen, NAME_MIN, NAME_MAX),
      isDescriptionValid: descLen === 0 || inRange(descLen, DESC_MIN, DESC_MAX),
      hasValidCategory:
        !!formData.serviceTypeId &&
        (!mustChoose || hasSubChoice(availableSubCategories, formData.serviceTypeId)),
    };
  }, [nameLen, descLen, formData.serviceTypeId, availableSubCategories.length]);

  const isSubmitDisabled =
    !isNameValid ||
    !hasValidCategory ||
    formData.branchIds.length === 0 ||
    !isDescriptionValid ||
    formData.basePrice < 1000 ||
    (selectedParentCategory && availableSubCategories.length === 0);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, partCategoriesData, branchesData] = await Promise.all([
          serviceService.getParentCategories(),
          serviceService.getPartCategories(),
          serviceService.getBranches(),
        ]);
        setServiceCategories(categoriesData);
        setPartCategories(partCategoriesData);
        setBranches(branchesData);
        setCategoriesLoaded(true);
        toast.success("Form data loaded successfully");
      } catch (e) {
        console.error(e);
        toast.error("Failed to load form data", {
          description: "Please refresh the page and try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // NEW: Khi edit và backend trả về partCategoryNames/parts(name),
  // map name -> id để UI preselect.
  useEffect(() => {
  if (!partCategories.length) return;
  if (selectedPartCategoryIds.length) return;

  const names = initialPartCategoryNamesRef.current; // ["Lốp xe", "Phanh"]
  const nameSet = new Set(names.map(x => x.toLowerCase().trim()));

  // Map tên → ids từ getAllPartCategory
  const matchedIds = partCategories
    .filter(c => nameSet.has(c.categoryName.toLowerCase().trim()))
    .map(c => c.partCategoryId)
    .filter(Boolean);

  setSelectedPartCategoryIds(matchedIds); // UI select đúng categories
}, [partCategories]);

  useEffect(() => {
    if (!categoriesLoaded) return;
    if (!initSubDoneRef.current) return;

    setSelectedSubCategory("");

    const parent = serviceCategories.find((c) => c.serviceCategoryId === selectedParentCategory);
    const hasSubs = !!parent?.childCategories?.length;

    setFormData((p) => ({ ...p, serviceTypeId: "" }));

    if (!hasSubs && selectedParentCategory) {
      setTouched((t) => ({ ...t, serviceType: true }));
      toast.error(
        "This category has no sub-categories. Please choose another main category."
      );
    }
  }, [selectedParentCategory, categoriesLoaded, serviceCategories]);

  useEffect(() => {
    if (!categoriesLoaded) return;
    if (!initParentDoneRef.current) return;
    if (!initSubDoneRef.current) return;

    if (
      selectedSubCategory &&
      !availableSubCategories.some((s: ServiceCategory) => s.serviceCategoryId === selectedSubCategory)
    ) {
      setSelectedSubCategory("");
    }
  }, [categoriesLoaded, availableSubCategories, selectedSubCategory]);

  useEffect(() => {
    if (initParentDoneRef.current) return;
    if (!categoriesLoaded || !service?.serviceType) return;

    const { id: serviceTypeId, parentServiceCategoryId } = service.serviceType as any;
    setSelectedParentCategory(parentServiceCategoryId ?? serviceTypeId);

    initParentDoneRef.current = true;
  }, [categoriesLoaded, service]);

  useEffect(() => {
    if (!initSubDoneRef.current) return;

    if (!service?.serviceType?.id || !selectedParentCategory) return;
    const targetSubId = (service.serviceType as any).id;

    const existsInSubs = availableSubCategories.some(
      (s: ServiceCategory) => s.serviceCategoryId === targetSubId
    );

    if (existsInSubs) {
      setSelectedSubCategory(targetSubId);
      initSubDoneRef.current = true;
    } else if (!availableSubCategories.length) {
      setSelectedSubCategory("");
      initSubDoneRef.current = true;
    }
  }, [availableSubCategories, selectedParentCategory, service]);

  useEffect(() => {
    const validSub =
      selectedSubCategory &&
      availableSubCategories.some((s: ServiceCategory) => s.serviceCategoryId === selectedSubCategory);

    setFormData((p) => ({
      ...p,
      serviceTypeId: validSub ? selectedSubCategory : "",
    }));
  }, [selectedSubCategory, availableSubCategories]);

  const markTouched = useCallback(
    (k: keyof Touched) => setTouched((t) => ({ ...t, [k]: true })),
    []
  );

  const filteredPartCategories = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return partCategories;
    return partCategories.filter((cat: any) =>
      String(cat.categoryName).toLowerCase().includes(term)
    );
  }, [partCategories, searchTerm]);

  const togglePartCategory = useCallback(
    (id: string) => {
      setSelectedPartCategoryIds((prev) => {
        if (formData.isAdvanced) {
          return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        }
        if (prev.includes(id)) return [];
        return [id];
      });
    },
    [formData.isAdvanced]
  );

  useEffect(() => {
    if (!formData.isAdvanced && selectedPartCategoryIds.length > 1) {
      setSelectedPartCategoryIds((prev) => (prev.length ? [prev[0]] : []));
    }
  }, [formData.isAdvanced, selectedPartCategoryIds.length]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    toast.info("Filters cleared");
  }, []);

  const toggleBranch = useCallback(
    (branchId: string) => {
      const isAdding = !formData.branchIds.includes(branchId);
      setFormData((p) => ({
        ...p,
        branchIds: isAdding
          ? [...p.branchIds, branchId]
          : p.branchIds.filter((id) => id !== branchId),
      }));
    },
    [formData.branchIds]
  );

  const handleBasePriceChange = (value: string) => {
    const raw = value.replace(/\./g, "");
    const num = parseFloat(raw) || 0;
    setBasePriceInput(formatNumber(num));
    setFormData((p) => ({ ...p, basePrice: num }));
  };

  const handleBasePriceBlur = () => {
    markTouched("basePrice");
    if (formData.basePrice < 1000) {
      const min = 1000;
      setBasePriceInput(formatNumber(min));
      setFormData((p) => ({ ...p, basePrice: min }));
    }
  };

  // NEW: convert selectedPartCategoryIds -> partCategoryNames (string[])
  const buildPartCategoryNames = useCallback((): string[] => {
    if (!selectedPartCategoryIds?.length) return [];

    const mapIdToName = (id: string) => {
      const found: any = partCategories.find((c: any) => {
        const cid = String(c.laborCategoryId ?? c.partCategoryId ?? c.id);
        return cid === String(id);
      });
      return found?.categoryName ? String(found.categoryName) : null;
    };

    return selectedPartCategoryIds
      .map(mapIdToName)
      .filter((x): x is string => !!x && x.trim().length > 0);
  }, [selectedPartCategoryIds, partCategories]);

  const submit = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading(service ? "Updating service..." : "Creating new service...", {
      description: "Please wait while we save your changes.",
    });

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        serviceTypeId: formData.serviceTypeId,
        basePrice: formData.basePrice,
        estimatedDuration: formData.estimatedDuration,
        isActive: formData.isActive,
        isAdvanced: formData.isAdvanced,
        branchIds: formData.branchIds,

        // IMPORTANT: backend mới nhận tên, không nhận ids
        partCategoryNames: buildPartCategoryNames(),
      };

      if (service) {
        await serviceService.updateService(service.id, payload);
        toast.success("Service updated successfully", {
          description: `${formData.name} has been updated.`,
          id: toastId,
        });
      } else {
        await serviceService.createService(payload);
        toast.success("Service created successfully", {
          description: `${formData.name} has been created.`,
          id: toastId,
        });
      }

      setTimeout(() => {
        router.push("/admin/services");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving service:", error);
      let description = "Please check your input and try again.";
      if (error?.message?.includes("HTTP error")) {
        const match = error.message.match(/message: (.+)$/);
        description = match ? match[1] : description;
      }
      toast.error("Failed to save service", { description, id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    serviceCategories,
    partCategories,
    branches,
    isLoading,
    isSubmitting,

    formData,
    setFormData,
    touched,
    markTouched,
    basePriceInput,
    handleBasePriceChange,
    handleBasePriceBlur,

    selectedParentCategory,
    setSelectedParentCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    availableSubCategories,

    searchTerm,
    setSearchTerm,
    filteredPartCategories,

    // UI vẫn dùng ids để render & toggle
    selectedPartCategoryIds,
    togglePartCategory,
    clearSearch,

    isDescriptionValid,
    isNameValid,
    hasValidCategory,
    isSubmitDisabled,

    formatCurrency,
    formatNumber,

    toggleBranch,
    submit,
  };
};
