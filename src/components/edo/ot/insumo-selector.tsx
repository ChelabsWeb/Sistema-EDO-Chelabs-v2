'use client'

import { useState, useMemo } from 'react'
import { formatPesos } from '@/lib/utils/currency'
import {
  Package, Users, Trash2, PlusCircle, Search,
  ChevronRight, Calculator, X, Layers, ShoppingCart,
  ArrowDownCircle, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  initialInsumos?: InsumoSeleccionado[]
  isLoading?: boolean
}

export function InsumoSelector({
  obraId,
  insumosObra,
  onChange,
  initialInsumos = [],
  isLoading = false,
}: InsumoSelectorProps) {
  const [insumos, setInsumos] = useState<InsumoSeleccionado[]>(initialInsumos)
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
      cantidad: 1,
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
      <div className="p-12 glass dark:glass-dark rounded-[40px] border border-apple-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-4 animate-apple-fade-in">
        <div className="w-12 h-12 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
        <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Sincronizando inventario...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-apple-slide-up">
      {/* Dynamic Inventory Stream */}
      <div className="space-y-4">
        {insumos.length === 0 ? (
          <div className="p-16 border-2 border-dashed border-apple-gray-100 dark:border-white/5 rounded-[40px] text-center group hover:border-apple-blue/30 transition-colors">
            <div className="w-20 h-20 bg-apple-gray-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-10 h-10 text-apple-gray-200" />
            </div>
            <p className="text-lg font-black text-apple-gray-300 tracking-tight">Carga de Recursos Vacía</p>
            <p className="text-xs font-bold text-apple-gray-400 mt-2 uppercase tracking-widest leading-loose">Agregue materiales o mano de obra<br />para estimar el costo de la OT</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {insumos.map((insumo) => {
              const itemObra = insumosObra.find(io => io.id === insumo.insumo_id)
              const isManoDeObra = itemObra?.tipo === 'mano_de_obra'

              return (
                <div
                  key={insumo.insumo_id}
                  className="group bg-white dark:bg-apple-gray-50 border border-apple-gray-100 dark:border-white/5 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                      isManoDeObra ? "bg-orange-500/10 text-orange-500" : "bg-apple-blue/10 text-apple-blue"
                    )}>
                      {isManoDeObra ? <Users className="w-7 h-7" /> : <Package className="w-7 h-7" />}
                    </div>
                    <div>
                      <h5 className="text-base font-black text-foreground tracking-tight">{insumo.nombre}</h5>
                      <p className="text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest">
                        {formatPesos(insumo.precio_unitario)} por {insumo.unidad}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest">Cantidad</label>
                      <div className="relative group/field">
                        <input
                          type="number"
                          value={insumo.cantidad}
                          onChange={(e) => updateCantidad(insumo.insumo_id, parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className="w-28 px-4 py-3 bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/10 rounded-xl text-center text-lg font-black text-foreground outline-none focus:ring-4 focus:ring-apple-blue/10 focus:border-apple-blue transition-all"
                        />
                        <span className="absolute right-[-24px] top-1/2 -translate-y-1/2 text-[10px] font-black text-apple-gray-300 uppercase">{insumo.unidad}</span>
                      </div>
                    </div>

                    <div className="min-w-[120px] text-right">
                      <p className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Subtotal</p>
                      <p className="text-xl font-black text-foreground tracking-tighter">
                        {formatPesos(insumo.cantidad * insumo.precio_unitario)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeInsumo(insumo.insumo_id)}
                      className="w-10 h-10 rounded-full bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action Area: Add Resource */}
      <div className="relative pt-4">
        {showAddInsumo ? (
          <div className="bg-white dark:bg-apple-gray-50 border-2 border-apple-blue rounded-[40px] p-8 shadow-apple-lg animate-apple-slide-up space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Search className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-3 px-2">
                  <Search className="w-4 h-4 text-apple-blue" />
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Master de Suministros</p>
                </div>
                <input
                  type="text"
                  placeholder="Escriba material o labor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-16 px-8 bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/10 rounded-2xl text-xl font-black text-foreground outline-none focus:ring-4 focus:ring-apple-blue/10 transition-all placeholder:text-apple-gray-200"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => { setShowAddInsumo(false); setSearchTerm('') }}
                className="w-16 h-16 rounded-full bg-apple-gray-100 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:text-foreground transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {insumosDisponibles.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-apple-gray-400 font-bold italic">
                  No se encontraron coincidencias en el catálogo de la obra.
                </div>
              ) : (
                insumosDisponibles.slice(0, 12).map((insumo) => (
                  <button
                    key={insumo.id}
                    type="button"
                    onClick={() => addInsumo(insumo)}
                    className="w-full px-6 py-5 bg-apple-gray-50/50 dark:bg-white/[0.02] hover:bg-apple-blue hover:text-white border border-apple-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-between transition-all group/item shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[15px] font-black tracking-tight">{insumo.nombre}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                          Base: {formatPesos(insumo.precio_referencia || 0)} / {insumo.unidad}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddInsumo(true)}
            className="w-full h-20 bg-white dark:bg-apple-gray-50 border-2 border-dashed border-apple-gray-200 dark:border-white/10 rounded-[40px] flex items-center justify-center gap-4 hover:border-apple-blue hover:bg-apple-blue/5 group transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-apple-blue text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-apple-blue/20">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-apple-gray-400 group-hover:text-apple-blue uppercase tracking-[0.2em] transition-colors">Vincular Recurso Adicional</span>
          </button>
        )}
      </div>

      {/* Aggregate Totals Panel */}
      {insumos.length > 0 && (
        <div className="bg-gradient-to-br from-white to-apple-gray-50 dark:from-apple-gray-50 dark:to-black/40 border border-apple-gray-100 dark:border-white/5 rounded-[40px] p-10 mt-12 shadow-apple-float animate-apple-slide-up">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 flex-1 w-full">
              <div className="flex items-center justify-between text-[11px] font-black text-apple-gray-400 uppercase tracking-widest px-2">
                <div className="flex items-center gap-2"><Package className="w-4 h-4" /> Materiales</div>
                <span>{formatPesos(totales.materiales)}</span>
              </div>
              <div className="h-2 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-apple-blue rounded-full" style={{ width: `${(totales.materiales / (totales.total || 1)) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px] font-black text-apple-gray-400 uppercase tracking-widest px-2">
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Mano de Obra</div>
                <span>{formatPesos(totales.manoDeObra)}</span>
              </div>
              <div className="h-2 w-full bg-apple-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(totales.manoDeObra / (totales.total || 1)) * 100}%` }} />
              </div>
            </div>

            <div className="h-px md:h-24 w-full md:w-px bg-apple-gray-200 dark:bg-white/10" />

            <div className="text-center md:text-right space-y-2">
              <div className="flex items-center justify-center md:justify-end gap-3 text-apple-blue">
                <ShoppingCart className="w-6 h-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Total Ejecución Estimada</p>
              </div>
              <h4 className="text-5xl font-black text-foreground tracking-tighter">{formatPesos(totales.total)}</h4>
              <p className="text-xs font-bold text-apple-gray-400">{totales.cantidadSeleccionados} recursos configurados para esta OT</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
