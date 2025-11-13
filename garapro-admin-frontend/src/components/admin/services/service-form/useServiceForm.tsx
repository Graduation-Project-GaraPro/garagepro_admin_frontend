"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { serviceService } from "@/services/service-Service";
import type {
  Service,
  ServiceType,
  PartCategory,
  Branch,
} from "@/services/service-Service";
import { formatCurrency, formatNumber } from "@/utils/format";

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
  // const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [selectedPartCategoryIds, setSelectedPartCategoryIds] = useState<string[]>(
  // nếu service đang edit có sẵn categoryIds thì dùng, không thì []
    (service as any)?.partCategoryIds ?? []
  );

  const initParentDoneRef = useRef(false);
  const initSubDoneRef = useRef(false);

  const initialServiceTypeId = service?.serviceType?.parentServiceCategoryId
    ? service?.serviceType?.id
    : service?.serviceType?.id ?? "";
  
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>(
    () => {
      const st = service?.serviceType;
      // nếu có parentServiceCategoryId => parent là category cha
      if (st?.parentServiceCategoryId) return st.parentServiceCategoryId;
      // nếu không có => serviceType chính là parent (nút lá)
      if (st?.id) return st.id;
      return "";
    }
  );

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    const st = service?.serviceType;
    // nếu có parent => sub ban đầu là chính serviceTypeId
    if (st?.parentServiceCategoryId && st?.id) return st.id;
    // nếu không có parent => parent là lá, sub để rỗng
    return "";
  });

  // ===== constants & helpers =====
  const NAME_MIN = 3;
  const NAME_MAX = 100;
  const DESC_MIN = 10;
  const DESC_MAX = 500;

  // form
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
  // derived
  const availableSubCategories = useMemo(() => {
    const parent = serviceCategories.find(
      (c) => c.serviceCategoryId === selectedParentCategory
    );
    return parent?.childCategories ?? [];
  }, [serviceCategories, selectedParentCategory]);

  

  

  
  

  // validation
  const inRange = (n: number, min: number, max: number) => n >= min && n <= max;
  const hasSubChoice = (
    subs: Array<{ serviceCategoryId: string }>,
    id?: string
  ) => !!id && subs.some((s) => s.serviceCategoryId === id);

  // ===== derived lengths (đã trim để tránh tên toàn space) =====
  const nameLen = formData.name.trim().length;
  const descLen = formData.description.trim().length;

  // ===== memo hóa validation =====
  const { isNameValid, isDescriptionValid, mustChooseSub, hasValidCategory } =
    useMemo(() => {
      const mustChoose = availableSubCategories.length > 0;

      return {
        isNameValid: inRange(nameLen, NAME_MIN, NAME_MAX),
        isDescriptionValid:
          descLen === 0 || inRange(descLen, DESC_MIN, DESC_MAX),
        mustChooseSub: mustChoose,
        hasValidCategory:
          !!formData.serviceTypeId &&
          (!mustChoose ||
            hasSubChoice(availableSubCategories, formData.serviceTypeId)),
      };
    }, [
      nameLen,
      descLen,
      formData.serviceTypeId,
      availableSubCategories.length,
    ]);

  const isSubmitDisabled =
    !isNameValid ||
    !hasValidCategory ||
    formData.branchIds.length === 0 ||
    !isDescriptionValid ||
    formData.basePrice < 1000 ||
    (selectedParentCategory && availableSubCategories.length === 0);

  // effects: load once
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, partCategoriesData, branchesData] =
          await Promise.all([
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

  // initialize category from service after categories loaded
  //  luôn reset sub + serviceTypeId khi parent đổi
  useEffect(() => {
    if (!categoriesLoaded) return;
    if (!initSubDoneRef.current) return;

    setSelectedSubCategory("");

    // kiểm tra sub
    const parent = serviceCategories.find(
      (c) => c.serviceCategoryId === selectedParentCategory
    );
    const hasSubs = !!parent?.childCategories?.length;

    // luôn clear serviceTypeId (chỉ gán khi có sub được chọn)
    setFormData((p) => ({ ...p, serviceTypeId: "" }));

    // nếu parent không có sub -> báo lỗi & vẫn không cho submit
    if (!hasSubs && selectedParentCategory) {
      setTouched((t) => ({ ...t, serviceType: true }));
      // có thể toast ở đây nếu muốn:
      toast.error(
        "This category has no sub-categories. Please choose another main category."
      );
    }
  }, [selectedParentCategory, categoriesLoaded, serviceCategories]);

  useEffect(() => {
    // Chưa load xong data thì thôi
    if (!categoriesLoaded) return;
    // Chưa init parent xong thì đừng đụng
    if (!initParentDoneRef.current) return;
    // Chưa init sub xong (Bước 2) thì đừng clear, tránh tranh chấp
    if (!initSubDoneRef.current) return;

    if (
      selectedSubCategory &&
      !availableSubCategories.some(
        (s: any) => s.serviceCategoryId === selectedSubCategory
      )
    ) {
      setSelectedSubCategory("");
    }
  }, [categoriesLoaded, availableSubCategories, selectedSubCategory]);
  // Bước 1: set parent khi load xong categories
  useEffect(() => {
    if (initParentDoneRef.current) return;
    if (!categoriesLoaded || !service?.serviceType) return;

    const { id: serviceTypeId, parentServiceCategoryId } = service.serviceType;
    setSelectedParentCategory(parentServiceCategoryId ?? serviceTypeId);

    initParentDoneRef.current = true;
  }, [categoriesLoaded, service]);
  // Bước 2: khi sub list sẵn sàng, set sub nếu tồn tại
  useEffect(() => {
    if (!initSubDoneRef.current) return;
    console.log("target");

    if (!service?.serviceType?.id || !selectedParentCategory) return;
    const targetSubId = service.serviceType.id;
    console.log("target", targetSubId);

    const existsInSubs = availableSubCategories.some(
      (s: any) => s.serviceCategoryId === targetSubId
    );

    // Chỉ đánh dấu done khi đã tính được sublist (kể cả trống)
    if (existsInSubs) {
      setSelectedSubCategory(targetSubId);
      initSubDoneRef.current = true;
    } else if (!availableSubCategories.length) {
      // parent là lá
      setSelectedSubCategory("");
      initSubDoneRef.current = true;
    }
  }, [availableSubCategories, selectedParentCategory, service]);

  // write serviceTypeId depending on chosen level
  // ✅ ghi serviceTypeId chỉ từ lá (sub) hoặc parent-lá
  useEffect(() => {
    const validSub =
      selectedSubCategory &&
      availableSubCategories.some(
        (s) => s.serviceCategoryId === selectedSubCategory
      );

    setFormData((p) => ({
      ...p,
      serviceTypeId: validSub ? selectedSubCategory : "",
    }));
  }, [selectedSubCategory, availableSubCategories]);

  // handlers
  const markTouched = useCallback(
    (k: keyof Touched) => setTouched((t) => ({ ...t, [k]: true })),
    []
  );

const filteredPartCategories = useMemo(
  () => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return partCategories;
    return partCategories.filter((cat) =>
      cat.categoryName.toLowerCase().includes(term)
    );
  },
  [partCategories, searchTerm]
);

//  toggle chọn / bỏ chọn PartCategory
const togglePartCategory = useCallback(
  (id: string) => {
    setSelectedPartCategoryIds((prev) => {
      if (formData.isAdvanced) {
        // ✅ Advanced: cho chọn nhiều
        return prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
      }

      // ✅ Không advanced: chỉ 1 category
      if (prev.includes(id)) {
        // click lại cái đang chọn -> bỏ chọn hết
        return [];
      }
      // chọn mới -> chỉ giữ đúng id này
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


//  clear chỉ search, không còn filter category nữa
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

  const submit = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading(
      service ? "Updating service..." : "Creating new service...",
      { description: "Please wait while we save your changes." }
    );
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
        partCategoryIds: selectedPartCategoryIds,
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
    // data
    serviceCategories,
    partCategories,
    branches,
    isLoading,
    isSubmitting,
    // form state
    formData,
    setFormData,
    touched,
    markTouched,
    basePriceInput,
    handleBasePriceChange,
    handleBasePriceBlur,
    // category selection
    selectedParentCategory,
    setSelectedParentCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    availableSubCategories,
    // parts
    searchTerm,
    setSearchTerm,
    
    filteredPartCategories,
    selectedPartCategoryIds,
    togglePartCategory,

    clearSearch,
    // validations
    isDescriptionValid,
    isNameValid,
    hasValidCategory,
    isSubmitDisabled,
    // helpers
    formatCurrency,
    formatNumber,
    // branches
    toggleBranch,
    // actions
    submit,
  };
};
