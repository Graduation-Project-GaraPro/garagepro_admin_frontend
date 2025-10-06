"use client";

import React, { useState } from "react";
import { Car, Bell, X, CheckCircle, AlertTriangle, Info, User, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Notification type
interface Notification {
  id: number;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
  target?: string;
}

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      title: "Xe Honda Civic đã hoàn thành sửa chữa",
      message:
        "Dịch vụ bảo dưỡng định kỳ đã hoàn thành. Bạn có thể đến lấy xe.",
      time: "2 giờ trước",
      read: false,
      target: "/customer/request-detail?requestId=1",
    },
    {
      id: 2,
      type: "info",
      title: "Có lịch hẹn vào ngày mai",
      message: "Lịch hẹn sửa chữa phanh lúc 9:00 sáng ngày mai.",
      time: "1 ngày trước",
      read: false,
      target: "/customer/appointments",
    },
    {
      id: 3,
      type: "warning",
      title: "Báo giá sửa chữa đã được gửi",
      message: "Báo giá cho dịch vụ sửa chữa điều hòa đã được gửi qua email.",
      time: "3 giờ trước",
      read: false,
      target: "/customer/notifications",
    },
    {
      id: 4,
      type: "success",
      title: "Thanh toán thành công",
      message: "Thanh toán cho dịch vụ thay lốp đã được xử lý thành công.",
      time: "1 tuần trước",
      read: true,
      target: "/customer/history",
    },
  ]);

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);
  const unreadCount = unread.length;

  const getNotificationIcon = (type: Notification["type"]): React.ReactElement => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // cập nhật avatar realtime
  if (typeof window !== "undefined" && !(window as any).__avatarListenerBound) {
    window.addEventListener("app:avatarUpdated", (e: Event) => {
      const customEvent = e as CustomEvent<{ url: string }>;
      const url = customEvent?.detail?.url;
      const img = document.getElementById(
        "app-header-avatar"
      ) as HTMLImageElement | null;
      if (img && url) img.src = url;
    });
    (window as any).__avatarListenerBound = true;
  }

  const handleNotificationClick = (notification: Notification): void => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    setShowNotifications(false);
    if (notification.target) {
      router.push(notification.target);
    }
  };

  const { isMobile } = useSidebar();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {isMobile && <SidebarTrigger className="mr-2" />}
            {/* <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 mr-2">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Garage Pro</h1>
            </div> */}
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-gray-100">
                  <div className="p-1 rounded-lg">
                    <Bell className="h-5 w-5 text-gray-600" />
                  </div>
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>Thông báo</DialogTitle>
                  <DialogDescription>
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {unreadCount} chưa đọc
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          setUnreadCount(0);
                        }}
                      >
                        Đánh dấu tất cả đã đọc
                      </Button>
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center my-4">
                      <Info className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No notifications</p>
                    </div>
                  ) : (
                    <>
                      {unread.length > 0 && (
                        <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase">
                          Not yet ({unread.length})
                        </div>
                      )}
                      {unread.map((notification) => (
                        <div
                          key={`unread-${notification.id}`}
                          className="flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="p-2 rounded-lg bg-blue-100">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 leading-snug">
                                {notification.title}
                              </p>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 leading-snug">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      ))}

                      {read.length > 0 && (
                        <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase">
                          As read ({read.length})
                        </div>
                      )}
                      {read.map((notification) => (
                        <div
                          key={`read-${notification.id}`}
                          className="flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors bg-white hover:bg-gray-50 border border-gray-200"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="p-2 rounded-lg bg-gray-100">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 leading-snug">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNotificationsOpen(false)}>
                    Close
                  </Button>
                  <Button asChild>
                    <Link href="/customer/notifications">
                      View all
                    </Link>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-gray-100">
                  <Avatar className="h-8 w-8 border-2 border-gray-200">
                    <img
                      id="app-header-avatar"
                      src={
                        typeof window !== "undefined" &&
                        window.localStorage.getItem("user_avatar")
                          ? (window.localStorage.getItem("user_avatar") as string)
                          : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                      }
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">KH</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Nguyễn Văn A</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      nguyenvana@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/customer/account")}>
                  <User className="mr-2 h-4 w-4" />
                  <span> Account </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/customer/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Setting </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
