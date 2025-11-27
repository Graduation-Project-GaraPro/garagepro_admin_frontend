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

interface GeographicData {
  country: string;
  users: number;
  revenue: number;
  growth: number;
}

const mockRealTimeMetrics: RealTimeMetric[] = [
  {
    id: "1",
    title: "Active Users",
    value: "1,247",
    change: "+12",
    changeType: "positive",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    trend: [1200, 1210, 1220, 1230, 1240, 1247],
    isLive: true,
  },
  {
    id: "2",
    title: "Live Orders",
    value: "89",
    change: "+5",
    changeType: "positive",
    icon: ShoppingCart,
    color: "text-green-600",
    bgColor: "bg-green-50",
    trend: [80, 82, 85, 87, 88, 89],
    isLive: true,
  },
  {
    id: "3",
    title: "Revenue (Last Hour)",
    value: "$12,847",
    change: "+$1,234",
    changeType: "positive",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    trend: [10000, 10500, 11000, 11500, 12000, 12847],
    isLive: true,
  },
  {
    id: "4",
    title: "System Load",
    value: "78%",
    change: "+3%",
    changeType: "neutral",
    icon: Activity,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    trend: [70, 72, 75, 77, 78, 78],
    isLive: true,
  },
];

const liveActivities: LiveActivity[] = [
  {
    id: "1",
    timestamp: "2 seconds ago",
    user: "john.doe@email.com",
    action: "Completed order",
    location: "New York, US",
    value: "$245.00",
    status: "success",
  },
  {
    id: "2",
    timestamp: "5 seconds ago",
    user: "AutoCare Pro",
    action: "New service added",
    location: "Los Angeles, US",
    value: "Brake Service",
    status: "success",
  },
  {
    id: "3",
    timestamp: "8 seconds ago",
    user: "quickfix.garage",
    action: "Payment received",
    location: "Chicago, US",
    value: "$189.50",
    status: "success",
  },
  {
    id: "4",
    timestamp: "12 seconds ago",
    user: "premium.auto",
    action: "Order cancelled",
    location: "Houston, US",
    value: "$156.00",
    status: "error",
  },
  {
    id: "5",
    timestamp: "15 seconds ago",
    user: "express.service",
    action: "New user registered",
    location: "Phoenix, US",
    value: "New Account",
    status: "pending",
  },
];

const geographicData: GeographicData[] = [
  { country: "United States", users: 847, revenue: 125000, growth: 15 },
  { country: "Canada", users: 234, revenue: 45000, growth: 12 },
  { country: "United Kingdom", users: 156, revenue: 32000, growth: 8 },
  { country: "Germany", users: 98, revenue: 21000, growth: 18 },
  { country: "Australia", users: 87, revenue: 18000, growth: 22 },
];

const topPages = [
  { page: "/dashboard", views: 1247, change: "+12%", trend: "up" },
  { page: "/services", views: 892, change: "+8%", trend: "up" },
  { page: "/garages", views: 654, change: "+15%", trend: "up" },
  { page: "/profile", views: 432, change: "-3%", trend: "down" },
  { page: "/settings", views: 298, change: "+5%", trend: "up" },
];

export function RealTimeAnalytics() {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

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
        <ActiveUsersCard />
        <LiveOrdersCard />
        {/* {mockRealTimeMetrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 
                  metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500">in last 5 min</span>
              </div>
              <div className="mt-4">
                <Progress value={metric.trend[metric.trend.length - 1] / 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))} */}
      </div>

      {/* Live Activity Feed */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Activity Feed</span>
            </CardTitle>
            <CardDescription>
              Real-time user activities and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {liveActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <span className="text-xs text-gray-400">
                        {activity.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-600">{activity.user}</p>
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
              ))}
            </div>
          </CardContent>
        </Card> */}
        <LiveActivityFeed />
      </div>
    </div>
  );
}
