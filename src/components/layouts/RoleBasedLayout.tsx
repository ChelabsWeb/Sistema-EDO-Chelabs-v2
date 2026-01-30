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
    <div className="min-h-screen bg-[--background] selection:bg-[--color-apple-blue]/10">
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
          'transition-all duration-500 ease-in-out',
          showSidebar && 'md:pl-[288px]', // 24px (left-6) + 256px (w-64) + 8px gap
          showBottomNav && 'pt-16 pb-24' // Mobile: offset for header and bottom nav
        )}
      >
        <div className="animate-apple-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && <MobileBottomNav userRole={userRole} />}
    </div>
  )
}
