'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuditHistory } from '@/services/historyChangePolicyService';
import { X, User, FileText, RotateCcw, History } from 'lucide-react';
import { useMemo } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface AuditDetailModalProps {
  audit: AuditHistory | null;
  isOpen: boolean;
  onClose: () => void;
  onRevert?: (audit: AuditHistory, type: 'snapshot' | 'previous') => void;
  isReverting: boolean;
}

export function AuditDetailModal({
  audit,
  isOpen,
  onClose,
  onRevert,
  isReverting = false
}: AuditDetailModalProps) {
  if (!audit) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const { changes } = useMemo(() => {
 
  if (!audit?.previousValues || !audit?.newValues) {
    return { changes: [] };
  }

  try {
    const prev = JSON.parse(audit.previousValues) as any;
    const curr = JSON.parse(audit.newValues) as any;

    const diffs: { key: string; previous: any; current: any }[] = [];

    const ignoreKeys = [
      "Id",
      "CreatedAt",
      "UpdatedAt",
      "Histories",
      "UpdatedBy",
      "UpdatedByUser",
    ];

    Object.keys(curr).forEach((key) => {
      if (ignoreKeys.includes(key)) return;

      const prevVal = prev[key];
      const currVal = curr[key];

      // Không đổi thì bỏ qua
      if (JSON.stringify(prevVal) === JSON.stringify(currVal)) return;

      diffs.push({
        key,
        previous: prevVal,
        current: currVal,
      });
    });

    return { changes: diffs };
  } catch {
    return { changes: [] };
  }
}, [audit]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              Audit Details
            </DialogTitle>
            <DialogDescription>
              Review changes made to this policy
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="grid gap-6">
              {/* Change Information */}
              <div className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Change Information</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-28">Changed by:</span>
                    <span className="truncate">
                       {String(audit.changedByUser || "System")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-28">Changed at:</span>
                    <span>{formatDate(audit.changedAt)}</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-28">Change Summary:</span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {audit.changeSummary}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detailed Changes</h3>
              {changes.length > 0 ? (
                <div className="space-y-3">
                  {changes.map((change, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium capitalize">
                          {change.key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <Badge variant="outline">Modified</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1 min-w-0">
                          <div className="font-medium text-muted-foreground">
                            Previous
                          </div>
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs">
                            {typeof change.previous === "object"
                              ? JSON.stringify(change.previous, null, 2)
                              : String(change.previous ?? "null")}
                          </div>
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="font-medium text-muted-foreground">
                            New
                          </div>
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-green-800 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs">
                            {typeof change.current === "object"
                              ? JSON.stringify(change.current, null, 2)
                              : String(change.current ?? "null")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  No detailed changes available
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-8 py-4 border-t bg-white/80 backdrop-blur-sm flex flex-col sm:flex-row gap-3 justify-between">
          <div className="text-sm text-muted-foreground">
            Review changes carefully before reverting
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-24 border-gray-300 hover:bg-gray-50"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>

            {onRevert && (
              <>
                {/* Confirm revert to previous */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isReverting}
                      className="min-w-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <RotateCcw
                        className={`mr-2 h-4 w-4 ${
                          isReverting ? "animate-spin" : ""
                        }`}
                      />
                      {isReverting ? "Reverting..." : "Revert to Previous"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Revert to Previous Version?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will restore the policy to the previous version
                        just before this change. Are you sure you want to
                        continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isReverting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isReverting}
                        onClick={() => onRevert(audit, "previous")}
                      >
                        {isReverting ? "Reverting..." : "Yes, revert"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Confirm revert to snapshot */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isReverting}
                      className="min-w-40 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <History
                        className={`mr-2 h-4 w-4 ${
                          isReverting ? "animate-spin" : ""
                        }`}
                      />
                      {isReverting ? "Reverting..." : "Revert to Snapshot"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revert to Snapshot?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will restore the policy from the stored snapshot.
                        All current changes after that snapshot will be lost.
                        Continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isReverting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isReverting}
                        onClick={() => onRevert(audit, "snapshot")}
                      >
                        {isReverting
                          ? "Reverting..."
                          : "Yes, revert to snapshot"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
