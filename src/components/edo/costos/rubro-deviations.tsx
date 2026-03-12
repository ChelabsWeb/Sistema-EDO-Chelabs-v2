'use client'

import { formatPesos } from '@/lib/utils/currency'
import type { RubroDeviationSummary } from '@/app/actions/costos'
import { TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface RubroDeviationsProps {
  deviations: RubroDeviationSummary[]
}

export function RubroDeviations({ deviations }: RubroDeviationsProps) {
  if (deviations.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/20 border-2 border-dashed rounded-xl mx-4">
        <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h4 className="text-sm font-semibold text-foreground">Sin datos de desempeño</h4>
        <p className="text-xs text-muted-foreground mt-1">Aún no hay rubros con órdenes de trabajo presupuestadas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 pb-4">
      {deviations.map((d) => (
        <DeviationCard key={d.rubro_id} dev={d} />
      ))}
    </div>
  )
}

function DeviationCard({ dev }: { dev: RubroDeviationSummary }) {
  const isOk = dev.status === 'ok';
  const isWarning = dev.status === 'warning';
  const isAlert = dev.status === 'alert';

  const getStatusColor = () => {
      if (isAlert) return 'text-destructive';
      if (isWarning) return 'text-amber-500';
      return 'text-emerald-500';
  };

  return (
      <div className="p-5 border rounded-3xl bg-card hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                  <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isAlert ? "bg-destructive/10 text-destructive" :
                      isWarning ? "bg-amber-500/10 text-amber-500" :
                      "bg-emerald-500/10 text-emerald-500"
                  )}>
                      {isAlert ? <ShieldAlert className="w-5 h-5" /> : 
                       isWarning ? <AlertTriangle className="w-5 h-5" /> : 
                       <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                      <h4 className="font-bold text-sm tracking-tight uppercase text-foreground">{dev.rubro_nombre}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          {dev.ots_count} {dev.ots_count === 1 ? 'ORDEN ACTIVA' : 'ÓRDENES ACTIVAS'}
                      </p>
                  </div>
              </div>
              <Badge variant="secondary" className={cn(
                  "font-bold rounded-md px-2.5 py-1 text-xs",
                  isAlert && "bg-destructive/10 text-destructive hover:bg-destructive/20",
                  isWarning && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
                  isOk && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              )}>
                  {dev.desvio_porcentaje > 0 ? '+' : ''}{dev.desvio_porcentaje.toFixed(1)}%
              </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border rounded-xl bg-background/50">
                  <p className="text-[9px] font-bold text-foreground uppercase tracking-widest mb-1">Estimado</p>
                  <p className="font-bold text-sm text-foreground">{formatPesos(dev.costo_estimado_total)}</p>
              </div>
              <div className="p-3 border rounded-xl bg-background/50">
                  <p className="text-[9px] font-bold text-foreground uppercase tracking-widest mb-1">Real</p>
                  <p className="font-bold text-sm text-foreground">{formatPesos(dev.costo_real_total)}</p>
              </div>
              <div className="p-3 border rounded-xl bg-background/50">
                  <p className="text-[9px] font-bold text-foreground uppercase tracking-widest mb-1">Diferencia</p>
                  <p className={cn(
                      "font-bold text-sm",
                      getStatusColor()
                  )}>
                      {dev.desvio > 0 && '+'}{formatPesos(dev.desvio)}
                  </p>
              </div>
          </div>
      </div>
  )
}
