'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Phone, Mail, Users, Clock, Building2, Edit, Trash2, Eye, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight , Play, Pause} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { branchService, GarageBranch } from '@/services/branch-service'
import Link from 'next/link'
import { toast } from 'sonner'

export default function BranchesPage() {
   const [branches, setBranches] = useState<GarageBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadBranches()
  }, [currentPage, pageSize]) // Reload when page or page size changes

  const loadBranches = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await branchService.getBranches(currentPage, pageSize, {
        search: searchTerm || undefined,
        city: cityFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      })
      console.log(response?.totalPages );
      setBranches(response?.branches || [])
      setTotalCount(response?.totalCount || 0)
      setTotalPages(Math.ceil((response?.totalPages || 1) / pageSize))
    } catch (error) {
      console.error('Failed to load branches:', error)
      setError('Failed to load branches. Please try again later.')
      toast.error('Failed to load branches', {
        description: 'Please try again later.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    loadBranches()
  }

  const handleStatusToggle = async (branchId: string, currentStatus: boolean) => {
    try {
      await branchService.toggleBranchStatus(branchId, !currentStatus)
      loadBranches()
      toast.success(`Branch ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Failed to toggle branch status:', error)
      toast.error('Failed to toggle branch status', {
        description: 'Please try again.'
      })
    }
  }

  const handleDelete = async (branchId: string) => {
    setConfirmDeleteId(branchId)
  }

  

  const handleCloseError = () => {
    setError(null)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExporting(true)
      const blob = await branchService.exportBranches({
        search: searchTerm || undefined,
        city: cityFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      }, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `branches-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Export started successfully')
    } catch (error) {
      console.error('Export failed', error)
      toast.error('Failed to export branches', {
        description: 'Please check your connection and try again.'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    const allIds = branches.map(b => b.branchId)
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
    setSelectedIds(allSelected ? [] : allIds)
  }

  const bulkActivate = async () => {
    if (selectedIds.length === 0) return
    try {
      await branchService.bulkActivateBranchesApi(selectedIds)
      toast.success('Selected branches activated')
      setSelectedIds([])
      loadBranches()
    } catch (e) {
      toast.error('Failed to activate selected branches', {
        description: e instanceof Error ? e.message : 'Please try again.'
      })
    }
  }

  const bulkDeactivate = async () => {
    if (selectedIds.length === 0) return
    try {
      await branchService.bulkDeactivateBranchesApi(selectedIds)
      toast.success('Selected branches deactivated')
      setSelectedIds([])
      loadBranches()
    } catch (e) {
      toast.error('Failed to deactivate selected branches', {
        description: e instanceof Error ? e.message : 'Please try again.'
      })
    }
  }

  
  const bulkDelete = async () => {
    if (selectedIds.length === 0) return
    setConfirmBulkDelete(true)
  }


  const handleConfirmBulkDelete = async () => {
  try {
    await branchService.bulkDeleteBranchesApi(selectedIds)
    toast.success('Selected branches deleted')
    setSelectedIds([])
    setConfirmBulkDelete(false)
    loadBranches()
  } catch (e) {
    toast.error('Failed to delete selected branches', {
      description: e instanceof Error ? e.message : 'Unknown error occurred'
    })
  }
}

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  // Get unique cities for filter
  const uniqueCities = [...new Set(branches.map(branch => branch.province))].filter(Boolean)

  // Calculate display range
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Garage Branches</h1>
          <p className="text-muted-foreground">
            Manage multiple branches with their own locations, services, and staff
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" onClick={bulkActivate}><Play className="mr-1 h-4 w-4" /> Activate ({selectedIds.length})</Button>
              <Button variant="outline" onClick={bulkDeactivate}><Pause className="mr-1 h-4 w-4" /> Deactivate ({selectedIds.length})</Button>
              <Button variant="destructive" onClick={bulkDelete}>Delete ({selectedIds.length})</Button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
            </>
          )}
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Link href="/admin/branches/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Branch
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCloseError} className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800">
              ×
            </Button>
          </div>
        </div>
      )}




  {/* Quick Stats */}
      {!loading && branches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{branches.length}</div>
              <p className="text-xs text-muted-foreground">
                {branches.filter(b => b.isActive).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {branches.reduce((total, branch) => total + branch.staffs.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all branches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {branches.reduce((total, branch) => total + branch.services.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Available services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(branches.map(b => b.province)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique locations
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search branches by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={cityFilter || 'all'} onValueChange={v => setCityFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Branches</CardTitle>
            <CardDescription>
              Manage your garage branches and their operations
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              Loading branches...
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No branches found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        checked={branches.length > 0 && branches.every(b => selectedIds.includes(b.branchId))} 
                      />
                    </TableHead>
                    <TableHead>Branch Information</TableHead>
                    <TableHead>Location Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Operating Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.branchId}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(branch.branchId)} 
                          onChange={() => toggleSelect(branch.branchId)} 
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.branchName}</div>
                          <div className="text-sm text-muted-foreground">
                            {branchService.getManagerInfo(branch.staffs).name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(branch.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {branch.street}
                          </div>
                          <div className="text-muted-foreground ml-4">
                            {branch.commune}, {branch.province}
                          </div>
                         
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatPhone(branch.phoneNumber)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {branch.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {branchService.getActiveServicesCount(branch.services)} active
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {branch.services.slice(0, 2).map(service => (
                              <div key={service.serviceId}>
                                {service.serviceName} - {formatCurrency(service.price)}
                              </div>
                            ))}
                            {branch.services.length > 2 && (
                              <div>+{branch.services.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {branchService.getActiveStaffCount(branch.staffs)} active
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {branch.staffs.slice(0, 2).map(staff => (
                              <div key={staff.id}>
                                {staff.firstName} {staff.lastName}
                              </div>
                            ))}
                            {branch.staffs.length > 2 && (
                              <div>+{branch.staffs.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {branchService.getOpenDaysCount(branch.operatingHours)}/7 days
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {branch.operatingHours
                              .filter(hours => hours.isOpen)
                              .slice(0, 2)
                              .map(hours => (
                                <div key={hours.dayOfWeek}>
                                  {branchService.getDayName(hours.dayOfWeek)}: {hours.openTime} - {hours.closeTime}
                                </div>
                              ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(branch.isActive)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/branches/${branch.branchId}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/branches/${branch.branchId}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusToggle(branch.branchId, branch.isActive)}
                          >
                            {branch.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(branch.branchId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            {/* Hiển thị số trang */}
            {console.log(totalPages)}
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              {/* First Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Numbers */}
              {getPageNumbers().map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

            </>
          )}
        </CardContent>
      </Card>


      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete Multiple Branches</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete {selectedIds.length} selected branch(es)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmBulkDelete(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleConfirmBulkDelete}
              >
                Delete {selectedIds.length} Branch(es)
              </Button>
            </div>
          </div>
        </div>
      )}
    

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete Branch</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this branch? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await branchService.deleteBranch(confirmDeleteId)
                    setConfirmDeleteId(null)
                    toast.success('Branch deleted successfully')
                    loadBranches()
                  } catch (error) {
                    toast.error('Failed to delete branch', {
                        description: error instanceof Error ? error.message : 'Please try again.'
                      })
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

    
  )
}