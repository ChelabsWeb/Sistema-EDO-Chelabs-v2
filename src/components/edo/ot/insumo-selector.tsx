'use client'

import { useState, useMemo } from 'react'
import { formatPesos } from '@/lib/utils/currency'
import {
  Package, Users, Trash2, PlusCircle, Search,
  ChevronRight, Calculator, X, Layers, ShoppingCart,
  ArrowDownCircle, Plus, Info, Sparkles, Box, Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface InsumoSeleccionado {
  insumo_id: string
  nombre: string
  unidad: string
  cantidad: number
  precio_unitario: number
}

interface InsumoObra {
  id: string
  nombre: string
  unidad: string
  tipo: 'material' | 'mano_de_obra'
  precio_referencia: number | null
  precio_unitario: number | null
}

interface InsumoSelectorProps {
  obraId: string
  insumosObra: InsumoObra[]
  onChange: (insumos: InsumoSeleccionado[]) => void
  initialSelection?: InsumoSeleccionado[]
  isLoading?: boolean
}

export function InsumoSelector({
  obraId,
  insumosObra,
  onChange,
  initialSelection = [],
  isLoading = false,
}: InsumoSelectorProps) {
  const [insumos, setInsumos] = useState<InsumoSeleccionado[]>(initialSelection)
  const [showAddInsumo, setShowAddInsumo] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Available insumos to add (not already in the list)
  const insumosDisponibles = useMemo(() => {
    const idsEnLista = new Set(insumos.map((i) => i.insumo_id))
    return insumosObra.filter(
      (i) =>
        !idsEnLista.has(i.id) &&
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [insumosObra, insumos, searchTerm])

  // Calculate totals
  const totales = useMemo(() => {
    const materiales = insumos.filter((i) => {
      const insumoObra = insumosObra.find((io) => io.id === i.insumo_id)
      return insumoObra?.tipo === 'material'
    })
    const manoDeObra = insumos.filter((i) => {
      const insumoObra = insumosObra.find((io) => io.id === i.insumo_id)
      return insumoObra?.tipo === 'mano_de_obra'
    })

    const costoMateriales = materiales.reduce(
      (sum, i) => sum + i.cantidad * i.precio_unitario,
      0
    )
    const costoManoDeObra = manoDeObra.reduce(
      (sum, i) => sum + i.cantidad * i.precio_unitario,
      0
    )

    return {
      total: costoMateriales + costoManoDeObra,
      materiales: costoMateriales,
      manoDeObra: costoManoDeObra,
      cantidadSeleccionados: insumos.length,
    }
  }, [insumos, insumosObra])

  const updateInsumos = (nuevosInsumos: InsumoSeleccionado[]) => {
    setInsumos(nuevosInsumos)
    onChange(nuevosInsumos)
  }

  const updateCantidad = (insumoId: string, cantidad: number) => {
    const nuevosInsumos = insumos.map((i) =>
      i.insumo_id === insumoId ? { ...i, cantidad: Math.max(0, cantidad) } : i
    )
    updateInsumos(nuevosInsumos)
  }

  const addInsumo = (insumoObra: InsumoObra) => {
    const nuevoInsumo: InsumoSeleccionado = {
      insumo_id: insumoObra.id,
      nombre: insumoObra.nombre,
      unidad: insumoObra.unidad,
      cantidad: 0,
      precio_unitario: insumoObra.precio_referencia || insumoObra.precio_unitario || 0,
    }
    updateInsumos([...insumos, nuevoInsumo])
    setShowAddInsumo(false)
    setSearchTerm('')
  }

  const removeInsumo = (insumoId: string) => {
    updateInsumos(insumos.filter((i) => i.insumo_id !== insumoId))
  }

  if (isLoading) {
    return (
      <div className="p-12 glass rounded-[40px] border border-apple-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-4 animate-apple-fade-in">
        <div className="w-12 h-12 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
        <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Consultando Inventario Maestro...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-apple-slide-up">
      {/* Selected Items List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {insumos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-24 border-2 border-dashed border-apple-gray-100 dark:border-white/5 rounded-[64px] text-center group hover:border-apple-blue/20 transition-all duration-700 bg-white/30 dark:bg-black/10"
            >
              <div className="w-24 h-24 bg-apple-gray-50 dark:bg-apple-gray-50/5 rounded-[40px] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Box className="w-12 h-12 text-apple-gray-200" />
              </div>
              <p className="text-2xl font-black text-foreground tracking-tighter uppercase">Carga de Operaciones Vacía</p>
              <p className="text-sm font-bold text-apple-gray-400 mt-3 uppercase tracking-widest leading-loose max-w-sm mx-auto">
                No has vinculado materiales ni mano de obra.<br />Agrega recursos para calcular el costo.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {insumos.map((insumo, idx) => {
                const itemObra = insumosObra.find(io => io.id === insumo.insumo_id)
                const isManoDeObra = itemObra?.tipo === 'mano_de_obra'

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    key={insumo.insumo_id}
                    className="group bg-white dark:bg-apple-gray-50/50 border border-apple-gray-100 dark:border-white/5 rounded-[40px] p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:shadow-apple-float hover:border-apple-blue/20 transition-all duration-500"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-500 relative overflow-hidden",
                        isManoDeObra ? "bg-orange-500 text-white shadow-orange-500/20" : "bg-apple-blue text-white shadow-apple-blue/20"
                      )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        {isManoDeObra ? <Users className="w-8 h-8 relative z-10" /> : <Package className="w-8 h-8 relative z-10" />}
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-foreground tracking-tight uppercase">{insumo.nombre}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag size={12} className="text-apple-gray-300" />
                          <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">
                            Valor REF: <span className="text-foreground">{formatPesos(insumo.precio_unitario)}</span> / {insumo.unidad}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-12 lg:gap-16">
                      {/* Quantity Input */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] px-1">Cantidad a Ejecutar</label>
                        <div className="relative group/field flex items-center bg-apple-gray-100/50 dark:bg-black/40 rounded-[24px] border border-apple-gray-100 dark:border-white/10 p-1 pr-6 hover:border-apple-blue transition-all">
                          <input
                            type="number"
                            value={insumo.cantidad || ''}
                            onChange={(e) => updateCantidad(insumo.insumo_id, parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-28 px-6 py-4 bg-transparent text-lg font-black text-foreground outline-none tracking-tighter placeholder:text-apple-gray-100"
                          />
                          <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">{insumo.unidad}</span>
                        </div>
                      </div>

                      {/* Subtotal Display */}
                      <div className="min-w-[160px] text-right">
                        <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] mb-1">Subtotal Estimado</p>
                        <p className="text-3xl font-black text-foreground tracking-tighter">
                          {formatPesos(insumo.cantidad * insumo.precio_unitario)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeInsumo(insumo.insumo_id)}
                        className="w-14 h-14 rounded-[24px] bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-500/10 group/btn"
                      >
                        <Trash2 className="w-5 h-5 transition-transform group-hover/btn:rotate-12" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Resource Selector */}
      <div className="pt-4">
        {showAddInsumo ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-apple-gray-50 border-2 border-apple-blue rounded-[56px] p-10 shadow-[0_40px_100px_rgba(0,122,255,0.15)] space-y-8 relative overflow-hidden"
          >
            {/* Glossy Header for Search Container */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 font-sans">
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center gap-3 px-4">
                  <Sparkles className="w-5 h-5 text-apple-blue animate-pulse-soft" />
                  <p className="text-[11px] font-black text-apple-blue uppercase tracking-[0.3em]">Master de Insumos & Servicios</p>
                </div>
                <div className="relative group">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-apple-gray-300 group-focus-within:text-apple-blue transition-all" />
                  <input
                    type="text"
                    placeholder="Escriba material, servicio o cuadrilla..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-20 pl-20 pr-10 bg-apple-gray-50 dark:bg-black/30 border border-apple-gray-200 dark:border-white/10 rounded-[32px] text-xl font-black text-foreground outline-none focus:ring-8 focus:ring-apple-blue/10 transition-all placeholder:text-apple-gray-200 shadow-inner"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowAddInsumo(false); setSearchTerm('') }}
                className="w-20 h-20 rounded-[32px] bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all group/close"
              >
                <X className="w-8 h-8 transition-transform group-close:rotate-90" />
              </button>
            </div>

            {/* Results Grid with Smooth Scroll */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar relative z-10 p-2">
              {insumosDisponibles.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-apple-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-30">
                    <Search className="w-10 h-10" />
                  </div>
                  <p className="text-xl font-bold text-apple-gray-300 tracking-tight">No se encontraron suministros con esos criterios.</p>
                </div>
              ) : (
                insumosDisponibles.slice(0, 15).map((insumo, idx) => (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    key={insumo.id}
                    type="button"
                    onClick={() => addInsumo(insumo)}
                    className="w-full p-6 bg-apple-gray-50/50 dark:bg-white/[0.03] hover:bg-apple-blue text-foreground hover:text-white border border-apple-gray-100 dark:border-white/5 rounded-[32px] flex flex-col gap-4 transition-all group/item shadow-sm active:scale-95 text-left relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between relative z-10 w-full">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        insumo.tipo === 'mano_de_obra' ? "bg-orange-500/10 text-orange-500" : "bg-apple-blue/10 text-apple-blue",
                        "group-hover/item:bg-white/20 group-hover/item:text-white"
                      )}>
                        {insumo.tipo === 'mano_de_obra' ? <Users size={20} /> : <Package size={20} />}
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[15px] font-black tracking-tight leading-tight mb-1 group-hover/item:text-white transition-colors">{insumo.nombre}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover/item:opacity-100">
                        {formatPesos(insumo.precio_referencia || 0)} / {insumo.unidad}
                      </p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddInsumo(true)}
            className="w-full h-24 bg-white dark:bg-apple-gray-50 border-2 border-dashed border-apple-gray-200 dark:border-white/10 rounded-[48px] flex items-center justify-center gap-6 hover:border-apple-blue hover:bg-apple-blue/5 group transition-all active:scale-[0.98] shadow-apple-sm"
          >
            <div className="w-14 h-14 bg-apple-blue text-white rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-all shadow-xl shadow-apple-blue/20">
              <PlusCircle className="w-7 h-7" />
            </div>
            <span className="text-base font-black text-apple-gray-400 group-hover:text-apple-blue uppercase tracking-[0.3em] transition-colors">Vincular Recurso Adicional</span>
          </button>
        )}
      </div>

      {/* Aggregate Totals Bento */}
      <AnimatePresence>
        {insumos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-apple-gray-50/50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 rounded-[56px] p-12 mt-12 shadow-apple-float"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="space-y-10 flex-1 w-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-black text-apple-gray-400 uppercase tracking-[0.2em] px-3">
                    <div className="flex items-center gap-3"><Package className="w-5 h-5 text-apple-blue" /> Materiales Obra</div>
                    <span className="text-foreground">{formatPesos(totales.materiales)}</span>
                  </div>
                  <div className="h-2 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(totales.materiales / (totales.total || 1)) * 100}%` }}
                      className="h-full bg-apple-blue rounded-full shadow-[0_0_15px_rgba(0,122,255,0.4)]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-black text-apple-gray-400 uppercase tracking-[0.2em] px-3">
                    <div className="flex items-center gap-3"><Users className="w-5 h-5 text-orange-500" /> Mano de Obra (MO)</div>
                    <span className="text-foreground">{formatPesos(totales.manoDeObra)}</span>
                  </div>
                  <div className="h-2 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(totales.manoDeObra / (totales.total || 1)) * 100}%` }}
                      className="h-full bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    />
                  </div>
                </div>
              </div>

              <div className="w-px h-32 bg-apple-gray-100 dark:bg-white/10 hidden lg:block" />

              <div className="text-center lg:text-right space-y-4">
                <div className="flex items-center justify-center lg:justify-end gap-3 text-apple-blue">
                  <ShoppingCart className="w-8 h-8" />
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-1">Impacto de Ejecución</p>
                </div>
                <h4 className="text-6xl font-black text-foreground tracking-tighter selection:bg-apple-blue/20">{formatPesos(totales.total)}</h4>
                <div className="flex items-center justify-center lg:justify-end gap-2 text-[10px] font-black text-apple-gray-400 uppercase tracking-widest bg-apple-gray-100 dark:bg-white/5 py-2 px-6 rounded-full inline-flex">
                  <Layers size={14} className="text-apple-blue" />
                  {totales.cantidadSeleccionados} recursos en despliegue
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
