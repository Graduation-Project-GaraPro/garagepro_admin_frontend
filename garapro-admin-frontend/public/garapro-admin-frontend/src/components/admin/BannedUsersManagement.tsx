'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import SendEmailDialog from '@/components/admin/users/SendEmailDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  UserX, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Clock,
  Ban,
  Eye,
  Mail,
  Phone
} from 'lucide-react'

const bannedUsers = [
  {
    id: 1,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1 (555) 123-4567',
    banReason: 'Violation of community guidelines',
    banDate: '2024-03-15',
    bannedBy: 'admin@garapro.com',
    banType: 'permanent',
    appealStatus: 'pending',
    lastActivity: '2024-03-15 09:20',
    avatar: 'BJ'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+1 (555) 987-6543',
    banReason: 'Spam and inappropriate content',
    banDate: '2024-03-10',
    bannedBy: 'moderator@garapro.com',
    banType: 'temporary',
    appealStatus: 'approved',
    lastActivity: '2024-03-10 14:30',
    avatar: 'SW'
  },
  {
    id: 3,
    name: 'Mike Davis',
    email: 'mike.davis@example.com',
    phone: '+1 (555) 456-7890',
    banReason: 'Multiple failed login attempts',
    banDate: '2024-03-08',
    bannedBy: 'system@garapro.com',
    banType: 'temporary',
    appealStatus: 'rejected',
    lastActivity: '2024-03-08 11:15',
    avatar: 'MD'
  },
  {
    id: 4,
    name: 'Lisa Brown',
    email: 'lisa.brown@example.com',
    phone: '+1 (555) 321-6547',
    banReason: 'Fraudulent activity detected',
    banDate: '2024-03-05',
    bannedBy: 'admin@garapro.com',
    banType: 'permanent',
    appealStatus: 'pending',
    lastActivity: '2024-03-05 16:45',
    avatar: 'LB'
  }
]
const handleCall = () => {
  // Ví dụ gọi đến số +84 123 456 789
  window.location.href = "tel:+84123456789"
}
const getBanTypeBadge = (type: string) => {
  switch (type) {
    case 'permanent':
      return <Badge variant="destructive">Permanent</Badge>
    case 'temporary':
      return <Badge className="bg-yellow-100 text-yellow-800">Temporary</Badge>
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
}

const getAppealStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
    case 'approved':
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function BannedUsersManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [banTypeFilter, setBanTypeFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const filteredUsers = bannedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = banTypeFilter === 'all' || user.banType === banTypeFilter
    return matchesSearch && matchesType
  })

  const handleUnbanUser = (user: any) => {
    setSelectedUser(user)
    setIsUnbanDialogOpen(true)
  }

  const handleViewDetails = (user: any) => {
    setSelectedUser(user)
    setIsViewDetailsDialogOpen(true)
  }

  const confirmUnban = () => {
    console.log(`Unbanning user: ${selectedUser?.name}`)
    setIsUnbanDialogOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search banned users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={banTypeFilter}
              onChange={(e) => setBanTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ban Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Banned Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banned Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Ban Reason</TableHead>
                <TableHead>Ban Type</TableHead>
                <TableHead>Ban Date</TableHead>
                <TableHead>Appeal Status</TableHead>
                <TableHead>Banned By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={user.banReason}>
                      {user.banReason}
                    </div>
                  </TableCell>
                  <TableCell>{getBanTypeBadge(user.banType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{user.banDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getAppealStatusBadge(user.appealStatus)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{user.bannedBy}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanUser(user)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Unban
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unban Dialog */}
      <Dialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {selectedUser?.name}? This will restore their access to the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnbanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUnban} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{selectedUser.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <p className="text-gray-600">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ban Reason</label>
                  <p className="text-sm bg-red-50 p-3 rounded mt-1">{selectedUser.banReason}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ban Type</label>
                  <div className="mt-1">{getBanTypeBadge(selectedUser.banType)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ban Date</label>
                  <p className="text-sm">{selectedUser.banDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Banned By</label>
                  <p className="text-sm">{selectedUser.bannedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Appeal Status</label>
                  <div className="mt-1">{getAppealStatusBadge(selectedUser.appealStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Activity</label>
                  <p className="text-sm">{selectedUser.lastActivity}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Actions</label>
                <div className="flex space-x-2 mt-2">
                  
                  <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleCall}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call User
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Review Appeal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SendEmailDialog 
        open={emailDialogOpen} 
        onOpenChange={setEmailDialogOpen} 
        user={selectedUser} 
      />
    </div>
  )
} 