'use client'

import { useRoleBasedLayout } from '@/hooks/useRoleBasedLayout'
import { DesktopSidebar } from './DesktopSidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { MobileHeader } from './MobileHeader'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface RoleBasedLayoutProps {
  children: React.ReactNode
  userRole: UserRole | null
  userName: string | null
  userEmail: string | null
  title?: string
}

export function RoleBasedLayout({
  children,
  userRole,
  userName,
  userEmail,
  title,
}: RoleBasedLayoutProps) {
  const { showSidebar, showBottomNav } = useRoleBasedLayout({ role: userRole })

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Desktop Sidebar */}
      {showSidebar && (
        <DesktopSidebar
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
        />
      )}

      {/* Mobile Header */}
      {showBottomNav && (
        <MobileHeader
          userRole={userRole}
          userName={userName}
          title={title}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-200',
          showSidebar && 'ml-64', // Desktop: offset for sidebar
          showBottomNav && 'pt-14 pb-20' // Mobile: offset for header and bottom nav
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && <MobileBottomNav userRole={userRole} />}
    </div>
  )
}
