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
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">EDO</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
      </Link>

      <div className="flex items-center gap-2">
        {userRole && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {getRoleAbbreviation(userRole)}
          </span>
        )}
        <Link
          href="/perfil"
          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
        >
          <span className="text-gray-600 font-medium text-xs">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </Link>
      </div>
    </header>
  )
}
