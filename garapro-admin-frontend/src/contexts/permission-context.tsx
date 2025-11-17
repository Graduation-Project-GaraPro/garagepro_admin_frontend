'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/authService';

type PermissionContextType = {
  permissions: Set<string>;
  loaded: boolean;
  hasPermission: (...codes: string[]) => boolean;     // tất cả đều phải có
  hasAnyPermission: (...codes: string[]) => boolean;  // chỉ cần 1 cái
  reload: () => Promise<void>;
};

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api';
const HUB_BASE_URL = API_BASE_URL.replace(/\/api$/, ''); // https://localhost:7113

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

const fetchPermissions = useCallback(async () => {
  if (!isAuthenticated) {
    setPermissions(new Set());
    setLoaded(true);
    return;
  }

  try {
    const token = authService.getToken();

    const res = await fetch(`${API_BASE_URL}/users/permissions`, {
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Get permissions failed', await res.text());
      setPermissions(new Set());
      return;
    }

    const data = await res.json();
    const codes: string[] = data.permissions ?? [];
    console.log('permission', new Set(codes));
    setPermissions(new Set(codes));
  } catch (err) {
    console.error('Error load permissions', err);
    setPermissions(new Set());
  } finally {
    // ✅ CHỈ setLoaded(true) ở đây
    setLoaded(true);
  }
}, [isAuthenticated]);

console.log('[Perm]', { loaded, permissions: Array.from(permissions) });
  // Cho handler SignalR dùng
  const reload = useCallback(async () => {
    setLoaded(false);
    await fetchPermissions();
  }, [fetchPermissions]);

  // Kết nối SignalR khi user login
  useEffect(() => {
  if (!isAuthenticated || !user) {
    // 🔹 Khi chưa login: coi như đã "load xong" nhưng không có quyền nào
    setPermissions(new Set());
    setLoaded(true);

    if (connectionRef.current) {
      connectionRef.current.stop();
      connectionRef.current = null;
    }
    return;
  }

  let cancelled = false;

  // 🔹 VỪA login / đổi user → CHẮC CHẮN đang load quyền
  setLoaded(false);

  const connect = async () => {
    try {
      if (connectionRef.current) {
        // đã có connection, chỉ cần reload quyền
        await fetchPermissions();
        return;
      }

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${HUB_BASE_URL}/hubs/permissions`, {
          withCredentials: true,
          accessTokenFactory: () => authService.getToken() ?? '',
        })
        .withAutomaticReconnect()
        .build();

      conn.on('RolePermissionsUpdated', async (payload) => {
        console.log('🔔 RolePermissionsUpdated', payload);
        await reload();
      });

      await conn.start();
      console.log('✅ Permission hub connected');

      if (user.roles && user.roles.length > 0) {
        await conn.invoke('JoinRoleGroups', user.roles);
      }

      connectionRef.current = conn;

      if (!cancelled) {
        await fetchPermissions();
      }
    } catch (err) {
      console.error('❌ Connect permission hub error', err);
      if (!cancelled) {
        await fetchPermissions();
      }
    }
  };

  connect();

  return () => {
    cancelled = true;
    if (connectionRef.current) {
      connectionRef.current.stop();
      connectionRef.current = null;
    }
  };
}, [isAuthenticated, user, fetchPermissions, reload]);

  const hasPermission = (...codes: string[]) => {
    if (!codes.length) return true;
    return codes.every((c) => permissions.has(c));
  };

  const hasAnyPermission = (...codes: string[]) => {
    if (!codes.length) return true;
    return codes.some((c) => permissions.has(c));
  };

  const value: PermissionContextType = {
    permissions,
    loaded,
    hasPermission,
    hasAnyPermission,
    reload,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error('usePermissionContext must be used within PermissionProvider');
  }
  return ctx;
};
