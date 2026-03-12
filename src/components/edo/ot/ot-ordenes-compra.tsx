'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import type { OrdenCompraWithRelations, Insumo } from '@/types/database'
import { CreateOCFromOTModal } from './create-oc-from-ot-modal'
import { Plus, ChevronRight, Package, Truck, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  otId: string
  obraId: string
  ordenesCompra: OrdenCompraWithRelations[]
  insumos: Insumo[]
  canCreate: boolean
}

const estadoConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-500/10', icon: AlertCircle },
  enviada: { label: 'Enviada', color: 'text-blue-600', bg: 'bg-blue-500/10', icon: Truck },
  recibida_parcial: { label: 'Parcial', color: 'text-orange-600', bg: 'bg-orange-500/10', icon: Package },
  recibida_completa: { label: 'Recibida', color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  cancelada: { label: 'Cancelada', color: 'text-red-600', bg: 'bg-red-500/10', icon: XCircle },
}

export function OTOrdenesCompra({ otId, obraId, ordenesCompra, insumos, canCreate }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Órdenes de Compra</h3>
        </div>
        {canCreate && insumos.length > 0 && (
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva OC
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {ordenesCompra.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
            <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mx-auto mb-4 border">
              <Package className="w-6 h-6 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sin suministros registrados</p>
            {canCreate && insumos.length > 0 && (
              <Button
                variant="link"
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-xs font-bold uppercase tracking-widest"
              >
                Crear primera orden de compra
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {ordenesCompra.map((oc) => {
              const config = estadoConfig[oc.estado || 'pendiente'] || estadoConfig.pendiente
              const Icon = config.icon

              return (
                <Link
                  key={oc.id}
                  href={`/compras/ordenes-compra/${oc.id}`}
                  className="block"
                >
                  <Card className="hover:border-primary/50 transition-colors group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bg, config.color)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-bold text-foreground tracking-tight">OC-{oc.numero}</span>
                            <Badge variant="outline" className={cn("px-2 py-0 text-[10px] uppercase tracking-wider border-current/20", config.bg, config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Proveedor: <span className="text-foreground font-bold">{oc.proveedor || 'Sin especificar'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-base font-bold text-foreground tracking-tight">{formatPesos(oc.total)}</p>
                          <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            <Package className="w-3 h-3" />
                            {oc.lineas?.length || 0} ITEMS
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateOCFromOTModal
          otId={otId}
          obraId={obraId}
          insumos={insumos}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
