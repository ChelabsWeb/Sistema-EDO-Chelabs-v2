'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared/Logo'
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Trash2,
  ShoppingCart,
  ClipboardList
} from 'lucide-react'

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: UserRole[]
}

const navSections: NavSection[] = [
  {
    title: 'Gestión',
    items: [
      { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
      { href: '/obras', label: 'Obras', icon: Building2 },
      { href: '/compras/ordenes-compra', label: 'Compras', icon: ShoppingCart, roles: ['admin', 'director_obra', 'jefe_obra', 'compras'] },
    ]
  },
  {
    title: 'Análisis',
    items: [
      { href: '/reportes', label: 'Analítica', icon: BarChart3, roles: ['admin', 'director_obra'] },
      { href: '/papelera', label: 'Papelera', icon: Trash2, roles: ['admin', 'director_obra'] },
    ]
  },
  {
    title: 'Configuración',
    items: [
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users, roles: ['admin', 'director_obra'] },
      { href: '/perfil', label: 'Ajustes', icon: Settings },
    ]
  }
]

interface DesktopSidebarProps {
  userRole: UserRole | null
  userName: string | null
  userEmail: string | null
}

export function DesktopSidebar({ userRole, userName, userEmail }: DesktopSidebarProps) {
  const pathname = usePathname()

  const filterItems = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true
      if (!userRole) return false
      return item.roles.includes(userRole)
    })
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 flex flex-col py-8 border-r border-slate-200 dark:border-white/5 bg-transparent backdrop-blur-2xl shrink-0 transition-all duration-500">
      {/* Brand Header */}
      <div className="px-8 mb-10 flex items-center gap-4 group cursor-default">
        <Logo size={44} className="group-hover:scale-110 transition-transform duration-500" />
        <div>
          <h1 className="text-slate-900 dark:text-white text-[19px] font-extrabold leading-none tracking-tight">
            Sistema EDO
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.25em] mt-1.5 opacity-80">
            Premium V2
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar-hide">
        {navSections.map((section) => {
          const visibleItems = filterItems(section.items)
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title}>
              <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 opacity-70">
                {section.title}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 relative overflow-hidden',
                        isActive
                          ? 'bg-primary/10 text-primary dark:text-white border-l-4 border-primary rounded-l-none pl-3'
                          : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5 hover:translate-x-1'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-[22px] h-[22px] transition-all duration-300',
                          isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors'
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className="tracking-tight">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Sign Out Only */}
      <div className="px-4 mt-auto">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-slate-500 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-[11px] uppercase tracking-widest group"
          >
            <LogOut className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
