"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export default function FormActions({
  isSubmitting,
  isDisabled,
  service,
  onSubmit,
}: any) {
  return (
    <div className="mt-8 flex justify-end gap-4 pt-6 border-t">
      <Button type="button" variant="outline" asChild disabled={isSubmitting}>
        <Link href="/admin/services">Cancel</Link>
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled || isSubmitting}
        className="min-w-32"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {service ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {service ? "Update Service" : "Create Service"}
          </>
        )}
      </Button>
    </div>
  );
}
