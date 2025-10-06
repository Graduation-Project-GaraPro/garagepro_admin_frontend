'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  TrendingUp,
  FileText,
  Download
} from 'lucide-react'

interface ComplianceStandard {
  id: string
  name: string
  version: string
  status: 'compliant' | 'non-compliant' | 'pending' | 'in-progress'
  complianceRate: number
  lastAudit: string
  nextAudit: string
  requirements: ComplianceRequirement[]
}

interface ComplianceRequirement {
  id: string
  name: string
  description: string
  status: 'met' | 'not-met' | 'partial'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
}

const mockComplianceStandards: ComplianceStandard[] = [
  {
    id: '1',
    name: 'ISO 27001',
    version: '2013',
    status: 'compliant',
    complianceRate: 95,
    lastAudit: '2024-02-15T09:00:00Z',
    nextAudit: '2024-08-15T09:00:00Z',
    requirements: [
      {
        id: '1',
        name: 'Information Security Policy',
        description: 'Establish and maintain information security policy',
        status: 'met',
        priority: 'high',
        category: 'Policy'
      },
      {
        id: '2',
        name: 'Access Control',
        description: 'Implement access control mechanisms',
        status: 'met',
        priority: 'critical',
        category: 'Security'
      }
    ]
  },
  {
    id: '2',
    name: 'GDPR',
    version: '2018',
    status: 'compliant',
    complianceRate: 88,
    lastAudit: '2024-03-01T10:00:00Z',
    nextAudit: '2024-09-01T10:00:00Z',
    requirements: [
      {
        id: '3',
        name: 'Data Protection',
        description: 'Implement data protection measures',
        status: 'met',
        priority: 'critical',
        category: 'Privacy'
      },
      {
        id: '4',
        name: 'User Consent',
        description: 'Obtain and manage user consent',
        status: 'partial',
        priority: 'high',
        category: 'Privacy'
      }
    ]
  },
  {
    id: '3',
    name: 'SOC 2',
    version: '2017',
    status: 'in-progress',
    complianceRate: 65,
    lastAudit: '2024-01-20T14:00:00Z',
    nextAudit: '2024-07-20T14:00:00Z',
    requirements: [
      {
        id: '5',
        name: 'Security Controls',
        description: 'Implement security controls',
        status: 'met',
        priority: 'critical',
        category: 'Security'
      },
      {
        id: '6',
        name: 'Availability Controls',
        description: 'Ensure system availability',
        status: 'not-met',
        priority: 'high',
        category: 'Availability'
      }
    ]
  }
]

const statusColors = {
  compliant: 'bg-green-100 text-green-800 border-green-200',
  'non-compliant': 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
}

const requirementStatusColors = {
  met: 'bg-green-100 text-green-800 border-green-200',
  'not-met': 'bg-red-100 text-red-800 border-red-200',
  partial: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

export function PolicyCompliance() {
  const [standards] = useState<ComplianceStandard[]>(mockComplianceStandards)

  const overallComplianceRate = standards.reduce((acc, standard) => acc + standard.complianceRate, 0) / standards.length

  // Tính toán số ngày đến audit tiếp theo
  const daysUntilNextAudit = () => {
    const nextAudits = standards.map(s => new Date(s.nextAudit).getTime());
    const closestAudit = Math.min(...nextAudits);
    const days = Math.ceil((closestAudit - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const exportComplianceReport = () => {
    const dataStr = JSON.stringify(standards, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'compliance-report.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage compliance with various standards and regulations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportComplianceReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallComplianceRate.toFixed(1)}%</div>
            <Progress value={overallComplianceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Across all standards
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant Standards</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {standards.filter(s => s.status === 'compliant').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {standards.length} total standards
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {standards.reduce((acc, standard) => 
                acc + standard.requirements.filter(r => r.priority === 'critical' && r.status !== 'met').length, 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Audit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysUntilNextAudit()}
            </div>
            <p className="text-xs text-muted-foreground">
              days until next audit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Standards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Standards</CardTitle>
          <CardDescription>
            Overview of compliance with various standards and regulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Standard</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance Rate</TableHead>
                <TableHead>Last Audit</TableHead>
                <TableHead>Next Audit</TableHead>
                <TableHead>Requirements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standards.map((standard) => (
                <TableRow key={standard.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{standard.name}</div>
                      <div className="text-sm text-gray-500">v{standard.version}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[standard.status]}>
                      {standard.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={standard.complianceRate} className="w-20" />
                      <span className="text-sm font-medium">{standard.complianceRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(standard.lastAudit).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(standard.nextAudit).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {standard.requirements.filter(r => r.status === 'met').length} / {standard.requirements.length} met
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Requirements Details */}
      <div className="space-y-6">
        {standards.map((standard) => (
          <Card key={standard.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{standard.name} Requirements</span>
                <Badge variant="outline" className={statusColors[standard.status]}>
                  {standard.status.replace('-', ' ')}
                </Badge>
              </CardTitle>
              <CardDescription>
                Detailed requirements and their compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standard.requirements.map((requirement) => (
                    <TableRow key={requirement.id}>
                      <TableCell>
                        <div className="font-medium">{requirement.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{requirement.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColors[requirement.priority]}>
                          {requirement.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={requirementStatusColors[requirement.status]}>
                          {requirement.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs">
                          {requirement.description}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}