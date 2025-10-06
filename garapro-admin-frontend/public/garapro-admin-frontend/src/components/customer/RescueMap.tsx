'use client';

import React, { useEffect, useState } from 'react';

interface Location {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface RescueMapProps {
  location: Location | null;
  technicianLocation?: Location | null;
}

const RescueMap: React.FC<RescueMapProps> = ({ location, technicianLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!location) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">Không có thông tin vị trí</p>
      </div>
    );
  }

  // Chuyển đổi định dạng vị trí nếu cần
  const userLocation = location.lat && location.lng
    ? { lat: location.lat, lng: location.lng }
    : { lat: location.latitude || 10.762622, lng: location.longitude || 106.660172 };

  return (
    <div className="relative h-full w-full bg-blue-50">
      {!mapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <div className="h-full w-full relative">
          {/* Mô phỏng bản đồ */}
          <div className="absolute inset-0 bg-blue-50 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-300 text-6xl opacity-20">
              MAP VIEW
            </div>

            {/* Vị trí của người dùng */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${userLocation.lat * 0.1}%`, left: `${userLocation.lng * 0.1}%` }}
            >
              <div className="h-6 w-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <div className="h-4 w-4 bg-red-300 rounded-full"></div>
              </div>
              <div className="mt-1 bg-white px-2 py-1 rounded-md shadow-md text-xs">
                Vị trí của bạn
              </div>
            </div>

            {/* Vị trí của kỹ thuật viên */}
            {technicianLocation && (
              <div
                className="absolute"
                style={{ top: `${technicianLocation.lat! * 0.1}%`, left: `${technicianLocation.lng! * 0.1}%` }}
              >
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-blue-300 rounded-full"></div>
                </div>
                <div className="mt-1 bg-white px-2 py-1 rounded-md shadow-md text-xs">
                  Kỹ thuật viên
                </div>
              </div>
            )}

            {/* Đường đi mô phỏng */}
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50% 50% L45% 40%"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            </svg>
          </div>

          {/* Thông tin vị trí */}
          <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-md shadow-md">
            <div className="text-sm font-medium text-gray-700">{location.address || 'Vị trí hiện tại'}</div>
            <div className="text-xs text-gray-500 mt-1">
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueMap;
