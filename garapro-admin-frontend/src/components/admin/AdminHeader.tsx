'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from "next/link";
import { useAuth } from '@/contexts/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bell,
  User,
  LogOut,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  Menu,          // ✅ thêm
} from 'lucide-react'

// ... notifications array giữ nguyên

type AdminHeaderProps = {
  onOpenSidebar?: () => void      // ✅ mobile open drawer
  onToggleSidebar?: () => void    // ✅ desktop collapse toggle
}

export function AdminHeader({ onOpenSidebar, onToggleSidebar }: AdminHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
          </div>
        </div>
      </header>
    )
  }

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => (window.location.href = '/')}>
              Login
            </Button>
          </div>
        </div>
      </header>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleMarkAllRead = () => {
    setUnreadCount(0)
    setIsNotificationsOpen(false)
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const renderNotificationItem = (notification: any) => {
    const Icon = notification.icon
    return (
      <div
        key={notification.id}
        className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
          notification.read ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
        } ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className={`p-2 rounded-lg ${notification.bgColor}`}>
          <Icon className={`h-4 w-4 ${notification.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
          <div className="flex items-center space-x-1 mt-2">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{notification.time}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* ✅ Mobile open */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* ✅ Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Admin Dashboard
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md w-full">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                      Mark all read
                    </Button>
                  )}
                </DialogTitle>
                <DialogDescription>{unreadCount} unread notifications</DialogDescription>
              </DialogHeader>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {/* {notifications.map(renderNotificationItem)} */}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNotificationsOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.roles?.join(', ') || 'No roles'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/edit">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
