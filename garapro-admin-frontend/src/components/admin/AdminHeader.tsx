'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Settings, 
  User, 
  LogOut, 
  Search,
  Plus,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Eye,
  Clock,
  Mail,
  Shield,
  Activity,
  BarChart3,
  Globe,
  Database,
  Server,
  Loader2
} from 'lucide-react'

const notifications = [
  {
    id: 1,
    type: 'warning',
    title: 'High Memory Usage',
    description: 'System memory usage is at 78%',
    time: '5 minutes ago',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    read: false
  },
  {
    id: 2,
    type: 'success',
    title: 'Backup Completed',
    description: 'Daily backup completed successfully',
    time: '2 hours ago',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    read: true
  },
  {
    id: 3,
    type: 'info',
    title: 'New User Registration',
    description: 'john.doe@example.com joined the platform',
    time: '15 minutes ago',
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    read: false
  },
  {
    id: 4,
    type: 'error',
    title: 'Security Alert',
    description: 'Multiple failed login attempts detected',
    time: '1 hour ago',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    read: false
  }
]

export function AdminHeader() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth()


    // Hiển thị loading khi đang check auth
  if (authLoading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
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

  // Hiển thị khi chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
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
  const handleRefreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const handleMarkAllRead = () => {
    setUnreadCount(0)
    setIsNotificationsOpen(false)
  }

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification.title)
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
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
            <h4 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notification.description}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {notification.time}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          
        </div>

        {/* Right side - CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP */}
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
           

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
                  <DialogDescription>
                    {unreadCount} unread notifications
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {notifications.map(renderNotificationItem)}
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

            
            

            {/* User Menu - CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP */}
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
                    <p className="text-sm font-medium leading-none">
                      {user?.email || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.roles?.join(', ') || 'No roles'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
