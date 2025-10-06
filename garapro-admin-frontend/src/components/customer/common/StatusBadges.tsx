"use client";

import { CheckCircle, Wrench, Calendar, AlertTriangle } from 'lucide-react';

interface RepairStatusBadgeProps {
  status: "completed" | "in-progress" | "pending" | "cancelled";
  className?: string;
}

export function RepairStatusBadge({ status, className = '' }: RepairStatusBadgeProps) {
  let color = "";
  let text = "";
  let icon = null;
  
  switch(status) {
    case "completed":
      color = "bg-green-100 text-green-800";
      text = "Hoàn thành";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "in-progress":
      color = "bg-blue-100 text-blue-800";
      text = "Đang xử lý";
      icon = <Wrench className="h-3 w-3 mr-1" />;
      break;
    case "pending":
      color = "bg-yellow-100 text-yellow-800";
      text = "Chờ xử lý";
      icon = <Calendar className="h-3 w-3 mr-1" />;
      break;
    case "cancelled":
      color = "bg-red-100 text-red-800";
      text = "Đã hủy";
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
      break;
    default:
      color = "bg-gray-100 text-gray-800";
      text = status;
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full flex items-center ${color} ${className}`}>
      {icon}
      {text}
    </span>
  );
}