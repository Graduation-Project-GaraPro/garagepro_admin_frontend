"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useServiceForm } from "@/components/admin/services/service-form/useServiceForm";
import ServiceDetailsCard from "@/components/admin/services/service-form/ServiceDetailsCard";
import CategorySelector from "@/components/admin/services/service-form/CategorySelector";
import PartsPicker from "@/components/admin/services/service-form/PartsPicker";
import BranchesPicker from "@/components/admin/services/service-form/BranchesPicker";
import FormActions from "@/components/admin/services/service-form/FormActions";

export default function ServiceForm({ service, isReady = true }: { service?: any; isReady?: boolean }) {
  const vm = useServiceForm(service);

  if (!isReady || vm.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <svg
            className="h-8 w-8 animate-spin mx-auto text-primary"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
          </svg>
          <div>
            <p className="text-lg font-medium">Loading form data</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare the form
            </p>
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
            {service ? "Edit Service" : "Create New Service"}
          </h2>
          <p className="text-muted-foreground">
            {service
              ? "Update your service details"
              : "Add a new service to your offerings"}
          </p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          vm.submit();
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* left column */}
          <div className="space-y-6">
            <ServiceDetailsCard
              name={vm.formData.name}
              description={vm.formData.description}
              basePrice={vm.formData.basePrice}
              estimatedDuration={vm.formData.estimatedDuration}
              isActive={vm.formData.isActive}
              isAdvanced={vm.formData.isAdvanced}

              setName={(v) => vm.setFormData((p) => ({ ...p, name: v }))}
              setDescription={(v) => vm.setFormData((p) => ({ ...p, description: v }))}
              setEstimatedDuration={(v) => vm.setFormData((p) => ({ ...p, estimatedDuration: v }))}
              setIsActive={(v) => vm.setFormData((p) => ({ ...p, isActive: v }))}
              setIsAdvanced={(v) => vm.setFormData((p) => ({ ...p, isAdvanced: v }))}

              basePriceInput={vm.basePriceInput}
              handleBasePriceChange={vm.handleBasePriceChange}
              handleBasePriceBlur={vm.handleBasePriceBlur}

              markTouched={vm.markTouched}
              formatCurrency={vm.formatCurrency}
              isNameValid={vm.isNameValid}
              isDescriptionValid={vm.isDescriptionValid}
            />
           <CategorySelector
              serviceCategories={vm.serviceCategories}
              availableSubCategories={vm.availableSubCategories}
              selectedParentCategory={vm.selectedParentCategory}
              setSelectedParentCategory={vm.setSelectedParentCategory}
              selectedSubCategory={vm.selectedSubCategory}
              setSelectedSubCategory={vm.setSelectedSubCategory}
              touchedServiceType={vm.touched.serviceType}
              markTouched={vm.markTouched}
            />
          </div>

          {/* right column */}
          <div className="space-y-6">
            <PartsPicker
                partCategories={vm.partCategories}
                searchTerm={vm.searchTerm}
                setSearchTerm={vm.setSearchTerm}                 // OK: setState từ useState là stable
                selectedCategory={vm.selectedCategory}
                setSelectedCategory={vm.setSelectedCategory}     // OK: Select onValueChange(string)
                filteredParts={vm.filteredParts}
                selectedPartIds={vm.selectedPartIds}
                togglePartSelection={vm.togglePartSelection}
                removePart={vm.removePart}
                selectedParts={vm.selectedParts}
                totalPartsPrice={vm.totalPartsPrice}
                clearSearch={vm.clearSearch}
                formatCurrency={vm.formatCurrency}
                formatNumber={vm.formatNumber}
              />
            <BranchesPicker
              branches={vm.branches}
              branchIds={vm.formData.branchIds}
              toggleBranch={vm.toggleBranch}
              touchedBranches={vm.touched.branches}
              markTouched={vm.markTouched}
            />
          </div>
        </div>

        <FormActions
          isSubmitting={vm.isSubmitting}
          isDisabled={vm.isSubmitDisabled}
          service={service}
          onSubmit={vm.submit}
        />
      </form>
    </div>
  );
}
