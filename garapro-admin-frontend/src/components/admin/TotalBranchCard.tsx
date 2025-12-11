"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2 } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";
import { apiClient } from "@/services/api-client";

export default function TotalBranchCard() {
  const [totalBranches, setTotalBranches] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchBranches() {
      try {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiClient.get<any>("/Branch");

        setTotalBranches(res.data.totalCount || 0);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch total branches", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBranches();
    const interval = setInterval(fetchBranches, 15000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Garage Partners</CardTitle>
        <div className="p-2 rounded-full bg-purple-50">
          <Building2 className="h-4 w-4 text-purple-600" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? "Loading..." : totalBranches}
        </div>

        <p className="text-xs text-gray-400 mt-1">
          Last updated: {timeAgo(lastUpdated)}
        </p>

        <div className="mt-4">
          <Progress value={totalBranches * 10} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
