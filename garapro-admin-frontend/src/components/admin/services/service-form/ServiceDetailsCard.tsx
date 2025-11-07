import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { Touched } from "./useServiceForm";

type Props = {
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: number;
  isActive: boolean;
  isAdvanced: boolean;

  setName: (v: string) => void;
  setDescription: (v: string) => void;
  setEstimatedDuration: (v: number) => void;
  setIsActive: (v: boolean) => void;
  setIsAdvanced: (v: boolean) => void;

  basePriceInput: string;
  handleBasePriceChange: (v: string) => void;
  handleBasePriceBlur: () => void;

  markTouched: (k: keyof Touched) => void;
  formatCurrency: (v: number) => string;

  isNameValid: boolean;
  isDescriptionValid: boolean;
};

function ServiceDetailsCard({
  name,
  description,
  basePrice,
  estimatedDuration,
  isActive,
  isAdvanced,
  setName,
  setDescription,
  setEstimatedDuration,
  setIsActive,
  setIsAdvanced,
  basePriceInput,
  handleBasePriceChange,
  handleBasePriceBlur,
  markTouched,
  formatCurrency,
  isNameValid,
  isDescriptionValid,
}: Props) {
  // console.log("Render ServiceDetailsCard");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" /> Service Details
        </CardTitle>
        <CardDescription>Basic information about the service</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Service Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => markTouched("name")}
            placeholder="Enter service name"
            required
            className="focus-visible:ring-primary"
          />
          <div className="flex justify-between text-xs">
            <span className={isNameValid ? "text-muted-foreground" : "text-destructive"}>
              {name.length}/100 characters{" "}
              {!isNameValid && <span className="ml-2">Service name must be between 3-100 characters</span>}
            </span>
            {!!name.length && (
              <span className={isNameValid ? "text-green-600" : "text-destructive"}>
                {isNameValid ? "✓ Valid" : "✗ Invalid"}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => markTouched("description")}
            rows={3}
            placeholder="Enter service description"
            className="resize-none focus-visible:ring-primary"
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{description.length}/500 characters</span>
            {!!description.length && (
              <span className={isDescriptionValid ? "text-green-600" : "text-destructive"}>
                {isDescriptionValid ? "✓ Valid" : "✗ Invalid"}
              </span>
            )}
          </div>
        </div>

        {/* Base price + duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basePrice">
              Base Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="basePrice"
              type="text"
              value={basePriceInput}
              onChange={(e) => handleBasePriceChange(e.target.value)}
              onBlur={handleBasePriceBlur}
              placeholder="0"
              required
              className="focus-visible:ring-primary font-mono"
            />
            <p className="text-xs text-muted-foreground">{formatCurrency(basePrice)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">
              Duration (minutes) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="estimatedDuration"
              type="number"
              min={1}
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(parseInt(e.target.value))}
              onBlur={() => markTouched("durationEstimate")}
              required
              className="focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Switches */}
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            className="data-[state=checked]:bg-primary"
          />
          <div className="flex-1">
            <div className="font-medium">Active Service</div>
            <div className="text-sm text-muted-foreground">
              {isActive ? "This service is available for booking" : "This service is hidden"}
            </div>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
        </div>

        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          <Switch
            id="isAdvanced"
            checked={isAdvanced}
            onCheckedChange={setIsAdvanced}
            className="data-[state=checked]:bg-primary"
          />
          <div className="flex-1">
            <div className="font-medium">Advanced Service</div>
            <div className="text-sm text-muted-foreground">
              {isAdvanced ? "This is an advanced-level service available to users." : "This is a basic service available to users."}
            </div>
          </div>
          <Badge variant={isAdvanced ? "default" : "secondary"}>{isAdvanced ? "Advanced" : "Basic"}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// chỉ re-render khi các giá trị hiển thị thực sự đổi
export default React.memo(ServiceDetailsCard, (prev, next) =>
  prev.name === next.name &&
  prev.description === next.description &&
  prev.basePrice === next.basePrice &&
  prev.estimatedDuration === next.estimatedDuration &&
  prev.isActive === next.isActive &&
  prev.isAdvanced === next.isAdvanced &&
  prev.basePriceInput === next.basePriceInput &&
  prev.isNameValid === next.isNameValid &&
  prev.isDescriptionValid === next.isDescriptionValid
);
