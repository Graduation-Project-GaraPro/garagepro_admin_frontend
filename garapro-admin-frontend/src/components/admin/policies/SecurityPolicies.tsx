// components/dashboard/SecurityPolicies.tsx
'use client';

import { useState, useEffect } from 'react';
import { securityPolicyService, SecurityPolicy } from '@/services/securityPolicyService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Save, Shield, Lock, Timer, RefreshCw, Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SecurityPolicies() {
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      setIsLoading(true);
      const currentPolicy = await securityPolicyService.getPolicy();
      setPolicy(currentPolicy);
    } catch (error) {
      console.error('Failed to load security policy:', error);
      toast.error('Failed to load security policy', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
  
    try {
      setIsSaving(true);
      
      const { message, updatedPolicy } = await securityPolicyService.updatePolicy(policy);
      setPolicy(updatedPolicy);
  
      toast.success(message, {
        description: "All security settings have been saved.",
      });
    } catch (error) {
      console.error("Failed to save security policy:", error);
      toast.error("Failed to save security policy", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultPolicy: SecurityPolicy = {
      minPasswordLength: 8,
      requireSpecialChar: true,
      requireNumber: true,
      requireUppercase: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      accountLockoutTime: 15,
      mfaRequired: false,
      passwordExpiryDays: 90,
      enableBruteForceProtection: true,
      updatedAt: new Date().toISOString(),
      updatedBy: null
    };
    
    setPolicy(defaultPolicy);
    toast.info('Reset to default values', {
      description: 'Remember to save changes to apply them.',
    });
  };

  const handlePolicyChange = (updates: Partial<SecurityPolicy>) => {
    if (policy) {
      setPolicy({ ...policy, ...updates });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  if (!policy) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load security policy. Please try refreshing the page.
        </AlertDescription>
        <Button onClick={loadPolicy} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Security Policies
          </h2>
          <p className="text-muted-foreground">
            Configure and enforce security settings for your application
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadPolicy} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleResetToDefaults} className="flex items-center gap-2">
            Reset to Defaults
          </Button>
        </div>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Recommendations</AlertTitle>
        <AlertDescription>
          We recommend enabling MFA and setting a minimum password length of at least 12 characters for enhanced security.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Session
            </TabsTrigger>
            <TabsTrigger value="authentication" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="advanced">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Policy
                </CardTitle>
                <CardDescription>
                  Configure requirements for user passwords
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minPasswordLength" className="flex items-center gap-2">
                      Minimum Password Length
                    </Label>
                    <Input
                      id="minPasswordLength"
                      type="number"
                      min="6"
                      max="20"
                      value={policy.minPasswordLength}
                      onChange={(e) => handlePolicyChange({ minPasswordLength: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiryDays">Password Expiry (Days)</Label>
                    <Input
                      id="passwordExpiryDays"
                      type="number"
                      min="1"
                      max="365"
                      value={policy.passwordExpiryDays}
                      onChange={(e) => handlePolicyChange({ passwordExpiryDays: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireSpecialChar" className="flex items-center gap-2">
                        {policy.requireSpecialChar ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        Require Special Characters
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain at least one special character (!@#$%^&*)
                      </p>
                    </div>
                    <Switch
                      id="requireSpecialChar"
                      checked={policy.requireSpecialChar}
                      onCheckedChange={(checked) => handlePolicyChange({ requireSpecialChar: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireNumber" className="flex items-center gap-2">
                        {policy.requireNumber ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        Require Numbers
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain at least one number
                      </p>
                    </div>
                    <Switch
                      id="requireNumber"
                      checked={policy.requireNumber}
                      onCheckedChange={(checked) => handlePolicyChange({ requireNumber: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireUppercase" className="flex items-center gap-2">
                        {policy.requireUppercase ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        Require Uppercase Letters
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Passwords must contain at least one uppercase letter
                      </p>
                    </div>
                    <Switch
                      id="requireUppercase"
                      checked={policy.requireUppercase}
                      onCheckedChange={(checked) => handlePolicyChange({ requireUppercase: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="session">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Session Policy
                </CardTitle>
                <CardDescription>
                  Configure user session settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="1440"
                      value={policy.sessionTimeout}
                      onChange={(e) => handlePolicyChange({ sessionTimeout: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                  <Timer className="h-4 w-4" />
                  <AlertTitle>Session Management</AlertTitle>
                  <AlertDescription>
                    Shorter session timeouts improve security but may inconvenience users. We recommend 15-30 minutes for most applications.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication Policy
                </CardTitle>
                <CardDescription>
                  Configure authentication and account lockout settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={policy.maxLoginAttempts}
                      onChange={(e) => handlePolicyChange({ maxLoginAttempts: parseInt(e.target.value) })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountLockoutTime">Account Lockout Time (Minutes)</Label>
                    <Input
                      id="accountLockoutTime"
                      type="number"
                      min="1"
                      max="1440"
                      value={policy.accountLockoutTime}
                      onChange={(e) => handlePolicyChange({ accountLockoutTime: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mfaRequired" className="flex items-center gap-2">
                      {policy.mfaRequired ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      Multi-Factor Authentication
                    </Label>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground mr-2">
                        Require MFA for all users
                      </p>
                      <Badge variant={policy.mfaRequired ? "default" : "outline"}>
                        {policy.mfaRequired ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    id="mfaRequired"
                    checked={policy.mfaRequired}
                    onCheckedChange={(checked) => handlePolicyChange({ mfaRequired: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableBruteForceProtection" className="flex items-center gap-2">
                      {policy.enableBruteForceProtection ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      Brute Force Protection
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable protection against brute force attacks
                    </p>
                  </div>
                  <Switch
                    id="enableBruteForceProtection"
                    checked={policy.enableBruteForceProtection}
                    onCheckedChange={(checked) => handlePolicyChange({ enableBruteForceProtection: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Security Settings</CardTitle>
                <CardDescription>
                  Configure advanced security policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="default" className="bg-purple-50 border-purple-200 mb-6">
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Advanced Features</AlertTitle>
                  <AlertDescription>
                    These settings are for advanced security configurations. Modify with caution.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="passwordHistory">Password History</Label>
                      <p className="text-sm text-muted-foreground">
                        Remember previous passwords to prevent reuse
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ipWhitelisting">IP Whitelisting</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict access to specific IP addresses
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2">
          <Button 
            type="button"
            variant="outline"
            onClick={loadPolicy}
            disabled={isSaving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving} 
            className="w-full md:w-auto bg-black text-white hover:bg-gray-800"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Policies
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}