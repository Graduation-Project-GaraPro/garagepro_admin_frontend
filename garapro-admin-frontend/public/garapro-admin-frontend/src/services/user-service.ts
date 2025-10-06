import { apiClient } from './api-client'

export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'user' | 'admin' | 'manager'
  status: 'active' | 'inactive' | 'banned' | 'pending'
  joinedDate: string
  lastLogin: string
  avatar: string
  location: string
  verified: boolean
  totalOrders: number
  totalSpent: number
  details: {
    address: string
    dateOfBirth: string
    emergencyContact: string
    preferences: {
      notifications: boolean
      marketing: boolean
      twoFactor: boolean
    }
    devices: string[]
    lastIpAddress: string
    userAgent: string
    accountHistory: Array<{
      action: string
      date: string
      ip: string
    }>
    orders: Array<{
      id: string
      amount: number
      status: string
      date: string
    }>
  }
}

export interface UserFilters {
  search?: string
  role?: string
  status?: string
  dateRange?: {
    start: string
    end: string
  }
  verified?: boolean
  page?: number
  limit?: number
}

export interface UserCreateData {
  name: string
  email: string
  phone: string
  role: 'user' | 'admin' | 'manager'
  password: string
  location: string
}

export interface UserUpdateData {
  name?: string
  phone?: string
  role?: 'user' | 'admin' | 'manager'
  location?: string
  preferences?: {
    notifications?: boolean
    marketing?: boolean
    twoFactor?: boolean
  }
}

export interface UserResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class UserService {
  private baseUrl = '/users'
  // In-memory storage instead of localStorage
  private memoryCache: User[] | null = null

  private readCache(): User[] {
    if (this.memoryCache === null) {
      this.memoryCache = this.getFallbackUsers().users
    }
    return [...this.memoryCache] // Return a copy to prevent direct mutations
  }

  private writeCache(users: User[]): void {
    this.memoryCache = [...users] // Store a copy
  }

  private initializeCache(): void {
    if (this.memoryCache === null) {
      this.memoryCache = this.getFallbackUsers().users
    }
  }

  // Get all users with filters and pagination
  async getUsers(filters?: UserFilters): Promise<UserResponse> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.search) params.search = filters.search
      if (filters?.role) params.role = filters.role
      if (filters?.status) params.status = filters.status
      if (filters?.verified !== undefined) params.verified = filters.verified
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      console.log('API request params:', params)
      const response = await apiClient.get<UserResponse>(this.baseUrl, params)
      return response.data
    } catch (error) {
      console.log('API failed, using mock data')
      this.initializeCache()
      let users = this.readCache()

      // Apply filters
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        users = users.filter(u => 
          u.name.toLowerCase().includes(q) || 
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
        )
      }
      if (filters?.role) {
        users = users.filter(u => u.role === filters.role)
      }
      if (filters?.status) {
        users = users.filter(u => u.status === filters.status)
      }
      if (filters?.verified !== undefined) {
        users = users.filter(u => u.verified === filters.verified)
      }
      if (filters?.dateRange) {
        users = users.filter(u => {
          const joinDate = new Date(u.joinedDate)
          const start = new Date(filters.dateRange!.start)
          const end = new Date(filters.dateRange!.end)
          return joinDate >= start && joinDate <= end
        })
      }

      // Apply pagination
      const page = filters?.page ?? 1
      const limit = filters?.limit ?? 10
      const total = users.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const startIndex = (page - 1) * limit
      const pageItems = users.slice(startIndex, startIndex + limit)
      
      return { users: pageItems, total, page, limit, totalPages }
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      this.initializeCache()
      const found = this.readCache().find(u => u.id === id)
      if (!found) throw new Error(`User with ID ${id} not found`)
      return found
    }
  }

  // Create new user
  async createUser(userData: UserCreateData): Promise<User> {
    try {
      const response = await apiClient.post<User>(this.baseUrl, userData)
      return response.data
    } catch (error) {
      this.initializeCache()
      const users = this.readCache()
      const now = new Date().toISOString()
      
      // Check for duplicate email
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already exists')
      }

      const newUser: User = {
        id: Math.max(0, ...users.map(u => u.id)) + 1,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: 'active',
        joinedDate: now,
        lastLogin: now,
        avatar: '',
        location: userData.location,
        verified: false,
        totalOrders: 0,
        totalSpent: 0,
        details: {
          address: '',
          dateOfBirth: '',
          emergencyContact: '',
          preferences: { 
            notifications: true, 
            marketing: false, 
            twoFactor: false 
          },
          devices: [],
          lastIpAddress: '127.0.0.1',
          userAgent: 'Mock Browser',
          accountHistory: [{
            action: 'Account Created',
            date: now,
            ip: '127.0.0.1'
          }],
          orders: []
        }
      }
      
      users.unshift(newUser)
      this.writeCache(users)
      return newUser
    }
  }

  // Update user
  async updateUser(id: number, userData: UserUpdateData): Promise<User> {
    try {
      const response = await apiClient.put<User>(`${this.baseUrl}/${id}`, userData)
      return response.data
    } catch (error) {
      this.initializeCache()
      const users = this.readCache()
      const index = users.findIndex(u => u.id === id)
      if (index === -1) throw new Error(`User with ID ${id} not found`)
      
      // Update user data
      const updatedUser = { 
        ...users[index], 
        ...userData,
        // Merge preferences if provided
        details: userData.preferences ? {
          ...users[index].details,
          preferences: {
            ...users[index].details.preferences,
            ...userData.preferences
          }
        } : users[index].details
      }
      
      users[index] = updatedUser
      this.writeCache(users)
      return updatedUser
    }
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      this.initializeCache()
      const users = this.readCache().filter(u => u.id !== id)
      this.writeCache(users)
    }
  }

  // Ban user
  async banUser(id: number, reason: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/ban`, { reason })
    } catch (error) {
      console.error(`Failed to ban user ${id}:`, error)
      
      // Fallback: update user status locally
      this.initializeCache()
      const users = this.readCache()
      const index = users.findIndex(u => u.id === id)
      if (index !== -1) {
        users[index].status = 'banned'
        users[index].details.accountHistory.push({
          action: `Banned: ${reason}`,
          date: new Date().toISOString(),
          ip: '127.0.0.1'
        })
        this.writeCache(users)
      }
    }
  }

  // Unban user
  async unbanUser(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/unban`)
    } catch (error) {
      console.error(`Failed to unban user ${id}:`, error)
      
      // Fallback: update user status locally
      this.initializeCache()
      const users = this.readCache()
      const index = users.findIndex(u => u.id === id)
      if (index !== -1) {
        users[index].status = 'active'
        users[index].details.accountHistory.push({
          action: 'Account unbanned',
          date: new Date().toISOString(),
          ip: '127.0.0.1'
        })
        this.writeCache(users)
      }
    }
  }

  async getUserByRoleId(roleId: number): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>(`${this.baseUrl}/role/${roleId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch users by role ID ${roleId}:`, error)
      
      // Fallback: map role IDs to role names and filter users
      const roleMapping: Record<number, 'user' | 'admin' | 'manager'> = {
        1: 'user',
        2: 'admin', 
        3: 'manager'
      }
      
      const roleName = roleMapping[roleId]
      if (!roleName) {
        throw new Error(`Invalid role ID: ${roleId}`)
      }
      
      const res = await this.getUsers({ role: roleName, limit: 1000 })
      return res.users
    }
  }

  // Change user role
  async changeUserRole(id: number, role: 'user' | 'admin' | 'manager'): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/role`, { role })
    } catch (error) {
      console.error(`Failed to change role for user ${id}:`, error)
      
      // Fallback: update user role locally
      this.initializeCache()
      const users = this.readCache()
      const index = users.findIndex(u => u.id === id)
      if (index !== -1) {
        const oldRole = users[index].role
        users[index].role = role
        users[index].details.accountHistory.push({
          action: `Role changed from ${oldRole} to ${role}`,
          date: new Date().toISOString(),
          ip: '127.0.0.1'
        })
        this.writeCache(users)
      }
    }
  }

  // Verify user
  async verifyUser(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/verify`)
    } catch (error) {
      console.error(`Failed to verify user ${id}:`, error)
      
      // Fallback: update user verification locally
      this.initializeCache()
      const users = this.readCache()
      const index = users.findIndex(u => u.id === id)
      if (index !== -1) {
        users[index].verified = true
        users[index].details.accountHistory.push({
          action: 'Account verified',
          date: new Date().toISOString(),
          ip: '127.0.0.1'
        })
        this.writeCache(users)
      }
    }
  }

  // Get user statistics
  async getUserStatistics(): Promise<{
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    bannedUsers: number
    pendingVerification: number
    userGrowth: number[]
    roleDistribution: Record<string, number>
  }> {
    try {
      const response = await apiClient.get<{
        totalUsers: number
        activeUsers: number
        newUsersThisMonth: number
        bannedUsers: number
        pendingVerification: number
        userGrowth: number[]
        roleDistribution: Record<string, number>
      }>(`${this.baseUrl}/statistics`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user statistics:', error)
      
      this.initializeCache()
      const users = this.readCache()
      const totalUsers = users.length
      const activeUsers = users.filter(u => u.status === 'active').length
      const bannedUsers = users.filter(u => u.status === 'banned').length
      const pendingVerification = users.filter(u => !u.verified || u.status === 'pending').length
      
      // Calculate new users this month (mock calculation)
      const thisMonth = new Date()
      thisMonth.setDate(1) // First day of current month
      const newUsersThisMonth = users.filter(u => new Date(u.joinedDate) >= thisMonth).length
      
      const roleDistribution: Record<string, number> = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return { 
        totalUsers, 
        activeUsers, 
        newUsersThisMonth, 
        bannedUsers, 
        pendingVerification, 
        userGrowth: [10, 12, 14, 16, 18, 20], // Mock growth data
        roleDistribution 
      }
    }
  }

  // Export users
  async exportUsers(filters?: UserFilters, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format }
      if (filters?.search) params.search = filters.search
      if (filters?.role) params.role = filters.role
      if (filters?.status) params.status = filters.status
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export users:', error)
      
      const users = (await this.getUsers(filters)).users
      const header = 'id,name,email,phone,role,status,joinedDate,lastLogin,totalOrders,totalSpent,verified,location\n'
      const rows = users.map(u => 
        `${u.id},"${u.name}","${u.email}","${u.phone}",${u.role},${u.status},${u.joinedDate},${u.lastLogin},${u.totalOrders},${u.totalSpent},${u.verified},"${u.location}"`
      ).join('\n')
      const csv = header + rows
      
      const mimeType = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;'
      return new Blob([csv], { type: mimeType })
    }
  }
  
  async exportUser(user: User, format: "csv" | "excel" | "json" = "csv"): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(`${this.baseUrl}/${user.id}/export`, { format })
      return response.data
    } catch (error) {
      console.error(`Failed to export user ${user.id}:`, error)

      // Fallback export
      if (format === "json") {
        return new Blob([JSON.stringify(user, null, 2)], { type: "application/json" })
      }

      // CSV/Excel format
      const header = "id,name,email,phone,role,status,joinedDate,lastLogin,totalOrders,totalSpent,verified,location\n"
      const row = `${user.id},"${user.name}","${user.email}","${user.phone}",${user.role},${user.status},${user.joinedDate},${user.lastLogin},${user.totalOrders},${user.totalSpent},${user.verified},"${user.location}"`
      const csv = header + row
      
      const mimeType = format === "excel" ? "application/vnd.ms-excel" : "text/csv;charset=utf-8;"
      return new Blob([csv], { type: mimeType })
    }
  }

  // Bulk operations
  async bulkUpdateUsers(userIds: number[], updates: Partial<UserUpdateData>): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-update`, { userIds, updates })
    } catch (error) {
      console.error('Failed to bulk update users:', error)
      
      // Fallback: update users locally
      this.initializeCache()
      const users = this.readCache()
      const now = new Date().toISOString()
      
      userIds.forEach(id => {
        const index = users.findIndex(u => u.id === id)
        if (index !== -1) {
          users[index] = { ...users[index], ...updates }
          users[index].details.accountHistory.push({
            action: 'Bulk update applied',
            date: now,
            ip: '127.0.0.1'
          })
        }
      })
      
      this.writeCache(users)
    }
  }

  async bulkDeleteUsers(userIds: number[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk-delete`, { body: { userIds } })
    } catch (error) {
      console.error('Failed to bulk delete users:', error)
      
      // Fallback: delete users locally
      this.initializeCache()
      const users = this.readCache().filter(u => !userIds.includes(u.id))
      this.writeCache(users)
    }
  }

  // Search users
  async searchUsers(query: string, filters?: Omit<UserFilters, 'search'>): Promise<UserResponse> {
    return this.getUsers({ ...filters, search: query })
  }

  // Get user activity
  async getUserActivity(userId: number, period: string = '30d'): Promise<Array<{
    action: string
    timestamp: string
    ip: string
    userAgent: string
    details: any
  }>> {
    try {
      const response = await apiClient.get<Array<{
        action: string
        timestamp: string
        ip: string
        userAgent: string
        details: any
      }>>(`${this.baseUrl}/${userId}/activity`, { period })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch activity for user ${userId}:`, error)
      
      // Fallback: return mock activity data
      this.initializeCache()
      const user = this.readCache().find(u => u.id === userId)
      if (!user) throw new Error('User not found')
      
      return user.details.accountHistory.map(h => ({
        action: h.action,
        timestamp: h.date,
        ip: h.ip,
        userAgent: 'Mock Browser',
        details: {}
      }))
    }
  }

  // Send notification to user
  async sendNotification(userId: number, message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${userId}/notifications`, { message, type })
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error)
      
      // Fallback: log notification locally
      this.initializeCache()
      const users = this.readCache()
      const index = users.findIndex(u => u.id === userId)
      if (index !== -1) {
        users[index].details.accountHistory.push({
          action: `Notification sent: ${message} (${type})`,
          date: new Date().toISOString(),
          ip: '127.0.0.1'
        })
        this.writeCache(users)
      }
    }
  }

  // Helpers for roles
  async getManagers(): Promise<User[]> {
    const res = await this.getUsers({ role: 'manager', limit: 100 })
    return res.users
  }

  async getDrivers(): Promise<User[]> {
    // Treat 'user' role as drivers in this mock
    const res = await this.getUsers({ role: 'user', limit: 200 })
    return res.users
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.memoryCache = null
  }

  private getFallbackUsers(): UserResponse {
    const users: User[] = [
      { 
        id: 1, 
        name: 'John Smith', 
        email: 'john@garage.com', 
        phone: '+1-555-0101', 
        role: 'manager', 
        status: 'active', 
        joinedDate: '2024-01-01T00:00:00Z', 
        lastLogin: '2024-03-10T10:30:00Z', 
        avatar: '', 
        location: 'New York', 
        verified: true, 
        totalOrders: 12, 
        totalSpent: 1500, 
        details: { 
          address: '123 Main St, New York, NY 10001', 
          dateOfBirth: '1985-06-15', 
          emergencyContact: 'Jane Smith (+1-555-0102)', 
          preferences: { notifications: true, marketing: false, twoFactor: true }, 
          devices: ['iPhone 14', 'MacBook Pro'], 
          lastIpAddress: '192.168.1.100', 
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 
          accountHistory: [
            { action: 'Account created', date: '2024-01-01T00:00:00Z', ip: '192.168.1.100' },
            { action: 'Profile updated', date: '2024-02-15T14:30:00Z', ip: '192.168.1.100' }
          ], 
          orders: [
            { id: 'ORD-001', amount: 150, status: 'completed', date: '2024-03-01' },
            { id: 'ORD-002', amount: 200, status: 'completed', date: '2024-03-05' }
          ]
        } 
      },
      { 
        id: 2, 
        name: 'Sarah Wilson', 
        email: 'sarah@garage.com', 
        phone: '+1-555-0202', 
        role: 'manager', 
        status: 'active', 
        joinedDate: '2024-01-05T00:00:00Z', 
        lastLogin: '2024-03-11T09:15:00Z', 
        avatar: '', 
        location: 'Los Angeles', 
        verified: true, 
        totalOrders: 8, 
        totalSpent: 980, 
        details: { 
          address: '456 Oak Ave, Los Angeles, CA 90210', 
          dateOfBirth: '1990-03-22', 
          emergencyContact: 'Tom Davis (+1-555-0303)', 
          preferences: { notifications: true, marketing: true, twoFactor: true }, 
          devices: ['Samsung Galaxy S23'], 
          lastIpAddress: '192.168.2.50', 
          userAgent: 'Mozilla/5.0 (Android 13; Mobile)', 
          accountHistory: [
            { action: 'Account created', date: '2024-01-05T00:00:00Z', ip: '192.168.2.50' },
            { action: '2FA enabled', date: '2024-01-10T16:45:00Z', ip: '192.168.2.50' }
          ], 
          orders: [
            { id: 'ORD-003', amount: 300, status: 'completed', date: '2024-02-20' }
          ]
        } 
      },
      { 
        id: 3, 
        name: 'Tom Davis', 
        email: 'tom@garage.com', 
        phone: '+1-555-0303', 
        role: 'user', 
        status: 'active', 
        joinedDate: '2024-01-10T00:00:00Z', 
        lastLogin: '2024-03-09T18:20:00Z', 
        avatar: '', 
        location: 'Chicago', 
        verified: true, 
        totalOrders: 4, 
        totalSpent: 350, 
        details: { 
          address: '789 Pine Rd, Chicago, IL 60601', 
          dateOfBirth: '1992-11-08', 
          emergencyContact: 'Sarah Wilson (+1-555-0202)', 
          preferences: { notifications: true, marketing: false, twoFactor: false }, 
          devices: ['Dell Laptop'], 
          lastIpAddress: '10.0.0.25', 
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 
          accountHistory: [
            { action: 'Account created', date: '2024-01-10T00:00:00Z', ip: '10.0.0.25' }
          ], 
          orders: []
        } 
      },
      { 
        id: 4, 
        name: 'Mike Johnson', 
        email: 'mike@garage.com', 
        phone: '+1-555-0404', 
        role: 'user', 
        status: 'active', 
        joinedDate: '2024-02-01T00:00:00Z', 
        lastLogin: '2024-03-08T12:00:00Z', 
        avatar: '', 
        location: 'Miami', 
        verified: false, 
        totalOrders: 6, 
        totalSpent: 520, 
        details: { 
          address: '321 Cedar St, Miami, FL 33101', 
          dateOfBirth: '1988-07-14', 
          emergencyContact: 'John Smith (+1-555-0101)', 
          preferences: { notifications: true, marketing: false, twoFactor: false }, 
          devices: [], 
          lastIpAddress: '172.16.0.10', 
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 
          accountHistory: [
            { action: 'Account created', date: '2024-02-01T00:00:00Z', ip: '172.16.0.10' }
          ], 
          orders: []
        } 
      },
      {
        id: 5,
        name: 'Emma Brown',
        email: 'emma@garage.com',
        phone: '+1-555-0505',
        role: 'admin',
        status: 'active',
        joinedDate: '2023-12-15T00:00:00Z',
        lastLogin: '2024-03-12T08:45:00Z',
        avatar: '',
        location: 'Seattle',
        verified: true,
        totalOrders: 0,
        totalSpent: 0,
        details: {
          address: '555 Admin Way, Seattle, WA 98101',
          dateOfBirth: '1987-04-30',
          emergencyContact: 'System Administrator (+1-800-ADMIN)',
          preferences: { notifications: true, marketing: false, twoFactor: true },
          devices: ['MacBook Air M2', 'iPhone 14 Pro'],
          lastIpAddress: '203.0.113.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          accountHistory: [
            { action: 'Admin account created', date: '2023-12-15T00:00:00Z', ip: '203.0.113.1' },
            { action: 'Security settings updated', date: '2024-01-01T00:00:00Z', ip: '203.0.113.1' }
          ],
          orders: []
        }
      }
    ]
    return { users, total: users.length, page: 1, limit: users.length, totalPages: 1 }
  }
}

export const userService = new UserService()