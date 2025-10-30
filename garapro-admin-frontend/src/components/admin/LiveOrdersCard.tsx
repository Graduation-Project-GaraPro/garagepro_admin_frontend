"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart } from "lucide-react";
import {
  repairOrderHubService,
  RoBoardCardDto,
} from "@/services/manager/repair-order-hub";

export default function LiveOrdersCard() {
  const [metric, setMetric] = useState({
    id: "live-orders",
    title: "Live Orders",
    value: 0,
    change: "+0",
    changeType: "neutral" as "positive" | "negative" | "neutral",
    icon: ShoppingCart,
    color: "text-green-600",
    bgColor: "bg-green-50",
    trend: [] as number[],
    isLive: true,
  });

  useEffect(() => {
    let initialized = false;

    const initHub = async () => {
      if (initialized) return;
      initialized = true;

      // Khi có đơn hàng mới
      repairOrderHubService.onRepairOrderCreated((order: RoBoardCardDto) => {
        console.log("🆕 New repair order:", order);

        setMetric((prev) => {
          const newValue = prev.value + 1;
          return {
            ...prev,
            value: newValue,
            change: "+1",
            changeType: "positive",
            trend: [...prev.trend.slice(-9), newValue],
          };
        });
      });
    };

    initHub();

    return () => {};
  }, []);

  return (
    <Card className="w-full relative overflow-hidden rounded-2xl shadow-sm border bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <div className="flex items-center space-x-2">
          {metric.isLive && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <div className={`p-2 rounded-full ${metric.bgColor}`}>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-3xl font-bold">{metric.value}</div>

        <div className="flex items-center space-x-2 mt-2">
          <span
            className={`text-sm font-medium ${
              metric.changeType === "positive"
                ? "text-green-600"
                : metric.changeType === "negative"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {metric.change}
          </span>
          <span className="text-sm text-gray-500">in last 5 min</span>
        </div>

        <div className="mt-4">
          <Progress
            value={metric.trend[metric.trend.length - 1]}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
