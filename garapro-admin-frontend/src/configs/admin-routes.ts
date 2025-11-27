// configs/admin-routes.ts
import React from "react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  FileCheck,
  Megaphone,
  MapPin,
  Wrench,
} from "lucide-react";

export type AdminMenuItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
  requiredPermissions: string[];
  submenu?: AdminMenuItem[];
  showInMenu?: boolean;
};

export type RoutePermissionRule = {
  pattern: RegExp;
  permissions: string[];
};

/**
 * MENU CONFIG – dùng cho AdminSidebar
 */
export const adminMenuItems: AdminMenuItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    requiredPermissions: [
      "USER_VIEW",
      "VIEW_STAT",
      "BRANCH_VIEW",
      "SERVICE_VIEW",
      "PROMO_VIEW",
      "LOG_VIEW",
    ],
    showInMenu: true,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    requiredPermissions: ["USER_VIEW"],
    showInMenu: true,
    submenu: [
      {
        title: "All Users",
        href: "/admin/users",
        requiredPermissions: ["USER_VIEW"],
        showInMenu: true,
      },
      {
        title: "Banned Users",
        href: "/admin/users/banned",
        requiredPermissions: ["USER_VIEW"],
        showInMenu: true,
      },
      {
        title: "User Roles",
        href: "/admin/users/roles",
        requiredPermissions: [
          "ROLE_VIEW",
          "ROLE_CREATE",
          "ROLE_UPDATE",
          "ROLE_DELETE",
          "PERMISSION_ASSIGN",
        ],
        showInMenu: true,
      },
    ],
  },
  {
    title: "Policies",
    href: "/admin/policies",
    icon: FileCheck,
    requiredPermissions: ["POLICY_MANAGEMENT"],
    showInMenu: true,
    submenu: [
      {
        title: "Security Policies",
        href: "/admin/policies/security",
        requiredPermissions: ["POLICY_MANAGEMENT"],
        showInMenu: true,
      },
      {
        title: "History change",
        href: "/admin/policies/history",
        requiredPermissions: ["POLICY_MANAGEMENT"],
        showInMenu: true,
      },
    ],
  },
  {
    title: "Statistics",
    href: "/admin/statistics",
    icon: BarChart3,
    requiredPermissions: ["VIEW_STAT"],
    showInMenu: true,
    submenu: [
      {
        title: "Overview",
        href: "/admin/statistics",
        requiredPermissions: ["VIEW_STAT"],
        showInMenu: true,
      },
      {
        title: "Advanced Analytics",
        href: "/admin/statistics/advanced",
        requiredPermissions: ["VIEW_STAT"],
        showInMenu: true,
      },
      {
        title: "Real-time Analytics",
        href: "/admin/statistics/realtime",
        requiredPermissions: ["VIEW_STAT"],
        showInMenu: true,
      },
      {
        title: "Revenue Reports",
        href: "/admin/financial-reports",
        requiredPermissions: ["VIEW_STAT"],
        showInMenu: true,
      },
    ],
  },
  {
    title: "System Logs",
    href: "/admin/logs",
    icon: FileText,
    requiredPermissions: ["LOG_VIEW"],
    showInMenu: true,
    submenu: [
      {
        title: "All Logs",
        href: "/admin/logs",
        requiredPermissions: ["LOG_VIEW"],
        showInMenu: true,
      },
    ],
  },
  {
    title: "Promotional Campaigns",
    href: "/admin/campaigns",
    icon: Megaphone,
    requiredPermissions: ["PROMO_VIEW"],
    showInMenu: true,
    submenu: [
      {
        title: "All Campaigns",
        href: "/admin/campaigns",
        requiredPermissions: ["PROMO_VIEW"],
        showInMenu: true,
      },
    ],
  },
  {
    title: "Garage Branches",
    href: "/admin/branches",
    icon: MapPin,
    requiredPermissions: ["BRANCH_VIEW"],
    showInMenu: true,
    submenu: [
      {
        title: "All Branches",
        href: "/admin/branches",
        requiredPermissions: ["BRANCH_VIEW"],
        showInMenu: true,
      }
    ],
  },
  {
    title: "Garage Services",
    href: "/admin/services",
    icon: Wrench,
    requiredPermissions: ["SERVICE_VIEW"],
    showInMenu: true,
    submenu: [
      {
        title: "All Services",
        href: "/admin/services",
        requiredPermissions: ["SERVICE_VIEW"],
        showInMenu: true,
      }
      
    ],
  },
];



export const routePermissionRules: RoutePermissionRule[] = [
  // ===== DASHBOARD =====
  {
    pattern: /^\/admin\/?$/,
    permissions: [
      "USER_VIEW",
      "BOOKING_VIEW",
      "BRANCH_VIEW",
      "SERVICE_VIEW",
      "PROMO_VIEW",
      "LOG_VIEW",
    ],
  },

  // ===== USER MANAGEMENT =====
  {
    pattern: /^\/admin\/users\/?$/,
    permissions: ["USER_VIEW"],
  },
  {
    pattern: /^\/admin\/users\/banned\/?$/,
    permissions: ["USER_VIEW"],
  },
  {
    pattern: /^\/admin\/users\/roles(\/.*)?$/,
    permissions: [
      "ROLE_VIEW",
      "ROLE_CREATE",
      "ROLE_UPDATE",
      "ROLE_DELETE",
      "PERMISSION_ASSIGN",
    ],
  },

  // ===== POLICIES =====
  {
    pattern: /^\/admin\/policies(\/.*)?$/,
    permissions: ["POLICY_MANAGEMENT"],
  },

  // ===== STATISTICS / REPORTS =====
  {
    pattern: /^\/admin\/statistics(\/.*)?$/,
    permissions: ["VIEW_STAT"],
  },
  {
    pattern: /^\/admin\/financial-reports(\/.*)?$/,
    permissions: ["VIEW_STAT"]
  },

  // ===== LOGS =====
  {
    pattern: /^\/admin\/logs(\/.*)?$/,
    permissions: ["LOG_VIEW"],
  },

  // ===== PROMOTIONAL CAMPAIGNS =====

   // /admin/campaigns - LIST
  {
    pattern: /^\/admin\/campaigns\/?$/,
    permissions: ["PROMO_VIEW"],
  },
  {
  pattern: /^\/admin\/campaigns\/[^\/]+\/analytics\/?$/,
  permissions: ["PROMO_VIEW"],
  },
  // /admin/campaign/create - CREATE
  {
    pattern: /^\/admin\/campaigns\/create\/?$/,
    permissions: ["PROMO_CREATE"],
  },
  // /admin/campaign/[id]/edit - EDIT
  {
    pattern: /^\/admin\/campaigns\/[^\/]+\/edit\/?$/,
    permissions: ["PROMO_UPDATE"],
  },
  // /admin/campaign/[id] - DETAIL
  {
    pattern: /^\/admin\/campaigns\/[^\/]+\/?$/,
    permissions: ["PROMO_VIEW"],
  },

  // ===== BRANCHES =====
  // /admin/branches/import
  {
    pattern: /^\/admin\/branches\/import\/?$/,
    permissions: ["BRANCH_IMPORT_EXCEL"],
    
  },
  // LIST
  {
    pattern: /^\/admin\/branches\/?$/,
    permissions: ["BRANCH_VIEW"],
  },
  // CREATE  
  {
    pattern: /^\/admin\/branches\/create\/?$/,
    permissions: ["BRANCH_CREATE"],
  },
  // EDIT
  {
    pattern: /^\/admin\/branches\/[^\/]+\/edit\/?$/,
    permissions: ["BRANCH_UPDATE"],
  },
  // DETAIL
  {
    pattern: /^\/admin\/branches\/[^\/]+\/?$/,
    permissions: ["BRANCH_VIEW"],
  },
  

  // ===== SERVICES =====
  // LIST
  {
    pattern: /^\/admin\/services\/?$/,
    permissions: ["SERVICE_VIEW"],
  },
  // CREATE  /admin/services/new/[id]
  {
    pattern: /^\/admin\/services\/new\/?$/,
    permissions: ["SERVICE_CREATE"],
  },
  // EDIT  /admin/services/edit/[id]
  {
    pattern: /^\/admin\/services\/edit\/[^\/]+\/?$/,
    permissions: ["SERVICE_UPDATE"],
  },
  // DETAIL /admin/services/view/[id]
  {
    pattern: /^\/admin\/services\/view\/[^\/]+\/?$/,
    permissions: ["SERVICE_VIEW"],
  },
];


export function findFirstAccessibleAdminRoute(
  hasAnyPermission: (...codes: string[]) => boolean
): string | null {
  for (const item of adminMenuItems) {
    
    if (item.requiredPermissions && !hasAnyPermission(...item.requiredPermissions)) {
      continue;
    }

    
    if (item.submenu && item.submenu.length > 0) {
      for (const sub of item.submenu) {
        if (!sub.requiredPermissions || hasAnyPermission(...sub.requiredPermissions)) {
          return sub.href;
        }
      }
    }

    
    console.log("itemHREF",item.href)
    return item.href;
  }

  return null;
}