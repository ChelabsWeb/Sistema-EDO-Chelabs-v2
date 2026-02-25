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
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 flex flex-col py-8 border-r border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="px-8 mb-10 flex items-center gap-4 group cursor-default">
        <Logo size={44} className="group-hover:scale-105 transition-transform duration-300" />
        <div>
          <h1 className="text-sidebar-foreground text-[19px] font-bold leading-none tracking-tight">
            Sistema EDO
          </h1>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-1.5 opacity-80">
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
              <p className="px-4 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest mb-4">
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
                        'group flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-all duration-200',
                          isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
                        )}
                        strokeWidth={2}
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="px-4 mt-auto">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all font-medium text-sm group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
