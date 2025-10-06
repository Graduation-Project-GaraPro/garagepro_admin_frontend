'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Megaphone,
  DollarSign,
  MapPin,
  Wrench
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    submenu: [
      { title: 'All Users', href: '/admin/users' },
      { title: 'Banned Users', href: '/admin/users/banned' },
      { title: 'User Roles', href: '/admin/users/roles' },
    ]
  },
  {
    title: 'Policies',
    href: '/admin/policies',
    icon: FileCheck,
    submenu: [
      { title: 'Security Policies', href: '/admin/policies/security' }
    ]
  },
  {
    title: 'Statistics',
    href: '/admin/statistics',
    icon: BarChart3,
    submenu: [
      { title: 'Overview', href: '/admin/statistics' },
      { title: 'Advanced Analytics', href: '/admin/statistics/advanced' },
      { title: 'Real-time Analytics', href: '/admin/statistics/realtime' },
      { title: 'Revenue Reports', href: '/admin/financial-reports' }      
    ]
  },
  {
    title: 'System Logs',
    href: '/admin/logs',
    icon: FileText,
    submenu: [
      { title: 'All Logs', href: '/admin/logs' },
      { title: 'Log Analytics', href: '/admin/logs/analytics' }
      
    ]
  },
  {
    title: 'Promotional Campaigns',
    href: '/admin/campaigns',
    icon: Megaphone,
    submenu: [
      { title: 'All Campaigns', href: '/admin/campaigns' },
      { title: 'Create Campaign', href: '/admin/campaigns/create' }
     
    ]
  },
  {
    title: 'Garage Branches',
    href: '/admin/branches',
    icon: MapPin,
    submenu: [
      { title: 'All Branches', href: '/admin/branches' },
      { title: 'Create Branch', href: '/admin/branches/create' }
     
    ]
  },
  {
    title: 'Garage Services',
    href: '/admin/services',
    icon: Wrench,
    submenu: [
      { title: 'All Services', href: '/admin/services' },
      { title: 'Create Service', href: '/admin/services/create' }    
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Chỉ chạy trên client sau khi mount
  useEffect(() => {
    setIsMounted(true)
    
    // Auto-expand current section sau khi hydration
    const currentMenuItem = menuItems.find(item => 
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

  // Render simplified version cho SSR - không sử dụng usePathname
  if (!isMounted) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600">System Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0

            return (
              <div key={item.title}>
                {hasSubmenu ? (
                  <div
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      "text-gray-700"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      "text-gray-700"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
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

  // Client-side rendering với đầy đủ tính năng
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-600">System Administration</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href + '/'))
          const isExpanded = expandedItems.includes(item.title)
          const hasSubmenu = item.submenu && item.submenu.length > 0

          return (
            <div key={item.title}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4" />
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
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              )}

              {hasSubmenu && isExpanded && (
                <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {item.submenu.map((subItem) => {
                    const isSubActive = pathname === subItem.href
                    return (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className={cn(
                          "block px-3 py-2 text-sm rounded-md transition-colors",
                          isSubActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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