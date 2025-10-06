"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaClipboardList,
  FaTools,
  FaHistory,
  FaBell,
  FaCar,
  FaWrench,
  FaUserCircle,
  FaChartBar,
  FaClipboardCheck,
  FaCog,
} from "react-icons/fa";
import { Dispatch, SetStateAction, useState } from "react";
interface ChildItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  href: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  href?: string;
  children?: ChildItem[];
}
// Props
interface TechnicianSidebarProps {
  activeSection: string;
  setActiveSection: Dispatch<SetStateAction<string>>;
}

const sidebarItems = [
  { id: "home", label: "Home", icon: FaHome, href: "/technician" },
  {
    id: "task-management", label: "Task Management", icon: FaClipboardList, href: "/technician/taskManagement",
  },
  {
    id: "condition-inspection",
    label: "Inspection & Repair",
    icon: FaTools,
    children: [
      {
        id: "vehicle-inspection",
        label: "Vehicle Inspection",
        icon: FaClipboardCheck,
        href: "/technician/inspectionAndRepair/inspection",
      },
      {
        id: "repair-progress",
        label: "Repair Progress",
        icon: FaCog,
        href: "/technician/inspectionAndRepair/repair",
      },
    ],
  },
  {
    id: "repair-history", label: "Repair History", icon: FaHistory, href: "/technician/repairHistory",
  },
  {
    id: "notifications", label: "Notifications", icon: FaBell, href: "/technician/notifications",
  },
  {
    id: "vehicle-lookup", label: "Information Lookup", icon: FaCar, href: "/technician/vehicleLookup",
  },
  {
    id: "statistical", label: "Statistical", icon: FaChartBar, href: "/technician/statistical",
  },
];

export default function TechnicianSidebar({
  activeSection,
  setActiveSection,
}: TechnicianSidebarProps) {
  const pathname = usePathname();

  // State riêng để quản lý expand/collapse menu cha
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Function để kiểm tra xem menu cha có đang active không (dựa trên children)
  const isParentActive = (item: SidebarItem) => {
  if (!item.children) return false;
  return item.children.some((child: ChildItem) => 
    pathname === child.href || activeSection === child.id
  );
};

  // Function xử lý click vào menu item không có children
  const handleMenuItemClick = (itemId: string) => {
    setActiveSection(itemId);
    setExpandedMenu(null); // Đóng tất cả menu expanded khi chọn menu khác
  };

  return (
    <div className="w-64 bg-gradient-to-r from-gray-300 to-teal-100 shadow-lg flex flex-col">
      {/* Navigation */}
      <nav className="mt-6 flex-1">
        <div className="px-4">
          <p className="text-[16px] font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center italic">
            <FaWrench className="text-xl text-gray-500 mr-2" />
            TECHNICIAN
          </p>

          {sidebarItems.map((item) => {
            const IconComponent = item.icon;

            // Kiểm tra active cho menu không có children
            const isActive = !item.children && (pathname === item.href || activeSection === item.id);
            
            // Kiểm tra active cho menu có children (dựa trên children active)
            const isParentActiveNow = isParentActive(item);

            return (
              <div key={item.id}>
                {item.children ? (
                  <div>
                    {/* Parent */}
                    <button
                      onClick={() =>
                        setExpandedMenu(
                          expandedMenu === item.id ? null : item.id
                        )
                      }
                      className={`w-full flex items-center px-4 py-4 text-left rounded-lg mb-2 transition-colors bg-white/10 ${
                        isParentActiveNow
                          ? "bg-gradient-to-r from-blue-300 to-teal-300 text-blue-800 border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <IconComponent className="mr-3 text-lg" />
                      <span className="text-[15px] font-medium">
                        {item.label}
                      </span>
                    </button>

                    {/* Children */}
                    {expandedMenu === item.id && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive =
                            pathname === child.href ||
                            activeSection === child.id;

                          return (
                            <Link
                              key={child.id}
                              href={child.href}
                              onClick={() => setActiveSection(child.id)}
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                isChildActive
                                  ? "bg-blue-200 text-blue-800 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <ChildIcon className="mr-2" />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`w-full flex items-center px-4 py-4 text-left rounded-lg mb-2 transition-colors bg-white/10 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-300 to-teal-300 text-blue-800 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="mr-3 text-lg" />
                    <span className="text-[15px] font-medium">
                      {item.label}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <FaUserCircle className="text-3xl text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              John Technician
            </p>
            <p className="text-xs text-gray-500">Senior Mechanic</p>
          </div>
        </div>
      </div>
    </div>
  );
}