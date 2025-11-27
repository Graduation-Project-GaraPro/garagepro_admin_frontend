"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"



import { toast } from "sonner";
import {
  campaignService,
  PromotionalCampaign,
} from "@/services/campaign-service";
import Link from "next/link";
import { usePermissionContext } from '@/contexts/permission-context'
import * as signalR from '@microsoft/signalr'
import type { PromotionAppliedNotificationDto } from '@/services/campaign-service'
import { authService } from '@/services/authService'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<PromotionalCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const { hasAnyPermission } = usePermissionContext();

  const canCreate = hasAnyPermission("PROMO_CREATE");
  const canEdit = hasAnyPermission("PROMO_UPDATE");
  const canDelete = hasAnyPermission("PROMO_DELETE");
  const canToggle = hasAnyPermission("PROMO_TOGGLE");

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  const loadCampaigns = useCallback(
    async (
      page: number = pagination.page,
      limit: number = pagination.limit
    ) => {
      try {
        setLoading(true);
        const response = await campaignService.getCampaigns({
          search: searchTerm || undefined,
          type: typeFilter === "all" ? undefined : typeFilter,
          isActive:
            statusFilter === "all"
              ? undefined
              : statusFilter === "active"
              ? true
              : false,
          page: page,
          limit: limit,
        });
        setCampaigns(response.campaigns);
        setPagination((prev) => ({
          ...prev,
          page: response.pagination.page,
          limit: response.pagination.limit,
          totalCount: response.pagination.totalCount,
          totalPages: response.pagination.totalPages,
        }));
      } catch (error) {
        console.error("Failed to load campaigns:", error);
        toast.error("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, typeFilter, statusFilter]
  );

  useEffect(() => {
    loadCampaigns(1, pagination.limit); // Reset to page 1 when filters change
  }, [loadCampaigns]);

  useEffect(() => {
    const hubBase = process.env.NEXT_PUBLIC_HUB_BASE_URL || "";
    const hubUrl = `${hubBase}/hubs/promotions`;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => authService.getToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    setConnection(conn);

    return () => {
      conn.stop().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!connection) return;

    let isMounted = true;

    const startConnection = async () => {
      try {
        await connection.start();
        console.log(" Connected to PromotionalHub");

        // Join dashboard group
        await connection.invoke("JoinDashboard");

        // Listen for promotion usage
        connection.on(
          "PromotionAppliedToQuotation",
          (payload: PromotionAppliedNotificationDto) => {
            if (!isMounted) return;

            console.log("PromotionAppliedToQuotation:", payload);

            loadCampaigns(pagination.page, pagination.limit);

            toast.success("A promotion was just used", {
              description: `Quotation ${payload.quotationId} applied ${payload.services.length} promotion(s).`,
            });
          }
        );
      } catch (err) {
        console.error("Error connecting to PromotionalHub:", err);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      connection.off("PromotionAppliedToQuotation");
    };
  }, [connection, loadCampaigns, pagination.page, pagination.limit]);

  const handleSearch = () => {
    loadCampaigns(1, pagination.limit); // Reset to page 1 when searching
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadCampaigns(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit }));
    loadCampaigns(1, newLimit); // Reset to page 1 when changing limit
  };

  const handleStatusToggle = async (
    campaignId: string,
    currentStatus: boolean
  ) => {
    try {
      const promise = currentStatus
        ? campaignService.deactivateCampaign(campaignId)
        : campaignService.activateCampaign(campaignId);

      toast.promise(promise, {
        loading: `${currentStatus ? "Deactivating" : "Activating"} campaign...`,
        success: `Campaign ${
          currentStatus ? "deactivated" : "activated"
        } successfully`,
      });

      await promise;
      loadCampaigns(pagination.page, pagination.limit);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again later";

      toast.error("Failed to delete campaign", {
        description: message,
      });
    }

    const handleDelete = async (campaignId: string) => {
      setConfirmDeleteId(campaignId);
    };

    const toggleSelect = (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    };

    const toggleSelectAll = () => {
      const allIds = campaigns.map((c) => c.id);
      const allSelected = allIds.every((id) => selectedIds.includes(id));
      setSelectedIds(allSelected ? [] : allIds);
    };

    const bulkActivate = async () => {
      if (selectedIds.length === 0) return;
      try {
        await campaignService.bulkActivateCampaigns(selectedIds);
        toast.success(
          `Activated ${selectedIds.length} campaign${
            selectedIds.length > 1 ? "s" : ""
          }`
        );
        setSelectedIds([]);
        loadCampaigns(pagination.page, pagination.limit);
      } catch (e: any) {
        console.error("Bulk activate failed:", e);
        toast.error("Failed to activate selected campaigns", {
          description: e.message || "Please try again later",
        });
      }
    };

    const bulkDeactivate = async () => {
      if (selectedIds.length === 0) return;
      try {
        await campaignService.bulkDeactivateCampaigns(selectedIds);
        toast.success(
          `Deactivated ${selectedIds.length} campaign${
            selectedIds.length > 1 ? "s" : ""
          }`
        );
        setSelectedIds([]);
        loadCampaigns(pagination.page, pagination.limit);
      } catch (e: any) {
        console.error("Bulk deactivate failed:", e);
        toast.error("Failed to deactivate selected campaigns", {
          description: e.message || "Please try again later",
        });
      }
    };

    const bulkDelete = async () => {
      if (selectedIds.length === 0) return;

      try {
        await campaignService.bulkDeleteCampaigns(selectedIds);
        toast.success(
          `Deleted ${selectedIds.length} campaign${
            selectedIds.length > 1 ? "s" : ""
          }`
        );
        setSelectedIds([]);
        setConfirmBulkDelete(false);
        loadCampaigns(pagination.page, pagination.limit);
      } catch (e: any) {
        console.error("Bulk delete failed:", e);
        toast.error("Failed to delete selected campaigns", {
          description: e.message || "Please try again later",
        });
      }
    };

    const getStatusBadge = (isActive: boolean) => {
      return isActive ? (
        <Badge className="bg-green-100 text-green-800">Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      );
    };

    const getTypeBadge = (type: string) => {
      const typeColors = {
        discount: "bg-blue-100 text-blue-800",
        seasonal: "bg-orange-100 text-orange-800",
        loyalty: "bg-purple-100 text-purple-800",
      };
      return (
        <Badge
          className={
            typeColors[type as keyof typeof typeColors] ||
            "bg-gray-100 text-gray-800"
          }
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const isUnlimited = (limit?: number | null) =>
      !limit || limit === 2147483647; // sentinel cho "unlimited" nếu bạn đang dùng

    const renderDiscountInfo = (campaign: any) => {
      const isPercent = campaign.discountType === "percentage";
      const topLine = isPercent
        ? `${campaign.discountValue}% off` +
          (campaign.maximumDiscount && campaign.maximumDiscount > 0
            ? ` (cap ${formatCurrency(campaign.maximumDiscount)})`
            : " (no cap)")
        : `${formatCurrency(campaign.discountValue)} off`;

      const bottomLine =
        campaign.minimumOrderValue && campaign.minimumOrderValue > 0
          ? `Min order: ${formatCurrency(campaign.minimumOrderValue)}`
          : "No minimum order";

      return { topLine, bottomLine };
    };

    const renderUsage = (usedCount?: number, usageLimit?: number | null) => {
      const used = usedCount ?? 0;
      if (isUnlimited(usageLimit)) return `${used} used • Unlimited`;
      return `${used} of ${usageLimit} used`;
    };

    // Pagination controls component
    const PaginationControls = () => {
      const { page, totalPages, totalCount, limit } = pagination;
      const startItem = (page - 1) * limit + 1;
      const endItem = Math.min(page * limit, totalCount);

      if (totalCount === 0) return null;

      return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
          <div className="flex items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Show:
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => handleLimitChange(parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                per page
              </span>
            </div>

            {/* Showing X to Y of Z items */}
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {startItem} to {endItem} of {totalCount} campaigns
            </div>
          </div>

          {/* Page navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && page < totalPages - 2 && (
              <span className="text-sm text-muted-foreground px-1">...</span>
            )}

            {totalPages > 5 && page < totalPages - 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                className="h-8 w-8 p-0 text-xs"
              >
                {totalPages}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Promotional Campaigns
            </h1>
            <p className="text-muted-foreground">
              Create and manage discount campaigns, seasonal offers, and loyalty
              bonuses
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                {canToggle && (
                    <Button variant="outline" onClick={bulkActivate}>
                      <Play className="mr-1 h-4 w-4" /> Activate (
                      {selectedIds.length})
                    </Button>
                  ) && (
                    <Button variant="outline" onClick={bulkDeactivate}>
                      <Pause className="mr-1 h-4 w-4" /> Deactivate (
                      {selectedIds.length})
                    </Button>
                  )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmBulkDelete(true)}
                  >
                    Delete ({selectedIds.length})
                  </Button>
                )}
                <div className="w-px h-6 bg-gray-200 mx-1" />
              </>
            )}

            {canCreate && (
              <Link href="/admin/campaigns/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex gap-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32 sm:w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>
              Manage your promotional campaigns and track their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns found.{" "}
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Create your first campaign to get started."}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            campaigns.length > 0 &&
                            campaigns.every((c) => selectedIds.includes(c.id))
                          }
                        />
                      </TableHead>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(campaign.id)}
                            onChange={() => toggleSelect(campaign.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {campaign.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(campaign.type.toString())}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const { topLine, bottomLine } =
                              renderDiscountInfo(campaign);
                            return (
                              <>
                                <div className="font-medium">{topLine}</div>
                                <div className="text-sm text-muted-foreground">
                                  {bottomLine}
                                </div>
                              </>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(campaign.startDate)}</div>
                            <div className="text-muted-foreground">
                              to {formatDate(campaign.endDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(campaign.isActive)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {renderUsage(
                              campaign.usedCount,
                              campaign.usageLimit
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-44">
                              {/* View */}
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/campaigns/${campaign.id}`}>
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    <span>View detail</span>
                                  </div>
                                </Link>
                              </DropdownMenuItem>

                              {/* Edit */}
                              {canEdit && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/campaigns/${campaign.id}/edit`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Edit className="h-4 w-4" />
                                      <span>Edit</span>
                                    </div>
                                  </Link>
                                </DropdownMenuItem>
                              )}

                              {/* Analytics */}
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/campaigns/${campaign.id}/analytics`}
                                >
                                  <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Analytics</span>
                                  </div>
                                </Link>
                              </DropdownMenuItem>

                              {/* Toggle status */}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusToggle(
                                    campaign.id,
                                    campaign.isActive
                                  )
                                }
                              >
                                <div className="flex items-center gap-2">
                                  {campaign.isActive ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                  <span>
                                    {campaign.isActive
                                      ? "Deactivate"
                                      : "Activate"}
                                  </span>
                                </div>
                              </DropdownMenuItem>

                              {/* Delete */}
                              {canDelete && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDelete(campaign.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                  </div>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <PaginationControls />
              </>
            )}
          </CardContent>
        </Card>

        {/* Bulk Delete Confirmation Modal */}
        {confirmBulkDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-2">Delete Campaigns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete {selectedIds.length} campaign
                {selectedIds.length > 1 ? "s" : ""}? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmBulkDelete(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={bulkDelete}>
                  Delete {selectedIds.length}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-2">Delete Campaign</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this campaign? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await campaignService.deleteCampaign(confirmDeleteId);
                      setConfirmDeleteId(null);
                      toast.success("Campaign deleted successfully");
                      loadCampaigns(pagination.page, pagination.limit);
                    } catch (error: any) {
                      console.error("Delete failed:", error);
                      toast.error("Failed to delete campaign", {
                        description: error.message || "Please try again later",
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
}