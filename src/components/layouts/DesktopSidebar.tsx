'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: UserRole[] // If undefined, visible to all
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/obras',
    label: 'Obras',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/compras/ordenes-compra',
    label: 'Órdenes de Compra',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    roles: ['admin', 'director_obra', 'jefe_obra', 'compras'],
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    roles: ['admin', 'director_obra'],
  },
  {
    href: '/papelera',
    label: 'Papelera',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
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

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!userRole) return false
    return item.roles.includes(userRole)
  })

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[--color-apple-gray-50]/80 backdrop-blur-xl border-r border-[--color-apple-gray-200]/50 flex flex-col">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[--color-apple-gray-200]/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[--color-apple-blue-light] to-[--color-apple-blue] rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,102,204,0.3)]">
            <span className="text-white font-bold text-sm">EDO</span>
          </div>
          <span className="font-semibold text-[--color-apple-gray-600] tracking-tight">Sistema EDO</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[--color-apple-blue]/10 text-[--color-apple-blue] border-l-[3px] border-[--color-apple-blue] pl-[9px]'
                  : 'text-[--color-apple-gray-500] hover:bg-[--color-apple-gray-100]/50 hover:text-[--color-apple-gray-600]'
              )}
            >
              <span className={cn(isActive && 'text-[--color-apple-blue]')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-[--color-apple-gray-200]/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[--color-apple-gray-200] to-[--color-apple-gray-300] rounded-full flex items-center justify-center">
            <span className="text-[--color-apple-gray-600] font-medium text-sm">
              {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[--color-apple-gray-600] truncate">
              {userName || userEmail}
            </p>
            <p className="text-xs text-[--color-apple-gray-400]">
              {getRoleDisplayName(userRole)}
            </p>
          </div>
        </div>
        <form action="/api/auth/signout" method="post" className="mt-3">
          <button
            type="submit"
            className="w-full text-left text-sm text-[--color-apple-gray-400] hover:text-[--color-apple-gray-600] px-3 py-2 rounded-[10px] hover:bg-[--color-apple-gray-100]/50 transition-all duration-200"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
