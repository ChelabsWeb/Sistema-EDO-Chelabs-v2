'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Check,
  Plus,
  Package,
  Users,
  AlertCircle,
  Layers,
  CheckCircle2,
  Sparkles,
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
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl m-1">
          <Package className="w-10 h-10 mb-4 opacity-50" />
          <p className="font-semibold text-sm">Sin resultados en esta categoría</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-2 pb-4">
        {items.map((insumo) => {
          const isDuplicate = duplicados.includes(insumo.nombre)
          const isSelected = selectedInsumos.has(insumo.nombre)

          return (
            <div
              key={insumo.nombre}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                isSelected
                  ? "bg-primary/5 border-primary"
                  : "bg-background hover:bg-muted/50",
                isDuplicate && "opacity-50 grayscale bg-muted cursor-not-allowed"
              )}
              onClick={() => !isDuplicate && toggleInsumo(insumo.nombre)}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                {isSelected ? <Check className="w-5 h-5" /> : (tipo === 'material' ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-bold truncate text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {insumo.nombre}
                  </p>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {insumo.unidad}
                  </span>
                </div>
              </div>
              {isDuplicate && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Ya Existe</span>
                </div>
              )}
              {!isDuplicate && isSelected && (
                <div className="text-primary pr-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
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
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Cargar Catálogos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col gap-0 border overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">Repositorio Maestro</DialogTitle>
              <DialogDescription>
                Importa suministros estandarizados listos para usar en tus rubros.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pb-2 space-y-6 flex-1 min-h-[400px] flex flex-col overflow-hidden bg-muted/5">
          {/* Controls Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Categoría Industrial
              </label>
              <Select value={selectedRubro} onValueChange={setSelectedRubro}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Filtrar por rubro..." />
                </SelectTrigger>
                <SelectContent>
                  {rubros.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Buscador
              </label>
              <Input
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-8">
                Seleccionar Todos
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-8 text-muted-foreground">
                Limpiar Selección
              </Button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {selectedCount} de {totalAvailable} Disponibles
            </div>
          </div>

          {/* Main List */}
          <div className="flex-1 min-h-0 relative border rounded-xl bg-background overflow-hidden">
             {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-sm font-semibold text-muted-foreground">Cargando base de datos...</p>
                </div>
             ) : (
                <Tabs defaultValue="materiales" className="h-full flex flex-col">
                  <div className="p-4 bg-muted/20 border-b">
                      <TabsList className="inline-flex w-full sm:w-auto">
                        <TabsTrigger value="materiales" className="text-xs uppercase tracking-wider font-semibold">
                          Materiales ({filteredInsumos.materiales.length})
                        </TabsTrigger>
                        <TabsTrigger value="mano_de_obra" className="text-xs uppercase tracking-wider font-semibold">
                          Mano de Obra ({filteredInsumos.mano_de_obra.length})
                        </TabsTrigger>
                      </TabsList>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <TabsContent value="materiales" className="m-0 border-0 p-0 outline-none">
                      {renderInsumoList(filteredInsumos.materiales, 'material')}
                    </TabsContent>
                    <TabsContent value="mano_de_obra" className="m-0 border-0 p-0 outline-none">
                      {renderInsumoList(filteredInsumos.mano_de_obra, 'mano_de_obra')}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
             )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-6 border-t bg-muted/20 sm:justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground hidden sm:flex">
             <Info className="w-4 h-4" />
             <p className="text-xs font-semibold">Los recursos se cargarán a tu bodega del proyecto.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedCount === 0 || submitting}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...
                </>
              ) : (
                `Vincular ${selectedCount} recursos`
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
