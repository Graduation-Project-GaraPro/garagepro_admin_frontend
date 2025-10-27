// contexts/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Kiểm tra cả token và user data
      if (authService.isAuthenticated()) {
        // Có token, nhưng cần kiểm tra user data
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          // Token không hợp lệ, clear auth
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

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
      const authData = await authService.phoneLogin(loginData);
      const userData = {
        userId: authData.userId,
        email: authData.email,
        roles: authData.roles
      };
      setUser(userData);
      
      // Verify token is actually stored
      console.log('Token after login:', authService.getToken());
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user?.roles.some(role => roles.includes(role)) || false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
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