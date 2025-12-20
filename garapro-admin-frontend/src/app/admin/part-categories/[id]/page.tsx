"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { partManagementService, StockFilter } from "@/services/PartManagementService";
import { Layers, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* =======================
   UTIL
======================= */
const formatVND = (value: number) =>
  value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

/* =======================
   PAGE
======================= */
export default function PartCategoryDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branchId");

  const [detail, setDetail] = useState<any>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>(StockFilter.All);
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD DETAIL
  ======================= */
  useEffect(() => {
    if (!id || !branchId) return;

    setLoading(true);

    partManagementService
      .getPartCategoryDetail(id as string, branchId, stockFilter)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [id, branchId, stockFilter]);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading part category...
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="px-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

         
        </div>
      </div>

      {/* FILTER BAR */}
      <Card>
  <CardContent className="
    p-4
    flex flex-col gap-4
    sm:flex-row sm:items-center sm:justify-between
  ">
    {/* LEFT */}
    <div className="space-y-2">
      {/* TITLE */}
      <div className="flex items-center gap-2">
        <Layers className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold leading-tight">
          {detail.categoryName}
        </h1>

        <Badge variant="secondary">
          {detail.parts.length} parts
        </Badge>
      </div>

      {/* META */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span>{detail.brandName}</span>
        <span>•</span>
        <span>{detail.modelName}</span>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-3">
      <Separator orientation="vertical" className="hidden sm:block h-6" />

      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Stock</span>

        <Select
          value={stockFilter.toString()}
          onValueChange={(v) => setStockFilter(Number(v))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All</SelectItem>
            <SelectItem value="1">In Stock</SelectItem>
            <SelectItem value="2">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
</Card>


      {/* TABLE */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Parts List</h2>
          <p className="text-sm text-muted-foreground">
            Inventory status by selected branch
          </p>
        </CardHeader>

        <CardContent>
          {detail.parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No parts found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {detail.parts.map((p: any) => (
                  <TableRow key={p.partId}>
                    <TableCell className="font-medium">
                      {p.partName}
                    </TableCell>

                    <TableCell>{formatVND(p.price)}</TableCell>

                    <TableCell>
                      {p.warrantyMonths
                        ? `${p.warrantyMonths} months`
                        : "-"}
                    </TableCell>

                    <TableCell className="text-center">
                      {p.stock > 0 ? (
                        <Badge className="bg-green-500">
                          {p.stock} In stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Out of stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
