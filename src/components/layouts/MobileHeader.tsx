'use client'

import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { getRoleAbbreviation } from '@/lib/roles'
import { Logo } from '@/components/shared/Logo'

interface MobileHeaderProps {
  userRole: UserRole | null
  userName: string | null
  title?: string
}

export function MobileHeader({ userRole, userName, title = 'Sistema EDO' }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 z-50">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Logo size={32} />
        <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{title}</span>
      </Link>

      <div className="flex items-center gap-2">
        {userRole && (
          <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
            {getRoleAbbreviation(userRole)}
          </span>
        )}
        <Link
          href="/perfil"
          className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/20 rounded-full flex items-center justify-center overflow-hidden"
        >
          <span className="text-slate-700 dark:text-white font-medium text-xs">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </Link>
      </div>
    </header>
  )
}
