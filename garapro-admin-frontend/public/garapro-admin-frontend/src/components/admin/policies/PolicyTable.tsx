import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, Play, Pause, Archive } from 'lucide-react'
import { Policy } from '@/services/policy-service'
import { cn } from '@/lib/utils'

const categoryColors = {
  security: 'bg-red-100 text-red-800 border-red-200',
  privacy: 'bg-blue-100 text-blue-800 border-blue-200',
  compliance: 'bg-green-100 text-green-800 border-green-200',
  operational: 'bg-purple-100 text-purple-800 border-purple-200',
  financial: 'bg-orange-100 text-orange-800 border-orange-200'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  archived: 'bg-purple-100 text-purple-800 border-purple-200'
}

interface PolicyTableProps {
  policies: Policy[]
  loading: boolean
  onView: (policy: Policy) => void
  onEdit: (policy: Policy) => void
  onDelete: (policy: Policy) => void
  onActivate: (policy: Policy) => void
  onDeactivate: (policy: Policy) => void
  onArchive: (policy: Policy) => void
}

export function PolicyTable({ 
  policies, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  onActivate, 
  onDeactivate, 
  onArchive 
}: PolicyTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Effective Date</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => (
          <TableRow key={policy.id}>
            <TableCell>
              <div>
                <div className="font-medium">{policy.name}</div>
                <div className="text-sm text-gray-500 line-clamp-2">{policy.description}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(categoryColors[policy.category])}>
                {policy.category}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(statusColors[policy.status])}>
                {policy.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(priorityColors[policy.priority])}>
                {policy.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                v{policy.version}
              </span>
            </TableCell>
            <TableCell>
              <div className="text-sm text-gray-500">
                {new Date(policy.effectiveDate).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {policy.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {policy.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{policy.tags.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end space-x-1">
                <Button variant="ghost" size="sm" onClick={() => onView(policy)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(policy)}>
                  <Edit className="h-4 w-4" />
                </Button>
                
                {policy.status === 'draft' && (
                  <Button variant="ghost" size="sm" onClick={() => onActivate(policy)}>
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                
                {policy.status === 'active' && (
                  <Button variant="ghost" size="sm" onClick={() => onDeactivate(policy)}>
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                
                {policy.status !== 'archived' && (
                  <Button variant="ghost" size="sm" onClick={() => onArchive(policy)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" onClick={() => onDelete(policy)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}