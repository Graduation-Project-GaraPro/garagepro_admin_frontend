"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Clock, AlertTriangle } from "lucide-react";

interface Repair {
  id: number | string;
  licensePlate: string;
  vehicle: string;
  issue: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  date: string;
  priority: "high" | "medium" | "low";
  progress: number;
}

interface RepairListProps {
  searchTerm: string;
  statusFilter: string;
}

export function RepairList({ searchTerm, statusFilter }: RepairListProps) {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập dữ liệu - trong thực tế sẽ gọi API
    const mockData: Repair[] = [
      {
        id: 1,
        licensePlate: "51F-123.45",
        vehicle: "Toyota Camry 2020",
        issue: "Thay dầu và bảo dưỡng định kỳ",
        status: "completed",
        date: "15/05/2023",
        priority: "medium",
        progress: 100,
      },
      {
        id: 2,
        licensePlate: "59A-678.90",
        vehicle: "Honda Civic 2019",
        issue: "Kiểm tra hệ thống phanh",
        status: "in-progress",
        date: "20/05/2023",
        priority: "high",
        progress: 60,
      },
      {
        id: 3,
        licensePlate: "51G-246.80",
        vehicle: "Ford Ranger 2021",
        issue: "Thay thế bộ ly hợp",
        status: "pending",
        date: "25/05/2023",
        priority: "medium",
        progress: 0,
      },
      {
        id: 4,
        licensePlate: "50D-357.91",
        vehicle: "Mazda CX-5 2022",
        issue: "Sửa chữa điều hòa",
        status: "pending",
        date: "28/05/2023",
        priority: "low",
        progress: 0,
      },
    ];

    setTimeout(() => {
      setRepairs(mockData);
      setLoading(false);
    }, 500);
  }, []);

  // Lọc dữ liệu theo tìm kiếm và trạng thái
  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch = repair.licensePlate
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || repair.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Hiển thị trạng thái
  const getStatusBadge = (status: Repair["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Wrench className="w-3 h-3 mr-1" /> Hoàn thành
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" /> Đang xử lý
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Chờ xử lý
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  // Hiển thị độ ưu tiên
  const getPriorityBadge = (priority: Repair["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cao
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Trung bình
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Thấp
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (filteredRepairs.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy yêu cầu nào
        </h2>
        <p className="text-gray-600 mb-4">
          Không có yêu cầu sửa chữa nào phù hợp với tìm kiếm của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Biển số
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Xe
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Vấn đề
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Trạng thái
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ngày
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Độ ưu tiên
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tiến độ
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Chi tiết</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRepairs.map((repair) => (
            <tr key={repair.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {repair.licensePlate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {repair.vehicle}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {repair.issue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getStatusBadge(repair.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {repair.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getPriorityBadge(repair.priority)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${repair.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs">{repair.progress}%</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/customer/repairs/${repair.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Chi tiết
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}