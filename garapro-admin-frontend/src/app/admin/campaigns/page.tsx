"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MoreHorizontal,
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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import {
  campaignService,
  PromotionalCampaign,
  PromotionAppliedNotificationDto,
} from "@/services/campaign-service";
import Link from "next/link";
import { usePermissionContext } from "@/contexts/permission-context";
import * as signalR from "@microsoft/signalr";
import { authService } from "@/services/authService";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<PromotionalCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const { hasAnyPermission } = usePermissionContext();

  const canCreate = hasAnyPermission("PROMO_CREATE");
  const canEdit = hasAnyPermission("PROMO_UPDATE");
  const canDelete = hasAnyPermission("PROMO_DELETE");
  const canToggle = hasAnyPermission("PROMO_TOGGLE");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  // Load campaigns
  const loadCampaigns = useCallback(
    async (page: number = pagination.page, limit: number = pagination.limit) => {
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
          page,
          limit,
        });

        setCampaigns(response.campaigns);
        setPagination(response.pagination);
      } catch (error) {
        toast.error("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, typeFilter, statusFilter]
  );

  useEffect(() => {
    loadCampaigns(1, pagination.limit);
  }, [loadCampaigns]);

  // SignalR Setup
  useEffect(() => {
    const hubUrl = `${process.env.NEXT_PUBLIC_HUB_BASE_URL}/hubs/promotions`;

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

    const start = async () => {
      try {
        await connection.start();
        await connection.invoke("JoinDashboard");

        connection.on(
          "PromotionAppliedToQuotation",
          (payload: PromotionAppliedNotificationDto) => {
            if (!isMounted) return;

            loadCampaigns();
            toast.success("A promotion was just used", {
              description: `Quotation ${payload.quotationId} applied ${payload.services.length} promotion(s).`,
            });
          }
        );
      } catch (err) {
        console.error(err);
      }
    };

    start();
    return () => {
      isMounted = false;
      connection.off("PromotionAppliedToQuotation");
    };
  }, [connection, loadCampaigns]);

  // Actions
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadCampaigns(newPage);
    }
  };

  const handleLimitChange = (limit: number) => {
    setPagination((p) => ({ ...p, limit }));
    loadCampaigns(1, limit);
  };

  const handleStatusToggle = async (id: string, status: boolean) => {
    try {
      const apiCall = status
        ? campaignService.deactivateCampaign(id)
        : campaignService.activateCampaign(id);

      toast.promise(apiCall, {
        loading: status ? "Deactivating..." : "Activating...",
        success: status ? "Deactivated" : "Activated",
      });

      await apiCall;
      loadCampaigns();
    } catch (error) {
      
      toast.error('Failed to '+status, {
        description: error instanceof Error ? error.message:'Please try again.'
      })
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const all = campaigns.map((c) => c.id);
    const allSelected = all.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : all);
  };

  const bulkActivate = async () => {
    try {
      await campaignService.bulkActivateCampaigns(selectedIds);
      toast.success("Activated selected campaigns");
      setSelectedIds([]);
      loadCampaigns();
    }catch (error) {
      
      toast.error('Failed to Activate', {
        description: error instanceof Error ? error.message:'Please try again.'
      })
    }
  };

  const bulkDeactivate = async () => {
    try {
      await campaignService.bulkDeactivateCampaigns(selectedIds);
      toast.success("Deactivated selected campaigns");
      setSelectedIds([]);
      loadCampaigns();
    } 
      catch (error) {
      
      toast.error('Failed to DeActivated', {
        description: error instanceof Error ? error.message:'Please try again.'
      })
    }
    
  };

  const bulkDelete = async () => {
    try {
      await campaignService.bulkDeleteCampaigns(selectedIds);
      toast.success("Deleted selected campaigns");
      setSelectedIds([]);
      setConfirmBulkDelete(false);
      loadCampaigns();
    } catch (error) {
      
      toast.error('Failed to Bulk Delete', {
        description: error instanceof Error ? error.message:'Please try again.'
      })
    }
  };

  // Helpers
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN") ?? "";

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const renderDiscountInfo = (campaign: any) => {
    const isPercent = campaign.discountType === "percentage";

    return {
      top: isPercent
        ? `${campaign.discountValue}% off`
        : `${formatCurrency(campaign.discountValue)} off`,
      bottom:
        campaign.minimumOrderValue > 0
          ? `Min order: ${formatCurrency(campaign.minimumOrderValue)}`
          : "No minimum order",
    };
  };

  const renderUsage = (used?: number, limit?: number) => {
    if (!limit || limit === 2147483647) return `${used ?? 0} used • Unlimited`;
    return `${used ?? 0} of ${limit} used`;
  };

  // Pagination Component
  const PaginationControls = () => {
    const { page, totalCount, limit, totalPages } = pagination;

    if (totalCount === 0) return null;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalCount);

    return (
      <div className="flex flex-col sm:flex-row justify-between py-4 px-2">
        <div className="flex items-center gap-4">
          <Select value={limit.toString()} onValueChange={(v) => handleLimitChange(Number(v))}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {start} to {end} of {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {[...Array(totalPages)].slice(0, 5).map((_, i) => {
            const num = i + 1;
            return (
              <Button
                key={num}
                variant={num === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(num)}
              >
                {num}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // FINAL RETURN UI
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promotional Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage discount campaigns
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {selectedIds.length > 0 && (
            <>
              {canToggle && (
                <>
                  <Button variant="outline" onClick={bulkActivate}>
                    <Play className="mr-1 h-4 w-4" /> Activate
                  </Button>
                  <Button variant="outline" onClick={bulkDeactivate}>
                    <Pause className="mr-1 h-4 w-4" /> Deactivate
                  </Button>
                </>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmBulkDelete(true)}
                >
                  Delete ({selectedIds.length})
                </Button>
              )}
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
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadCampaigns(1)}
            />

            {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
              </SelectContent>
            </Select> */}

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => loadCampaigns(1)}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage and track campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found.
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
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {campaigns.map((c) => {
                    const discount = renderDiscountInfo(c);

                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => toggleSelect(c.id)}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {c.description}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge>{c.type}</Badge>
                        </TableCell>

                        <TableCell>
                          <div>{discount.top}</div>
                          <div className="text-sm text-muted-foreground">
                            {discount.bottom}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>{formatDate(c.startDate)}</div>
                          <div className="text-sm text-muted-foreground">
                            to {formatDate(c.endDate)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={c.isActive ? "bg-green-500" : ""}>
                            {c.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {renderUsage(c.usedCount, c.usageLimit)}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/campaigns/${c.id}`}>
                                  <Eye className="h-4 w-4 mr-2" /> View
                                </Link>
                              </DropdownMenuItem>

                              {canEdit && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/campaigns/${c.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/campaigns/${c.id}/analytics`}
                                >
                                  <BarChart3 className="h-4 w-4 mr-2" />{" "}
                                  Analytics
                                </Link>
                              </DropdownMenuItem>
                              {canToggle && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusToggle(c.id, c.isActive)
                                  }
                                >
                                  {c.isActive ? (
                                    <>
                                      <Pause className="h-4 w-4 mr-2" />{" "}
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" /> Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}

                              {canDelete && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(c.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <PaginationControls />
            </>
          )}
        </CardContent>
      </Card>

      {/* DELETE MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold">Delete Campaign</h3>
            <p className="text-sm text-muted-foreground my-3">
              Are you sure you want to delete this campaign?
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await campaignService.deleteCampaign(confirmDeleteId);
                    toast.success("Deleted successfully");
                    setConfirmDeleteId(null);
                    loadCampaigns();
                  } catch (error) {
      
                  toast.error('Failed to Delete', {
                    description: error instanceof Error ? error.message:'Please try again.'
                  })
                }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE MODAL */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold">Delete Campaigns</h3>
            <p className="text-sm text-muted-foreground my-3">
              Delete {selectedIds.length} campaign(s)?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmBulkDelete(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={bulkDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
