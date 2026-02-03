'use client'

import { useState, useEffect } from 'react'
import type { Insumo } from '@/types/database'
import { getAvailableInsumosForRubro, addInsumoToRubro } from '@/app/actions/rubro-insumos'
import { Search, Plus, Package, Users, Tag, DollarSign, X, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPesos } from '@/lib/utils/currency'

interface AddInsumoSelectorProps {
  rubroId: string
  onClose: () => void
  onAdded: () => void
}

export function AddInsumoSelector({ rubroId, onClose, onAdded }: AddInsumoSelectorProps) {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'material' | 'mano_de_obra'>('material')

  useEffect(() => {
    loadInsumos()
  }, [rubroId])

  const loadInsumos = async () => {
    setLoading(true)
    const result = await getAvailableInsumosForRubro(rubroId)
    setLoading(false)
    if (result.success && result.data) {
      setInsumos(result.data)
    }
  }

  const handleAdd = async (insumoId: string) => {
    setAdding(insumoId)
    const result = await addInsumoToRubro(rubroId, insumoId)
    setAdding(null)

    if (result.success) {
      onAdded()
    }
  }

  const filteredInsumos = insumos.filter(
    (i) =>
      (i.nombre.toLowerCase().includes(search.toLowerCase()) ||
        i.unidad.toLowerCase().includes(search.toLowerCase())) &&
      i.tipo === activeTab
  )

  return (
    <div className="bg-white dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 shadow-apple-lg overflow-hidden animate-apple-slide-up">
      {/* Header */}
      <div className="px-8 py-6 bg-apple-gray-50/50 dark:bg-white/[0.02] border-b border-apple-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Vincular Suministro</h4>
            <p className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-tighter mt-1">Maestro de obra actual</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-apple-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex p-1.5 bg-apple-gray-100/50 dark:bg-white/5 rounded-2xl border border-apple-gray-200/50 dark:border-white/5 shrink-0">
            {(['material', 'mano_de_obra'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab
                    ? "bg-white dark:bg-apple-gray-50 text-apple-blue shadow-apple-sm scale-105"
                    : "text-apple-gray-400 hover:text-foreground"
                )}
              >
                {tab === 'material' ? 'Materiales' : 'Recursos'}
              </button>
            ))}
          </div>

          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-300 group-focus-within:text-apple-blue transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nombre o unidad..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-black/20 border border-apple-gray-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue outline-none transition-all placeholder:text-apple-gray-200"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-none space-y-3 pr-2">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-200">Consultando Maestro...</p>
            </div>
          ) : filteredInsumos.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-apple-gray-50/50 dark:bg-white/[0.01] rounded-[32px] border border-dashed border-apple-gray-100 dark:border-white/5">
              <Package className="w-12 h-12 text-apple-gray-100 mx-auto" />
              <p className="text-sm font-medium text-apple-gray-400 italic">
                {search ? 'No se encontraron coincidencias' : 'Todos los ítems están vinculados'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode='popLayout'>
                {filteredInsumos.map((insumo) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={insumo.id}
                    className="group p-5 bg-white dark:bg-white/[0.03] border border-apple-gray-100 dark:border-white/5 rounded-[24px] hover:border-apple-blue/30 hover:shadow-apple-float transition-all duration-500 flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner",
                        insumo.tipo === 'material' ? "bg-apple-blue/10 text-apple-blue" : "bg-indigo-500/10 text-indigo-500"
                      )}>
                        {insumo.tipo === 'material' ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                      </div>
                      <div>
                        <h5 className="text-base font-black text-foreground tracking-tight group-hover:text-apple-blue transition-colors leading-none">{insumo.nombre}</h5>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-apple-gray-300 px-2 py-0.5 bg-apple-gray-50 dark:bg-white/5 rounded-md border border-current/10">{insumo.unidad}</span>
                          <span className="w-1 h-1 rounded-full bg-apple-gray-100" />
                          <span className="text-xs font-bold text-apple-gray-400">{formatPesos(insumo.precio_unitario || insumo.precio_referencia)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdd(insumo.id)}
                      disabled={adding === insumo.id}
                      className={cn(
                        "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                        adding === insumo.id
                          ? "bg-apple-gray-50 text-apple-gray-300"
                          : "bg-apple-blue text-white shadow-apple-sm hover:bg-apple-blue-dark"
                      )}
                    >
                      {adding === insumo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {adding === insumo.id ? 'Añadiendo' : 'Añadir'}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-apple-blue/[0.03] border-t border-apple-gray-100 dark:border-white/5 flex items-center gap-3">
        <Info className="w-4 h-4 text-apple-blue shrink-0" />
        <p className="text-[10px] font-bold text-apple-blue/70 uppercase tracking-tight leading-relaxed">
          Los insumos aquí listados provienen del Maestro General de esta obra.
        </p>
      </div>
    </div>
  )
}
