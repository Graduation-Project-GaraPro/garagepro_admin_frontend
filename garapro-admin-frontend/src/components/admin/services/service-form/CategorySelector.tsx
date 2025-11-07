"use client";
import React from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Props = {
  serviceCategories: any[];
  availableSubCategories: any[];
  selectedParentCategory: string;
  setSelectedParentCategory: (v: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (v: string) => void;
  touchedServiceType: boolean;              // ✅ thay touched.serviceType
  markTouched: (k: "serviceType") => void;  // ✅ chỉ key cần dùng
};

function CategorySelector({
  serviceCategories,
  availableSubCategories,
  selectedParentCategory,
  setSelectedParentCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  touchedServiceType,
  markTouched,
}: Props) {
  // tra cứu tên hiển thị
  const parent = serviceCategories.find(
    (c) => c.serviceCategoryId === selectedParentCategory
  );
  const subSelected = availableSubCategories.find(
    (s: any) => s.serviceCategoryId === selectedSubCategory
  );
console.log("categgvo")
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Service Category <span className="text-destructive">*</span>
        </CardTitle>
        <CardDescription>
          Pick main category and, if available, a sub-category
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Parent */}
        <div className="space-y-2">
          <Label>Main Category</Label>
          <Select
            value={selectedParentCategory || undefined}
            onValueChange={(v) => {
              setSelectedParentCategory(v);
              markTouched("serviceType");
            }}
          >
            <SelectTrigger className="focus-visible:ring-primary">
              <SelectValue placeholder="Select main category" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories
                .filter((c) => c.isActive)
                .map((c) => (
                  <SelectItem
                    key={c.serviceCategoryId}
                    value={c.serviceCategoryId}
                  >
                    {c.categoryName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub */}
        {!!availableSubCategories.length && (
          <div className="space-y-2">
            <Label>
              Sub Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedSubCategory || undefined}
              onValueChange={(v) => {
                setSelectedSubCategory(v);
                markTouched("serviceType");
              }}
            >
              <SelectTrigger className="focus-visible:ring-primary">
                <SelectValue placeholder="Select sub category" />
              </SelectTrigger>
              <SelectContent>
                {availableSubCategories
                  .filter((s: any) => s.isActive)
                  .map((s: any) => (
                    <SelectItem
                      key={s.serviceCategoryId}
                      value={s.serviceCategoryId}
                    >
                      {s.categoryName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Validations */}
        {touchedServiceType && !selectedParentCategory && (
          <p className="text-sm text-destructive">Main category is required</p>
        )}
        {touchedServiceType &&
          selectedParentCategory &&
          !!availableSubCategories.length &&
          !selectedSubCategory && (
            <p className="text-sm text-destructive">
              Please select a sub category
            </p>
          )}
        {touchedServiceType &&
          selectedParentCategory &&
          availableSubCategories.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This category cannot be selected because it has no sub-categories.
                Please choose another main category.
              </AlertDescription>
            </Alert>
          )}

        {/* Selected display (không cần formData) */}
        {selectedParentCategory && (
          <div className="mt-1 p-2 bg-muted/50 rounded text-sm">
            <span className="font-medium">Selected: </span>
            {parent?.categoryName}
            {subSelected && (
              <>
                <span className="mx-2">→</span>
                {subSelected.categoryName}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ✅ Memo + comparator để chỉ re-render khi props liên quan đổi
function areEqual(prev: Props, next: Props) {
  return (
    prev.selectedParentCategory === next.selectedParentCategory &&
    prev.selectedSubCategory === next.selectedSubCategory &&
    prev.touchedServiceType === next.touchedServiceType &&
    prev.serviceCategories === next.serviceCategories &&
    prev.availableSubCategories === next.availableSubCategories &&
    prev.setSelectedParentCategory === next.setSelectedParentCategory &&
    prev.setSelectedSubCategory === next.setSelectedSubCategory &&
    prev.markTouched === next.markTouched
  );
}

export default React.memo(CategorySelector, areEqual);
