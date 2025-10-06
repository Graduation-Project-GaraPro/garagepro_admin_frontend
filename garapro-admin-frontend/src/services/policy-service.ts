import { apiClient } from './api-client'

export interface Policy {
  id: number
  name: string
  description: string
  category: 'security' | 'privacy' | 'compliance' | 'operational' | 'financial'
  status: 'active' | 'inactive' | 'draft' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  version: string
  effectiveDate: string
  expiryDate?: string
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
  tags: string[]
  compliance: {
    gdpr: boolean
    hipaa: boolean
    sox: boolean
    pci: boolean
    iso27001: boolean
  }
  rules: PolicyRule[]
  exceptions: PolicyException[]
  auditLog: PolicyAuditLog[]
}

export interface PolicyRule {
  id: number
  name: string
  description: string
  condition: string
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

export interface PolicyException {
  id: number
  reason: string
  requestedBy: string
  approvedBy?: string
  status: 'pending' | 'approved' | 'rejected'
  startDate: string
  endDate: string
  conditions: string
}

export interface PolicyAuditLog {
  id: number
  action: string
  userId: string
  timestamp: string
  details: string
  ipAddress: string
  userAgent: string
}

export interface PolicyFilters {
  search?: string
  category?: string
  status?: string
  priority?: string
  compliance?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  page?: number
  limit?: number
}

export interface PolicyCreateData {
  name: string
  description: string
  category: 'security' | 'privacy' | 'compliance' | 'operational' | 'financial'
  priority: 'low' | 'medium' | 'high' | 'critical'
  effectiveDate: string
  expiryDate?: string
  tags: string[]
  compliance: {
    gdpr: boolean
    hipaa: boolean
    sox: boolean
    pci: boolean
    iso27001: boolean
  }
  rules: Omit<PolicyRule, 'id'>[]
}

export interface PolicyUpdateData {
  name?: string
  description?: string
  category?: 'security' | 'privacy' | 'compliance' | 'operational' | 'financial'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  effectiveDate?: string
  expiryDate?: string
  tags?: string[]
  compliance?: {
    gdpr?: boolean
    hipaa?: boolean
    sox?: boolean
    pci?: boolean
    iso27001?: boolean
  }
  rules?: Omit<PolicyRule, 'id'>[]
}

export interface PolicyResponse {
  policies: Policy[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ComplianceReport {
  policyId: number
  policyName: string
  complianceScore: number
  violations: number
  lastAudit: string
  nextAudit: string
  recommendations: string[]
}

class PolicyService {
  private baseUrl = '/policies'
  // In-memory storage instead of localStorage
  private memoryCache: Policy[] | null = null

  private readCache(): Policy[] {
    if (this.memoryCache === null) {
      this.memoryCache = this.getFallbackPolicies().policies
    }
    return [...this.memoryCache] // Return a copy to prevent direct mutations
  }

  private writeCache(policies: Policy[]): void {
    this.memoryCache = [...policies] // Store a copy
  }

  private initializeCache(): void {
    if (this.memoryCache === null) {
      this.memoryCache = this.getFallbackPolicies().policies
    }
  }

  // Get all policies with filters and pagination
  async getPolicies(filters?: PolicyFilters): Promise<PolicyResponse> {
    try {
      const params: Record<string, unknown> = {}
      if (filters?.search) params.search = filters.search
      if (filters?.category) params.category = filters.category
      if (filters?.status) params.status = filters.status
      if (filters?.priority) params.priority = filters.priority
      if (filters?.compliance) params.compliance = filters.compliance
      if (filters?.tags) params.tags = filters.tags.join(',')
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }
      if (filters?.page) params.page = filters.page
      if (filters?.limit) params.limit = filters.limit

      console.log('API request params:', params)
      const response = await apiClient.get<PolicyResponse>(this.baseUrl, params)
      return response.data
    } catch (error) {
      console.log('API failed, using mock data')
      this.initializeCache()
      let policies = this.readCache()

      // Apply filters
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        policies = policies.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) ||
          p.tags.some(tag => tag.toLowerCase().includes(q))
        )
      }
      if (filters?.category) {
        policies = policies.filter(p => p.category === filters.category)
      }
      if (filters?.status) {
        policies = policies.filter(p => p.status === filters.status)
      }
      if (filters?.priority) {
        policies = policies.filter(p => p.priority === filters.priority)
      }
      if (filters?.compliance) {
        policies = policies.filter(p => p.compliance[filters.compliance as keyof typeof p.compliance])
      }
      if (filters?.tags && filters.tags.length > 0) {
        policies = policies.filter(p => 
          filters.tags!.some(tag => p.tags.includes(tag))
        )
      }
      if (filters?.dateRange) {
        policies = policies.filter(p => {
          const effectiveDate = new Date(p.effectiveDate)
          const start = new Date(filters.dateRange!.start)
          const end = new Date(filters.dateRange!.end)
          return effectiveDate >= start && effectiveDate <= end
        })
      }

      // Apply pagination
      const page = filters?.page ?? 1
      const limit = filters?.limit ?? 10
      const total = policies.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const startIndex = (page - 1) * limit
      const pageItems = policies.slice(startIndex, startIndex + limit)
      
      return { policies: pageItems, total, page, limit, totalPages }
    }
  }

  // Get policy by ID
  async getPolicyById(id: number): Promise<Policy> {
    try {
      const response = await apiClient.get<Policy>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      this.initializeCache()
      const found = this.readCache().find(p => p.id === id)
      if (!found) throw new Error(`Policy with ID ${id} not found`)
      return found
    }
  }

  // Create new policy
  async createPolicy(policyData: PolicyCreateData): Promise<Policy> {
    try {
      const response = await apiClient.post<Policy>(this.baseUrl, policyData)
      return response.data
    } catch (error) {
      this.initializeCache()
      const policies = this.readCache()
      const now = new Date().toISOString()
      
      // Check for duplicate name
      if (policies.some(p => p.name === policyData.name)) {
        throw new Error('Policy name already exists')
      }

      const newPolicy: Policy = {
        id: Math.max(0, ...policies.map(p => p.id)) + 1,
        name: policyData.name,
        description: policyData.description,
        category: policyData.category,
        status: 'draft',
        priority: policyData.priority,
        version: '1.0.0',
        effectiveDate: policyData.effectiveDate,
        expiryDate: policyData.expiryDate,
        createdBy: 'admin@company.com',
        createdAt: now,
        updatedBy: 'admin@company.com',
        updatedAt: now,
        tags: policyData.tags,
        compliance: policyData.compliance,
        rules: policyData.rules.map((rule, index) => ({ ...rule, id: index + 1 })),
        exceptions: [],
        auditLog: [{
          id: 1,
          action: 'POLICY_CREATED',
          userId: 'admin@company.com',
          timestamp: now,
          details: `Created policy: ${policyData.name}`,
          ipAddress: '127.0.0.1',
          userAgent: 'Mock Browser'
        }]
      }
      
      policies.unshift(newPolicy)
      this.writeCache(policies)
      return newPolicy
    }
  }

  // Update policy
  async updatePolicy(id: number, policyData: PolicyUpdateData): Promise<Policy> {
    try {
      const response = await apiClient.put<Policy>(`${this.baseUrl}/${id}`, policyData)
      return response.data
    } catch (error) {
      this.initializeCache()
      const policies = this.readCache()
      const index = policies.findIndex(p => p.id === id)
      if (index === -1) throw new Error(`Policy with ID ${id} not found`)
      
      const now = new Date().toISOString()
      const updatedPolicy = { 
        ...policies[index], 
        ...policyData,
        updatedBy: 'admin@company.com',
        updatedAt: now,
        compliance: policyData.compliance ? {
          ...policies[index].compliance,
          ...policyData.compliance
        } : policies[index].compliance,
        rules: policyData.rules ? 
          policyData.rules.map((rule, idx) => ({ ...rule, id: idx + 1 })) :
          policies[index].rules
      }
      
      updatedPolicy.auditLog.push({
        id: updatedPolicy.auditLog.length + 1,
        action: 'POLICY_UPDATED',
        userId: 'admin@company.com',
        timestamp: now,
        details: `Updated policy: ${updatedPolicy.name}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Mock Browser'
      })
      
      policies[index] = updatedPolicy
      this.writeCache(policies)
      return updatedPolicy
    }
  }

  // Delete policy
  async deletePolicy(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      this.initializeCache()
      const policies = this.readCache().filter(p => p.id !== id)
      this.writeCache(policies)
    }
  }

  // Activate policy
  async activatePolicy(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/activate`)
    } catch (error) {
      console.error(`Failed to activate policy ${id}:`, error)
      
      this.initializeCache()
      const policies = this.readCache()
      const index = policies.findIndex(p => p.id === id)
      if (index !== -1) {
        policies[index].status = 'active'
        policies[index].updatedAt = new Date().toISOString()
        policies[index].auditLog.push({
          id: policies[index].auditLog.length + 1,
          action: 'POLICY_ACTIVATED',
          userId: 'admin@company.com',
          timestamp: new Date().toISOString(),
          details: 'Policy activated',
          ipAddress: '127.0.0.1',
          userAgent: 'Mock Browser'
        })
        this.writeCache(policies)
      }
    }
  }

  // Deactivate policy
  async deactivatePolicy(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/deactivate`)
    } catch (error) {
      console.error(`Failed to deactivate policy ${id}:`, error)
      
      this.initializeCache()
      const policies = this.readCache()
      const index = policies.findIndex(p => p.id === id)
      if (index !== -1) {
        policies[index].status = 'inactive'
        policies[index].updatedAt = new Date().toISOString()
        policies[index].auditLog.push({
          id: policies[index].auditLog.length + 1,
          action: 'POLICY_DEACTIVATED',
          userId: 'admin@company.com',
          timestamp: new Date().toISOString(),
          details: 'Policy deactivated',
          ipAddress: '127.0.0.1',
          userAgent: 'Mock Browser'
        })
        this.writeCache(policies)
      }
    }
  }

  // Archive policy
  async archivePolicy(id: number): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/archive`)
    } catch (error) {
      console.error(`Failed to archive policy ${id}:`, error)
      
      this.initializeCache()
      const policies = this.readCache()
      const index = policies.findIndex(p => p.id === id)
      if (index !== -1) {
        policies[index].status = 'archived'
        policies[index].updatedAt = new Date().toISOString()
        policies[index].auditLog.push({
          id: policies[index].auditLog.length + 1,
          action: 'POLICY_ARCHIVED',
          userId: 'admin@company.com',
          timestamp: new Date().toISOString(),
          details: 'Policy archived',
          ipAddress: '127.0.0.1',
          userAgent: 'Mock Browser'
        })
        this.writeCache(policies)
      }
    }
  }

  // Get policy compliance report
  async getPolicyCompliance(policyId: number): Promise<ComplianceReport> {
    try {
      const response = await apiClient.get<ComplianceReport>(`${this.baseUrl}/${policyId}/compliance`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch compliance for policy ${policyId}:`, error)
      
      this.initializeCache()
      const policy = this.readCache().find(p => p.id === policyId)
      if (!policy) throw new Error('Policy not found')
      
      return {
        policyId: policy.id,
        policyName: policy.name,
        complianceScore: Math.random() * 20 + 80, // Mock score 80-100
        violations: Math.floor(Math.random() * 5),
        lastAudit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextAudit: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'Review policy effectiveness regularly',
          'Update compliance documentation',
          'Conduct staff training on policy requirements'
        ]
      }
    }
  }

  // Get all compliance reports
  async getAllComplianceReports(): Promise<ComplianceReport[]> {
    try {
      const response = await apiClient.get<ComplianceReport[]>(`${this.baseUrl}/compliance/reports`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error)
      
      this.initializeCache()
      const policies = this.readCache().filter(p => p.status === 'active')
      
      return policies.map(policy => ({
        policyId: policy.id,
        policyName: policy.name,
        complianceScore: Math.random() * 20 + 80,
        violations: Math.floor(Math.random() * 5),
        lastAudit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextAudit: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'Review policy effectiveness regularly',
          'Update compliance documentation'
        ]
      }))
    }
  }

  // Get policy statistics
  async getPolicyStatistics(): Promise<{
    totalPolicies: number
    activePolicies: number
    draftPolicies: number
    archivedPolicies: number
    complianceScore: number
    violationsThisMonth: number
    policiesByCategory: Record<string, number>
    policiesByPriority: Record<string, number>
  }> {
    try {
      const response = await apiClient.get<{
        totalPolicies: number
        activePolicies: number
        draftPolicies: number
        archivedPolicies: number
        complianceScore: number
        violationsThisMonth: number
        policiesByCategory: Record<string, number>
        policiesByPriority: Record<string, number>
      }>(`${this.baseUrl}/statistics`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch policy statistics:', error)
      
      this.initializeCache()
      const policies = this.readCache()
      const totalPolicies = policies.length
      const activePolicies = policies.filter(p => p.status === 'active').length
      const draftPolicies = policies.filter(p => p.status === 'draft').length
      const archivedPolicies = policies.filter(p => p.status === 'archived').length
      
      const policiesByCategory: Record<string, number> = policies.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const policiesByPriority: Record<string, number> = policies.reduce((acc, p) => {
        acc[p.priority] = (acc[p.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return { 
        totalPolicies, 
        activePolicies, 
        draftPolicies, 
        archivedPolicies, 
        complianceScore: 87.5,
        violationsThisMonth: 12,
        policiesByCategory,
        policiesByPriority 
      }
    }
  }

  // Export policies
  async exportPolicies(filters?: PolicyFilters, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const params: Record<string, unknown> = { format }
      if (filters?.search) params.search = filters.search
      if (filters?.category) params.category = filters.category
      if (filters?.status) params.status = filters.status
      if (filters?.priority) params.priority = filters.priority
      if (filters?.compliance) params.compliance = filters.compliance
      if (filters?.tags) params.tags = filters.tags.join(',')
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.start
        params.endDate = filters.dateRange.end
      }

      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, params)
      return response.data
    } catch (error) {
      console.error('Failed to export policies:', error)
      
      const policies = (await this.getPolicies(filters)).policies
      const header = 'id,name,category,status,priority,version,effectiveDate,expiryDate,createdBy,tags\n'
      const rows = policies.map(p => 
        `${p.id},"${p.name}",${p.category},${p.status},${p.priority},"${p.version}",${p.effectiveDate},${p.expiryDate || ''},"${p.createdBy}","${p.tags.join(';')}"`
      ).join('\n')
      const csv = header + rows
      
      const mimeType = format === 'excel' ? 'application/vnd.ms-excel' : 
                      format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;'
      return new Blob([csv], { type: mimeType })
    }
  }

  // Bulk operations
  async bulkUpdatePolicies(policyIds: number[], updates: Partial<PolicyUpdateData>): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-update`, { policyIds, updates })
    } catch (error) {
      console.error('Failed to bulk update policies:', error)
      
      this.initializeCache()
      const policies = this.readCache()
      const now = new Date().toISOString()
      
      policyIds.forEach(id => {
        const index = policies.findIndex(p => p.id === id)
        if (index !== -1) {
          policies[index] = { ...policies[index], ...updates, updatedAt: now }
          policies[index].auditLog.push({
            id: policies[index].auditLog.length + 1,
            action: 'BULK_UPDATE',
            userId: 'admin@company.com',
            timestamp: now,
            details: 'Bulk update applied',
            ipAddress: '127.0.0.1',
            userAgent: 'Mock Browser'
          })
        }
      })
      
      this.writeCache(policies)
    }
  }

  async bulkDeletePolicies(policyIds: number[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk-delete`, { body: { policyIds } })
    } catch (error) {
      console.error('Failed to bulk delete policies:', error)
      
      this.initializeCache()
      const policies = this.readCache().filter(p => !policyIds.includes(p.id))
      this.writeCache(policies)
    }
  }

  async bulkActivatePolicies(policyIds: number[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-activate`, { policyIds })
    } catch (error) {
      console.error('Failed to bulk activate policies:', error)
      
      this.initializeCache()
      const policies = this.readCache()
      const now = new Date().toISOString()
      
      policyIds.forEach(id => {
        const index = policies.findIndex(p => p.id === id)
        if (index !== -1) {
          policies[index].status = 'active'
          policies[index].updatedAt = now
          policies[index].auditLog.push({
            id: policies[index].auditLog.length + 1,
            action: 'BULK_ACTIVATED',
            userId: 'admin@company.com',
            timestamp: now,
            details: 'Bulk activation applied',
            ipAddress: '127.0.0.1',
            userAgent: 'Mock Browser'
          })
        }
      })
      
      this.writeCache(policies)
    }
  }

  async bulkDeactivatePolicies(policyIds: number[]): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-deactivate`, { policyIds })
    } catch (error) {
      console.error('Failed to bulk deactivate policies:', error)
      
      this.initializeCache()
      const policies = this.readCache()
      const now = new Date().toISOString()
      
      policyIds.forEach(id => {
        const index = policies.findIndex(p => p.id === id)
        if (index !== -1) {
          policies[index].status = 'inactive'
          policies[index].updatedAt = now
          policies[index].auditLog.push({
            id: policies[index].auditLog.length + 1,
            action: 'BULK_DEACTIVATED',
            userId: 'admin@company.com',
            timestamp: now,
            details: 'Bulk deactivation applied',
            ipAddress: '127.0.0.1',
            userAgent: 'Mock Browser'
          })
        }
      })
      
      this.writeCache(policies)
    }
  }

  // Search policies
  async searchPolicies(query: string, filters?: Omit<PolicyFilters, 'search'>): Promise<PolicyResponse> {
    return this.getPolicies({ ...filters, search: query })
  }

  // Get policy audit log
  async getPolicyAuditLog(policyId: number, page: number = 1, limit: number = 50): Promise<{
    logs: PolicyAuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const response = await apiClient.get<{
        logs: PolicyAuditLog[]
        total: number
        page: number
        limit: number
        totalPages: number
      }>(`${this.baseUrl}/${policyId}/audit-log`, { page, limit })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch audit log for policy ${policyId}:`, error)
      
      this.initializeCache()
      const policy = this.readCache().find(p => p.id === policyId)
      if (!policy) throw new Error('Policy not found')
      
      const total = policy.auditLog.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const startIndex = (page - 1) * limit
      const logs = policy.auditLog.slice(startIndex, startIndex + limit)
      
      return { logs, total, page, limit, totalPages }
    }
  }

  // Get available policy categories
  async getPolicyCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/categories`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch policy categories:', error)
      return ['security', 'privacy', 'compliance', 'operational', 'financial']
    }
  }

  // Get available policy tags
  async getPolicyTags(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/tags`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch policy tags:', error)
      return [
        'security', 'privacy', 'compliance', 'financial', 'operational',
        'gdpr', 'hipaa', 'sox', 'pci-dss', 'iso27001',
        'access-control', 'authentication', 'authorization', 'encryption',
        'data-protection', 'personal-data', 'audit', 'monitoring'
      ]
    }
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.memoryCache = null
  }

  private getFallbackPolicies(): PolicyResponse {
    const policies: Policy[] = [
      {
        id: 1,
        name: 'Information Security Policy',
        description: 'Comprehensive policy governing information security practices, access controls, and data protection measures across the organization.',
        category: 'security',
        status: 'active',
        priority: 'critical',
        version: '2.1.0',
        effectiveDate: '2024-01-01T00:00:00Z',
        expiryDate: '2024-12-31T23:59:59Z',
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T10:00:00Z',
        updatedBy: 'security.admin@company.com',
        updatedAt: '2024-01-05T14:30:00Z',
        tags: ['security', 'access-control', 'authentication', 'authorization'],
        compliance: {
          gdpr: true,
          hipaa: false,
          sox: true,
          pci: false,
          iso27001: true
        },
        rules: [
          {
            id: 1,
            name: 'Password Complexity Rule',
            description: 'Passwords must contain at least 8 characters with uppercase, lowercase, numbers and special characters',
            condition: 'password.length >= 8 AND password.hasUppercase AND password.hasLowercase',
            action: 'REJECT_ACCESS',
            severity: 'high',
            enabled: true
          }
        ],
        exceptions: [],
        auditLog: [
          {
            id: 1,
            action: 'POLICY_CREATED',
            userId: 'admin@company.com',
            timestamp: '2024-01-01T10:00:00Z',
            details: 'Created Information Security Policy',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        ]
      },
      {
        id: 2,
        name: 'Data Privacy and Protection Policy',
        description: 'Policy outlining data privacy requirements, personal data handling procedures, and compliance with international privacy regulations.',
        category: 'privacy',
        status: 'active',
        priority: 'critical',
        version: '1.3.2',
        effectiveDate: '2024-01-15T00:00:00Z',
        expiryDate: '2025-01-15T23:59:59Z',
        createdBy: 'privacy.officer@company.com',
        createdAt: '2023-12-15T09:00:00Z',
        updatedBy: 'privacy.officer@company.com',
        updatedAt: '2024-01-10T11:15:00Z',
        tags: ['privacy', 'gdpr', 'data-protection', 'consent', 'personal-data'],
        compliance: {
          gdpr: true,
          hipaa: true,
          sox: false,
          pci: false,
          iso27001: true
        },
        rules: [],
        exceptions: [],
        auditLog: []
      },
      {
        id: 3,
        name: 'Remote Work Security Policy - Draft',
        description: 'Draft policy for secure remote work practices, including VPN usage, device security, and home office requirements.',
        category: 'security',
        status: 'draft',
        priority: 'medium',
        version: '0.9.0',
        effectiveDate: '2024-03-01T00:00:00Z',
        createdBy: 'security.admin@company.com',
        createdAt: '2024-01-20T14:20:00Z',
        updatedBy: 'security.admin@company.com',
        updatedAt: '2024-01-25T16:45:00Z',
        tags: ['remote-work', 'vpn', 'device-security', 'encryption'],
        compliance: {
          gdpr: true,
          hipaa: false,
          sox: false,
          pci: true,
          iso27001: true
        },
        rules: [
          {
            id: 1,
            name: 'Mandatory VPN Usage',
            description: 'All remote access to company resources must use the corporate VPN',
            condition: 'remote_access AND NOT vpn_connected',
            action: 'BLOCK_ACCESS',
            severity: 'high',
            enabled: true
          },
          {
            id: 2,
            name: 'Device Encryption Requirement',
            description: 'All devices used for remote work must have full disk encryption enabled',
            condition: 'remote_device AND NOT encryption_enabled',
            action: 'RESTRICT_ACCESS',
            severity: 'medium',
            enabled: true
          }
        ],
        exceptions: [
          {
            id: 1,
            reason: 'Emergency maintenance access',
            requestedBy: 'network.admin@company.com',
            approvedBy: 'security.admin@company.com',
            status: 'approved',
            startDate: '2024-02-01T00:00:00Z',
            endDate: '2024-02-01T06:00:00Z',
            conditions: 'Only for network team during maintenance window'
          }
        ],
        auditLog: [
          {
            id: 1,
            action: 'POLICY_CREATED',
            userId: 'security.admin@company.com',
            timestamp: '2024-01-20T14:20:00Z',
            details: 'Created draft Remote Work Security Policy',
            ipAddress: '192.168.1.150',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          {
            id: 2,
            action: 'POLICY_UPDATED',
            userId: 'security.admin@company.com',
            timestamp: '2024-01-25T16:45:00Z',
            details: 'Added VPN and encryption rules',
            ipAddress: '192.168.1.150',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        ]
      },
      {
        id: 4,
        name: 'Financial Controls and Reporting Policy',
        description: 'Policy governing financial reporting accuracy, internal controls, and compliance with financial regulations.',
        category: 'financial',
        status: 'active',
        priority: 'high',
        version: '3.2.1',
        effectiveDate: '2024-01-01T00:00:00Z',
        expiryDate: '2024-12-31T23:59:59Z',
        createdBy: 'finance.director@company.com',
        createdAt: '2023-11-10T08:00:00Z',
        updatedBy: 'finance.director@company.com',
        updatedAt: '2023-12-20T15:30:00Z',
        tags: ['financial', 'sox', 'reporting', 'internal-controls', 'compliance'],
        compliance: {
          gdpr: false,
          hipaa: false,
          sox: true,
          pci: false,
          iso27001: false
        },
        rules: [
          {
            id: 1,
            name: 'Dual Authorization for Large Transactions',
            description: 'Financial transactions above $50,000 require dual authorization',
            condition: 'transaction_amount > 50000 AND authorization_count < 2',
            action: 'HOLD_TRANSACTION',
            severity: 'critical',
            enabled: true
          }
        ],
        exceptions: [],
        auditLog: []
      },
      {
        id: 5,
        name: 'Incident Response Policy - Archived',
        description: 'Archived policy for security incident response procedures and escalation protocols.',
        category: 'security',
        status: 'archived',
        priority: 'high',
        version: '1.5.3',
        effectiveDate: '2023-01-01T00:00:00Z',
        expiryDate: '2023-12-31T23:59:59Z',
        createdBy: 'security.admin@company.com',
        createdAt: '2022-12-15T11:00:00Z',
        updatedBy: 'security.admin@company.com',
        updatedAt: '2023-11-30T09:45:00Z',
        tags: ['incident-response', 'security', 'escalation', 'breach'],
        compliance: {
          gdpr: true,
          hipaa: true,
          sox: false,
          pci: true,
          iso27001: true
        },
        rules: [],
        exceptions: [],
        auditLog: [
          {
            id: 1,
            action: 'POLICY_ARCHIVED',
            userId: 'security.admin@company.com',
            timestamp: '2023-12-01T10:00:00Z',
            details: 'Policy archived due to new version release',
            ipAddress: '192.168.1.200',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        ]
      }
    ]
    
    return {
      policies,
      total: policies.length,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  }
}

export const policyService = new PolicyService()