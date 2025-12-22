'use client'

import { Toaster } from "sonner";
import { OnlineUserProvider } from "@/constants/OnlineUserProvider";
import { RepairOrderHubProvider } from "@/constants/RepairOrderHubProvider";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PermissionProvider>
        <OnlineUserProvider>
          <RepairOrderHubProvider>{children}</RepairOrderHubProvider>
        </OnlineUserProvider>
        <Toaster />
      </PermissionProvider>
    </AuthProvider>
  );
}
