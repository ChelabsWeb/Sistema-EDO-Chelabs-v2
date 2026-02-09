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
    <aside className="fixed left-6 top-6 bottom-6 w-64 z-40 bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] flex flex-col overflow-hidden transition-all duration-500">
      {/* Brand Header */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[16px] flex items-center justify-center shadow-lg shadow-blue-500/20 transform transition-all group-hover:scale-110">
            <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-extrabold text-white tracking-tight text-lg leading-tight">Sistema EDO</h1>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-0.5">Premium V2</p>
          </div>
        </Link>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 px-4 py-2 space-y-2">
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
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3.5 relative z-10 transition-transform group-hover:translate-x-1">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'
                  )}
                  strokeWidth={2}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-blue-600 shadow-lg shadow-blue-600/20"
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
          className="p-4 bg-white/[0.03] border border-white/5 rounded-[24px] mb-4 flex items-center gap-4 transition-all hover:bg-white/[0.05] hover:border-blue-500/30 group/user"
        >
          <div className="w-12 h-12 bg-white/10 rounded-[14px] flex items-center justify-center border border-white/10 group-hover/user:scale-105 transition-transform">
            <span className="text-[12px] font-black text-blue-400 uppercase">
              {userName?.substring(0, 2) || userEmail?.substring(0, 2) || 'AD'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate tracking-tight lowercase first-letter:uppercase group-hover/user:text-blue-400 transition-colors">
              {userName || userEmail}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.1em] mt-0.5">
              {getRoleDisplayName(userRole)}
            </p>
          </div>
        </Link>

        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center gap-2 text-[13px] font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-300 active:scale-95 group border border-transparent"
          >
            <LogOut className="w-4 h-4 transition-all group-hover:-translate-x-1" strokeWidth={2.5} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
