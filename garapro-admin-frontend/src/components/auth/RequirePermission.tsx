// components/auth/RequirePermission.tsx
'use client'

import { ReactNode } from 'react'
import { usePermissionContext } from '@/contexts/permission-context'

type RequirePermissionProps = {
  permissions: string[]          // list quyền cần check
  children: ReactNode           // render khi đủ quyền
  fallback?: ReactNode          // render khi KHÔNG đủ quyền (mặc định: null)
  logic?: 'any' | 'all'         // cần 1 quyền hay tất cả (mặc định: any)
}

export function RequirePermission({
  permissions,
  children,
  fallback = null,
  logic = 'any',
}: RequirePermissionProps) {
  const { hasAnyPermission, hasPermission } = usePermissionContext()

  let allowed = false

  if (logic === 'any') {
    allowed = hasAnyPermission(...permissions)
  } else {
    
    allowed = hasPermission
      ? hasPermission(...permissions)
      : permissions.every(p => hasAnyPermission(p))
  }

  if (!allowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
