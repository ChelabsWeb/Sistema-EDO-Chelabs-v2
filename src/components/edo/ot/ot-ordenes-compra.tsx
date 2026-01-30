'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import type { OrdenCompraWithRelations, Insumo } from '@/types/database'
import { CreateOCFromOTModal } from './create-oc-from-ot-modal'
import { ShoppingCart, Plus, ChevronRight, Package, Truck, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-apple-blue" />
          </div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">Órdenes de Compra</h3>
        </div>
        {canCreate && insumos.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-apple-blue text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-apple-blue-dark transition-all active:scale-95 shadow-apple-sm group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Nueva OC
          </button>
        )}
      </div>

      <div className="space-y-4">
        {ordenesCompra.length === 0 ? (
          <div className="text-center py-20 bg-apple-gray-50/50 dark:bg-black/10 rounded-[32px] border border-dashed border-apple-gray-200 dark:border-white/5 mx-2">
            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Package className="w-8 h-8 text-apple-gray-200" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Sin suministros registrados</p>
            {canCreate && insumos.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-xs font-black text-apple-blue uppercase tracking-widest hover:underline"
              >
                Crear primera orden de compra
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 mx-2">
            {ordenesCompra.map((oc) => {
              const config = estadoConfig[oc.estado || 'pendiente'] || estadoConfig.pendiente
              const Icon = config.icon

              return (
                <Link
                  key={oc.id}
                  href={`/compras/ordenes-compra/${oc.id}`}
                  className="group flex items-center justify-between p-6 bg-white dark:bg-apple-gray-50 rounded-[32px] border border-apple-gray-100 dark:border-white/5 hover:border-apple-blue/40 transition-all duration-500 shadow-apple hover:shadow-apple-float"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-sm", config.bg, config.color)}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-black text-foreground tracking-tight">OC-{oc.numero}</span>
                        <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border", config.bg, config.color, "border-current/10")}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-apple-gray-400">
                        Proveedor: <span className="text-foreground font-bold">{oc.proveedor || 'Sin especificar'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-black text-foreground tracking-tighter">{formatPesos(oc.total)}</p>
                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest mt-0.5">
                        <Package className="w-3 h-3" />
                        {oc.lineas?.length || 0} ITEMS
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-300 group-hover:bg-apple-blue group-hover:text-white transition-all duration-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
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
