"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissionContext } from "@/contexts/permission-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { routePermissionRules } from "@/configs/admin-routes";
import AccessDenied from "@/app/access-denied/page";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { loaded: permLoaded, hasAnyPermission } = usePermissionContext();
  const router = useRouter();
  const pathname = usePathname() || "";

  const isAdminRoute = pathname.startsWith("/admin");

  // 🔥 Các route admin KHÔNG cần check permission (chỉ cần login)
  const adminUnprotectedRoutes = ["/admin/profile"];

  const isUnprotectedAdminRoute =
    isAdminRoute && adminUnprotectedRoutes.includes(pathname);

  // Chỉ khi auth xong + permission xong mới check
  const isChecking = isLoading || !permLoaded;

  // Tìm rule cho route hiện tại
  const matchedRule = routePermissionRules.find((rule) =>
    rule.pattern.test(pathname)
  );

  console.log("matchedRule", matchedRule);

  const hasAccess = (() => {
    if (!isAuthenticated) return false;

    // ✅ /admin/profile (hoặc các unprotected admin route khác) → chỉ cần login
    if (isUnprotectedAdminRoute) return true;

    // Route không phải /admin → không check permission
    if (!isAdminRoute) return true;

    // /admin mà không có rule → không cho
    if (!matchedRule) return false;

    // Có rule → check permission
    return hasAnyPermission(...matchedRule.permissions);
  })();

  
  useEffect(() => {
    if (isChecking) return;

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isChecking, isAuthenticated, router]);

  
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

  
  if (!isAuthenticated) {
    return null;
  }


  if (isAdminRoute && permLoaded && !hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6">
              <AccessDenied />
            </main>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Đến đây là chắc chắn có quyền (hoặc là /admin/profile được whitelist) → render layout
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
