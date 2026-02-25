'use client'

import { useRoleBasedLayout } from '@/hooks/useRoleBasedLayout'
import { DesktopSidebar } from './DesktopSidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { MobileHeader } from './MobileHeader'
import { ChatBubble } from '@/components/chat/ChatBubble'
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/30 transition-colors duration-500">

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
            'transition-all duration-300 ease-in-out min-h-screen',
            showSidebar && 'md:pl-64', // Exactly 256px for the sidebar
            showBottomNav && 'pt-16 pb-24'
          )}
        >
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {showBottomNav && <MobileBottomNav userRole={userRole} />}

        {/* Global Realtime Chat */}
        {userRole && <ChatBubble />}
      </div>
    </div>
  )
}
