'use client'

import { useState, useMemo } from 'react'
import { formatPesos } from '@/lib/utils/currency'
import {
  Package, Users, Trash2, PlusCircle, Search,
  ChevronRight, Calculator, X, Layers, ShoppingCart,
  Box, Tag, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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
      <div className="p-8 border rounded-xl flex items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Consultando Inventario...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selected Items List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {insumos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 border-2 border-dashed rounded-xl text-center bg-muted/20"
            >
              <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-bold tracking-tight mb-2">Sin recursos asignados</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No has vinculado materiales ni mano de obra. Agrega recursos para planificar el costo de esta orden.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {insumos.map((insumo) => {
                const itemObra = insumosObra.find(io => io.id === insumo.insumo_id)
                const isManoDeObra = itemObra?.tipo === 'mano_de_obra'

                return (
                  <Card key={insumo.insumo_id} className="overflow-hidden hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          isManoDeObra ? "bg-orange-500/10 text-orange-600" : "bg-primary/10 text-primary"
                        )}>
                          {isManoDeObra ? <Users className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm tracking-tight">{insumo.nombre}</h5>
                          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                            <Tag className="w-3.5 h-3.5" />
                            <p className="text-xs font-semibold">
                              {formatPesos(insumo.precio_unitario)} / {insumo.unidad}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:block">Cant.</label>
                          <div className="relative flex items-center">
                            <Input
                              type="number"
                              value={insumo.cantidad || ''}
                              onChange={(e) => updateCantidad(insumo.insumo_id, parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              placeholder="0"
                              className="w-24 pr-8 font-bold text-right"
                            />
                            <span className="absolute right-3 text-xs font-bold text-muted-foreground select-none pointer-events-none">{insumo.unidad}</span>
                          </div>
                        </div>

                        <div className="text-right min-w-[100px]">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Subtotal</p>
                          <p className="font-bold text-sm">{formatPesos(insumo.cantidad * insumo.precio_unitario)}</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInsumo(insumo.insumo_id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Resource Section */}
      <div>
        {showAddInsumo ? (
          <Card className="border-primary/50 shadow-md">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar material o mano de obra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 w-full bg-background"
                    autoFocus
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setShowAddInsumo(false); setSearchTerm('') }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {insumosDisponibles.length === 0 ? (
                  <div className="col-span-full py-8 text-center">
                    <p className="text-sm font-medium text-muted-foreground">No se encontraron resultados.</p>
                  </div>
                ) : (
                  insumosDisponibles.map((insumo) => (
                    <button
                      key={insumo.id}
                      type="button"
                      onClick={() => addInsumo(insumo)}
                      className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left group"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        insumo.tipo === 'mano_de_obra' ? "bg-orange-500/10 text-orange-600" : "bg-primary/10 text-primary"
                      )}>
                        {insumo.tipo === 'mano_de_obra' ? <Users className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm truncate">{insumo.nombre}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {formatPesos(insumo.precio_referencia || 0)} / {insumo.unidad}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 border-dashed font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors"
            onClick={() => setShowAddInsumo(true)}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Añadir Recurso
          </Button>
        )}
      </div>

      {/* Aggregate Totals Inline */}
      {insumos.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    <Package className="w-4 h-4 text-primary" /> Materiales
                  </div>
                  <span className="font-bold">{formatPesos(totales.materiales)}</span>
                </div>
                <div className="flex items-center justify-between items-center gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                     <Users className="w-4 h-4 text-orange-500" /> Mano de Obra
                  </div>
                  <span className="font-bold">{formatPesos(totales.manoDeObra)}</span>
                </div>
              </div>
              
              <div className="w-px h-16 bg-border hidden md:block" />
              
              <div className="text-center md:text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Impacto de Ejecución</p>
                <p className="text-3xl font-bold tracking-tight text-foreground">{formatPesos(totales.total)}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-background border text-xs font-semibold text-muted-foreground">
                  <Layers className="w-3.5 h-3.5" />
                  {totales.cantidadSeleccionados} recursos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
