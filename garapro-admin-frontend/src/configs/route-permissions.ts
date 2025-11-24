// config/route-permissions.ts

export type RoutePermissionRule = {
  pattern: RegExp;
  permissions: string[]; // chỉ cần có ÍT NHẤT 1 trong các quyền này (hasAnyPermission)
};

/**
 * Map quyền → route
 * Bạn có thể chỉnh sửa thoải mái cho hợp với hệ thống thực tế.
 */
export const routePermissionRules: RoutePermissionRule[] = [
  // ===== USER MANAGEMENT =====
  // /admin/users, /admin/users/banned
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
    permissions: ["BOOKING_VIEW"],
  },
  {
    pattern: /^\/admin\/financial-reports(\/.*)?$/,
    permissions: ["BOOKING_VIEW", "BOOKING_MANAGE"],
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
