export interface Policy {
  id: string
  name: string
  description: string
  category: 'security' | 'privacy' | 'data' | 'access' | 'compliance'
  status: 'active' | 'inactive' | 'draft'
  priority: 'low' | 'medium' | 'high' | 'critical'
  scope: 'global' | 'user' | 'garage' | 'admin'
  version: string
  createdAt: string
  updatedAt: string
  createdBy: string
  rules?: PolicyRule[]
  compliance?: ComplianceInfo[]
}

export interface PolicyRule {
  id: string
  name: string
  description: string
  type: 'allow' | 'deny' | 'require' | 'optional'
  conditions: string[]
  actions: string[]
}

export interface ComplianceInfo {
  standard: string
  version: string
  status: 'compliant' | 'non-compliant' | 'pending'
  lastAudit: string
}

export interface ComplianceStandard {
  id: string
  name: string
  version: string
  status: 'compliant' | 'non-compliant' | 'pending' | 'in-progress'
  complianceRate: number
  lastAudit: string
  nextAudit: string
  requirements: ComplianceRequirement[]
}

export interface ComplianceRequirement {
  id: string
  name: string
  description: string
  status: 'met' | 'not-met' | 'partial'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: 'success' | 'failure' | 'warning'
  ipAddress: string
  userAgent: string
  details: string
  category: 'policy' | 'security' | 'access' | 'data' | 'compliance'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface PolicyFilters {
  search?: string
  category?: string
  status?: string
  priority?: string
  scope?: string
}

export interface ComplianceFilters {
  standard?: string
  status?: string
  priority?: string
}

export interface AuditFilters {
  search?: string
  status?: string
  category?: string
  severity?: string
  dateRange?: {
    start: string
    end: string
  }
} 