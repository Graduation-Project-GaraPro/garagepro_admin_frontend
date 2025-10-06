"use client";

import { useState, useEffect } from "react";
import {
  Car,
  Wrench,
  CheckCircle,
  Calendar,
  Star,
  FileText,
  ChevronRight,
  PlusCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// ====== TYPE DEFINITIONS ======
interface RepairRequest {
  id: number;
  vehicle: string;
  issue: string;
  status: "pending" | "in-progress" | "completed";
  date: string;
  priority: "high" | "medium" | "low";
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  service: string;
  vehicle: string;
}

interface Quotation {
  id: number;
  vehicle: string;
  issue: string;
  status: "pending" | "confirmed" | "rejected";
  date: string;
  totalCost: number;
}

export default function Dashboard() {
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    vehicle: "",
    licensePlate: "",
    issue: "",
    priority: "medium",
  });

  useEffect(() => {
    try {
      // Simulate API call with updated dates (2025)
      setRepairRequests([
        {
          id: 1,
          vehicle: "Honda Civic 2020",
          issue: "Động cơ kêu lạ",
          status: "pending",
          date: "2025-09-10",
          priority: "high",
        },
        {
          id: 2,
          vehicle: "Toyota Camry 2019",
          issue: "Thay dầu máy",
          status: "in-progress",
          date: "2025-09-08",
          priority: "medium",
        },
        {
          id: 3,
          vehicle: "BMW X5 2021",
          issue: "Kiểm tra phanh",
          status: "completed",
          date: "2025-09-05",
          priority: "low",
        },
      ]);

      setAppointments([
        {
          id: 1,
          date: "2025-09-12",
          time: "09:00",
          service: "Bảo dưỡng định kỳ",
          vehicle: "Honda Civic 2020",
        },
        {
          id: 2,
          date: "2025-09-15",
          time: "14:30",
          service: "Sửa chữa động cơ",
          vehicle: "Toyota Camry 2019",
        },
      ]);

      setQuotations([
        {
          id: 1,
          vehicle: "Honda Civic 2020",
          issue: "Động cơ kêu lạ",
          status: "pending",
          date: "2025-09-10",
          totalCost: 2000000,
        },
        {
          id: 2,
          vehicle: "Toyota Camry 2019",
          issue: "Thay dầu máy",
          status: "confirmed",
          date: "2025-09-08",
          totalCost: 1000000,
        },
      ]);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    }
  }, []);

  // ====== DYNAMIC METRICS ======
  const pendingRequests = repairRequests.filter(
    (r) => r.status === "pending"
  ).length;

  const completedThisMonth = repairRequests.filter((r) => {
    const requestDate = new Date(r.date);
    const now = new Date();
    return (
      r.status === "completed" &&
      requestDate.getMonth() === now.getMonth() &&
      requestDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.date) >= new Date()
  ).length;

  const pendingQuotations = quotations.filter(
    (q) => q.status === "pending"
  ).length;

  const averageRating = 4.8; // Placeholder

  if (error) {
    return <div className="text-red-600 text-center p-6">{error}</div>;
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Thêm yêu cầu mới vào danh sách
    const newRequest: RepairRequest = {
      id: repairRequests.length + 1,
      vehicle: formData.vehicle,
      issue: formData.issue,
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      priority: formData.priority as "high" | "medium" | "low",
    };
    
    setRepairRequests([newRequest, ...repairRequests]);
    setShowForm(false);
    setFormData({
      vehicle: "",
      licensePlate: "",
      issue: "",
      priority: "medium",
    });
  };

  return (
    <div className="space-y-6">
      {/* ====== HEADER ====== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Quản lý yêu cầu và lịch hẹn của bạn</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="default"
          className="flex items-center gap-2"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" />
              <span>Đóng biểu mẫu</span>
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              <span>Tạo yêu cầu mới</span>
            </>
          )}
        </Button>
      </div>

      {/* ====== REQUEST FORM ====== */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-blue-600" />
              Tạo yêu cầu sửa chữa mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Thông tin xe
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle}
                    onChange={(e) => handleInputChange("vehicle", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Honda Civic 2020"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Biển số xe
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => handleInputChange("licensePlate", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 30A-12345"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vấn đề gặp phải
                </label>
                <textarea
                  value={formData.issue}
                  onChange={(e) => handleInputChange("issue", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mức độ ưu tiên
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Gửi yêu cầu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* ====== METRICS CARDS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/customer/repairs/progress" className="block w-full">
          <Card className="bg-blue-50 border-blue-100 hover:border-blue-300 transition-all h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Yêu cầu đang xử lý</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{pendingRequests}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/repairs/history" className="block w-full">
          <Card className="bg-green-50 border-green-100 hover:border-green-300 transition-all h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Hoàn thành tháng này</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{completedThisMonth}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/services/appointments" className="block w-full">
          <Card className="bg-orange-50 border-orange-100 hover:border-orange-300 transition-all h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Lịch hẹn sắp tới</p>
                  <p className="text-3xl font-bold text-orange-700 mt-1">{upcomingAppointments}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/reviews" className="block w-full">
          <Card className="bg-purple-50 border-purple-100 hover:border-purple-300 transition-all h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Đánh giá trung bình</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">{averageRating}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/notifications" className="block w-full">
          <Card className="bg-yellow-50 border-yellow-100 hover:border-yellow-300 transition-all h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Báo giá đang chờ</p>
                  <p className="text-3xl font-bold text-yellow-700 mt-1">{pendingQuotations}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ====== RECENT REQUESTS + UPCOMING APPOINTMENTS ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {repairRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wrench className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">Không có yêu cầu nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {repairRequests.slice(0, 3).map((request) => (
                  <Link
                    href={`/customer/repairs/progress?requestId=${request.id}`}
                    key={request.id}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <Car className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{request.vehicle}</p>
                          <p className="text-sm text-gray-500">{request.issue}</p>
                        </div>
                      </div>
                      <Badge
                        variant={request.status === "completed" ? "success" : 
                               request.status === "in-progress" ? "default" : "outline"}
                      >
                        {request.status === "completed"
                          ? "Hoàn thành"
                          : request.status === "in-progress"
                          ? "Đang xử lý"
                          : "Chờ xử lý"}
                      </Badge>
                    </div>
                  </Link>
                ))}
                <div className="flex justify-end mt-2">
                  <Button variant="link" asChild className="flex items-center gap-1 text-blue-600">
                    <Link href="/customer/repairs">
                      Xem tất cả <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch hẹn sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">Không có lịch hẹn nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <Link
                    href={`/customer/services/appointments?appointmentId=${appointment.id}`}
                    key={appointment.id}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.service}</p>
                          <p className="text-sm text-gray-500">
                            {appointment.date} - {appointment.time}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </Link>
                ))}
                <div className="flex justify-end mt-2">
                  <Button variant="link" asChild className="flex items-center gap-1 text-blue-600">
                    <Link href="/customer/services/appointments">
                      Xem tất cả <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
