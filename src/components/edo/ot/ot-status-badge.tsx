'use client'

import { cn } from '@/lib/utils'
import type { OTStatus } from '@/types/database'
import { FileEdit, CheckCircle2, Zap, Lock, Activity, type LucideIcon } from 'lucide-react'

interface OTStatusBadgeProps {
  estado: OTStatus | string
  size?: 'sm' | 'default'
  className?: string
}

interface StatusConfig {
  label: string
  className: string
  icon: LucideIcon
  colorClass: string
}

const statusConfig: Record<OTStatus, StatusConfig> = {
  borrador: {
    label: 'Borrador',
    className: 'bg-apple-gray-100/50 text-apple-gray-500 border-apple-gray-200/50 dark:bg-white/5 dark:text-apple-gray-400 dark:border-white/10',
    icon: FileEdit,
    colorClass: 'text-apple-gray-400'
  },
  aprobada: {
    label: 'Aprobada',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
    icon: CheckCircle2,
    colorClass: 'text-sky-500'
  },
  en_ejecucion: {
    label: 'En Ejecución',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    icon: Zap,
    colorClass: 'text-amber-500'
  },
  cerrada: {
    label: 'Cerrada',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    icon: Lock,
    colorClass: 'text-emerald-500'
  },
}

export function OTStatusBadge({ estado, size = 'default', className }: OTStatusBadgeProps) {
  const config = statusConfig[estado as OTStatus] || {
    label: estado,
    className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400',
    icon: Activity,
    colorClass: 'text-slate-400'
  }

  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-black uppercase tracking-widest border transition-all duration-300',
        size === 'sm' ? 'px-2 py-0.5 text-[9px] rounded-lg' : 'px-3 py-1 text-[10px] rounded-xl',
        config.className,
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5', config.colorClass)} strokeWidth={3} />
      {config.label}
    </span>
  )
}

export function OTStatusIcon({ estado, className }: { estado: OTStatus | string, className?: string }) {
  const config = statusConfig[estado as OTStatus] || { icon: Activity, colorClass: 'text-slate-400 outline-none' }
  const Icon = config.icon

  return <Icon className={cn("w-4 h-4", config.colorClass, className)} strokeWidth={2.5} />
}
