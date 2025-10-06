'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, Users, Building2, Clock, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { branchService, GarageBranch, BranchServiceType as BranchService, BranchStaff, OperatingHours } from '@/services/branch-service'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

// Interface for day schedule
interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
}

export default function BranchManagementPage() {
  const params = useParams()
  const router = useRouter()
  const branchId = params.id as string
  const [branch, setBranch] = useState<GarageBranch | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('services')
  const [newService, setNewService] = useState<Omit<BranchService, 'id'>>({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    isAvailable: true,
  })
  const [newStaff, setNewStaff] = useState<Omit<BranchStaff, 'id'>>({
    name: '',
    role: 'technician',
    email: '',
    phone: '',
    isActive: true,
  })
  const [editingService, setEditingService] = useState<BranchService | null>(null)
  const [editingStaff, setEditingStaff] = useState<BranchStaff | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (branchId) {
      loadBranchData()
    }
  }, [branchId])

  const loadBranchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const branchData = await branchService.getBranchById(branchId)
      setBranch(branchData)
    } catch (error) {
      console.error('Failed to load branch data:', error)
      setError('Không thể tải dữ liệu chi nhánh. Vui lòng thử lại sau.')
      setBranch(null)
    } finally {
      setLoading(false)
    }
  }

  const addService = async () => {
    if (!branch || !newService.name || !newService.description || newService.price <= 0) {
      toast({
        title: "Thông tin không hợp lệ",
        description: "Vui lòng điền đầy đủ thông tin dịch vụ",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      const currentServices = branch.services || []
      const updatedServices = [...currentServices, { ...newService, id: Date.now().toString() }]
      
      await branchService.updateBranchServices(branchId, updatedServices)
      
      const updatedBranch = await branchService.getBranchById(branchId)
      setBranch(updatedBranch)
      
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        isAvailable: true,
      })

      toast({
        title: "Thành công",
        description: "Dịch vụ đã được thêm thành công",
      })
    } catch (error) {
      console.error('Failed to add service:', error)
      setError('Không thể thêm dịch vụ. Vui lòng thử lại.')
      toast({
        title: "Lỗi",
        description: "Không thể thêm dịch vụ",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateService = async (serviceId: string, updates: Partial<BranchService>) => {
    if (!branch) return

    try {
      setSaving(true)
      const updatedServices = branch.services.map(service =>
        service.id === serviceId ? { ...service, ...updates } : service
      )
      await branchService.updateBranchServices(branchId, updatedServices)
      
      const updatedBranch = await branchService.getBranchById(branchId)
      setBranch(updatedBranch)
      setEditingService(null)

      toast({
        title: "Thành công",
        description: "Dịch vụ đã được cập nhật",
      })
    } catch (error) {
      console.error('Failed to update service:', error)
      setError('Không thể cập nhật dịch vụ. Vui lòng thử lại.')
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật dịch vụ",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const removeService = async (serviceId: string) => {
    if (!branch) return

    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return

    try {
      setSaving(true)
      const updatedServices = branch.services.filter(service => service.id !== serviceId)
      await branchService.updateBranchServices(branchId, updatedServices)
      
      const updatedBranch = await branchService.getBranchById(branchId)
      setBranch(updatedBranch)

      toast({
        title: "Thành công",
        description: "Dịch vụ đã được xóa",
      })
    } catch (error) {
      console.error('Failed to remove service:', error)
      setError('Không thể xóa dịch vụ. Vui lòng thử lại.')
      toast({
        title: "Lỗi",
        description: "Không thể xóa dịch vụ",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const addStaff = async () => {
    if (!branch || !newStaff.name || !newStaff.email || !newStaff.phone) {
      toast({
        title: "Thông tin không hợp lệ",
        description: "Vui lòng điền đầy đủ thông tin nhân viên",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      await branchService.addStaffMember(branchId, {
        name: newStaff.name,
        role: newStaff.role,
        email: newStaff.email,
        phone: newStaff.phone
      })
      
      const updatedBranch = await branchService.getBranchById(branchId)
      setBranch(updatedBranch)
      
      setNewStaff({
        name: '',
        role: 'technician',
        email: '',
        phone: '',
        isActive: true,
      })

      toast({
        title: "Thành công",
        description: "Nhân viên đã được thêm thành công",
      })
    } catch (error) {
      console.error('Failed to add staff:', error)
      setError('Không thể thêm nhân viên. Vui lòng thử lại.')
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhân viên",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateStaff = async (staffId: string, updates: Partial<BranchStaff>) => {
    if (!branch) return

    try {
      setSaving(true)
      await branchService.updateStaffMember(branchId, staffId, updates)
      
      const updatedBranch = await branchService.getBranchById(branchId)
      setBranch(updatedBranch)
      setEditingStaff(null)

      toast({
        title: "Thành công",
        description: "Thông tin nhân viên đã được cập nhật",
      })
    } catch (error) {
      console.error('Failed to update staff:', error)
      setError('Không thể cập nhật nhân viên. Vui lòng thử lại.')
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật nhân viên",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const removeStaff = async (staffId: string) => {
    if (!branch) return

    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return

    try {
      setSaving(true)
      await branchService.removeStaffMember(branchId, staffId)
      
      const updatedBranch = await branchService.getBranchById(branchId)
      setBranch(updatedBranch)

      toast({
        title: "Thành công",
        description: "Nhân viên đã được xóa",
      })
    } catch (error) {
      console.error('Failed to remove staff:', error)
      setError('Không thể xóa nhân viên. Vui lòng thử lại.')
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhân viên",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateOperatingHours = async (day: keyof OperatingHours, field: keyof DaySchedule, value: string | boolean) => {
    if (!branch) return

    try {
      setSaving(true)
      const updatedHours = {
        ...branch.operatingHours,
        [day]: {
          ...branch.operatingHours[day],
          [field]: value,
        },
      }
      await branchService.updateBranchOperatingHours(branchId, updatedHours)
      
      const updatedBranch = await branchService.getBranchById(branchId)
      setBranch(updatedBranch)

      toast({
        title: "Thành công",
        description: "Giờ làm việc đã được cập nhật",
      })
    } catch (error) {
      console.error('Failed to update operating hours:', error)
      setError('Không thể cập nhật giờ làm việc. Vui lòng thử lại.')
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật giờ làm việc",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    loadBranchData()
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>

        <Skeleton className="h-32 w-full" />

        <Card>
          <CardHeader>
            <Skeleton className="h-9 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !branch) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý chi nhánh</h1>
            <p className="text-muted-foreground">Đã xảy ra lỗi</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={handleRetry}>Thử lại</Button>
        </div>
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý chi nhánh</h1>
            <p className="text-muted-foreground">Không tìm thấy chi nhánh</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="mb-4">Không tìm thấy chi nhánh được yêu cầu.</div>
          <Button onClick={() => router.push('/admin/branches')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách chi nhánh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="outline" className="ml-4" onClick={() => setError(null)}>
              Đóng
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý chi nhánh</h1>
          <p className="text-muted-foreground">
            Quản lý dịch vụ, nhân viên và giờ làm việc của {branch.name}
          </p>
        </div>
      </div>

      {/* Branch Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi nhánh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                Tên chi nhánh
              </div>
              <div className="text-lg font-semibold">{branch.name}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Địa chỉ
              </div>
              <div className="text-sm">
                {branch.address}, {branch.city}, {branch.state}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Số điện thoại
              </div>
              <div className="text-sm">{branch.phone}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Quản lý
              </div>
              <div className="text-sm">{branch.managerName}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quản lý chi tiết</CardTitle>
          <CardDescription>
            Quản lý dịch vụ, nhân viên và giờ làm việc của chi nhánh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">
                <Building2 className="mr-2 h-4 w-4" />
                Dịch vụ
              </TabsTrigger>
              <TabsTrigger value="staff">
                <Users className="mr-2 h-4 w-4" />
                Nhân viên
              </TabsTrigger>
              <TabsTrigger value="hours">
                <Clock className="mr-2 h-4 w-4" />
                Giờ làm việc
              </TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Thêm dịch vụ mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Tên dịch vụ</Label>
                    <Input
                      id="service-name"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Thay dầu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-desc">Mô tả</Label>
                    <Input
                      id="service-desc"
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Thay dầu động cơ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Giá ($)</Label>
                    <Input
                      id="service-price"
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="29.99"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-duration">Thời gian (phút)</Label>
                    <Input
                      id="service-duration"
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      placeholder="60"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-available">Khả dụng</Label>
                    <div className="pt-2">
                      <Switch
                        id="service-available"
                        checked={newService.isAvailable}
                        onCheckedChange={(checked) => setNewService(prev => ({ ...prev, isAvailable: checked }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={addService} className="mt-4" disabled={saving}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm dịch vụ
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Dịch vụ hiện tại</h3>
                <div className="space-y-3">
                  {branch.services && branch.services.length > 0 ? (
                    branch.services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            {service.name}
                            {!service.isAvailable && (
                              <Badge variant="outline" className="ml-2">
                                Tạm ngừng
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {service.description}
                          </div>
                          <div className="text-sm mt-1">
                            ${service.price} • {service.duration} phút
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={service.isAvailable}
                            onCheckedChange={(checked) => updateService(service.id, { isAvailable: checked })}
                            disabled={saving}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingService(service)}
                            disabled={saving}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(service.id)}
                            className="text-red-600"
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chưa có dịch vụ nào cho chi nhánh này.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Service Modal */}
              {editingService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">Chỉnh sửa dịch vụ</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-service-name">Tên dịch vụ</Label>
                        <Input
                          id="edit-service-name"
                          value={editingService.name}
                          onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-service-desc">Mô tả</Label>
                        <Input
                          id="edit-service-desc"
                          value={editingService.description}
                          onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-service-price">Giá ($)</Label>
                        <Input
                          id="edit-service-price"
                          type="number"
                          value={editingService.price}
                          onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-service-duration">Thời gian (phút)</Label>
                        <Input
                          id="edit-service-duration"
                          type="number"
                          value={editingService.duration}
                          onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-service-available"
                          checked={editingService.isAvailable}
                          onCheckedChange={(checked) => setEditingService({ ...editingService, isAvailable: checked })}
                        />
                        <Label htmlFor="edit-service-available">Khả dụng</Label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" onClick={() => setEditingService(null)} disabled={saving}>
                        Hủy
                      </Button>
                      <Button onClick={() => updateService(editingService.id, editingService)} disabled={saving}>
                        Lưu thay đổi
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="space-y-6 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Thêm nhân viên mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-name">Họ tên</Label>
                    <Input
                      id="staff-name"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-role">Vai trò</Label>
                    <Select value={newStaff.role} onValueChange={(value: 'technician' | 'receptionist' | 'manager') => setNewStaff(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger id="staff-role">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                        <SelectItem value="receptionist">Lễ tân</SelectItem>
                        <SelectItem value="manager">Quản lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-email">Email</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="nva@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-phone">Số điện thoại</Label>
                    <Input
                      id="staff-phone"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="0123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-active">Đang làm việc</Label>
                    <div className="pt-2">
                      <Switch
                        id="staff-active"
                        checked={newStaff.isActive}
                        onCheckedChange={(checked) => setNewStaff(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={addStaff} className="mt-4" disabled={saving}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm nhân viên
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Nhân viên hiện tại</h3>
                <div className="space-y-3">
                  {branch.staff && branch.staff.length > 0 ? (
                    branch.staff.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            {staff.name}
                            {!staff.isActive && (
                              <Badge variant="outline" className="ml-2">
                                Nghỉ việc
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {staff.role}
                          </div>
                          <div className="text-sm mt-1">
                            {staff.email} • {staff.phone}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={staff.isActive}
                            onCheckedChange={(checked) => updateStaff(staff.id, { isActive: checked })}
                            disabled={saving}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStaff(staff)}
                            disabled={saving}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStaff(staff.id)}
                            className="text-red-600"
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chưa có nhân viên nào trong chi nhánh này.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Staff Modal */}
              {editingStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">Chỉnh sửa nhân viên</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-staff-name">Họ tên</Label>
                        <Input
                          id="edit-staff-name"
                          value={editingStaff.name}
                          onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-staff-role">Vai trò</Label>
                        <Select 
                          value={editingStaff.role} 
                          onValueChange={(value: 'technician' | 'receptionist' | 'manager') => setEditingStaff({ ...editingStaff, role: value })}
                        >
                          <SelectTrigger id="edit-staff-role">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                            <SelectItem value="receptionist">Lễ tân</SelectItem>
                            <SelectItem value="manager">Quản lý</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-staff-email">Email</Label>
                        <Input
                          id="edit-staff-email"
                          type="email"
                          value={editingStaff.email}
                          onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-staff-phone">Số điện thoại</Label>
                        <Input
                          id="edit-staff-phone"
                          value={editingStaff.phone}
                          onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-staff-active"
                          checked={editingStaff.isActive}
                          onCheckedChange={(checked) => setEditingStaff({ ...editingStaff, isActive: checked })}
                        />
                        <Label htmlFor="edit-staff-active">Đang làm việc</Label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" onClick={() => setEditingStaff(null)} disabled={saving}>
                        Hủy
                      </Button>
                      <Button onClick={() => updateStaff(editingStaff.id, editingStaff)} disabled={saving}>
                        Lưu thay đổi
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Operating Hours Tab */}
            <TabsContent value="hours" className="space-y-6 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Giờ làm việc</h3>
                <div className="space-y-4">
                  {([
                    { key: 'monday', label: 'Thứ 2' },
                    { key: 'tuesday', label: 'Thứ 3' },
                    { key: 'wednesday', label: 'Thứ 4' },
                    { key: 'thursday', label: 'Thứ 5' },
                    { key: 'friday', label: 'Thứ 6' },
                    { key: 'saturday', label: 'Thứ 7' },
                    { key: 'sunday', label: 'Chủ nhật' },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24 font-medium">{label}</div>
                      <Switch
                        checked={branch.operatingHours[key].isOpen}
                        onCheckedChange={(checked) => updateOperatingHours(key, 'isOpen', checked)}
                        disabled={saving}
                      />
                      {branch.operatingHours[key].isOpen ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Label>Mở cửa:</Label>
                            <Input
                              type="time"
                              value={branch.operatingHours[key].openTime}
                              onChange={(e) => updateOperatingHours(key, 'openTime', e.target.value)}
                              className="w-32"
                              disabled={saving}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>Đóng cửa:</Label>
                            <Input
                              type="time"
                              value={branch.operatingHours[key].closeTime}
                              onChange={(e) => updateOperatingHours(key, 'closeTime', e.target.value)}
                              className="w-32"
                              disabled={saving}
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Đóng cửa</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}