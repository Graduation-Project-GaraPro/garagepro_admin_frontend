"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/authService";

type PermissionContextType = {
  permissions: Set<string>;
  loaded: boolean; // = permissionsLoaded
  hasPermission: (...codes: string[]) => boolean;
  hasAnyPermission: (...codes: string[]) => boolean;
  reload: () => Promise<void>;
};

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7113/api";
const HUB_BASE_URL = API_BASE_URL.replace(/\/api$/, ""); // https://localhost:7113

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions(new Set());
      setPermissionsLoaded(true);
      return;
    }

    try {
      const token = authService.getToken();

      const res = await fetch(`${API_BASE_URL}/users/permissions`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Get permissions failed", await res.text());
        setPermissions(new Set());
        return;
      }

      const data = await res.json();
      const codes: string[] = data.permissions ?? [];
      console.log("permission", new Set(codes));
      setPermissions(new Set(codes));
    } catch (err) {
      console.error("Error load permissions", err);
      setPermissions(new Set());
    } finally {
      setPermissionsLoaded(true);
    }
  }, [isAuthenticated]);

  console.log("[Perm]", {
    loaded: permissionsLoaded,
    permissions: Array.from(permissions),
  });

  const reload = useCallback(async () => {
    // tuỳ bạn: có thể set false trước khi reload, hoặc không
    setPermissionsLoaded(false);
    await fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPermissions(new Set());
      setPermissionsLoaded(true);

      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setPermissionsLoaded(false); // bắt đầu load

    const connect = async () => {
      try {
        if (connectionRef.current) {
          await fetchPermissions();
          return;
        }

        const conn = new signalR.HubConnectionBuilder()
          .withUrl(`${HUB_BASE_URL}/hubs/permissions`, {
            withCredentials: true,
            accessTokenFactory: () => authService.getToken() ?? "",
          })
          .withAutomaticReconnect()
          .build();

        conn.on("PermissionsUpdated", async () => {
          console.log("PermissionsUpdated from hub");
          await fetchPermissions();
        });

        await conn.start();
        console.log("Permission hub connected");

        connectionRef.current = conn;

        if (!cancelled) {
          await fetchPermissions();
        }
      } catch (e) {
        console.error("SignalR connect error", e);
        if (!cancelled) await fetchPermissions();
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
  }, [isAuthenticated, user, fetchPermissions]);

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
    loaded: permissionsLoaded,
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
    throw new Error("usePermissionContext must be used within PermissionProvider");
  }
  return ctx;
};
