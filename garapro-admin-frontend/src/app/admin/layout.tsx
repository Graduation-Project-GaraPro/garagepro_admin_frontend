// app/admin/layout.tsx
'use client'

import { useAuth } from '@/contexts/auth-context'
import { usePermissionContext } from '@/contexts/permission-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { routePermissionRules } from '@/configs/admin-routes'
import AccessDenied from '@/app/access-denied/page' // 👈 dùng lại UI sẵn có

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const { loaded: permLoaded, hasAnyPermission } = usePermissionContext()
  const router = useRouter()
  const pathname = usePathname() || ''

  const isAdminRoute = pathname.startsWith('/admin')

  // Chỉ khi auth xong + permission xong mới check
  const isChecking = isLoading || !permLoaded

  // Tìm rule cho route hiện tại
  const matchedRule = routePermissionRules.find(rule => rule.pattern.test(pathname))

  console.log("matchedRule", matchedRule)
  // Tính quyền truy cập
  const hasAccess = (() => {
    if (!isAuthenticated) return false

    // /admin mà không có rule → không cho
    if (isAdminRoute && !matchedRule) return false

    // route không phải /admin hoặc không có rule (vd: /login, /access-denied)
    if (!isAdminRoute || !matchedRule) return true

    // Có rule → check permission
    return hasAnyPermission(...matchedRule.permissions)
  })()

  // Redirect LOGIN duy nhất chỗ này
  useEffect(() => {
    if (isChecking) return

    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isChecking, isAuthenticated, router])

  // Đang check auth/permission → loading
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }

  // Chưa login → effect phía trên sẽ redirect, ở đây không render gì
  if (!isAuthenticated) {
    return null
  }

  // 👉 ĐÃ login, là route admin nhưng KHÔNG có quyền → render AccessDenied TẠI CHỖ
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
    )
  }

  // ✅ Đến đây là chắc chắn có quyền → render layout bình thường
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
