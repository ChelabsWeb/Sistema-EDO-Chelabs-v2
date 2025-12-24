'use client'

import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { getRoleAbbreviation } from '@/lib/roles'

interface MobileHeaderProps {
  userRole: UserRole | null
  userName: string | null
  title?: string
}

export function MobileHeader({ userRole, userName, title = 'Sistema EDO' }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-xl border-b border-[--color-apple-gray-200]/50 flex items-center justify-between px-4 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-[--color-apple-blue-light] to-[--color-apple-blue] rounded-[8px] flex items-center justify-center shadow-[0_2px_6px_rgba(0,102,204,0.25)]">
          <span className="text-white font-bold text-xs">EDO</span>
        </div>
        <span className="font-semibold text-[--color-apple-gray-600] text-sm tracking-tight">{title}</span>
      </Link>

      <div className="flex items-center gap-2">
        {userRole && (
          <span className="px-2.5 py-1 bg-[--color-apple-blue]/10 text-[--color-apple-blue] text-xs font-medium rounded-full border border-[--color-apple-blue]/20">
            {getRoleAbbreviation(userRole)}
          </span>
        )}
        <Link
          href="/perfil"
          className="w-8 h-8 bg-gradient-to-br from-[--color-apple-gray-200] to-[--color-apple-gray-300] rounded-full flex items-center justify-center"
        >
          <span className="text-[--color-apple-gray-600] font-medium text-xs">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </Link>
      </div>
    </header>
  )
}
