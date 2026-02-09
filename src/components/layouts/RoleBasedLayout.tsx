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
    <div className="min-h-screen bg-[#101622] relative overflow-hidden selection:bg-blue-500/30">
      {/* Background Abstract Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.15, 0.85, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 70, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [30, -30, 0, 30],
            y: [30, 30, -50, 30],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] left-[10%] w-[700px] h-[700px] bg-indigo-700/10 rounded-full blur-[140px]"
        />
        {/* Noise Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
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
            'transition-all duration-500 ease-in-out',
            showSidebar && 'md:pl-[300px]', // Adjusted for better spacing with sidebar
            showBottomNav && 'pt-16 pb-24'
          )}
        >
          <div className="animate-apple-fade-in p-4 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {showBottomNav && <MobileBottomNav userRole={userRole} />}
      </div>
    </div>
  )
}
