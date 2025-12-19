'use client'

import type { RequisicionEstado } from '@/types/database'

interface RequisicionEstadoBadgeProps {
  estado: RequisicionEstado
  size?: 'sm' | 'md'
}

const estadoConfig: Record<RequisicionEstado, { label: string; color: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  en_proceso: {
    label: 'En Proceso',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  completada: {
    label: 'Completada',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}

export function RequisicionEstadoBadge({ estado, size = 'md' }: RequisicionEstadoBadgeProps) {
  const config = estadoConfig[estado]

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses}`}
    >
      {config.label}
    </span>
  )
}
