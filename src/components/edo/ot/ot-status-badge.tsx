'use client'

import { cn } from '@/lib/utils'
import type { OTStatus } from '@/types/database'

interface OTStatusBadgeProps {
  estado: OTStatus | string
  size?: 'sm' | 'default'
}

const statusConfig: Record<OTStatus, { label: string; className: string }> = {
  borrador: {
    label: 'Borrador',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  aprobada: {
    label: 'Aprobada',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  en_ejecucion: {
    label: 'En Ejecución',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  cerrada: {
    label: 'Cerrada',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
}

export function OTStatusBadge({ estado, size = 'default' }: OTStatusBadgeProps) {
  const config = statusConfig[estado as OTStatus] || statusConfig.borrador

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

export function OTStatusIcon({ estado }: { estado: OTStatus | string }) {
  switch (estado) {
    case 'borrador':
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    case 'aprobada':
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'en_ejecucion':
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'cerrada':
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    default:
      return null
  }
}
