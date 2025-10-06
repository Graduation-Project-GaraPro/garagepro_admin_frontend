'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircleIcon } from "@heroicons/react/24/solid"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  UserPlus, 
  UserX, 
  Building2, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  MoreHorizontal,
  Calendar,
  MapPin,
  Mail,
  // Phone,
  // ExternalLink,
  Copy,
  Check,
  X,
  AlertCircle,
  Info,
  User,
  Building,
  Globe,
  Settings
} from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'user_registered',
    title: 'New user registered',
    description: 'john.doe@example.com joined the platform',
    time: '2 minutes ago',
    user: 'JD',
    status: 'success',
    icon: UserPlus,
    details: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      verificationStatus: 'Pending',
      accountType: 'Standard',
      referralSource: 'Direct'
    }
  },
  {
    id: 2,
    type: 'user_banned',
    title: 'User account banned',
    description: 'spam.user@example.com was banned for violations',
    time: '15 minutes ago',
    user: 'SU',
    status: 'warning',
    icon: UserX,
    details: {
      email: 'spam.user@example.com',
      name: 'Spam User',
      phone: '+1 (555) 999-8888',
      location: 'Unknown',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      banReason: 'Multiple policy violations',
      banDuration: 'Permanent',
      bannedBy: 'Admin System',
      previousWarnings: 3
    }
  },
  {
    id: 3,
    type: 'garage_created',
    title: 'New garage registered',
    description: 'AutoFix Garage joined the platform',
    time: '1 hour ago',
    user: 'AG',
    status: 'success',
    icon: Building2,
    details: {
      name: 'AutoFix Garage',
      email: 'contact@autofix.com',
      phone: '+1 (555) 777-6666',
      location: 'Los Angeles, CA',
      address: '123 Main St, Los Angeles, CA 90210',
      businessType: 'Automotive Repair',
      services: ['Oil Change', 'Brake Service', 'Engine Repair'],
      domain: 'autofix.garapro.com',
      verificationStatus: 'Pending',
      ownerName: 'Mike Johnson'
    }
  },
  {
    id: 4,
    type: 'security_alert',
    title: 'Security alert detected',
    description: 'Multiple failed login attempts detected',
    time: '3 hours ago',
    user: 'SA',
    status: 'error',
    icon: AlertTriangle,
    details: {
      alertType: 'Failed Login Attempts',
      targetEmail: 'admin@garapro.com',
      ipAddress: '203.0.113.45',
      location: 'Unknown',
      attempts: 15,
      timeRange: '2 hours',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      threatLevel: 'High',
      actionTaken: 'IP Blocked',
      resolved: false
    }
  },
  {
    id: 5,
    type: 'domain_created',
    title: 'New domain created',
    description: 'autofix.garapro.com subdomain created',
    time: '5 hours ago',
    user: 'DC',
    status: 'success',
    icon: CheckCircle,
    details: {
      domain: 'autofix.garapro.com',
      garageName: 'AutoFix Garage',
      createdBy: 'Admin User',
      sslStatus: 'Active',
      dnsStatus: 'Propagated',
      redirects: [],
      customSettings: {
        maintenanceMode: false,
        analyticsEnabled: true,
        backupEnabled: true
      }
    }
  },
  {
    id: 6,
    type: 'system_backup',
    title: 'System backup completed',
    description: 'Daily backup completed successfully',
    time: '1 day ago',
    user: 'SB',
    status: 'info',
    icon: Shield,
    details: {
      backupType: 'Full System Backup',
      size: '2.5 GB',
      duration: '45 minutes',
      location: 'AWS S3',
      retention: '30 days',
      status: 'Completed',
      filesBackedUp: 15420,
      databasesBackedUp: 3,
      verificationStatus: 'Verified'
    }
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'info':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'error':
      return X
    case 'info':
      return Info
    default:
      return Info
  }
}

export function RecentActivity() {
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedActivity(null)
  }

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const renderActivityDetails = (activity: any) => {
    const StatusIcon = getStatusIcon(activity.status)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-50' : activity.status === 'warning' ? 'bg-yellow-50' : activity.status === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
              <activity.icon className={`h-5 w-5 ${activity.status === 'success' ? 'text-green-600' : activity.status === 'warning' ? 'text-yellow-600' : activity.status === 'error' ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
              <p className="text-sm text-gray-500">{activity.description}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(activity.status)}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {activity.status}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(activity.details).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900 break-all">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyToClipboard(String(value), key)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  {copiedField === key ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          {activity.type === 'user_registered' && (
            <>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Send Welcome Email
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </>
          )}
          
          {activity.type === 'user_banned' && (
            <>
              <Button variant="outline" size="sm">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Unban User
              </Button>
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Ban History
              </Button>
            </>
          )}
          
          {activity.type === 'garage_created' && (
            <>
              <Button variant="outline" size="sm">
                <Building className="h-4 w-4 mr-2" />
                View Garage
              </Button>
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Manage Domain
              </Button>
            </>
          )}
          
          {activity.type === 'security_alert' && (
            <>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Block IP
              </Button>
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Investigate
              </Button>
            </>
          )}
          
          {activity.type === 'domain_created' && (
            <>
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Visit Domain
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Domain Settings
              </Button>
            </>
          )}
          
          {activity.type === 'system_backup' && (
            <>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Download Backup
              </Button>
              <Button variant="outline" size="sm">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Verify Backup
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(activity)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.user}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all activity →
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>
              Detailed information about this activity
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedActivity && renderActivityDetails(selectedActivity)}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}