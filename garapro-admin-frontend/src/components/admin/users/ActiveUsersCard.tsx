"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

import { timeAgo } from "@/utils/timeAgo";
import { useOnlineUsers } from "@/constants/OnlineUserProvider";

export default function ActiveUsersCard() {
  const { userCount, change, connected, lastUpdated } = useOnlineUsers();

  const changeType =
    change > 0 ? "positive" : change < 0 ? "negative" : "neutral";

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        <div className="flex items-center space-x-2">
          {connected && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <div className="p-2 rounded-full bg-blue-50">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{userCount}</div>

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
            {change > 0 ? `+${change}` : change}
          </span>
          <span className="text-sm text-gray-500">since last update</span>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          Last updated: {timeAgo(lastUpdated)}
        </p>

        <div className="mt-4">
          <Progress value={userCount * 10} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
