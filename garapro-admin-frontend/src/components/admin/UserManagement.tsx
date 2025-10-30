/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { User, userService, UserFilters } from "@/services/user-service";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MoreHorizontal,
  Mail,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Phone,
  MapPin,
  Activity,
  CreditCard,
  Copy,
  Check,
  X,
  Download,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import SendEmailDialog from "@/components/admin/users/SendEmailDialog";
import ActivityDialog from "@/components/admin/users/ActivityDialog";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "banned":
      return <Badge variant="destructive">Banned</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
    case "manager":
      return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>;
    case "user":
      return <Badge className="bg-gray-100 text-gray-800">User</Badge>;
    default:
      return <Badge variant="secondary">{role}</Badge>;
  }
};

// Hàm cleanup portal triệt để
const cleanupPortals = () => {
  // Xóa tất cả portal elements
  const portals = document.querySelectorAll("[data-radix-portal]");
  portals.forEach((portal) => {
    if (portal.parentNode) {
      portal.parentNode.removeChild(portal);
    }
  });

  // Reset body styles
  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
  document.body.removeAttribute("data-radix-modal-open");
  document.body.removeAttribute("data-radix-dialog-open");

  // Xóa các overlay còn sót lại
  const overlays = document.querySelectorAll("[data-radix-overlay]");
  overlays.forEach((overlay) => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  });
};

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cleanup triệt để khi component unmount
  useEffect(() => {
    return () => {
      cleanupPortals();
    };
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: UserFilters = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (roleFilter !== "all") filters.role = roleFilter;
      if (verifiedFilter !== "all") {
        if (verifiedFilter === "verified") filters.verified = true;
        if (verifiedFilter === "unverified") filters.verified = false;
      }

      const response = await userService.getUsers(filters);

      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalUsers(response.total);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError("Failed to load users. Please try again later.");
      toast.error("Failed to load users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, roleFilter, verifiedFilter, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounce search term
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, currentPage, loadUsers]);

  const refreshUsers = async () => {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
    toast.success("Users refreshed successfully.");
  };

  const handleBanUser = async (user: User) => {
    if (!banReason.trim()) {
      toast.error("Please provide a reason for banning this user.");
      return;
    }

    try {
      await userService.banUser(user.id, banReason);
      setBanDialogOpen(false);
      setBanReason("");
      setSelectedUser(null);
      await loadUsers();
      toast.success(`${user.name} has been banned successfully.`);
    } catch (error) {
      toast.error("Failed to ban user. Please try again.");
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      await userService.unbanUser(user.id);
      setUnbanDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
      toast.success(`${user.name} has been unbanned successfully.`);
    } catch (error) {
      toast.error("Failed to unban user. Please try again.");
    }
  };

  const handleChangeRole = async (
    user: User,
    newRole: "user" | "admin" | "manager"
  ) => {
    try {
      await userService.changeUserRole(user.id, newRole);
      await loadUsers();
      toast.success(`${user.name}'s role has been changed to ${newRole}.`);
    } catch (error) {
      toast.error("Failed to change user role. Please try again.");
    }
  };

  const handleVerifyUser = async (user: User) => {
    try {
      await userService.verifyUser(user.id);
      await loadUsers();
      toast.success(`${user.name} has been verified successfully.`);
    } catch (error) {
      toast.error("Failed to verify user. Please try again.");
    }
  };

  const handleUserDetails = (user: User) => {
    setSelectedUser(user);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      let actionLabel = "";
      switch (action) {
        case "ban":
          actionLabel = "Ban";
          await userService.bulkUpdateUsers(selectedUsers, {
            status: "banned",
          } as any);
          break;
        case "unban":
          actionLabel = "Unban";
          await userService.bulkUpdateUsers(selectedUsers, {
            status: "active",
          } as any);
          break;
        case "delete":
          actionLabel = "Delete";
          await userService.bulkDeleteUsers(selectedUsers);
          break;
        case "export":
          actionLabel = "Export";
          const blob = await userService.exportUsers({
            search: searchTerm || undefined,
            role: roleFilter !== "all" ? roleFilter : undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "users.csv";
          a.click();
          window.URL.revokeObjectURL(url);
          break;
      }

      setIsBulkActionDialogOpen(false);
      setSelectedUsers([]);
      if (action !== "export") {
        await loadUsers();
      }

      toast.success(`${actionLabel} successful`, {
        description: `Bulk ${actionLabel.toLowerCase()} completed for ${
          selectedUsers.length
        } user(s).`,
      });
    } catch (error) {
      toast.error("Action failed", {
        description: `Could not complete bulk ${action}. Please try again.`,
      });
    }
  };

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success(`${fieldName} copied to clipboard.`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleExportUser = async (
    user: User,
    format: "csv" | "excel" | "json" = "csv"
  ) => {
    setExporting(true);
    try {
      const blob = await userService.exportUser(user, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user_${user.id}.${
        format === "json" ? "json" : format === "excel" ? "xls" : "csv"
      }`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("User data exported successfully.");
    } catch (error) {
      toast.error("Failed to export user data.");
    } finally {
      setExporting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Hàm đóng dialog với cleanup triệt để
  const handleDialogClose = () => {
    setSelectedUser(null);
    // Cleanup sau khi animation hoàn tất
    setTimeout(cleanupPortals, 150);
  };

  const renderUserDetails = (user: User) => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
                {user.verified && (
                  <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button> */}
            {user.status === "banned" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setUnbanDialogOpen(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Unban
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user);
                  setBanDialogOpen(true);
                }}
              >
                <Ban className="h-4 w-4 mr-2" />
                Ban
              </Button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Email</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(user.email, "email")}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Phone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{user.phone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyToClipboard(user.phone, "phone")}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === "phone" ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Location</span>
                </div>
                <span className="text-sm text-gray-900">{user.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Account Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Joined Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.joinedDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-sm text-gray-900">
                  {user.totalOrders}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="text-sm text-gray-900">
                  ${user.totalSpent.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEmailDialogOpen(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivityDialogOpen(true)}
          >
            <Activity className="h-4 w-4 mr-2" />
            View Activity
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportUser(user)}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export Data"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters & Search</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshUsers}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="technician">Technician</option>
              <option value="manager">Manager</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Users ({totalUsers})
              {isLoading && (
                <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />
              )}
            </CardTitle>
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkActionDialogOpen(true)}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers?.length === users?.length &&
                      users?.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.verified ? (
                      <Badge className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleUserDetails(user)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        {!user.verified && (
                          <DropdownMenuItem
                            onClick={() => handleVerifyUser(user)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify User
                          </DropdownMenuItem>
                        )}
                        {user.status === "inactive" ? (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setUnbanDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setBanDialogOpen(true);
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog với cleanup triệt để */}
      {selectedUser && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && handleDialogClose()}
        >
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about the selected user
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">{renderUserDetails(selectedUser)}</div>

            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                Close
              </Button>
              <Button onClick={() => handleEditUser(selectedUser)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Ban User Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {selectedUser?.name}? Please provide
              a reason for the ban.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="banReason">Ban Reason</Label>
            <Input
              id="banReason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for banning this user..."
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setBanReason("");
                setBanDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleBanUser(selectedUser)}
              className="bg-red-600 hover:bg-red-700"
            >
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban User Dialog */}
      <AlertDialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban {selectedUser?.name}? This will
              restore their account access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUnbanDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleUnbanUser(selectedUser)}
            >
              Unban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Dialog */}
      <Dialog
        open={isBulkActionDialogOpen}
        onOpenChange={setIsBulkActionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Select an action to perform on {selectedUsers.length} selected
              users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkAction("ban")}
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban Selected Users
            </Button>
            <Button
              variant="outoutline"
              className="w-full justify-start"
              onClick={() => handleBulkAction("unban")}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Unban Selected Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkAction("delete")}
            >
              <X className="mr-2 h-4 w-4" />
              Delete Selected Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBulkAction("export")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export User Data
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkActionDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        user={selectedUser}
      />

      <ActivityDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
