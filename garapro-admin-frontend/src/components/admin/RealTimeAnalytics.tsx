/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  Globe,
  MapPin,
  Calendar,
  Eye,
  Zap,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Play,
  Pause,
  Settings,
} from "lucide-react";
import ActiveUsersCard from "./users/ActiveUsersCard";
import LiveOrdersCard from "./LiveOrdersCard";
import LiveActivityFeed from "./LiveActivityFeed";
import { RepairOrderHubProvider } from "@/constants/RepairOrderHubProvider";
import { AdvancedStatistics } from "./AdvancedStatistics";
import TotalRevenueCard from "./TotalRevenueCard";
import TotalBranchCard from "./TotalBranchCard";

interface RealTimeMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: any;
  color: string;
  bgColor: string;
  trend: number[];
  isLive: boolean;
}

interface LiveActivity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  location: string;
  value: string;
  status: "success" | "pending" | "error";
}

export function RealTimeAnalytics() {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Real-Time Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Live monitoring and real-time performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            <span className="text-sm font-medium">
              {isLive ? "Live" : "Paused"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isLive ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Current Time */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold">Current Time</span>
            </div>
            <div className="text-2xl font-mono font-bold text-gray-900">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalRevenueCard />
        <ActiveUsersCard />
        <TotalBranchCard />
        <LiveOrdersCard />
      </div>

      {/* Live Activity Feed */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivityFeed />
      </div>
    </div>
  );
}
