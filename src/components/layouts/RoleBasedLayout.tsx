'use client'

import { useRoleBasedLayout } from '@/hooks/useRoleBasedLayout'
import { DesktopSidebar } from './DesktopSidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { MobileHeader } from './MobileHeader'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-transparent text-foreground relative overflow-hidden selection:bg-blue-500/30 transition-colors duration-500">
      {/* Background noise texture */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
            backgroundSize: '128px 128px'
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen">
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
            'transition-all duration-500 ease-in-out min-h-screen',
            showSidebar && 'md:pl-64', // Exactly 256px for the sidebar
            showBottomNav && 'pt-16 pb-24'
          )}
        >
          <div className="animate-apple-fade-in">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {showBottomNav && <MobileBottomNav userRole={userRole} />}
      </div>
    </div>
  )
}
