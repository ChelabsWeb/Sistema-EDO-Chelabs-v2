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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden selection:bg-blue-500/30 transition-colors duration-500">
      {/* Background Abstract Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.15, 0.85, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 70, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-900/10 rounded-full blur-[120px]"
        />
        {/* Noise Overlay */}
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
