"use client";

import type * as React from "react";
import {
  Car,
  Calendar,
  Clock,
  MessageCircle,
  History,
  Star,
  Bell,
  User,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface NotificationEventDetail {
  id: number;
  pendingCount?: number;
}

// Navigation data for sidebar based on actual folder structure
const data = {
  // Main navigation items
  mainNav: [
    { id: "dashboard", title: "Dashboard", url: "/customer", icon: Car },
    { id: "vehicles", title: "Vehicles", url: "/customer/vehicles", icon: Car },
    { id: "services", title: "Services", url: "/customer/services", icon: Plus },
    { id: "repairs", title: "Repairs", url: "/customer/repairs", icon: Clock },
  ],
  // Tracking and appointment items
  trackingNav: [
    { id: "appointments", title: "Appointments", url: "/customer/services/appointments", icon: Calendar },
    { id: "progress", title: "Progress", url: "/customer/repairs/progress", icon: Clock },
    { id: "history", title: "History", url: "/customer/repairs/history", icon: History },
    { id: "emergency", title: "Emergency", url: "/customer/services/emergency", icon: AlertTriangle },
  ],
  // Account and review items
  accountNav: [
    { id: "reviews", title: "Reviews", url: "/customer/reviews", icon: Star },
    { id: "notifications", title: "Notifications", url: "/customer/notifications", icon: Bell },
    { id: "account", title: "Account", url: "/customer/account", icon: User },
  ],
};

// Component NavMain để hiển thị các mục điều hướng
function NavMain({
  items,
  groupLabel,
  notificationsCount,
}: {
  items: {
    id: string;
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
  groupLabel?: string;
  notificationsCount?: number;
}) {
  const pathname = usePathname();
  
  return (
    <SidebarMenu className="gap-0">
      {items.map((item) => {
        const isActive = pathname === item.url;
        const Icon = item.icon;
        
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton 
              asChild 
              tooltip={item.title} 
              isActive={isActive}
            >
              <a href={item.url} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="text-blue-600">
                    <Icon className="size-4" />
                  </div>
                  <span>{item.title}</span>
                </div>
                {item.id === "notifications" && notificationsCount && notificationsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function CustomerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const defaultNotifs = [
    {
      id: 1,
      message: "Honda Civic repair has been completed",
      time: "2 hours ago",
      type: "success",
      read: false,
    },
    {
      id: 2,
      message: "Appointment scheduled for tomorrow at 9:00",
      time: "1 day ago",
      type: "info",
      read: false,
    },
    {
      id: 3,
      message: "Repair quote has been sent",
      time: "3 hours ago",
      type: "warning",
      read: false,
    },
  ];

  const [notificationsCount, setNotificationsCount] = useState(
    defaultNotifs.length
  );

  // Listen for events to decrease badge count
  useEffect(() => {
    if (typeof window === "undefined") return;

    setNotificationsCount(defaultNotifs.length);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationEventDetail>;
      const id = customEvent?.detail?.id;
      const pendingCount = customEvent?.detail?.pendingCount;

      if (!id) return;
      if (typeof pendingCount === "number" && pendingCount >= 0) {
        setNotificationsCount(pendingCount);
      } else {
        setNotificationsCount((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener("app:notificationConfirmed", handler as EventListener);
    return () =>
      window.removeEventListener(
        "app:notificationConfirmed",
        handler as EventListener
      );
  }, []);

  return (
    <Sidebar collapsible="none" className="border-r bg-white text-gray-700" {...props}>
      <SidebarHeader className="border-b border-gray-200 py-4">
        {/* Logo/Brand */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="px-9 mb-3" asChild>
              <a href="/customer">
                <div className="flex aspect-square size-6 items-center justify-center rounded-sm bg-blue-100 text-blue-600">
                  <Car className="size-10" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Garage Pro</span>
                  {/* <span className="truncate text-xs">Customer</span> */}
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Main Navigation */}
        <NavMain items={data.mainNav} groupLabel="MAIN" />
        
        {/* Tracking Navigation */}
        <NavMain items={data.trackingNav} groupLabel="TRACKING" />
        
        {/* Account Navigation */}
        <NavMain 
          items={data.accountNav} 
          groupLabel="ACCOUNT" 
          notificationsCount={notificationsCount} 
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export default CustomerSidebar;