'use client'

import { OTStatusIcon } from './ot-status-badge'
import type { OTStatus } from '@/types/database'
import { AlertCircle, ArrowRight, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistorialItem {
  id: string
  estado_anterior: OTStatus | null
  estado_nuevo: OTStatus
  usuario_id: string
  notas: string | null
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
  usuarios: { id: string; nombre: string } | null
  acknowledged_usuario?: { id: string; nombre: string } | null
}

interface OTHistoryTimelineProps {
  historial: HistorialItem[]
}

const statusLabels: Record<OTStatus, string> = {
  borrador: 'Borrador',
  aprobada: 'Aprobada',
  en_ejecucion: 'Ejecución',
  cerrada: 'Cerrada',
}

export function OTHistoryTimeline({ historial }: OTHistoryTimelineProps) {
  if (historial.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-30">
        <Calendar className="w-10 h-10 mb-2" />
        <p className="text-sm font-medium">Sin actividad registrada</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-apple-blue/20 before:via-apple-gray-100 before:to-transparent dark:before:from-apple-blue/10 dark:before:via-white/5">
      {historial.map((item, idx) => (
        <div key={item.id} className="relative flex items-start group animate-apple-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
          {/* Indicator */}
          <div className="absolute left-0 w-10 h-10 rounded-full border-4 border-white dark:border-apple-gray-50 bg-apple-gray-50 dark:bg-white/10 flex items-center justify-center z-10 shadow-apple-sm transition-transform group-hover:scale-110">
            <OTStatusIcon estado={item.estado_nuevo} className="w-4 h-4" />
          </div>

          {/* Content Card */}
          <div className="ml-14 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-black text-apple-gray-400 uppercase tracking-widest">
                {item.usuarios?.nombre || 'Sistema'}
              </span>
              <span className="w-1 h-1 rounded-full bg-apple-gray-200" />
              <time className="text-[10px] font-medium text-apple-gray-300">
                {new Date(item.created_at).toLocaleDateString('es-UY', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </time>
            </div>

            <div className="p-4 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-apple-gray-100 dark:border-white/[0.05] group-hover:bg-white dark:group-hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-2 mb-2">
                {item.estado_anterior ? (
                  <>
                    <span className="text-[10px] px-2 py-0.5 bg-apple-gray-100 dark:bg-white/5 rounded-full text-apple-gray-400 font-bold uppercase tracking-tighter line-through opacity-50">
                      {statusLabels[item.estado_anterior]}
                    </span>
                    <ArrowRight className="w-3 h-3 text-apple-gray-300" />
                  </>
                ) : (
                  <span className="text-[9px] font-black text-apple-blue uppercase tracking-widest mr-1">Nueva</span>
                )}
                <span className="text-[10px] px-2 py-0.5 bg-apple-blue/10 text-apple-blue rounded-full font-black uppercase tracking-tighter">
                  {statusLabels[item.estado_nuevo]}
                </span>
              </div>

              {item.notas && (
                <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-300 leading-relaxed">
                  {item.notas}
                </p>
              )}

              {item.acknowledged_by && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-apple-gray-50">
                      {item.acknowledged_usuario?.nombre?.[0] || 'D'}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Desvío reconocido por {item.acknowledged_usuario?.nombre || 'Director'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
