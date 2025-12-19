'use client'

import { RoleBasedLayout } from './RoleBasedLayout'
import type { UserRole } from '@/types/database'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userRole: UserRole | null
  userName: string | null
  userEmail: string | null
}

export function DashboardLayoutClient({
  children,
  userRole,
  userName,
  userEmail,
}: DashboardLayoutClientProps) {
  return (
    <RoleBasedLayout
      userRole={userRole}
      userName={userName}
      userEmail={userEmail}
    >
      {children}
    </RoleBasedLayout>
  )
}
