'use client'

import { OTStatusBadge } from './ot-status-badge'
import type { OTStatus } from '@/types/database'
import { ArrowRight, Calendar, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

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
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
        <Calendar className="w-10 h-10 mb-4 text-muted-foreground opacity-50" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sin actividad registrada</p>
      </div>
    )
  }

  return (
    <div className="relative pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-border">
      <div className="space-y-6">
        {historial.map((item) => (
          <div key={item.id} className="relative group">
            <div className="absolute -left-[32px] mt-1.5 w-4 h-4 rounded-full border-[3px] border-background bg-primary ring-1 ring-border shadow-sm z-10" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  {item.usuarios?.nombre || 'Sistema'}
                </span>
                <span className="w-1 h-1 rounded-full bg-border md:hidden" />
                <time className="text-[10px] font-semibold text-muted-foreground md:hidden">
                  {new Date(item.created_at).toLocaleDateString('es-UY', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </time>
              </div>

              <time className="hidden md:block text-[10px] font-semibold text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString('es-UY', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </time>
            </div>

            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {item.estado_anterior ? (
                    <>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider line-through decoration-muted-foreground/50 opacity-60">
                        {statusLabels[item.estado_anterior]}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Nueva</span>
                  )}
                  <OTStatusBadge estado={item.estado_nuevo} size="sm" />
                </div>

                {item.notas && (
                  <p className="text-sm font-medium text-foreground mt-2">
                    {item.notas}
                  </p>
                )}

                {item.acknowledged_by && (
                  <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg">
                    <div className="flex -space-x-2 shrink-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-background">
                        {item.acknowledged_usuario?.nombre?.[0] || 'D'}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Desvío reconocido por {item.acknowledged_usuario?.nombre || 'Director'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
