// 'use client'

// import { useState } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Label } from '@/components/ui/label'
// import { Download, Plus, Filter, Search, Shield, CheckCircle, AlertTriangle, Settings } from 'lucide-react'
// import { toast } from 'sonner'

// import { PolicyTable } from '@/components/admin/policies/PolicyTable'
// import { CreatePolicyDialog, EditPolicyDialog, ViewPolicyDialog } from '@/components/admin/policies/PolicyDialogs'
// import { usePolicies, usePolicyStatistics, usePolicyOperations, usePolicyCategories, usePolicyTags } from '@/hooks/admin/policies/usePolicies'
// import { Policy } from '@/services/policy-service'
// import { policyService } from '@/services/policy-service'

// export function PolicyManagement() {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterCategory, setFilterCategory] = useState('all')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [filterPriority, setFilterPriority] = useState('all')
//   const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

//   const { policies, loading, refetch } = usePolicies({
//     search: searchTerm,
//     category: filterCategory !== 'all' ? filterCategory : undefined,
//     status: filterStatus !== 'all' ? filterStatus : undefined,
//     priority: filterPriority !== 'all' ? filterPriority : undefined
//   })

//   const { statistics, loading: statsLoading } = usePolicyStatistics()
//   const { loading: operationLoading, createPolicy, updatePolicy, deletePolicy, activatePolicy, deactivatePolicy, archivePolicy } = usePolicyOperations()
//   const { categories, loading: categoriesLoading } = usePolicyCategories()
//   const { tags, loading: tagsLoading } = usePolicyTags()

//   const handleCreate = async (policyData: any) => {
//     try {
//       await createPolicy(policyData)
//       toast.success('Policy created successfully')
//       setIsCreateDialogOpen(false)
//       refetch()
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to create policy')
//     }
//   }

//   const handleUpdate = async (policy: Policy) => {
//     try {
//       await updatePolicy(policy.id, policy)
//       toast.success('Policy updated successfully')
//       setIsEditDialogOpen(false)
//       setSelectedPolicy(null)
//       refetch()
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to update policy')
//     }
//   }

//   const handleDelete = async (policy: Policy) => {
//     try {
//       await deletePolicy(policy.id)
//       toast.success('Policy deleted successfully')
//       refetch()
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to delete policy')
//     }
//   }

//   const handleActivate = async (policy: Policy) => {
//     try {
//       await activatePolicy(policy.id)
//       toast.success('Policy activated successfully')
//       refetch()
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to activate policy')
//     }
//   }

//   const handleDeactivate = async (policy: Policy) => {
//     try {
//       await deactivatePolicy(policy.id)
//       toast.success('Policy deactivated successfully')
//       refetch()
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to deactivate policy')
//     }
//   }

//   const handleArchive = async (policy: Policy) => {
//     try {
//       await archivePolicy(policy.id)
//       toast.success('Policy archived successfully')
//       refetch()
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to archive policy')
//     }
//   }

//   const handleExport = async () => {
//     try {
//       const blob = await policyService.exportPolicies({
//         search: searchTerm,
//         category: filterCategory !== 'all' ? filterCategory : undefined,
//         status: filterStatus !== 'all' ? filterStatus : undefined,
//         priority: filterPriority !== 'all' ? filterPriority : undefined
//       }, 'json')
      
//       const url = URL.createObjectURL(blob)
//       const link = document.createElement('a')
//       link.href = url
//       link.download = 'policies-export.json'
//       link.click()
//       URL.revokeObjectURL(url)
//       toast.success('Policies exported successfully')
//     } catch (error) {
//       toast.error('Failed to export policies')
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
//           <p className="text-gray-600 mt-1">Manage system policies, security rules, and compliance requirements</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <Button variant="outline" onClick={handleExport} disabled={operationLoading}>
//             <Download className="h-4 w-4 mr-2" />
//             Export
//           </Button>
//           <Button onClick={() => setIsCreateDialogOpen(true)} disabled={operationLoading}>
//             <Plus className="h-4 w-4 mr-2" />
//             Create Policy
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <Filter className="h-5 w-5" />
//             <span>Filters</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <Label htmlFor="search">Search</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="search"
//                   placeholder="Search policies..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//             <div>
//               <Label htmlFor="category">Category</Label>
//               <Select value={filterCategory} onValueChange={setFilterCategory}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Categories" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Categories</SelectItem>
//                   {categories.map(category => (
//                     <SelectItem key={category} value={category}>{category}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="status">Status</Label>
//               <Select value={filterStatus} onValueChange={setFilterStatus}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                   <SelectItem value="draft">Draft</SelectItem>
//                   <SelectItem value="archived">Archived</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="priority">Priority</Label>
//               <Select value={filterPriority} onValueChange={setFilterPriority}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Priorities" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Priorities</SelectItem>
//                   <SelectItem value="low">Low</SelectItem>
//                   <SelectItem value="medium">Medium</SelectItem>
//                   <SelectItem value="high">High</SelectItem>
//                   <SelectItem value="critical">Critical</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
//             <Shield className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{statistics?.totalPolicies || 0}</div>
//             <p className="text-xs text-muted-foreground">
//               Across all categories
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
//             <CheckCircle className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{statistics?.activePolicies || 0}</div>
//             <p className="text-xs text-muted-foreground">
//               Currently enforced
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
//             <Settings className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{statistics?.complianceScore || 0}%</div>
//             <p className="text-xs text-muted-foreground">
//               Overall compliance rate
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Violations</CardTitle>
//             <AlertTriangle className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{statistics?.violationsThisMonth || 0}</div>
//             <p className="text-xs text-muted-foreground">
//               This month
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Policies Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Policies</CardTitle>
//           <CardDescription>
//             Manage system policies and their configurations
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <PolicyTable
//             policies={policies}
//             loading={loading}
//             onView={(policy) => {
//               setSelectedPolicy(policy)
//               setIsViewDialogOpen(true)
//             }}
//             onEdit={(policy) => {
//               setSelectedPolicy(policy)
//               setIsEditDialogOpen(true)
//             }}
//             onDelete={handleDelete}
//             onActivate={handleActivate}
//             onDeactivate={handleDeactivate}
//             onArchive={handleArchive}
//           />
//         </CardContent>
//       </Card>

//       {/* Dialogs */}
//       <CreatePolicyDialog
//         open={isCreateDialogOpen}
//         onOpenChange={setIsCreateDialogOpen}
//         onSubmit={handleCreate}
//         loading={operationLoading}
//         categories={categories}
//         tags={tags}
//       />

//       {selectedPolicy && (
//         <EditPolicyDialog
//           open={isEditDialogOpen}
//           onOpenChange={setIsEditDialogOpen}
//           policy={selectedPolicy}
//           onSubmit={handleUpdate}
//           loading={operationLoading}
//           categories={categories}
//           tags={tags}
//         />
//       )}

//       {selectedPolicy && (
//         <ViewPolicyDialog
//           open={isViewDialogOpen}
//           onOpenChange={setIsViewDialogOpen}
//           policy={selectedPolicy}
//         />
//       )}
//     </div>
//   )
// }