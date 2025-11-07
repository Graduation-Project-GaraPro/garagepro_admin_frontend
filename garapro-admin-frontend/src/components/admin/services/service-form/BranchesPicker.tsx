"use client";
import React, { useMemo } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Touched } from "./useServiceForm";
import type { Branch } from "@/services/service-Service";

type Props = {
  branches: Branch[];                     // danh sách chi nhánh
  branchIds: string[];                    // các id đã chọn
  toggleBranch: (id: string) => void;     // đã useCallback ở parent
  touchedBranches: boolean;               // touched.branches
  markTouched: (k: keyof Touched) => void;// đã useCallback ở parent
};

const BranchesPicker = React.memo(function BranchesPicker({
  branches,
  branchIds,
  toggleBranch,
  touchedBranches,
  markTouched,
}: Props) {
  const active = useMemo(
    () => branches.filter((b) => b.isActive),
    [branches]
  );
  console.log("branch Render")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Available Branches <span className="text-destructive">*</span>
        </CardTitle>
        <CardDescription>
          Select branches where this service is offered
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {active.length ? (
          <div
            className="flex flex-wrap gap-2"
            onClick={() => markTouched("branches")}
          >
            {active.map((branch) => {
              const selected = branchIds.includes(branch.id);
              return (
                <Badge
                  key={branch.id}
                  variant={selected ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => toggleBranch(branch.id)}
                >
                  {branch.name}
                  {selected && <CheckCircle2 className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active branches available</p>
          </div>
        )}

        {touchedBranches && branchIds.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select at least one branch where this service will be offered.
            </AlertDescription>
          </Alert>
        )}

        {branchIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Selected {branchIds.length} branch{branchIds.length !== 1 ? "es" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
}, areEqual);

// 👇 comparator: chỉ re-render khi những props liên quan UI thực sự đổi
function areEqual(prev: Props, next: Props) {
  return (
    prev.branches === next.branches &&                 // ref danh sách chi nhánh
    prev.branchIds === next.branchIds &&               // ref mảng id (đổi khi chọn/bỏ)
    prev.touchedBranches === next.touchedBranches &&   // boolean
    prev.toggleBranch === next.toggleBranch &&         // callback đã useCallback
    prev.markTouched === next.markTouched              // callback đã useCallback
  );
}

export default BranchesPicker;
