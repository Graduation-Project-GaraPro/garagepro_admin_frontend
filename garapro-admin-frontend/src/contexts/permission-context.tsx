"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/authService";

/* ================= TYPES ================= */

type PermissionContextType = {
  permissions: Set<string>;
  loaded: boolean;
  hasPermission: (...codes: string[]) => boolean;
  hasAnyPermission: (...codes: string[]) => boolean;
  reload: () => Promise<void>;
};

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

/* ================= ENV ================= */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const HUB_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

/* ================= PROVIDER ================= */

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isAuthenticated } = useAuth();

  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const connectionRef = useRef<any>(null);

  /* ================= FETCH PERMISSIONS ================= */

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions(new Set());
      setLoaded(true);
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
        console.error("[Permission] fetch failed:", await res.text());
        setPermissions(new Set());
        return;
      }

      const data = await res.json();
      const codes: string[] = data?.permissions ?? [];
      setPermissions(new Set(codes));
    } catch (err) {
      console.error("[Permission] fetch error:", err);
      setPermissions(new Set());
    } finally {
      setLoaded(true);
    }
  }, [isAuthenticated]);

  /* ================= SIGNALR CONNECT ================= */

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPermissions(new Set());
      setLoaded(true);

      if (connectionRef.current) {
        connectionRef.current.stop?.();
        connectionRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const connect = async () => {
      try {
        // ✅ QUAN TRỌNG: dynamic import (SSR safe)
        const signalR = await import("@microsoft/signalr");

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
          await fetchPermissions();
        });

        await conn.start();
        connectionRef.current = conn;

        if (!cancelled) {
          await fetchPermissions();
        }
      } catch (err) {
        console.error("[Permission] SignalR error:", err);
        if (!cancelled) {
          await fetchPermissions();
        }
      }
    };

    setLoaded(false);
    connect();

    return () => {
      cancelled = true;
      if (connectionRef.current) {
        connectionRef.current.stop?.();
        connectionRef.current = null;
      }
    };
  }, [isAuthenticated, user, fetchPermissions]);

  /* ================= HELPERS ================= */

  const reload = useCallback(async () => {
    setLoaded(false);
    await fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = (...codes: string[]) => {
    if (!codes.length) return true;
    return codes.every((c) => permissions.has(c));
  };

  const hasAnyPermission = (...codes: string[]) => {
    if (!codes.length) return true;
    return codes.some((c) => permissions.has(c));
  };

  /* ================= CONTEXT VALUE ================= */

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

/* ================= HOOK ================= */

export const usePermissionContext = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error(
      "usePermissionContext must be used within PermissionProvider"
    );
  }
  return ctx;
};
