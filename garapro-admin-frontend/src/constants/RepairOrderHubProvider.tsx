"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { repairOrderHubService } from "@/services/manager/repair-order-hub";

interface HubContextType {
  isConnected: boolean;
}

const RepairOrderHubContext = createContext<HubContextType>({
  isConnected: false,
});

export const useRepairOrderHub = () => useContext(RepairOrderHubContext);

export function RepairOrderHubProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connect = async () => {
      try {
        await repairOrderHubService.initialize();
        setIsConnected(true);
      } catch (err) {
        console.error("❌ Failed to connect to hub:", err);
      }
    };
    connect();

    // chỉ disconnect khi browser đóng
    const handleUnload = () => repairOrderHubService.disconnect();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <RepairOrderHubContext.Provider value={{ isConnected }}>
      {children}
    </RepairOrderHubContext.Provider>
  );
}
