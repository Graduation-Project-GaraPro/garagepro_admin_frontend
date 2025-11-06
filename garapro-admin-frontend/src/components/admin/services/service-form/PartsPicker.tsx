"use client";
import React from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, X, AlertCircle } from "lucide-react";
import { PackageIcon } from "./PackageIcon";
import type { Part, PartCategory } from "@/services/service-Service";
import { formatCurrency, formatNumber } from "@/utils/format"; // ✅ import trực tiếp

type Props = {
  partCategories: PartCategory[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string; // 'all' | partCategoryId
  setSelectedCategory: (v: string) => void;
  filteredParts: Part[];
  selectedPartIds: string[];
  togglePartSelection: (id: string) => void;
  removePart: (id: string) => void;
  selectedParts: Part[];
  totalPartsPrice: number;
  clearSearch: () => void;
};

function PartsPicker({
  partCategories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  filteredParts,
  selectedPartIds,
  togglePartSelection,
  removePart,
  selectedParts,
  totalPartsPrice,
  clearSearch,
}: Props) {
  const categories: PartCategory[] = [
    { partCategoryId: "all", categoryName: "All Categories" } as PartCategory,
    ...partCategories,
  ];

  console.log("PartsPicker render");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Required Parts</CardTitle>
        <CardDescription>
          Select parts needed for this service (optional)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[220px] focus-visible:ring-primary">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.partCategoryId} value={c.partCategoryId}>
                    {c.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {filteredParts.length} parts found
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Parts grid */}
        <div className="border rounded-lg bg-card">
          <div className="max-h-48 overflow-y-auto">
            {filteredParts.length ? (
              <div className="p-2 space-y-2">
                {filteredParts.map((part) => (
                  <div
                    key={part.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPartIds.includes(part.id)
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "hover:bg-muted/50 border-muted"
                    }`}
                    onClick={() => togglePartSelection(part.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 border-2 flex items-center justify-center rounded ${
                            selectedPartIds.includes(part.id)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{part.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(part.price)} • Stock: {formatNumber(part.stock)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        selectedPartIds.includes(part.id) ? "default" : "outline"
                      }
                      className="ml-2"
                    >
                      {selectedPartIds.includes(part.id) ? "Selected" : "Select"}
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

        {/* Selected table */}
        {selectedParts.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Selected Parts ({selectedParts.length})
              </h4>
              <Badge variant="secondary">
                Parts Total: {formatCurrency(totalPartsPrice)}
              </Badge>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(part.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => removePart(part.id)}
                          className="text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
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
            <p className="font-medium">No parts selected</p>
            <p className="text-sm mt-1">
              Select parts from the list above if this service requires specific components
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ✅ comparator: chỉ re-render khi props liên quan đổi thật sự
function areEqual(prev: Props, next: Props) {
  const diffs: string[] = [];

    const check = <K extends keyof Props>(key: K) => {
      if (prev[key] !== next[key]) diffs.push(String(key));
    };

    check("searchTerm");
    check("selectedCategory");
    check("totalPartsPrice");
    check("partCategories");
    check("filteredParts");
    check("selectedPartIds");
    check("selectedParts");
    check("togglePartSelection");
    check("removePart");
    check("setSearchTerm");
    check("setSelectedCategory");
    check("clearSearch");

    if (diffs.length) {
      console.log("%c[PartsPicker] props changed:", "color:orange", diffs);
      return false; // có thay đổi -> cho re-render
    }
    return true; // không có thay đổi -> skip render
}

export default React.memo(PartsPicker, areEqual);
