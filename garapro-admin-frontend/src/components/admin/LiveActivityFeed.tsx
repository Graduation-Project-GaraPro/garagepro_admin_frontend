/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRepairOrderHub } from "@/constants/RepairOrderHubProvider";
import { repairOrderHubService } from "@/services/manager/repair-order-hub";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MapPin, Wrench } from "lucide-react";
import { apiClient } from "@/services/api-client";


const API_URL =
  "http://103.216.119.34:5000/api/RepairOrder?$top=5";

export default function LiveActivityFeed() {
  const { isConnected } = useRepairOrderHub();
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch latest repair orders
  const fetchLatestOrders = useCallback(async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/RepairOrder?$top=5`);

      if (!res.data) throw new Error("Failed to fetch repair orders");

      const data = res.data as any[] || [];

      const activities = data.map((order: any) => ({
        id: order.repairOrderId,
        action: order.note || "New Repair Order Created",
        timestamp: new Date(order.createdAt).toLocaleTimeString(),
        user:
          order.customerName ||
          `Customer ${order.customerPhone || "Unknown"}`,
        location: `Branch ID: ${order.branchId?.slice(0, 8)}...`,
        value: `Est. ₫${order.estimatedAmount?.toLocaleString()} • ${
          order.estimatedRepairTime
        }h`,
        status: "created",
      }));

      setLiveActivities(activities);
    } catch (error) {
      console.error("❌ Fetch repair orders failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    console.log("✅ Hub connected — listening for RepairOrderCreated");

    // SignalR chỉ dùng làm trigger
    const handler = () => {
      console.log("📡 RepairOrderCreated signal received → refetching...");
      fetchLatestOrders();
    };

    repairOrderHubService.onRepairOrderCreated(handler);

    // fetch lần đầu khi connect
    fetchLatestOrders();

    return () => {
      repairOrderHubService.offRepairOrderCreated(handler);
    };
  }, [isConnected, fetchLatestOrders]);

  const getStatusIcon = () => (
    <Wrench className="h-4 w-4 text-blue-500" />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Live Activity Feed</span>
        </CardTitle>
        <CardDescription>
          Real-time updates
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading && (
            <p className="text-xs text-gray-400 text-center">
              Updating...
            </p>
          )}

          {liveActivities.length === 0 && !loading ? (
            <p className="text-sm text-gray-500 text-center">
              No recent activity
            </p>
          ) : (
            liveActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                {getStatusIcon()}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {activity.action}
                    </p>
                    <span className="text-xs text-gray-400">
                      {activity.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">
                      {activity.user}
                    </p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {activity.location}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.value}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
