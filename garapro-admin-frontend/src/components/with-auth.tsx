// components/with-auth.tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated, hasAnyRole } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated || !user) {
          // Chưa đăng nhập - redirect đến login
          const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
          router.push(`/login?redirect=${redirectUrl}`);
          return;
        }

        if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
          // Không có quyền - redirect đến access denied
          router.push('/access-denied');
          return;
        }
      }
    }, [user, isLoading, isAuthenticated, hasAnyRole, router]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated || !user) {
      return null; // Đang redirect
    }

    if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return null; // Đang redirect
    }

    return <WrappedComponent {...props} />;
  };
}