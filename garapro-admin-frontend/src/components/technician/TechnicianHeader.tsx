"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FaUserCircle, FaBell, FaArrowRight, FaExclamationTriangle, FaCheckCircle, 
  FaClock, FaUser, FaCog, FaChartBar, FaSignOutAlt 
} from "react-icons/fa";
import { useRouter } from "next/navigation";

type NotificationType = "normal" | "warning";
type NotificationCategory = "Task" | "Approval" | "Parts" | "Deadline" | "Feedback";

interface Notification {
  id: number;
  message: string;
  time: string;
  type: NotificationType;
  category: NotificationCategory;
}

export default function TechnicianHeader() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false); // ✅ thêm state cho Account menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null); // ✅ thêm ref cho Account menu

  // Dữ liệu thông báo mẫu
  const recentNotifications: Notification[] = [
    { id: 1, message: "New Task: Toyota Camry", time: "2 minutes ago", type: "normal", category: "Task" },
    { id: 2, message: "Tesla vehicle status accepted", time: "15 minutes ago", type: "normal", category: "Approval" },
    { id: 3, message: "Windshield is available in stock", time: "45 minutes ago", type: "normal", category: "Parts" },
    { id: 4, message: "WARNING: You missed the deadline for the Porsche task.", time: "1 hour ago", type: "warning", category: "Deadline" },
    { id: 5, message: "Customer feedback is not satisfied with the repair quality.", time: "3 hours ago", type: "warning", category: "Feedback" }
  ];

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) &&
        (accountRef.current && !accountRef.current.contains(event.target as Node))
      ) {
        setShowNotifications(false);
        setShowAccountMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type: NotificationType, category: NotificationCategory) => {
    if (type === "warning") {
      return <FaExclamationTriangle className="text-red-500 text-sm" />;
    }
    switch (category) {
      case "Approval":
        return <FaCheckCircle className="text-green-500 text-sm" />;
      case "Parts":
        return <FaBell className="text-blue-500 text-sm" />;
      case "Task":
        return <FaClock className="text-purple-500 text-sm" />;
      default:
        return <FaBell className="text-gray-500 text-sm" />;
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  const goToAllNotifications = () => {
    setShowNotifications(false);
    router.push("/technician/notifications");
  };

  return (
    <header className="bg-gradient-to-r from-blue-100 to-teal-100 shadow-sm border-b border-teal-200 p-4 w-full text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-2">
            <img
              src="/gr_logo.png"
              alt="GaragePro Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">GaragePro</span>
          </div>
          <div className="h-8 w-px bg-gray-300" style={{ marginLeft: "58px" }}></div>
        </div>

        <div className="flex items-center space-x-4 bg-white/70 rounded-xl px-5">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              onClick={toggleNotifications}
            >
              <FaBell className="text-2xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {recentNotifications.length}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">Recent Notifications</h3>
                </div>

                <div className="max-h-80 overflow-y-auto px-2">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-200 transition-colors duration-200 rounded-xl ${
                        notification.type === "warning" ? "bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              notification.type === "warning"
                                ? "text-red-800"
                                : "text-gray-800"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          {notification.type === "warning" && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-200 rounded-full">
                              Warning
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={goToAllNotifications}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <span>All Notifications</span>
                    <FaArrowRight className="text-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>
<div className="h-6 w-px bg-gray-300"></div>
          {/* Account Menu */}
          <div className="relative" ref={accountRef}>
            <button
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              onClick={toggleAccountMenu}
            >
              <FaUserCircle className="text-4xl text-gray-500 hover:text-gray-700" />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      JT
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">John Technician</h3>
                      <p className="text-xs text-gray-500">johntech@garapro.com</p>
                    </div>
                  </div>
                </div>

                <div className="py-2 px-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 rounded-xl">
                    <FaUser className="text-gray-700" />
                    <span className="text-sm font-semibold">Profile</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors duration-200 rounded-xl">
                    <FaCog className="text-gray-700" />
                    <span className="text-sm font-semibold">Settings</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors duration-200 rounded-xl">
                    <FaChartBar className="text-gray-700" />
                    <span className="text-sm font-semibold">Analytics</span>
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-xl">
                      <FaSignOutAlt className="text-red-700" />
                      <span className="text-sm font-bold">Log out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
