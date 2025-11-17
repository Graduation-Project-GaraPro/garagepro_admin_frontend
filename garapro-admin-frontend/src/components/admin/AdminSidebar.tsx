// components/admin/AdminSidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, UserCheck } from 'lucide-react'
import { usePermissionContext } from '@/contexts/permission-context'
import { adminMenuItems } from '@/configs/admin-routes'

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  const { loaded, hasAnyPermission } = usePermissionContext()

  useEffect(() => {
    setIsMounted(true)

    // Tự động expand group chứa current route
    const currentMenuItem = adminMenuItems.find(item =>
      pathname === item.href ||
      (item.submenu && item.submenu.some(sub => pathname === sub.href))
    )

    if (currentMenuItem && currentMenuItem.submenu) {
      setExpandedItems([currentMenuItem.title])
    }
  }, [pathname])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  // Skeleton khi permission chưa load xong / SSR
  if (!isMounted || !loaded) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600">System Administration</p>
        </div>
        <div className="flex-1 p-4 space-y-2">
          <div className="h-8 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-600">System Administration</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminMenuItems.map((item) => {
          // nếu config có showInMenu === false thì bỏ
          if (item.showInMenu === false) return null

          // nếu không đủ quyền để thấy menu chính thì ẩn luôn
          if (item.requiredPermissions && !hasAnyPermission(...item.requiredPermissions)) {
            return null
          }

          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname?.startsWith(item.href + '/'))

          const isExpanded = expandedItems.includes(item.title)
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const Icon = item.icon ?? UserCheck

          return (
            <div key={item.title}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              )}

              {hasSubmenu && isExpanded && (
                <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {item.submenu
                    ?.filter(sub =>
                      sub.showInMenu !== false &&
                      (!sub.requiredPermissions ||
                        hasAnyPermission(...sub.requiredPermissions))
                    )
                    .map((subItem) => {
                      const isSubActive = pathname === subItem.href
                      return (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className={cn(
                            'block px-3 py-2 text-sm rounded-md transition-colors',
                            isSubActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          {subItem.title}
                        </Link>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}
