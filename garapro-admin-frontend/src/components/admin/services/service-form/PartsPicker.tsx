"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, X } from "lucide-react";
import { PackageIcon } from "./PackageIcon";
import type { PartCategory } from "@/services/service-Service";

type Props = {
  partCategories: PartCategory[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filteredPartCategories: PartCategory[];
  selectedPartCategoryIds: string[];
  togglePartCategory: (id: string) => void;
  clearSearch: () => void;
  isAdvanced: boolean;
  touched?: boolean;        
  isValid?: boolean;        
  markTouched?: () => void;      
};

function PartsPicker({
  partCategories,
  searchTerm,
  setSearchTerm,
  filteredPartCategories,
  selectedPartCategoryIds,
  togglePartCategory,
  clearSearch,
  isAdvanced, 
  touched,
  isValid,
  markTouched,              
}: Props) {
  console.log("PartsPicker render");

  const selectedCategories = partCategories.filter((c) =>
    selectedPartCategoryIds.includes(c.partCategoryId)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Required Parts</CardTitle>
        <CardDescription>
            Select part categories needed for this service <span className="text-destructive">*</span>
          </CardDescription>

          {touched && isValid === false && (
            <div className="text-sm text-destructive">
              Please select at least 1 part category.
            </div>
          )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 focus-visible:ring-primary"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {searchTerm && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {filteredPartCategories.length} categories found
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Categories list */}
        <div className="border rounded-lg bg-card">
          <div className="max-h-48 overflow-y-auto">
            {filteredPartCategories.length ? (
              <div className="p-2 space-y-2">
                {filteredPartCategories.map((cat) => {
                  const isSelected = selectedPartCategoryIds.includes(
                    cat.partCategoryId
                  );
                  return (
                    <div
                      key={cat.partCategoryId}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "hover:bg-muted/50 border-muted"
                      }`}
                      onClick={() => {
                                markTouched?.();
                                togglePartCategory(cat.partCategoryId);
                              }}
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <div
                            className={`w-4 h-4 border-2 flex items-center justify-center ${
                              isAdvanced ? "rounded" : "rounded-full"
                            } ${
                              isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                            }`}
                          />
                        <div>
                          <p className="font-medium text-sm">
                            {cat.categoryName}
                          </p>
                          
                        </div>
                      </div>
                      <Badge variant={isSelected ? "default" : "outline"} className="ml-2">
                        {isSelected ? "Selected" : "Select"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No categories found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected categories table */}
        {selectedCategories.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Selected Categories ({selectedCategories.length})
              </h4>
            </div>
            <div className="overflow-x-auto border rounded-lg shadow-md">
  <Table className="min-w-full divide-y divide-gray-200">
    <TableHeader className="bg-gray-100">
      <TableRow>
        <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Category Name
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody className="bg-white divide-y divide-gray-200">
      {selectedCategories.map((cat) => (
        <TableRow 
          key={cat.partCategoryId} 
          className="hover:bg-gray-50 transition-colors duration-200"
        >
          <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
            {cat.categoryName}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
          </div>

          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <PackageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No categories selected</p>
            <p className="text-sm mt-1">
              Select part categories from the list above if this service requires
              specific components.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

//  comparator: chỉ re-render khi props liên quan đổi thật sự
function areEqual(prev: Props, next: Props) {
  const diffs: string[] = [];

  const check = <K extends keyof Props>(key: K) => {
    if (prev[key] !== next[key]) diffs.push(String(key));
  };

  check("searchTerm");
  check("partCategories");
  check("filteredPartCategories");
  check("selectedPartCategoryIds");
  check("togglePartCategory");
  check("setSearchTerm");
  check("clearSearch");
  check("isAdvanced");
  check("touched");
  check("isValid");
  check("markTouched");
  if (diffs.length) {
    console.log("%c[PartsPicker] props changed:", "color:orange", diffs);
    return false; // có thay đổi -> cho re-render
  }
  return true; // không có thay đổi -> skip render
}

export default React.memo(PartsPicker, areEqual);
