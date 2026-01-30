'use client'

import { formatPesos } from '@/lib/utils/currency'
import type { RubroDeviationSummary } from '@/app/actions/costos'
import { TrendingUp, AlertTriangle, CheckCircle2, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RubroDeviationsProps {
  deviations: RubroDeviationSummary[]
}

const statusConfig = {
  ok: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Bajo Control' },
  warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle, label: 'Precaución' },
  alert: { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle, label: 'Sobrecosto' },
}

export function RubroDeviations({ deviations }: RubroDeviationsProps) {
  if (deviations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 bg-apple-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-inner">
          <Minus className="w-8 h-8 text-apple-gray-200" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Sin datos de desvío</p>
      </div>
    )
  }

  const totals = deviations.reduce(
    (acc, d) => ({
      presupuesto: acc.presupuesto + d.presupuesto,
      estimado: acc.estimado + d.costo_estimado_total,
      real: acc.real + d.costo_real_total,
      desvio: acc.desvio + d.desvio,
    }),
    { presupuesto: 0, estimado: 0, real: 0, desvio: 0 }
  )

  const totalDesvioPorcentaje = totals.estimado > 0
    ? (totals.desvio / totals.estimado) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {deviations.map((d) => {
          const config = statusConfig[d.status] || statusConfig.ok
          const Icon = config.icon

          return (
            <div key={d.rubro_id} className="p-4 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-apple-gray-100 dark:border-white/5 hover:border-apple-blue/20 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-sm", config.bg, config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors uppercase">{d.rubro_nombre}</h4>
                    <p className="text-[9px] font-bold text-apple-gray-300 uppercase tracking-widest">{d.ots_count} Órdenes Activas</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                    config.bg, config.color
                  )}>
                    {d.desvio_porcentaje > 0 ? '+' : ''}{d.desvio_porcentaje.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl border border-apple-gray-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-apple-gray-300 uppercase tracking-widest leading-none mb-1">Estimado</p>
                  <p className="text-xs font-black text-foreground tracking-tight">{formatPesos(d.costo_estimado_total)}</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl border border-apple-gray-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-apple-gray-300 uppercase tracking-widest leading-none mb-1">Real</p>
                  <p className="text-xs font-black text-foreground tracking-tight">{d.costo_real_total > 0 ? formatPesos(d.costo_real_total) : '-'}</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl border border-apple-gray-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-apple-gray-300 uppercase tracking-widest leading-none mb-1">Diferencia</p>
                  <p className={cn(
                    "text-xs font-black tracking-tight",
                    d.desvio > 0 ? "text-red-500" : d.desvio < 0 ? "text-emerald-500" : "text-foreground"
                  )}>
                    {d.desvio > 0 ? '+' : ''}{formatPesos(d.desvio)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mini Summary Footer */}
      <div className="p-6 bg-apple-blue/[0.03] dark:bg-apple-blue/10 rounded-[32px] border border-apple-blue/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-apple-blue uppercase tracking-[0.2em] mb-1">Desvío Global Obra</p>
            <h4 className={cn(
              "text-xl font-black tracking-tighter",
              totals.desvio > 0 ? "text-red-500" : "text-emerald-500"
            )}>
              {totals.desvio > 0 ? '+' : ''}{formatPesos(totals.desvio)}
            </h4>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-apple-gray-400 uppercase tracking-widest leading-none mb-1">Eficiencia</p>
            <p className="text-sm font-black text-foreground">{(100 - totalDesvioPorcentaje).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
