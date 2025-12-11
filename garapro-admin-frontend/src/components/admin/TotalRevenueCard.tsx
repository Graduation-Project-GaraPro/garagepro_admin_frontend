"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign } from "lucide-react";

import { timeAgo } from "@/utils/timeAgo";
import revenueService, { RevenueFilters } from "@/services/revenue-service";

export default function TotalRevenueCard() {
  const [amount, setAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [change, setChange] = useState(0); // nếu muốn tính % tăng giảm
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const filters: RevenueFilters = {
          period: "monthly",
          startDate: "",
          endDate: "",
          branchId: "",
          serviceType: "",
        }; // Nếu có filters thì bạn bổ sung vào đây
        const data = await revenueService.getRevenueReport(filters);

        setAmount(data?.totalRevenue ?? 0);

        // Nếu backend có trả về growth thì handle thêm ở đây
        setChange(data?.growthRate ?? 0);

        setLastUpdated(Date.now());
      } catch (err) {
        console.error("Failed to load revenue", err);
        setConnected(false);
      }
    }

    loadRevenue();
  }, []);

  const changeType =
    change > 0 ? "positive" : change < 0 ? "negative" : "neutral";

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <div className="flex items-center space-x-2">
          {connected && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <div className="p-2 rounded-full bg-green-50">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{amount.toLocaleString()} ₫</div>

        <div className="flex items-center space-x-2 mt-2">
          <span
            className={`text-sm font-medium ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
          <span className="text-sm text-gray-500">vs last update</span>
        </div>

        <div className="mt-4">
          <Progress
            value={Math.min((amount / 10000000) * 100, 100)}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
