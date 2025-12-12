'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronRight,
  UserCheck,
  X,
} from 'lucide-react'
import { usePermissionContext } from '@/contexts/permission-context'
import { adminMenuItems } from '@/configs/admin-routes'

type AdminSidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  const { loaded, hasAnyPermission } = usePermissionContext()

  useEffect(() => {
    setIsMounted(true)

    const currentMenuItem = adminMenuItems.find(
      (item) =>
        pathname === item.href ||
        (item.submenu && item.submenu.some((sub) => pathname === sub.href))
    )

    if (currentMenuItem && currentMenuItem.submenu) {
      setExpandedItems([currentMenuItem.title])
    }
  }, [pathname])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    )
  }

  // Skeleton
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

  // ====== Sidebar content (reuse for desktop + mobile) ======
  const SidebarContent = (
    <div
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col h-screen',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className={cn('border-b border-gray-200', collapsed ? 'p-3' : 'p-6')}>
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">System Administration</p>
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'hidden md:inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50',
              collapsed ? 'h-10 w-10' : 'h-10 w-10'
            )}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', collapsed ? 'rotate-0' : 'rotate-180')}
            />
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className={cn('flex-1 p-3 space-y-2', collapsed && 'px-2')}>
        {adminMenuItems.map((item) => {
          if (item.showInMenu === false) return null
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
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    collapsed && 'px-2'
                  )}
                  aria-expanded={isExpanded}
                  title={collapsed ? item.title : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </div>

                  {!collapsed &&
                    (isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ))}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    collapsed && 'px-2'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </div>
                </Link>
              )}

              {hasSubmenu && isExpanded && !collapsed && (
                <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {item.submenu
                    ?.filter(
                      (sub) =>
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
                          onClick={onCloseMobile}
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

      <div className={cn('border-t border-gray-200', collapsed ? 'p-3' : 'p-4')}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">System Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ====== Desktop (sticky) ======
  // ====== Mobile (drawer) ======
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block sticky top-0">{SidebarContent}</div>

      {/* Mobile Drawer */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-50',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={onCloseMobile}
        />
        <div
          className={cn(
            'absolute left-0 top-0 h-full transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* mobile: luôn full */}
          <div className="w-64">{/* keep same width */}
            {SidebarContent}
          </div>
        </div>
      </div>
    </>
  )
}
