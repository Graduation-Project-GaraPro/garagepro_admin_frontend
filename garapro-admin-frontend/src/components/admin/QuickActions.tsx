'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  UserX, 
  CheckCircle,
  Globe,
  Activity,
  Mail,
  Building2,
  Info,
  Save,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

const quickActions = [
  {
    title: 'Ban User',
    description: 'Temporarily suspend user account',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    action: 'ban-user',
    modalTitle: 'Ban User Account',
    modalDescription: 'Suspend a user account temporarily or permanently'
  },
  {
    title: 'Unban User',
    description: 'Restore user account access',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    action: 'unban-user',
    modalTitle: 'Unban User Account',
    modalDescription: 'Restore access to a previously banned user account'
  },
  {
    title: 'Create Branch',
    description: 'Add new Branch for garage',
    icon: Globe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    action: 'create-domain',
    modalTitle: 'Create New Domain',
    modalDescription: 'Create a new subdomain for a garage'
  }
]

export function QuickActions() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    reason: '',
    duration: '',
    domain: '',
    garageName: '',
    description: ''
  })

  const handleSubmit = async (action: string) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
  
    switch (action) {
      case 'ban-user':
        toast.success(`User ${formData.email} banned`, {
          description: `Reason: ${formData.reason || 'No reason provided'}`,
        })
        break
  
      case 'unban-user':
        toast.success(`User ${formData.email} unbanned`)
        break
  
      case 'create-domain':
        toast.success(`Domain ${formData.domain} created`, {
          description: `Garage: ${formData.garageName}`,
        })
        break
  
      default:
        toast.error('Unknown action')
        break
    }
  
    setIsLoading(false)
    setSelectedAction(null)
    setFormData({
      email: '',
      reason: '',
      duration: '',
      domain: '',
      garageName: '',
      description: ''
    })
  }
  

  const renderModalContent = (action: string) => {
    switch (action) {
      case 'ban-user':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter user email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Ban Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-day">1 Day</SelectItem>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for banning this user..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        )

      case 'unban-user':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter user email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Restore Access</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This will immediately restore all access privileges to the user account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'create-domain':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="garageName">Garage Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="garageName"
                  placeholder="Enter garage name"
                  value={formData.garageName}
                  onChange={(e) => setFormData({...formData, garageName: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="domain">Subdomain</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="domain"
                  placeholder="Enter subdomain (e.g., autofix)"
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">The full domain will be: {formData.domain}.garapro.com</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for this domain..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Dialog
                key={action.title}
                open={selectedAction === action.action}
                onOpenChange={(open) => {
                  if (!open) {
                    setSelectedAction(null)
                  } else {
                    setSelectedAction(action.action)
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`p-2 rounded-lg ${action.bgColor}`}>
                        <Icon className={`h-4 w-4 ${action.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${action.color}`} />
                      <span>{action.modalTitle}</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                      {action.modalDescription}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    {renderModalContent(action.action)}
                  </div>
                  
                  <DialogFooter className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAction(null)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSubmit(action.action)}
                      disabled={isLoading}
                      className="min-w-[80px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}