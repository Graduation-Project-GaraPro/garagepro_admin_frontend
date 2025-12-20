"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { partManagementService } from "@/services/PartManagementService";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Search, Car, CarFront, Building } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
/* =======================
   CONFIG
======================= */
const PAGE_SIZE = 10;

/* =======================
   PAGE
======================= */
export default function PartCategoriesPage() {
  const router = useRouter();

  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  
  useEffect(() => {
    const init = async () => {
      const [brandData, branchData] = await Promise.all([
        partManagementService.getBrands(),
        partManagementService.getBranches(),
      ]);

      setBrands(brandData);
      setBranches(branchData);

      if (brandData.length > 0) setBrandId(brandData[0].brandId);
      if (branchData.length > 0) setBranchId(branchData[0].branchId);
    };

    init();
  }, []);

  
  useEffect(() => {
    if (!brandId) return;

    const loadModels = async () => {
      const modelData = await partManagementService.getModels(brandId);
      setModels(modelData);

      if (modelData.length > 0) {
        setModelId(modelData[0].modelId);
      } else {
        setModelId("");
      }
    };

    loadModels();
  }, [brandId]);

  
  useEffect(() => {
    if (!modelId || !branchId) return;

    partManagementService
      .getPartCategories(modelId, branchId, search)
      .then(setCategories);
  }, [modelId, branchId, search]);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [brandId, modelId, branchId, search]);

  
  const totalPages = Math.ceil(categories.length / PAGE_SIZE);

  const pagedCategories = categories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Part Category Management</h1>

      {/* FILTER */}
      <Card>
  <CardContent className="p-4 space-y-4">
    {/* TITLE */}
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-medium text-muted-foreground">
        Filters
      </h2>
    </div>

    <Separator />

    {/* FILTER GRID */}
    <div className="
      grid gap-4
      sm:grid-cols-2
      lg:grid-cols-4
    ">
      {/* BRAND */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 text-xs">
          <CarFront className="h-3.5 w-3.5" />
          Brand
        </Label>
        <Select value={brandId} onValueChange={setBrandId}>
          <SelectTrigger>
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b.brandId} value={b.brandId}>
                {b.brandName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* MODEL */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 text-xs">
          <Car className="h-3.5 w-3.5" />
          Model
        </Label>
        <Select
          value={modelId}
          onValueChange={setModelId}
          disabled={!brandId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.modelId} value={m.modelId}>
                {m.modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BRANCH */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 text-xs">
          <Building className="h-3.5 w-3.5" />
          Branch
        </Label>
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b.branchId} value={b.branchId}>
                {b.branchName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SEARCH */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2 text-xs">
          <Search className="h-3.5 w-3.5" />
          Search
        </Label>
        <Input
          placeholder="Category or part name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  </CardContent>
</Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Part Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage part categories and view stock by branch
          </p>
        </CardHeader>

        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No part categories found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-center">
                      Total Parts
                    </TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pagedCategories.map((c) => (
                    <TableRow key={c.partCategoryId}>
                      <TableCell className="font-medium">
                        {c.categoryName}
                      </TableCell>
                      <TableCell>{c.brandName}</TableCell>
                      <TableCell>{c.modelName}</TableCell>
                      <TableCell className="text-center">
                        {c.totalParts}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/part-categories/${c.partCategoryId}?branchId=${branchId}`
                                  )
                                }
                                className="
                                  inline-flex items-center justify-center
                                  h-9 w-9 rounded-md
                                  hover:bg-muted transition
                                "
                              >
                                <Eye className="h-5 w-5 text-muted-foreground hover:text-primary" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>View detail</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* =======================
   PAGINATION CONTROLS
======================= */
function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md text-sm ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
