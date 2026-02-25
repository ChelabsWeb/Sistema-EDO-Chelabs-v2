'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrdenCompra } from '@/app/actions/ordenes-compra'
import type { Insumo } from '@/types/database'
import {
  Plus, Trash2, ShoppingCart, Package,
  AlertCircle, Loader2,
  ListPlus, Tag, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { AppleSelector } from '@/components/ui/apple-selector'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LineaItem {
  insumo_id: string
  cantidad: number
}

interface Props {
  otId: string
  obraId: string
  insumos: Insumo[]
  onClose: () => void
}

export function CreateOCFromOTModal({ otId, obraId, insumos, onClose }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [lineas, setLineas] = useState<LineaItem[]>([])
  const [selectedInsumo, setSelectedInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')

  const handleAddLinea = () => {
    if (!selectedInsumo || !cantidad || Number(cantidad) <= 0) return

    setLineas(prev => [...prev, {
      insumo_id: selectedInsumo,
      cantidad: Number(cantidad),
    }])

    setSelectedInsumo('')
    setSearchTerm('')
    setCantidad('')
  }

  const handleRemoveLinea = (index: number) => {
    setLineas(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (lineas.length === 0) {
      setError('Debe agregar al menos un item')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createOrdenCompra({
        obra_id: obraId,
        ot_id: otId,
        proveedor: 'Por definir',
        lineas: lineas.map(l => ({
          insumo_id: l.insumo_id,
          cantidad: l.cantidad,
          precio_unitario: 0,
        })),
      })

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error)
      }
    })
  }

  const getInsumoName = (insumoId: string) => {
    return insumos.find(i => i.id === insumoId)?.nombre || 'Desconocido'
  }

  const getInsumoUnidad = (insumoId: string) => {
    return insumos.find(i => i.id === insumoId)?.unidad || ''
  }

  const [searchTerm, setSearchTerm] = useState('')
  const availableInsumos = insumos.filter(i => !lineas.some(l => l.insumo_id === i.id))

  const formattedInsumos = availableInsumos.map(i => ({
    id: i.id,
    nombre: i.nombre,
    unidad: i.unidad,
    subtitle: i.tipo === 'material' ? 'Suministro Físico' : 'Mano de Obra'
  }))

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-apple-gray-50 flex flex-col p-0 overflow-hidden rounded-[56px] border border-apple-gray-100 dark:border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.4)] max-h-[92vh] gap-0">
        {/* Header */}
        <DialogHeader className="px-10 py-10 flex flex-row items-center justify-between bg-white dark:bg-apple-gray-50 border-b border-apple-gray-100 dark:border-white/5 shrink-0 m-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <ShoppingCart className="w-7 h-7 relative z-10" />
            </div>
            <div className="text-left space-y-1">
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Logística de Suministros</p>
              <DialogTitle className="text-2xl font-black text-foreground tracking-tighter uppercase m-0">Nueva Orden de Compra</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-4 text-red-500 shadow-sm antialiased"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-black uppercase tracking-tight">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Builder Section */}
          <div className="space-y-10">
            <div className="flex items-center gap-3 px-2">
              <ListPlus className="w-4 h-4 text-apple-blue" />
              <h4 className="text-[11px] font-black text-apple-gray-400 dark:text-apple-gray-300 uppercase tracking-[0.3em]">Constructor de Pedido</h4>
            </div>

            <div className="space-y-8 bg-apple-gray-50/50 dark:bg-black/20 p-10 rounded-[48px] border border-apple-gray-100 dark:border-white/5 shadow-inner">
              <AppleSelector
                options={formattedInsumos}
                value={selectedInsumo}
                onSelect={setSelectedInsumo}
                size="sm"
                placeholder="Vincular insumo del catálogo..."
                searchPlaceholder="Escriba material o labor..."
                label="Catálogo Maestro"
                icon={<Tag className="w-3 h-3 text-apple-blue" />}
              />

              <div className="space-y-2">
                <label className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest px-2">Cantidad a Provisionar</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-16 rounded-[24px] bg-white dark:bg-black/40 border border-apple-gray-100 dark:border-white/10 px-8 font-black text-xl text-foreground focus:ring-8 focus:ring-apple-blue/10 transition-all outline-none tracking-tighter"
                    step="0.01"
                  />
                  {selectedInsumo && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest pointer-events-none bg-apple-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg">
                      {getInsumoUnidad(selectedInsumo)}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddLinea}
                disabled={!selectedInsumo || !cantidad || Number(cantidad) <= 0}
                className="w-full h-16 bg-apple-blue text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-apple-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:grayscale"
              >
                <Plus className="w-5 h-5" />
                Agregar Item
              </button>
            </div>
          </div>

          {/* Consolidado Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-indigo-500" />
                <h4 className="text-[11px] font-black text-apple-gray-400 uppercase tracking-widest">Pedido Consolidado</h4>
              </div>
              <Badge count={lineas.length} />
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {lineas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[48px] border border-dashed border-apple-gray-100 dark:border-white/5"
                >
                  <Package className="w-16 h-16 text-apple-gray-100 mx-auto mb-6 opacity-30" />
                  <p className="text-[11px] font-black text-apple-gray-300 uppercase tracking-[0.3em] leading-relaxed">
                    La canasta está vacía.<br />Vincule recursos arriba.
                  </p>
                </motion.div>
              ) : (
                <div className="grid gap-4">
                  {lineas.map((linea, index) => (
                    <motion.div
                      key={`${linea.insumo_id}-${index}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between p-8 bg-white dark:bg-white/[0.03] rounded-[32px] border border-apple-gray-50 dark:border-white/5 shadow-apple-sm transition-all hover:border-apple-blue/20"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                          <Package className="w-7 h-7 relative z-10" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-foreground tracking-tighter uppercase line-clamp-1">{getInsumoName(linea.insumo_id)}</p>
                          <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mt-0.5">
                            Cant: <span className="text-indigo-500">{linea.cantidad}</span> {getInsumoUnidad(linea.insumo_id)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLinea(index)}
                        className="w-12 h-12 rounded-full bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-500/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-10 bg-apple-gray-50/80 dark:bg-black/40 backdrop-blur-xl border-t border-apple-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Garantía Técnica</p>
              <p className="text-[9px] font-bold text-apple-gray-400 uppercase tracking-[0.2em] leading-tight">
                Emisión firmada digitalmente<br />para auditoría central.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-8 h-12 rounded-full text-[10px] font-black text-apple-gray-300 uppercase tracking-widest hover:text-foreground transition-all"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || lineas.length === 0}
              className="flex-1 sm:flex-none h-20 px-14 bg-apple-blue text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] shadow-apple-float hover:bg-apple-blue-dark active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:grayscale"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Emitiendo...
                </>
              ) : (
                <>
                  Emitir Orden
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
      {count} Items en Canasta
    </div>
  )
}
