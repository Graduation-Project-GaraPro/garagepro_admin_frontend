import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Shield, Calendar, Tag, FileText } from 'lucide-react'
import { Policy } from '@/services/policy-service'
import { cn } from '@/lib/utils'

const categoryColors = {
  security: 'bg-red-100 text-red-800',
  privacy: 'bg-blue-100 text-blue-800',
  compliance: 'bg-green-100 text-green-800',
  operational: 'bg-purple-100 text-purple-800',
  financial: 'bg-orange-100 text-orange-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-purple-100 text-purple-800'
}

// Create Policy Dialog
interface CreatePolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (policyData: any) => void
  loading?: boolean
  categories: string[]
  tags: string[]
}

export function CreatePolicyDialog({ open, onOpenChange, onSubmit, loading, categories, tags }: CreatePolicyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'security' as Policy['category'],
    priority: 'medium' as Policy['priority'],
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    tags: [] as string[],
    compliance: {
      gdpr: false,
      hipaa: false,
      sox: false,
      pci: false,
      iso27001: false
    },
    rules: [] as any[]
  })

  const [selectedTag, setSelectedTag] = useState('')

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        category: 'security',
        priority: 'medium',
        effectiveDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        tags: [],
        compliance: {
          gdpr: false,
          hipaa: false,
          sox: false,
          pci: false,
          iso27001: false
        },
        rules: []
      })
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addTag = () => {
    if (selectedTag && !formData.tags.includes(selectedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, selectedTag]
      }))
      setSelectedTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Policy</DialogTitle>
          <DialogDescription>
            Create a new system policy with rules and compliance requirements.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Policy['category']) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Policy['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addTag}>Add Tag</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Compliance Standards</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.compliance).map(([standard, enabled]) => (
                <div key={standard} className="flex items-center space-x-2">
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      compliance: { ...prev.compliance, [standard]: checked }
                    }))}
                  />
                  <Label className="text-sm font-medium capitalize">{standard}</Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Policy Dialog
interface EditPolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: Policy
  onSubmit: (policy: Policy) => void
  loading?: boolean
  categories: string[]
  tags: string[]
}

export function EditPolicyDialog({ open, onOpenChange, policy, onSubmit, loading, categories, tags }: EditPolicyDialogProps) {
  const [formData, setFormData] = useState<Policy>(policy)
  const [selectedTag, setSelectedTag] = useState('')

  useEffect(() => {
    if (open) {
      setFormData(policy)
      setSelectedTag('')
    }
  }, [open, policy])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addTag = () => {
    if (selectedTag && !formData.tags.includes(selectedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, selectedTag]
      }))
      setSelectedTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Policy: {policy.name}</DialogTitle>
          <DialogDescription>
            Update the policy configuration and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Policy['category']) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Policy['status']) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Policy['priority']) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date *</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={new Date(formData.effectiveDate).toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  effectiveDate: new Date(e.target.value).toISOString() 
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expiryDate: e.target.value ? new Date(e.target.value).toISOString() : '' 
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addTag}>Add Tag</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Compliance Standards</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.compliance).map(([standard, enabled]) => (
                <div key={standard} className="flex items-center space-x-2">
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      compliance: { ...prev.compliance, [standard]: checked }
                    }))}
                  />
                  <Label className="text-sm font-medium capitalize">{standard}</Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// View Policy Dialog
interface ViewPolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: Policy
}

export function ViewPolicyDialog({ open, onOpenChange, policy }: ViewPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{policy.name}</span>
          </DialogTitle>
          <DialogDescription>
            Policy details and configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="text-sm">{policy.name}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Category</Label>
              <Badge className={cn(categoryColors[policy.category])}>
                {policy.category}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <Badge className={cn(statusColors[policy.status])}>
                {policy.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Priority</Label>
              <Badge className={cn(priorityColors[policy.priority])}>
                {policy.priority}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Version</Label>
              <p className="text-sm font-mono">v{policy.version}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Effective Date</Label>
              <p className="text-sm">{new Date(policy.effectiveDate).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Description</Label>
            <p className="text-sm text-gray-700">{policy.description}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {policy.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-600">Compliance Standards</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(policy.compliance).map(([standard, compliant]) => (
                <div key={standard} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${compliant ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm font-medium capitalize">{standard}</span>
                  <span className="text-sm text-gray-500">{compliant ? 'Compliant' : 'Not Compliant'}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Created By</Label>
              <p>{policy.createdBy}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Created At</Label>
              <p>{new Date(policy.createdAt).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Updated By</Label>
              <p>{policy.updatedBy}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Last Updated</Label>
              <p>{new Date(policy.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}