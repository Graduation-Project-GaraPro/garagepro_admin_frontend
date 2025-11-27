'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();         // Đợi logout hoàn thành
    router.push("/");       // Sau đó về trang chủ
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <span className="text-2xl"></span>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {user && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Logged in as</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Roles</p>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
