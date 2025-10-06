"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Calendar,
  User,
  Phone,
  MapPin,
  Wrench,
  Clock,
  AlertTriangle,
  Download,
  MessageCircle,
} from "lucide-react";

// ==== Types ====
interface Part {
  name: string;
  quantity: number;
  price: number;
  status: "ordered" | "installed" | "pending";
}

interface TimelineItem {
  date: string;
  action: string;
  status: "completed" | "in-progress" | "pending";
}

interface Request {
  id: number | string;
  vehicle: string;
  licensePlate: string;
  issue: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "completed" | "in-progress" | "pending" | "cancelled";
  date: string;
  time: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  technician: string;
  estimatedCost: number;
  actualCost: number;
  estimatedTime: string;
  progress: number;
  images: string[];
  parts: Part[];
  timeline: TimelineItem[];
}

interface ChatMessage {
  id: number;
  from: "me" | "tech";
  text: string;
  time: string;
}

interface RepairDetailsProps {
  request: Request;
}

export function RepairDetails({ request }: RepairDetailsProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  // === Utility Functions ===
  const getStatusText = (status: Request["status"]) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in-progress":
        return "Đang xử lý";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getPriorityText = (priority: Request["priority"]) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now(),
      from: "me",
      text: chatInput,
      time: new Date().toLocaleTimeString(),
    };
    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/customer/repairs" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" /> Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết yêu cầu #{request.id}</h1>
      </div>

      {/* Thông tin chung */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
          <h2 className="text-lg font-semibold flex items-center">
            <Car className="mr-2 h-5 w-5 text-blue-600" /> Thông tin xe
          </h2>
          <p><strong>Xe:</strong> {request.vehicle}</p>
          <p><strong>Biển số:</strong> {request.licensePlate}</p>
          <p><strong>Sự cố:</strong> {request.issue}</p>
          <p><strong>Mô tả:</strong> {request.description}</p>
          <p><strong>Độ ưu tiên:</strong> {getPriorityText(request.priority)}</p>
          <p><strong>Trạng thái:</strong> {getStatusText(request.status)}</p>
          <p><strong>Tiến độ:</strong> {request.progress}%</p>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
          <h2 className="text-lg font-semibold flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-600" /> Thông tin khách hàng
          </h2>
          <p><strong>Tên:</strong> {request.customerName}</p>
          <p><strong>SĐT:</strong> {request.phone}</p>
          <p><strong>Email:</strong> {request.email}</p>
          <p><strong>Địa chỉ:</strong> {request.address}</p>
          <p><strong>Kỹ thuật viên:</strong> {request.technician}</p>
        </div>
      </div>

      {/* Hình ảnh */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Hình ảnh</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {request.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Ảnh ${i}`}
              className="rounded-lg shadow"
            />
          ))}
        </div>
      </div>

      {/* Phụ tùng */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Phụ tùng</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Tên</th>
              <th className="border px-2 py-1">Số lượng</th>
              <th className="border px-2 py-1">Giá</th>
              <th className="border px-2 py-1">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {request.parts.map((p, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1">{p.quantity}</td>
                <td className="border px-2 py-1">{p.price.toLocaleString()} đ</td>
                <td className="border px-2 py-1">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Tiến trình</h2>
        <ul className="space-y-3">
          {request.timeline.map((t, i) => (
            <li key={i} className="flex items-start space-x-3">
              <div className={`h-3 w-3 mt-1 rounded-full ${
                t.status === "completed"
                  ? "bg-green-500"
                  : t.status === "in-progress"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              }`} />
              <div>
                <p className="font-medium">{t.action}</p>
                <p className="text-sm text-gray-600">{t.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="inline mr-2" />
          {showChat ? "Ẩn chat" : "Mở chat với kỹ thuật viên"}
        </button>

        {showChat && (
          <div className="mt-4 border rounded-lg p-4 h-64 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg max-w-xs ${
                    msg.from === "me"
                      ? "bg-blue-100 self-end"
                      : "bg-gray-100 self-start"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-500">{msg.time}</p>
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 border rounded-l-lg px-2"
                placeholder="Nhập tin nhắn..."
              />
              <button
                className="bg-blue-600 text-white px-4 rounded-r-lg"
                onClick={sendMessage}
              >
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}