"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissionContext } from "@/contexts/permission-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { routePermissionRules } from "@/configs/admin-routes";
import AccessDenied from "@/app/access-denied/page";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { loaded: permLoaded, hasAnyPermission } = usePermissionContext();
  const router = useRouter();
  const pathname = usePathname() || "";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");
  const adminUnprotectedRoutes = ["/admin/profile"];
  const isUnprotectedAdminRoute = isAdminRoute && adminUnprotectedRoutes.includes(pathname);

  const isChecking = isLoading || !permLoaded;

  const matchedRule = routePermissionRules.find((rule) => rule.pattern.test(pathname));

  const hasAccess = (() => {
    if (!isAuthenticated) return false;
    if (isUnprotectedAdminRoute) return true;
    if (!isAdminRoute) return true;
    if (!matchedRule) return false;
    return hasAnyPermission(...matchedRule.permissions);
  })();

  useEffect(() => {
    if (isChecking) return;
    if (!isAuthenticated) router.replace("/");
  }, [isChecking, isAuthenticated, router]);

  // đổi route => đóng mobile drawer
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const LayoutShell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            // thêm props nếu bạn muốn header có nút mở sidebar mobile/collapse
            onOpenSidebar={() => setMobileSidebarOpen(true)}
            onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          />
          <main className="flex-1 p-4 sm:p-6">{content}</main>
        </div>
      </div>
    </div>
  );

  if (isAdminRoute && permLoaded && !hasAccess) {
    return LayoutShell(<AccessDenied />);
  }

  return LayoutShell(children);
}
