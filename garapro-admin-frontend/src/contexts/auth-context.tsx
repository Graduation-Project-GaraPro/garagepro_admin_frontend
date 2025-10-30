// contexts/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

export interface User {
  userId: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (loginData: any) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          console.log('✅ Auth check: User authenticated', userData.email);
          
          // Nếu đang ở trang chủ (login) và đã login -> redirect đến admin
          // NHƯNG chỉ redirect nếu middleware chưa làm (tránh loop)
          if (pathname === '/' && !isRedirecting) {
            console.log('🔄 Auth context: Redirecting to /admin');
            setTimeout(() => router.push('/admin'), 100); // Small delay để tránh conflict với middleware
          }
        } else {
          console.log('❌ Auth check: Token invalid');
          await authService.logout();
        }
      } else {
        console.log('🔐 Auth check: No token found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Biến để tránh redirect loop
  let isRedirecting = false;

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const token = authService.getToken();
      if (!token) return null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  const login = async (loginData: any) => {
    try {
      console.log('🔐 Starting login process...');
      const authData = await authService.phoneLogin(loginData);
      const userData = {
        userId: authData.userId,
        email: authData.email,
        roles: authData.roles
      };
      setUser(userData);
      
      console.log('✅ Login successful, redirecting to /admin');
      // Redirect sau khi login thành công
      isRedirecting = true;
      router.push('/admin');
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      await authService.logout();
      setUser(null);
      
      console.log('✅ Logout successful, redirecting to /');
      isRedirecting = true;
      router.push('/');
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // ... rest of the code (hasRole, hasAnyRole, etc.)

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
    
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}