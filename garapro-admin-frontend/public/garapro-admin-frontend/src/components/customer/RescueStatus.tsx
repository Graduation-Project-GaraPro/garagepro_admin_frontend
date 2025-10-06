'use client';

import React from 'react';

type RescueStatusType =
  | 'pending'
  | 'accepted'
  | 'dispatched'
  | 'on-the-way'
  | 'arrived'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

interface RescueStatusProps {
  status: RescueStatusType;
  estimatedArrival: string | null; // ISO date string
  requestTime: string | null;      // ISO date string
  updateStatus: (newStatus: RescueStatusType) => void;
  generatePdf: () => void;
}

const RescueStatus: React.FC<RescueStatusProps> = ({
  status,
  estimatedArrival,
  requestTime,
  updateStatus,
  generatePdf,
}) => {
  // Map trạng thái sang tiếng Việt
  const getStatusText = (status: RescueStatusType) => {
    const statusMap: Record<RescueStatusType, string> = {
      pending: 'Đang chờ xử lý',
      accepted: 'Đã tiếp nhận',
      dispatched: 'Đã điều động',
      'on-the-way': 'Đang trên đường',
      arrived: 'Đã đến nơi',
      'in-progress': 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  // Màu sắc theo trạng thái
  const getStatusColor = (status: RescueStatusType) => {
    const colorMap: Record<RescueStatusType, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-purple-100 text-purple-800',
      'on-the-way': 'bg-indigo-100 text-indigo-800',
      arrived: 'bg-green-100 text-green-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Format thời gian ISO
  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Không có thông tin';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Thời gian không hợp lệ';

    return (
      date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) +
      ' - ' +
      date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    );
  };

  // Tính thời gian còn lại
  const getRemainingTime = () => {
    if (!estimatedArrival) return 'Không xác định';
    const now = new Date();
    const arrival = new Date(estimatedArrival);
    const diffMs = arrival.getTime() - now.getTime();

    if (diffMs <= 0) return 'Đã đến giờ';

    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} phút`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white font-semibold">
        Trạng thái cứu hộ
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-gray-500">Trạng thái:</span>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                status
              )}`}
            >
              {getStatusText(status)}
            </span>
          </div>

          <button
            onClick={generatePdf}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
          >
            Tạo PDF
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Thời gian yêu cầu:</span>
            <span className="text-sm font-medium">{formatTime(requestTime)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Dự kiến đến nơi:</span>
            <span className="text-sm font-medium">{formatTime(estimatedArrival)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Thời gian còn lại:</span>
            <span className="text-sm font-medium text-blue-600">
              {getRemainingTime()}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Cập nhật trạng thái:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(['dispatched', 'on-the-way', 'arrived', 'in-progress', 'completed'] as RescueStatusType[]).map(
              (statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => updateStatus(statusOption)}
                  disabled={statusOption === status}
                  className={`py-2 px-3 rounded-md text-sm transition-colors ${
                    statusOption === status
                      ? 'bg-blue-600 text-white cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getStatusText(statusOption)}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescueStatus;
