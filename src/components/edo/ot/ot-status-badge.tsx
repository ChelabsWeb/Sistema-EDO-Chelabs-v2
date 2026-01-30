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
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  aprobada: {
    label: 'Aprobada',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  en_ejecucion: {
    label: 'En Ejecución',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  cerrada: {
    label: 'Cerrada',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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

export function OTStatusIcon({ estado, className }: { estado: OTStatus | string, className?: string }) {
  const iconProps = { className: cn("w-4 h-4", className) }

  switch (estado) {
    case 'borrador':
      return <FileEdit {...iconProps} className={cn("text-slate-500", className)} />
    case 'aprobada':
      return <CheckCircle2 {...iconProps} className={cn("text-sky-600", className)} />
    case 'en_ejecucion':
      return <Zap {...iconProps} className={cn("text-amber-600", className)} />
    case 'cerrada':
      return <Lock {...iconProps} className={cn("text-emerald-600", className)} />
    default:
      return <Activity {...iconProps} className={cn("text-slate-400", className)} />
  }
}

import { FileEdit, CheckCircle2, Zap, Lock, Activity } from 'lucide-react'
