import React, { useState } from "react";
import {
  Calendar,
  Car,
  Users,
  Wrench,
  DollarSign,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  customerId: string;
}

interface RepairJob {
  id: string;
  vehicleId: string;
  customerId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  estimatedCost: number;
  actualCost?: number;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  assignedTechnician: string;
}

interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  date: string;
  time: string;
  service: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

// Sample data
const sampleCustomers: Customer[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    phone: "0123456789",
    email: "nguyenvana@email.com",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  },
  {
    id: "2",
    name: "Trần Thị B",
    phone: "0987654321",
    email: "tranthib@email.com",
    address: "456 Đường XYZ, Quận 2, TP.HCM",
  },
];

const sampleVehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "51A-12345",
    brand: "Toyota",
    model: "Camry",
    year: 2020,
    customerId: "1",
  },
  {
    id: "2",
    licensePlate: "51B-67890",
    brand: "Honda",
    model: "Civic",
    year: 2019,
    customerId: "2",
  },
];

const sampleRepairJobs: RepairJob[] = [
  {
    id: "1",
    vehicleId: "1",
    customerId: "1",
    title: "Thay dầu động cơ",
    description: "Thay dầu động cơ và lọc dầu",
    status: "completed",
    priority: "medium",
    estimatedCost: 500000,
    actualCost: 480000,
    startDate: "2024-12-01",
    estimatedEndDate: "2024-12-01",
    actualEndDate: "2024-12-01",
    assignedTechnician: "Nguyễn Văn Thành",
  },
  {
    id: "2",
    vehicleId: "2",
    customerId: "2",
    title: "Sửa phanh",
    description: "Thay má phanh và đĩa phanh",
    status: "in-progress",
    priority: "high",
    estimatedCost: 1200000,
    startDate: "2024-12-15",
    estimatedEndDate: "2024-12-16",
    assignedTechnician: "Trần Văn Hùng",
  },
];

const sampleAppointments: Appointment[] = [
  {
    id: "1",
    customerId: "1",
    vehicleId: "1",
    date: "2024-12-20",
    time: "09:00",
    service: "Bảo dưỡng định kỳ",
    status: "scheduled",
    notes: "Khách hàng yêu cầu kiểm tra hệ thống điện",
  },
  {
    id: "2",
    customerId: "2",
    vehicleId: "2",
    date: "2024-12-21",
    time: "14:00",
    service: "Kiểm tra động cơ",
    status: "confirmed",
  },
];

export default function CarRepairManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [customers] = useState<Customer[]>(sampleCustomers);
  const [vehicles] = useState<Vehicle[]>(sampleVehicles);
  const [repairJobs] = useState<RepairJob[]>(sampleRepairJobs);
  const [appointments] = useState<Appointment[]>(sampleAppointments);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "scheduled":
        return "bg-gray-100 text-gray-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng Khách Hàng
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {customers.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Công Việc Đang Thực Hiện
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  repairJobs.filter((job) => job.status === "in-progress")
                    .length
                }
              </p>
            </div>
            <Wrench className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Lịch Hẹn Hôm Nay
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  appointments.filter(
                    (apt) => apt.date === new Date().toISOString().split("T")[0]
                  ).length
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Doanh Thu Tháng
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(
                  repairJobs.reduce(
                    (sum, job) => sum + (job.actualCost || 0),
                    0
                  )
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Công Việc Gần Đây
          </h3>
          <div className="space-y-4">
            {repairJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-gray-600">
                      {job.assignedTechnician}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    job.status
                  )}`}
                >
                  {job.status === "completed"
                    ? "Hoàn thành"
                    : job.status === "in-progress"
                    ? "Đang thực hiện"
                    : job.status === "pending"
                    ? "Chờ xử lý"
                    : "Đã hủy"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch Hẹn Sắp Tới
          </h3>
          <div className="space-y-4">
            {appointments.slice(0, 5).map((appointment) => {
              const customer = customers.find(
                (c) => c.id === appointment.customerId
              );
              const vehicle = vehicles.find(
                (v) => v.id === appointment.vehicleId
              );
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{customer?.name}</p>
                      <p className="text-sm text-gray-600">
                        {vehicle?.licensePlate} - {appointment.service}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.date} {appointment.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status === "scheduled"
                      ? "Đã lên lịch"
                      : appointment.status === "confirmed"
                      ? "Đã xác nhận"
                      : appointment.status === "completed"
                      ? "Hoàn thành"
                      : "Đã hủy"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm Khách Hàng</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách Hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên Hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa Chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-start space-x-2">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{customer.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRepairJobs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Quản Lý Công Việc Sửa Chữa
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Tạo Công Việc Mới</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="grid gap-6">
            {repairJobs.map((job) => {
              const customer = customers.find((c) => c.id === job.customerId);
              const vehicle = vehicles.find((v) => v.id === job.vehicleId);
              return (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{job.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{customer?.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Car className="h-4 w-4" />
                          <span>
                            {vehicle?.licensePlate} - {vehicle?.brand}{" "}
                            {vehicle?.model}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Wrench className="h-4 w-4" />
                          <span>{job.assignedTechnician}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          job.priority
                        )}`}
                      >
                        {job.priority === "high"
                          ? "Cao"
                          : job.priority === "medium"
                          ? "Trung bình"
                          : "Thấp"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status === "completed"
                          ? "Hoàn thành"
                          : job.status === "in-progress"
                          ? "Đang thực hiện"
                          : job.status === "pending"
                          ? "Chờ xử lý"
                          : "Đã hủy"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-500">Chi phí ước tính</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(job.estimatedCost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                      <p className="font-semibold text-gray-900">
                        {job.startDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Ngày dự kiến hoàn thành
                      </p>
                      <p className="font-semibold text-gray-900">
                        {job.estimatedEndDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm">
                      Xem chi tiết
                    </button>
                    <button className="text-green-600 hover:text-green-900 px-3 py-1 text-sm">
                      Cập nhật
                    </button>
                    {job.status !== "completed" && (
                      <button className="text-red-600 hover:text-red-900 px-3 py-1 text-sm">
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Lịch Hẹn</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Tạo Lịch Hẹn</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách Hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch Vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời Gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const customer = customers.find(
                    (c) => c.id === appointment.customerId
                  );
                  const vehicle = vehicles.find(
                    (v) => v.id === appointment.vehicleId
                  );
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {customer?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicle?.licensePlate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle?.brand} {vehicle?.model}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {appointment.service}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-500">
                            {appointment.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status === "scheduled"
                            ? "Đã lên lịch"
                            : appointment.status === "confirmed"
                            ? "Đã xác nhận"
                            : appointment.status === "completed"
                            ? "Hoàn thành"
                            : "Đã hủy"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-900">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Quản Lý Phương Tiện
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm Phương Tiện</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid gap-6">
            {vehicles.map((vehicle) => {
              const customer = customers.find(
                (c) => c.id === vehicle.customerId
              );
              const jobsCount = repairJobs.filter(
                (job) => job.vehicleId === vehicle.id
              ).length;
              return (
                <div
                  key={vehicle.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.licensePlate}
                        </h3>
                        <p className="text-gray-600">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </p>
                        <p className="text-sm text-gray-500">
                          Chủ xe: {customer?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Số lần sửa chữa</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {jobsCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm">
                      Xem lịch sử
                    </button>
                    <button className="text-green-600 hover:text-green-900 px-3 py-1 text-sm">
                      Sửa thông tin
                    </button>
                    <button className="text-red-600 hover:text-red-900 px-3 py-1 text-sm">
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Quản Lý Kho Phụ Tung
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm Phụ Tung</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: "Dầu động cơ",
            category: "Dầu nhờn",
            stock: 25,
            minStock: 10,
            price: 150000,
          },
          {
            name: "Má phanh",
            category: "Hệ thống phanh",
            stock: 8,
            minStock: 15,
            price: 300000,
          },
          {
            name: "Lọc gió",
            category: "Bộ lọc",
            stock: 30,
            minStock: 20,
            price: 80000,
          },
          {
            name: "Bóng đèn",
            category: "Điện",
            stock: 50,
            minStock: 25,
            price: 25000,
          },
          {
            name: "Dây curoa",
            category: "Động cơ",
            stock: 5,
            minStock: 10,
            price: 250000,
          },
          {
            name: "Bugi",
            category: "Đánh lửa",
            stock: 20,
            minStock: 15,
            price: 45000,
          },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">{item.category}</p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.stock < item.minStock
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {item.stock < item.minStock ? "Thiếu hàng" : "Đủ hàng"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tồn kho:</span>
                <span className="font-medium">{item.stock} cái</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Tồn kho tối thiểu:
                </span>
                <span className="font-medium">{item.minStock} cái</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Giá:</span>
                <span className="font-medium">
                  {formatCurrency(item.price)}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                Nhập kho
              </button>
              <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
                Xuất kho
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Báo Cáo Thống Kê</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Doanh Thu Theo Tháng
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Biểu đồ doanh thu sẽ được hiển thị ở đây
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Công Việc Theo Trạng Thái
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Hoàn thành</span>
              <span className="font-semibold">
                {repairJobs.filter((job) => job.status === "completed").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Đang thực hiện</span>
              <span className="font-semibold">
                {
                  repairJobs.filter((job) => job.status === "in-progress")
                    .length
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Chờ xử lý</span>
              <span className="font-semibold">
                {repairJobs.filter((job) => job.status === "pending").length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Khách Hàng
          </h3>
          <div className="space-y-3">
            {customers.slice(0, 5).map((customer, index) => {
              const customerJobs = repairJobs.filter(
                (job) => job.customerId === customer.id
              );
              const totalSpent = customerJobs.reduce(
                (sum, job) => sum + (job.actualCost || 0),
                0
              );
              return (
                <div
                  key={customer.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {customerJobs.length} lần sửa chữa
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(totalSpent)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hiệu Suất Kỹ Thuật Viên
          </h3>
          <div className="space-y-3">
            {["Nguyễn Văn Thành", "Trần Văn Hùng", "Lê Minh Tuấn"].map(
              (technician, index) => {
                const technicianJobs = repairJobs.filter(
                  (job) => job.assignedTechnician === technician
                );
                const completedJobs = technicianJobs.filter(
                  (job) => job.status === "completed"
                );
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{technician}</p>
                      <p className="text-sm text-gray-600">
                        {completedJobs.length}/{technicianJobs.length} hoàn
                        thành
                      </p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            technicianJobs.length > 0
                              ? (completedJobs.length / technicianJobs.length) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Cài Đặt Hệ Thống</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông Tin Cửa Hàng
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên cửa hàng
              </label>
              <input
                type="text"
                value="AutoCare Service Center"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                value="123 Đường Lê Lợi, Quận 1, TP.HCM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value="(028) 3822-1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value="info@autocare.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cài Đặt Thông Báo
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thông báo email</p>
                <p className="text-sm text-gray-600">
                  Nhận thông báo qua email
                </p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nhắc nhở lịch hẹn</p>
                <p className="text-sm text-gray-600">
                  Gửi nhắc nhở trước 1 giờ
                </p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cảnh báo tồn kho</p>
                <p className="text-sm text-gray-600">
                  Thông báo khi phụ tùng sắp hết
                </p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quản Lý Người Dùng
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Admin</p>
                  <p className="text-sm text-gray-600">Quản trị viên</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-900 text-sm">
                Sửa
              </button>
            </div>
            <button className="w-full py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
              + Thêm người dùng mới
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sao Lưu & Khôi Phục
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              Sao lưu dữ liệu
            </button>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Khôi phục dữ liệu
            </button>
            <p className="text-sm text-gray-600">
              Lần sao lưu cuối: 28/12/2024 - 15:30
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "customers":
        return renderCustomers();
      case "vehicles":
        return renderVehicles();
      case "repair-jobs":
        return renderRepairJobs();
      case "appointments":
        return renderAppointments();
      case "inventory":
        return renderInventory();
      case "reports":
        return renderReports();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  AutoCare Manager
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "customers"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Khách Hàng</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("vehicles")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "vehicles"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Car className="h-5 w-5" />
                  <span>Phương Tiện</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("repair-jobs")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "repair-jobs"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Wrench className="h-5 w-5" />
                  <span>Công Việc Sửa Chữa</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "appointments"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Lịch Hẹn</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "inventory"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Kho Phụ Tung</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "reports"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Báo Cáo</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === "settings"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Cài Đặt</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
