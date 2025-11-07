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
      console.log('🔄 checkAuth started');
      
      if (authService.isAuthenticated()) {
        console.log('✅ Token exists, creating user from token data');
        
        // Tạo user từ thông tin trong token/sessionStorage
        const userData = await createUserFromStoredData();
        if (userData) {
          console.log('✅ User created from stored data:', userData.email);
          setUser(userData);
        } else {
          console.log('❌ Cannot create user from stored data');
          await authService.logout();
        }
      } else {
        console.log('❌ No token found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
      console.log('🔄 checkAuth completed');
    }
  };

  const createUserFromStoredData = async (): Promise<User | null> => {
    try {
      const userId = authService.getCurrentUserId();
      const email = authService.getCurrentUserEmail();
      
      console.log('🔍 Creating user from stored data:', { userId, email });
      
      if (!userId || !email) {
        console.log('❌ Missing user data in storage');
        return null;
      }

      // Mặc định roles là ['User'], hoặc lấy từ token nếu có
      // Trong thực tế, bạn có thể decode JWT token để lấy roles
      const userData: User = {
        userId,
        email,
        roles: ['Admin'] // Tạm thời hardcode, sau này có thể decode từ token
      };

      return userData;
    } catch (error) {
      console.error('❌ createUserFromStoredData error:', error);
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
      
      console.log('✅ Login successful');
      
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