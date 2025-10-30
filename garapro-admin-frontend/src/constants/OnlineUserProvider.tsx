"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

interface OnlineUserContextType {
  userCount: number;
  change: number;
  connected: boolean;
  lastUpdated: Date | null;
}

const OnlineUserContext = createContext<OnlineUserContextType>({
  userCount: 0,
  change: 0,
  connected: false,
  lastUpdated: null,
});

export const OnlineUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userCount, setUserCount] = useState(0);
  const [change, setChange] = useState(0);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5117/api/onlineuserhub")
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("UserCountUpdated", (newCount: number) => {
      setUserCount((oldCount) => {
        const diff = newCount - oldCount;
        setChange(diff);
        return newCount;
      });
      setLastUpdated(new Date());
    });

    connection
      .start()
      .then(async () => {
        setConnected(true);
        const count = await connection.invoke("GetOnlineUserCount");
        setUserCount(count);
        setChange(0);
        setLastUpdated(new Date());
      })
      .catch((err) => console.error("SignalR connection error:", err));

    connection.onclose(() => setConnected(false));
    connection.onreconnected(() => setConnected(true));

    return () => {
      connection
        .stop()
        .catch((err) => console.error("Error stopping connection:", err));
    };
  }, []);

  return (
    <OnlineUserContext.Provider
      value={{ userCount, change, connected, lastUpdated }}
    >
      {children}
    </OnlineUserContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(OnlineUserContext);
