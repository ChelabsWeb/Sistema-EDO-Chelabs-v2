'use client'

import { formatPesos } from '@/lib/utils/currency'
import type { InsumoTipo } from '@/types/database'
import { Package, Users, Calculator, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsumoEstimado {
  id: string
  orden_trabajo_id: string
  insumo_id: string
  cantidad_estimada: number
  precio_estimado: number
  insumos: {
    id: string
    nombre: string
    unidad: string
    tipo: InsumoTipo | null
  } | null
}

interface OTInsumosEstimadosProps {
  insumos: InsumoEstimado[]
  cantidad: number
}

export function OTInsumosEstimados({ insumos, cantidad }: OTInsumosEstimadosProps) {
  const total = insumos.reduce((sum, i) => sum + i.precio_estimado, 0)
  const materiales = insumos.filter((i) => i.insumos?.tipo === 'material')
  const manoDeObra = insumos.filter((i) => i.insumos?.tipo === 'mano_de_obra')

  if (insumos.length === 0) {
    return (
      <div className="p-10 bg-apple-gray-50/10 dark:bg-black/10 rounded-[32px] border border-dashed border-apple-gray-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
        <Calculator className="w-12 h-12 mb-4 text-apple-gray-200" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">No hay fórmula definida</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-apple-gray-50 rounded-[40px] border border-apple-gray-100 dark:border-white/[0.05] shadow-apple-float">
      <div className="p-10 pb-4 flex justify-between items-center bg-apple-gray-50/30 dark:bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-apple-blue" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Insumos Estimados</h2>
            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Base de cálculo: {cantidad} unidades</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {materiales.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-apple-blue" />
              Materiales Requeridos
            </h3>
            <div className="grid gap-3">
              {materiales.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-apple-gray-100 dark:border-white/[0.05] hover:border-apple-blue/20 transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{item.insumos?.nombre}</p>
                    <p className="text-[10px] text-apple-gray-400 font-medium">
                      Intensidad: <span className="text-apple-blue font-black">{(item.cantidad_estimada / cantidad).toFixed(3)}</span> {item.insumos?.unidad}/un
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{formatPesos(item.precio_estimado)}</p>
                    <p className="text-[10px] font-medium text-apple-gray-300">{item.cantidad_estimada.toFixed(2)} {item.insumos?.unidad}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {manoDeObra.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-orange-500" />
              Recurso Humano
            </h3>
            <div className="grid gap-3">
              {manoDeObra.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-orange-500/[0.02] dark:bg-orange-500/[0.05] rounded-2xl border border-orange-500/10 hover:border-orange-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{item.insumos?.nombre}</p>
                    <p className="text-[10px] text-orange-500/60 font-medium">
                      Carga: <span className="font-black">{(item.cantidad_estimada / cantidad).toFixed(3)}</span> hs/un
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{formatPesos(item.precio_estimado)}</p>
                    <p className="text-[10px] font-medium text-apple-gray-300">{item.cantidad_estimada.toFixed(2)} {item.insumos?.unidad}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-apple-blue text-white flex justify-between items-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[60px] translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="relative z-10">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Inversión Estimada Total</p>
          <p className="text-3xl font-black tracking-tighter">{formatPesos(total)}</p>
        </div>
        <div className="relative z-10 flex flex-col items-end">
          <Info className="w-5 h-5 text-white/40 mb-1" />
          <p className="text-[9px] font-medium text-white/60 max-w-[120px] text-right leading-tight">Incluye materiales y mano de obra directa.</p>
        </div>
      </div>
    </div>
  )
}
