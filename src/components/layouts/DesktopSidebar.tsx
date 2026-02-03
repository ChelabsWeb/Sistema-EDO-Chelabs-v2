'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Building2,
  Users,
  Trash2,
  LogOut,
  ShoppingCart,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Resumen',
    icon: LayoutDashboard,
  },
  {
    href: '/obras',
    label: 'Obras',
    icon: Building2,
  },
  {
    href: '/compras/ordenes-compra',
    label: 'Compras',
    icon: ShoppingCart,
    roles: ['admin', 'director_obra', 'jefe_obra', 'compras'],
  },
  {
    href: '/reportes',
    label: 'Analítica',
    icon: BarChart3,
    roles: ['admin', 'director_obra'],
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    icon: Users,
    roles: ['admin', 'director_obra'],
  },
  {
    href: '/papelera',
    label: 'Papelera',
    icon: Trash2,
    roles: ['admin', 'director_obra'],
  },
]

interface DesktopSidebarProps {
  userRole: UserRole | null
  userName: string | null
  userEmail: string | null
}

export function DesktopSidebar({ userRole, userName, userEmail }: DesktopSidebarProps) {
  const pathname = usePathname()

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!userRole) return false
    return item.roles.includes(userRole)
  })

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-64 z-40 glass border border-apple-gray-100 dark:border-white/10 shadow-apple-float rounded-[32px] flex flex-col overflow-hidden transition-all duration-500">
      {/* Brand Header */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-apple-blue rounded-[16px] flex items-center justify-center shadow-[0_8px_16px_rgba(0,113,227,0.3)] transform transition-all group-hover:scale-110 group-active:scale-95">
            <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-bold text-foreground tracking-tight text-lg leading-tight">EDO Chelabs</h1>
            <p className="text-[10px] font-bold text-apple-blue uppercase tracking-[0.2em] opacity-80 mt-0.5">V2.0 PRO</p>
          </div>
        </Link>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'text-white'
                  : 'text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-50 dark:hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3.5 relative z-10 transition-transform group-hover:translate-x-1">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive ? 'text-white scale-110' : 'text-apple-gray-300 group-hover:text-apple-blue'
                  )}
                  strokeWidth={2}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-apple-blue shadow-[0_4px_12px_rgba(0,113,227,0.3)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              {isActive && <ChevronRight className="w-4 h-4 text-white/60 relative z-10" strokeWidth={2.5} />}
            </Link>
          )
        })}
      </nav>

      {/* User & Sign Out */}
      <div className="p-6 mt-auto">
        <Link
          href="/perfil"
          className="p-4 bg-apple-gray-50/50 dark:bg-white/[0.03] border border-apple-gray-50 dark:border-white/5 rounded-[24px] mb-4 flex items-center gap-4 transition-all hover:border-apple-blue/20 group/user shadow-sm hover:shadow-apple-sm group"
        >
          <div className="w-12 h-12 bg-white dark:bg-apple-gray-100 rounded-[14px] flex items-center justify-center border border-apple-gray-100 dark:border-white/10 shadow-sm group-hover/user:scale-105 transition-transform">
            <span className="text-[12px] font-black text-apple-blue uppercase tracking-tighter">
              {userName?.substring(0, 2) || userEmail?.substring(0, 2) || 'AD'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-foreground truncate tracking-tight lowercase first-letter:uppercase group-hover/user:text-apple-blue transition-colors">
              {userName || userEmail}
            </p>
            <p className="text-[10px] uppercase font-bold text-apple-gray-400 tracking-[0.1em] mt-0.5 opacity-70">
              {getRoleDisplayName(userRole)}
            </p>
          </div>
        </Link>

        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center gap-2 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all duration-300 active:scale-95 group border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
          >
            <LogOut className="w-4 h-4 transition-all group-hover:-translate-x-1" strokeWidth={2.5} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
