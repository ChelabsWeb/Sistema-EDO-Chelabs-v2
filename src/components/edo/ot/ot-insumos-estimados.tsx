'use client'

import { formatPesos } from '@/lib/utils/currency'
import type { InsumoTipo } from '@/types/database'
import { Package, Users, Calculator, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Calculator className="w-10 h-10 mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">No hay fórmula definida</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-foreground" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg">Insumos Estimados</CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Base de cálculo: {cantidad} unidades
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {materiales.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Materiales Requeridos
            </h3>
            <div className="space-y-3">
              {materiales.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-background border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{item.insumos?.nombre}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      Intensidad: <span className="text-foreground font-bold">{(item.cantidad_estimada / cantidad).toFixed(3)}</span> {item.insumos?.unidad}/un
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatPesos(item.precio_estimado)}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">{item.cantidad_estimada.toFixed(2)} {item.insumos?.unidad}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {manoDeObra.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              Recurso Humano
            </h3>
            <div className="space-y-3">
              {manoDeObra.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 rounded-lg hover:border-orange-500/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{item.insumos?.nombre}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      Carga: <span className="text-orange-500 font-bold">{(item.cantidad_estimada / cantidad).toFixed(3)}</span> hs/un
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatPesos(item.precio_estimado)}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">{item.cantidad_estimada.toFixed(2)} {item.insumos?.unidad}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-muted/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-[10px] font-medium text-muted-foreground max-w-[200px] leading-tight">
            Inversión total incluyendo materiales y mano de obra directa.
          </p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Inversión Estimada Total</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{formatPesos(total)}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
