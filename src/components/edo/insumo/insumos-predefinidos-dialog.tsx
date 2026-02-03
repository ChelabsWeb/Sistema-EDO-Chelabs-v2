'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Check,
  Plus,
  X,
  Package,
  Users,
  AlertCircle,
  ChevronDown,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Info,
  Loader2
} from 'lucide-react'
import {
  getRubrosDisponibles,
  getInsumosPredefinidosConDuplicados,
  addInsumosPredefinidosToObra,
  type InsumosPredefinidosResult,
} from '@/app/actions/insumos'
import type { InsumoPredefinido } from '@/lib/constants/insumos-predefinidos'
import { cn } from '@/lib/utils'
import { AppleSelector } from '@/components/ui/apple-selector'

interface InsumosPredefinidosDialogProps {
  obraId: string
  onInsumosAdded?: (result: { creados: number; omitidos: number }) => void
  trigger?: React.ReactNode
}

export function InsumosPredefinidosDialog({
  obraId,
  onInsumosAdded,
  trigger,
}: InsumosPredefinidosDialogProps) {
  const [open, setOpen] = useState(false)
  const [rubros, setRubros] = useState<string[]>([])
  const [selectedRubro, setSelectedRubro] = useState<string>('')
  const [insumos, setInsumos] = useState<InsumosPredefinidosResult | null>(null)
  const [duplicados, setDuplicados] = useState<string[]>([])
  const [selectedInsumos, setSelectedInsumos] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load available rubros when dialog opens
  useEffect(() => {
    if (open) {
      loadRubros()
    }
  }, [open])

  // Load insumos when rubro changes
  useEffect(() => {
    if (selectedRubro) {
      loadInsumos(selectedRubro)
    }
  }, [selectedRubro, obraId])

  const loadRubros = async () => {
    const result = await getRubrosDisponibles()
    if (result.success && result.data) {
      setRubros(result.data)
      if (result.data.length > 0 && !selectedRubro) {
        setSelectedRubro(result.data[0])
      }
    }
  }

  const loadInsumos = async (rubro: string) => {
    setLoading(true)
    const result = await getInsumosPredefinidosConDuplicados(rubro, obraId)
    if (result.success && result.data) {
      setInsumos(result.data.insumos)
      setDuplicados(result.data.duplicados)
      // Pre-select non-duplicates
      const nonDuplicates = [
        ...result.data.insumos.materiales,
        ...result.data.insumos.mano_de_obra,
      ]
        .filter(i => !result.data.duplicados.includes(i.nombre))
        .map(i => i.nombre)
      setSelectedInsumos(new Set(nonDuplicates))
    }
    setLoading(false)
  }

  // Filter insumos based on search term
  const filteredInsumos = useMemo(() => {
    if (!insumos) return { materiales: [], mano_de_obra: [] }
    const term = searchTerm.toLowerCase()
    return {
      materiales: insumos.materiales.filter(i =>
        i.nombre.toLowerCase().includes(term)
      ),
      mano_de_obra: insumos.mano_de_obra.filter(i =>
        i.nombre.toLowerCase().includes(term)
      ),
    }
  }, [insumos, searchTerm])

  const toggleInsumo = (nombre: string) => {
    const newSelected = new Set(selectedInsumos)
    if (newSelected.has(nombre)) {
      newSelected.delete(nombre)
    } else {
      newSelected.add(nombre)
    }
    setSelectedInsumos(newSelected)
  }

  const selectAll = () => {
    if (!insumos) return
    const all = [...insumos.materiales, ...insumos.mano_de_obra]
      .filter(i => !duplicados.includes(i.nombre))
      .map(i => i.nombre)
    setSelectedInsumos(new Set(all))
  }

  const deselectAll = () => {
    setSelectedInsumos(new Set())
  }

  const handleSubmit = async () => {
    if (!insumos || selectedInsumos.size === 0) return

    setSubmitting(true)

    // Get selected insumo objects
    const allInsumos = [...insumos.materiales, ...insumos.mano_de_obra]
    const insumosToAdd = allInsumos.filter(i => selectedInsumos.has(i.nombre))

    const result = await addInsumosPredefinidosToObra(obraId, insumosToAdd)

    setSubmitting(false)

    if (result.success && result.data) {
      onInsumosAdded?.({
        creados: result.data.creados.length,
        omitidos: result.data.omitidos.length,
      })
      setOpen(false)
      // Reset state
      setSelectedInsumos(new Set())
      setSearchTerm('')
    }
  }

  const renderInsumoList = (items: InsumoPredefinido[], tipo: 'material' | 'mano_de_obra') => {
    if (items.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-[32px] bg-apple-gray-50 dark:bg-apple-gray-50/5 flex items-center justify-center mb-6 shadow-inner">
            <Package className="w-10 h-10 text-apple-gray-200" />
          </div>
          <p className="text-lg font-black text-apple-gray-300 italic uppercase">Sin resultados en esta categoría</p>
        </motion.div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-3 pb-8">
        {items.map((insumo, index) => {
          const isDuplicate = duplicados.includes(insumo.nombre)
          const isSelected = selectedInsumos.has(insumo.nombre)

          return (
            <motion.div
              layout
              key={insumo.nombre}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                "group flex items-center gap-5 p-6 rounded-[28px] border transition-all duration-300 cursor-pointer relative overflow-hidden",
                isSelected
                  ? "bg-apple-blue/5 border-apple-blue shadow-lg shadow-apple-blue/5"
                  : "bg-white dark:bg-apple-gray-50/50 border-apple-gray-100 dark:border-white/5 hover:border-apple-gray-200 dark:hover:border-white/10",
                isDuplicate && "opacity-50 grayscale bg-apple-gray-100/30 cursor-not-allowed border-dashed"
              )}
              onClick={() => !isDuplicate && toggleInsumo(insumo.nombre)}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                isSelected
                  ? "bg-apple-blue text-white"
                  : "bg-apple-gray-50 dark:bg-white/5 text-apple-gray-300 group-hover:bg-apple-blue group-hover:text-white"
              )}>
                {isSelected ? <Check className="w-6 h-6" /> : (tipo === 'material' ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className={cn(
                    "text-lg font-black tracking-tight truncate leading-none",
                    isSelected ? "text-apple-blue" : "text-foreground"
                  )}>
                    {insumo.nombre}
                  </p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-apple-gray-400 bg-apple-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                    {insumo.unidad}
                  </span>
                </div>
                <p className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest mt-1.5 opacity-60">
                  {tipo === 'material' ? 'Suministro Técnico de Obra' : 'Servicio Especializado'}
                </p>
              </div>
              {isDuplicate && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/10">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ya Cargado</span>
                </div>
              )}
              {!isDuplicate && isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-0 right-0 p-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-apple-blue" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    )
  }

  const selectedCount = selectedInsumos.size
  const totalAvailable = insumos
    ? insumos.materiales.length + insumos.mano_de_obra.length - duplicados.length
    : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="h-12 px-8 rounded-full border-apple-gray-200 dark:border-white/10 hover:bg-apple-blue/5 hover:text-apple-blue transition-all font-black text-[10px] uppercase tracking-widest">
            <Plus className="w-4 h-4 mr-2" />
            Cargar Catálogos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-3xl border-apple-gray-100 dark:border-white/10 rounded-[56px] gap-0 shadow-2xl">
        <DialogHeader className="p-12 pb-6 border-b border-apple-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/30">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-[28px] bg-apple-blue/10 flex items-center justify-center text-apple-blue shadow-inner relative overflow-hidden scale-110">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <Layers className="w-8 h-8 relative z-10" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase">Repositorio Maestro</DialogTitle>
              <DialogDescription className="text-sm font-medium text-apple-gray-400 mt-1">
                Importa suministros estandarizados filtrados por rubro maestro.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-10 pb-4 space-y-8 overflow-hidden flex flex-col h-full">
          {/* Advanced Controls Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-apple-gray-50/50 dark:bg-white/5 p-8 rounded-[40px] border border-apple-gray-100 dark:border-white/5 shadow-inner">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Filter size={12} className="text-apple-blue" />
                Categoría Industrial
              </label>
              <AppleSelector
                options={rubros.map(r => ({ id: r, nombre: r }))}
                value={selectedRubro}
                onSelect={setSelectedRubro}
                size="sm"
                placeholder="Filtrar por rubro..."
                searchPlaceholder="Buscar categoría..."
              />
            </div>

            <div className="space-y-3 font-sans">
              <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Search size={12} className="text-apple-blue" />
                Buscador Inteligente
              </label>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-300 group-focus-within:text-apple-blue transition-all" />
                <Input
                  placeholder="Material, labor o servicio..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-14 h-14 bg-white dark:bg-black/40 border-apple-gray-100 dark:border-white/10 rounded-[20px] font-bold text-lg focus:ring-8 focus:ring-apple-blue/10 transition-all shadow-sm tracking-tight placeholder:text-apple-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Aggregate Selection Info */}
          <div className="flex items-center justify-between gap-6 px-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest text-apple-gray-400 hover:text-apple-blue hover:bg-apple-blue/10 transition-all border border-transparent hover:border-apple-blue/20"
              >
                Seleccionar Todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deselectAll}
                className="h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest text-apple-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
              >
                Limpiar Selección
              </Button>
            </div>
            <div className="px-6 py-2 bg-foreground text-background dark:bg-white dark:text-black rounded-full shadow-lg shadow-black/5 animate-apple-fade-in flex items-center gap-3">
              <Sparkles size={14} className="text-apple-blue animate-pulse-soft" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {selectedCount} de {totalAvailable} Disponibles
              </span>
            </div>
          </div>

          {/* Main List Area */}
          <div className="flex-1 min-h-0 relative px-2">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/40 dark:bg-black/40 backdrop-blur-xl z-20 rounded-[56px]"
                >
                  <div className="w-16 h-16 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
                  <p className="text-[11px] font-black text-apple-blue uppercase tracking-[0.3em] animate-pulse">Accediendo a Base de Datos...</p>
                </motion.div>
              ) : (
                <Tabs defaultValue="materiales" className="h-full flex flex-col pt-2">
                  <TabsList className="grid w-full grid-cols-2 bg-apple-gray-50/50 dark:bg-white/5 p-1.5 rounded-[24px] h-14 border border-apple-gray-100 dark:border-white/5 mb-8">
                    <TabsTrigger
                      value="materiales"
                      className="rounded-[18px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-apple-blue data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all font-black text-[11px] uppercase tracking-widest flex items-center gap-3"
                    >
                      <Package className="w-4 h-4" />
                      Materiales
                      <span className="bg-apple-blue/10 px-2 py-0.5 rounded-lg ml-1">{filteredInsumos.materiales.length}</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="mano_de_obra"
                      className="rounded-[18px] data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-orange-500 data-[state=active]:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all font-black text-[11px] uppercase tracking-widest flex items-center gap-3"
                    >
                      <Users className="w-4 h-4" />
                      Personal
                      <span className="bg-orange-500/10 px-2 py-0.5 rounded-lg ml-1">{filteredInsumos.mano_de_obra.length}</span>
                    </TabsTrigger>
                  </TabsList>
                  <ScrollArea className="flex-1 pr-6 -mr-6 custom-scrollbar scroll-pb-20">
                    <TabsContent value="materiales" className="mt-0 outline-none focus-visible:outline-none">
                      {renderInsumoList(filteredInsumos.materiales, 'material')}
                    </TabsContent>
                    <TabsContent value="mano_de_obra" className="mt-0 outline-none focus-visible:outline-none">
                      {renderInsumoList(filteredInsumos.mano_de_obra, 'mano_de_obra')}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Footer */}
        <DialogFooter className="p-12 border-t border-apple-gray-100 dark:border-white/10 bg-apple-gray-50/80 dark:bg-white/[0.02] backdrop-blur-xl shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-8">
            <div className="flex items-center gap-4 text-apple-gray-400">
              <Info size={16} className="text-apple-blue shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Los insumos seleccionados se vincularán <br />a la base de costos de la obra actual.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="px-8 h-12 rounded-full text-[10px] font-black uppercase tracking-widest text-apple-gray-400 hover:text-foreground transition-all"
              >
                Cerrar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedCount === 0 || submitting}
                className="flex-1 sm:flex-none h-20 px-16 rounded-[28px] bg-apple-blue hover:bg-apple-blue-dark text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-apple-float active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-4 group"
              >
                {submitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Vinculando...</span>
                  </div>
                ) : (
                  <>
                    Vincular recursos
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
