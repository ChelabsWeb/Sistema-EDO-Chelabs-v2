'use client'

import type { Insumo } from '@/types/database'
import { Package, Users, Edit3, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'

interface InsumoItemProps {
  insumo: Insumo
  canEdit: boolean
  onEdit: () => void
  onRemove: () => void
  isRemoving?: boolean
}

export function InsumoItem({ insumo, canEdit, onEdit, onRemove, isRemoving }: InsumoItemProps) {
  const isMaterial = insumo.tipo === 'material'

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.03] border border-apple-gray-100 dark:border-white/5 rounded-2xl hover:border-apple-blue/20 hover:shadow-apple-sm transition-all duration-300 group">
      <div className="flex items-center gap-4">
        {/* Tipo Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
            isMaterial ? "bg-apple-blue/10 text-apple-blue" : "bg-indigo-500/10 text-indigo-500"
          )}
        >
          {isMaterial ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
        </div>

        {/* Insumo Info */}
        <div>
          <p className="text-sm font-black text-foreground group-hover:text-apple-blue transition-colors outline-none font-display uppercase tracking-tight">{insumo.nombre}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-apple-gray-500 bg-apple-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-apple-gray-200 dark:border-white/10">{insumo.unidad}</span>
            <span className="w-1 h-1 rounded-full bg-apple-gray-200 dark:bg-white/10" />
            <span className="text-xs font-black text-foreground/70">
              {formatPesos(insumo.precio_unitario || insumo.precio_referencia)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="w-9 h-9 flex items-center justify-center text-apple-gray-300 hover:text-apple-blue hover:bg-apple-blue/10 rounded-xl transition-all"
            title="Editar insumo"
          >
            <Edit3 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            disabled={isRemoving}
            className="w-9 h-9 flex items-center justify-center text-apple-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
            title="Quitar del rubro"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
