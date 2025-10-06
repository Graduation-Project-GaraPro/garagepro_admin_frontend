// "use client";

// import { useState, useEffect } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Switch } from '@/components/ui/switch'
// import { Label } from '@/components/ui/label'
// import { Separator } from '@/components/ui/separator'
// import { 
//   Shield, 
//   Lock, 
//   Clock, 
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   Eye,
//   Save,
//   RefreshCw,
//   User
// } from 'lucide-react'
// import { securityPolicyService, SecurityPolicy } from './services/securityPolicyService'

// const securityAlerts = [
//   {
//     id: 1,
//     type: 'warning',
//     title: 'Multiple Failed Login Attempts',
//     description: 'User john.doe@example.com has 3 failed login attempts',
//     time: '2 minutes ago',
//     icon: AlertTriangle
//   },
//   {
//     id: 2,
//     type: 'error',
//     title: 'Suspicious IP Activity',
//     description: 'Unusual login activity detected from IP 192.168.1.100',
//     time: '15 minutes ago',
//     icon: AlertTriangle
//   },
//   {
//     id: 3,
//     type: 'success',
//     title: 'Security Scan Completed',
//     description: 'Daily security scan completed successfully',
//     time: '1 hour ago',
//     icon: CheckCircle
//   }
// ]

// const getAlertIcon = (type: string) => {
//   switch (type) {
//     case 'warning':
//       return AlertTriangle
//     case 'error':
//       return XCircle
//     case 'success':
//       return CheckCircle
//     default:
//       return AlertTriangle
//   }
// }

// const getAlertColor = (type: string) => {
//   switch (type) {
//     case 'warning':
//       return 'text-yellow-600 bg-yellow-50'
//     case 'error':
//       return 'text-red-600 bg-red-50'
//     case 'success':
//       return 'text-green-600 bg-green-50'
//     default:
//       return 'text-gray-600 bg-gray-50'
//   }
// }

// export function SecurityManagement() {
//   const [policy, setPolicy] = useState<SecurityPolicy | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState(false)
//   const [initialLoad, setInitialLoad] = useState(true)

//   // Load policy khi component mount
//   useEffect(() => {
//     console.log('Component mounted, loading policy...')
//     loadPolicy()
//   }, [])

//   const loadPolicy = async () => {
//     try {
//       console.log('Starting to load policy...')
//       setLoading(true)
//       setError(null)
//       setInitialLoad(true)
      
//       // Clear cache để đảm bảo load mới
//       securityPolicyService.clearCache();
      
//       const policyData = await securityPolicyService.getPolicy()
//       console.log('Policy loaded successfully:', policyData)
      
//       setPolicy(policyData)
//     } catch (err) {
//       console.error('Error loading policy:', err)
//       setError('Failed to load security policy: ' + (err instanceof Error ? err.message : 'Unknown error'))
      
//       // Tạo policy mặc định nếu API fail
//       const defaultPolicy: SecurityPolicy = {
//         minPasswordLength: 8,
//         requireSpecialChar: false,
//         requireNumber: true,
//         requireUppercase: true,
//         sessionTimeout: 30,
//         maxLoginAttempts: 5,
//         accountLockoutTime: 15,
//         mfaRequired: false,
//         passwordExpiryDays: 90,
//         enableBruteForceProtection: true,
//         updatedAt: new Date().toISOString(),
//         updatedBy: null
//       }
//       setPolicy(defaultPolicy)
//       console.log('Using default policy due to error:', defaultPolicy)
//     } finally {
//       setLoading(false)
//       setInitialLoad(false)
//       console.log('Loading finished')
//     }
//   }

//   const updatePolicy = async (updates: Partial<SecurityPolicy>) => {
//     if (!policy) return

//     try {
//       setSaving(true)
//       setError(null)
//       setSuccess(false)
      
//       console.log('Updating policy with:', updates)
//       const updatedPolicy = await securityPolicyService.updatePolicy(updates)
//       console.log('Policy updated:', updatedPolicy)
      
//       setPolicy(updatedPolicy)
//       setSuccess(true)
      
//       setTimeout(() => setSuccess(false), 3000)
//     } catch (err) {
//       console.error('Error updating policy:', err)
//       setError('Failed to update security policy: ' + (err instanceof Error ? err.message : 'Unknown error'))
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleSwitchChange = (key: keyof SecurityPolicy, value: boolean) => {
//     if (!policy) return
    
//     console.log('Switch changed:', key, value)
    
//     // Cập nhật UI ngay lập tức
//     setPolicy(prev => {
//       if (!prev) return null
//       const updated = { ...prev, [key]: value }
//       console.log('Updated policy state:', updated)
//       return updated
//     })
    
//     // Gọi API update
//     updatePolicy({ [key]: value })
//   }

//   const handleNumberInputChange = (key: keyof SecurityPolicy, value: string) => {
//     if (!policy) return
    
//     let numValue = parseInt(value) || 0
    
//     // Áp dụng constraints dựa trên field
//     const constraints: { [key: string]: { min: number; max: number } } = {
//       minPasswordLength: { min: 6, max: 20 },
//       sessionTimeout: { min: 1, max: 1440 },
//       maxLoginAttempts: { min: 1, max: 10 },
//       accountLockoutTime: { min: 1, max: 1440 },
//       passwordExpiryDays: { min: 1, max: 365 }
//     }
    
//     if (constraints[key]) {
//       numValue = Math.max(constraints[key].min, Math.min(constraints[key].max, numValue))
//     }
    
//     console.log('Input changed:', key, numValue)
    
//     setPolicy(prev => {
//       if (!prev) return null
//       const updated = { ...prev, [key]: numValue }
//       console.log('Updated policy state:', updated)
//       return updated
//     })
    
//     updatePolicy({ [key]: numValue })
//   }

//   const handleSaveAll = async () => {
//     if (!policy) return
    
//     try {
//       setSaving(true)
//       setError(null)
//       setSuccess(false)
      
//       console.log('Saving all changes:', policy)
//       const updatedPolicy = await securityPolicyService.updatePolicy(policy)
//       setPolicy(updatedPolicy)
//       setSuccess(true)
      
//       setTimeout(() => setSuccess(false), 3000)
//     } catch (err) {
//       console.error('Error saving policy:', err)
//       setError('Failed to update security policy: ' + (err instanceof Error ? err.message : 'Unknown error'))
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleReset = () => {
//     console.log('Resetting policy...')
//     loadPolicy() // Reload từ database để reset
//   }

//   // Test API connection (debug)
//   const testApiConnection = async () => {
//     try {
//       console.log('Testing API connection...')
//       const response = await fetch('https://localhost:7113/api/SecurityPolicy/current', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//       console.log('API test response status:', response.status)
      
//       if (response.ok) {
//         const data = await response.json()
//         console.log('API test data:', data)
//         alert('API connection successful! Check console for details.')
//       } else {
//         alert('API connection failed: ' + response.status)
//       }
//     } catch (error) {
//       console.error('API test error:', error)
//       alert('API connection error: ' + error)
//     }
//   }

//   // Hiển thị loading state
//   if (loading && initialLoad) {
//     return (
//       <div className="flex flex-col justify-center items-center h-64 space-y-4">
//         <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
//         <span className="text-lg">Loading security policy...</span>
//         <div className="text-sm text-gray-500">
//           Connecting to: https://localhost:7113/api/SecurityPolicy/current
//         </div>
//       </div>
//     )
//   }

//   // Hiển thị error state
//   if (error && !policy) {
//     return (
//       <div className="flex flex-col justify-center items-center h-64">
//         <XCircle className="h-8 w-8 text-red-600" />
//         <span className="mt-2 text-red-600">{error}</span>
//         <Button onClick={loadPolicy} className="mt-4">
//           <RefreshCw className="mr-2 h-4 w-4" />
//           Retry
//         </Button>
//       </div>
//     )
//   }

//   if (!policy) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <XCircle className="h-8 w-8 text-red-600 mr-2" />
//         <span>No security policy found. Please check the API connection.</span>
//       </div>
//     )
//   }

//   const securityPolicies = [
//     {
//       id: 1,
//       name: 'Password Policy',
//       description: 'Configure password requirements and complexity rules',
//       icon: Lock,
//       settings: [
//         { 
//           name: 'Minimum Length', 
//           value: policy.minPasswordLength,
//           type: 'input',
//           key: 'minPasswordLength' as keyof SecurityPolicy,
//           min: 6,
//           max: 20
//         },
//         { 
//           name: 'Require Uppercase', 
//           value: policy.requireUppercase,
//           type: 'switch',
//           key: 'requireUppercase' as keyof SecurityPolicy
//         },
//         { 
//           name: 'Require Numbers', 
//           value: policy.requireNumber,
//           type: 'switch',
//           key: 'requireNumber' as keyof SecurityPolicy
//         },
//         { 
//           name: 'Require Special Characters', 
//           value: policy.requireSpecialChar,
//           type: 'switch',
//           key: 'requireSpecialChar' as keyof SecurityPolicy
//         },
//         { 
//           name: 'Password Expiry (days)', 
//           value: policy.passwordExpiryDays,
//           type: 'input',
//           key: 'passwordExpiryDays' as keyof SecurityPolicy,
//           min: 1,
//           max: 365
//         }
//       ]
//     },
//     {
//       id: 2,
//       name: 'Session Management',
//       description: 'Configure session timeouts and security settings',
//       icon: Clock,
//       settings: [
//         { 
//           name: 'Session Timeout (minutes)', 
//           value: policy.sessionTimeout,
//           type: 'input',
//           key: 'sessionTimeout' as keyof SecurityPolicy,
//           min: 1,
//           max: 1440
//         },
//         { 
//           name: 'Max Login Attempts', 
//           value: policy.maxLoginAttempts,
//           type: 'input',
//           key: 'maxLoginAttempts' as keyof SecurityPolicy,
//           min: 1,
//           max: 10
//         },
//         { 
//           name: 'Account Lockout Time (minutes)', 
//           value: policy.accountLockoutTime,
//           type: 'input',
//           key: 'accountLockoutTime' as keyof SecurityPolicy,
//           min: 1,
//           max: 1440
//         }
//       ]
//     },
//     {
//       id: 3,
//       name: 'Security Features',
//       description: 'Manage security features and protections',
//       icon: Shield,
//       settings: [
//         { 
//           name: 'Two-Factor Authentication', 
//           value: policy.mfaRequired,
//           type: 'switch',
//           key: 'mfaRequired' as keyof SecurityPolicy
//         },
//         { 
//           name: 'Brute Force Protection', 
//           value: policy.enableBruteForceProtection,
//           type: 'switch',
//           key: 'enableBruteForceProtection' as keyof SecurityPolicy
//         }
//       ]
//     }
//   ]

//   return (
//     <div className="space-y-6">
//       {/* Status Messages */}
//       {error && (
//         <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
//           <XCircle className="h-5 w-5 text-red-600 mr-2" />
//           <span className="text-red-600">{error}</span>
//         </div>
//       )}
      
//       {success && (
//         <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
//           <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
//           <span className="text-green-600">Security policy updated successfully!</span>
//         </div>
//       )}

//       {/* Debug Button (tạm thời) */}
//       <div className="flex justify-end">
//         <Button onClick={testApiConnection} variant="outline" size="sm" className="mb-4">
//           Test API Connection
//         </Button>
//       </div>

//       {/* Security Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Password Strength</CardTitle>
//             <Lock className="h-4 w-4 text-blue-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{policy.minPasswordLength}+ chars</div>
//             <p className="text-xs text-gray-600">
//               {policy.requireUppercase && policy.requireNumber && policy.requireSpecialChar 
//                 ? 'Strong requirements' 
//                 : policy.requireUppercase && policy.requireNumber
//                 ? 'Medium requirements'
//                 : 'Basic requirements'
//               }
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Session Timeout</CardTitle>
//             <Clock className="h-4 w-4 text-yellow-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{policy.sessionTimeout}m</div>
//             <p className="text-xs text-gray-600">Auto logout after {policy.sessionTimeout} minutes</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Security Features</CardTitle>
//             <Shield className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {[policy.mfaRequired, policy.enableBruteForceProtection].filter(Boolean).length}/2
//             </div>
//             <p className="text-xs text-gray-600">
//               {policy.enableBruteForceProtection ? 'Brute force protection enabled' : 'Basic protection'}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Last Updated Info */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex justify-between items-center text-sm text-gray-600">
//             <div>
//               <span className="font-medium">Last updated: </span>
//               {new Date(policy.updatedAt).toLocaleString()}
//             </div>
//             {policy.updatedBy && (
//               <div className="flex items-center">
//                 <User className="h-4 w-4 mr-1" />
//                 <span className="font-medium">By: </span>
//                 {policy.updatedBy}
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Security Policies */}
//       {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {securityPolicies.map((policyGroup) => {
//           const Icon = policyGroup.icon
//           return (
//             <Card key={policyGroup.id}>
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2">
//                   <Icon className="h-5 w-5" />
//                   <span>{policyGroup.name}</span>
//                 </CardTitle>
//                 <p className="text-sm text-gray-600">{policyGroup.description}</p>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {policyGroup.settings.map((setting) => (
//                   <div key={setting.name} className="flex items-center justify-between">
//                     <Label htmlFor={`${policyGroup.id}-${setting.name}`} className="text-sm font-medium">
//                       {setting.name}
//                     </Label>
//                     <div className="flex items-center space-x-2">
//                       {setting.type === 'switch' ? (
//                         <Switch
//                           id={`${policyGroup.id}-${setting.name}`}
//                           checked={setting.value as boolean}
//                           onCheckedChange={(checked) => 
//                             handleSwitchChange(setting.key, checked)
//                           }
//                           disabled={saving}
//                         />
//                       ) : (
//                         <Input
//                           id={`${policyGroup.id}-${setting.name}`}
//                           type="number"
//                           value={setting.value as number}
//                           onChange={(e) => 
//                             handleNumberInputChange(setting.key, e.target.value)
//                           }
//                           className="w-32"
//                           disabled={saving}
//                           min={(setting as any).min}
//                           max={(setting as any).max}
//                         />
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           )
//         })}
//       </div> */}

//       {/* Actions */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="font-medium">Security Policy Management</p>
//               <p className="text-sm text-gray-600">Manage your security settings</p>
//             </div>
//             <div className="flex space-x-2">
              
//                 <RefreshCw className="mr-2 h-4 w-4" />
//                 Reload<Button 
//                 variant="outline" 
//                 onClick={handleReset}
//                 disabled={loading || saving}
//               >
//               </Button>
//               <Button 
//                 onClick={handleSaveAll}
//                 disabled={saving}
//               >
//                 <Save className="mr-2 h-4 w-4" />
//                 {saving ? 'Saving...' : 'Save All'}
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

     

//       {/* Security Alerts */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <AlertTriangle className="h-5 w-5" />
//             <span>Security Alerts</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {securityAlerts.map((alert) => {
//               const Icon = getAlertIcon(alert.type)
//               return (
//                 <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg ${getAlertColor(alert.type)}`}>
//                   <div className="flex items-center space-x-3">
//                     <Icon className="h-5 w-5" />
//                     <div>
//                       <div className="font-medium">{alert.title}</div>
//                       <div className="text-sm opacity-80">{alert.description}</div>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm opacity-80">{alert.time}</span>
//                     <Button variant="ghost" size="sm">
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Security Actions */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Quick Security Actions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
//               <Shield className="h-5 w-5" />
//               <span>Run Security Scan</span>
//             </Button>
//             <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
//               <Lock className="h-5 w-5" />
//               <span>Update Policies</span>
//             </Button>
//             <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
//               <Clock className="h-5 w-5" />
//               <span>Session Audit</span>
//             </Button>
//             <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto p-4">
//               <AlertTriangle className="h-5 w-5" />
//               <span>View Logs</span>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
