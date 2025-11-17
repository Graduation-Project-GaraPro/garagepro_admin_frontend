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
  {
    pattern: /^\/admin\/users(\/banned)?\/?$/,
    permissions: ['USER_VIEW'],
  },
  // /admin/users/roles
  {
    pattern: /^\/admin\/users\/roles(\/.*)?$/,
    permissions: ['ROLE_VIEW', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'PERMISSION_ASSIGN'],
  },

  // ===== POLICIES =====
  // /admin/policies + sub pages
  {
    pattern: /^\/admin\/policies(\/.*)?$/,
    permissions: ['POLICY_MANAGEMENT'],
  },

  // ===== STATISTICS / REPORTS =====
  // /admin/statistics, /admin/statistics/advanced, /admin/statistics/realtime
  {
    pattern: /^\/admin\/statistics(\/.*)?$/,
    permissions: ['BOOKING_VIEW'],
  },
  // /admin/financial-reports
  {
    pattern: /^\/admin\/financial-reports(\/.*)?$/,
    permissions: ['BOOKING_VIEW', 'BOOKING_MANAGE'],
  },

  // ===== LOGS =====
  // /admin/logs
  {
    pattern: /^\/admin\/logs(\/.*)?$/,
    permissions: ['LOG_VIEW'],
  },

  // ===== PROMOTIONAL CAMPAIGNS =====
  // /admin/campaigns
  {
    pattern: /^\/admin\/campaigns(\/.*)?$/,
    permissions: ['PROMO_VIEW', 'PROMO_CREATE', 'PROMO_UPDATE', 'PROMO_DELETE', 'PROMO_TOGGLE'],
  },

  // ===== BRANCHES =====
  // /admin/branches
  // ===== BRANCH LIST =====
{
  pattern: /^\/admin\/branches\/?$/,          // /admin/branches hoặc /admin/branches/
  permissions: ['BRANCH_VIEW'],
},

// ===== CREATE BRANCH =====
{
  pattern: /^\/admin\/branches\/create\/?$/,  // /admin/branches/create
  permissions: ['BRANCH_CREATE'],
},

// ===== EDIT BRANCH =====
{
  pattern: /^\/admin\/branches\/[^\/]+\/edit\/?$/, // /admin/branches/{id}/edit
  permissions: ['BRANCH_UPDATE'],
},

// ===== VIEW BRANCH DETAIL =====
{
  pattern: /^\/admin\/branches\/[^\/]+\/?$/,  // /admin/branches/{id}
  permissions: ['BRANCH_VIEW'],
},
  // ===== SERVICES =====
  // /admin/services
  {
    pattern: /^\/admin\/services(\/.*)?$/,
    permissions: ['SERVICE_VIEW', 'SERVICE_CREATE', 'SERVICE_UPDATE', 'SERVICE_DELETE', 'SERVICE_STATUS_TOGGLE'],
  },

  // ===== DASHBOARD =====
  // /admin (dashboard chính)
  // Ở đây mình cho phép ai có ÍT NHẤT 1 trong các quyền này vào dashboard
  {
    pattern: /^\/admin\/?$/,
    permissions: ['USER_VIEW', 'BOOKING_VIEW', 'BRANCH_VIEW', 'SERVICE_VIEW', 'PROMO_VIEW', 'LOG_VIEW'],
  },
];
