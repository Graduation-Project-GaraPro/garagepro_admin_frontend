/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SendEmailDialog from "@/components/admin/users/SendEmailDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  CheckCircle,
  Calendar,
  Eye,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { apiClient } from "@/services/api-client";
import { userService } from "@/services/user-service";

// ⚙️ Hàm gọi API
const fetchBannedUsers = async (banType?: string) => {
  const query =
    banType && banType !== "all"
      ? `?status=banned&type=${banType}`
      : "?status=inactive";
  const res = await apiClient.get<any>(`/users${query}`);
  if (!res.data) throw new Error("Failed to fetch users");
  console.log(res.data);
  return await res.data;
};

const getBanTypeBadge = (type: string) => {
  switch (type) {
    case "permanent":
      return <Badge variant="destructive">Permanent</Badge>;
    case "temporary":
      return <Badge className="bg-yellow-100 text-yellow-800">Temporary</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

const getAppealStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    case "approved":
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function BannedUsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [banTypeFilter, setBanTypeFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 📡 Gọi API khi component load hoặc khi đổi filter
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchBannedUsers(banTypeFilter);
        setUsers(data.data);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [banTypeFilter]);

  const filteredUsers = Array.isArray(users)
  ? users.filter((user) => {
      const search = searchTerm.toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      );
    })
  : [];

  const handleUnbanUser = (user: any) => {
    setSelectedUser(user);
    setIsUnbanDialogOpen(true);
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsViewDetailsDialogOpen(true);
  };

  const confirmUnban = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await userService.unbanUser(selectedUser.id);

      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setIsUnbanDialogOpen(false);
      setSelectedUser(null);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
        <span className="ml-3 text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search banned users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={banTypeFilter}
              onChange={(e) => setBanTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ban Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banned Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-gray-500">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Banned By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.name?.slice(0, 2)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.roles[0]}</TableCell>
                    <TableCell>{"System Admin"}</TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanUser(user)}
                        className="text-green-600 hover:text-green-700 ml-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Unban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Unban Dialog */}
      <Dialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {selectedUser?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnbanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUnban}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email dialog */}
      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
