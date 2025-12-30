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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getRubrosDisponibles,
  getInsumosPredefinidosConDuplicados,
  addInsumosPredefinidosToObra,
  type InsumosPredefinidosResult,
} from '@/app/actions/insumos'
import type { InsumoPredefinido } from '@/lib/constants/insumos-predefinidos'

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
        <p className="text-sm text-muted-foreground py-4 text-center">
          No hay insumos de este tipo
        </p>
      )
    }

    return (
      <div className="space-y-2">
        {items.map(insumo => {
          const isDuplicate = duplicados.includes(insumo.nombre)
          const isSelected = selectedInsumos.has(insumo.nombre)

          return (
            <div
              key={insumo.nombre}
              className={`flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 ${
                isDuplicate ? 'opacity-60' : ''
              }`}
            >
              <Checkbox
                id={`insumo-${insumo.nombre}`}
                checked={isSelected}
                onCheckedChange={() => toggleInsumo(insumo.nombre)}
                disabled={isDuplicate}
              />
              <label
                htmlFor={`insumo-${insumo.nombre}`}
                className="flex-1 text-sm cursor-pointer"
              >
                <span className="font-medium">{insumo.nombre}</span>
                <span className="text-muted-foreground ml-2">({insumo.unidad})</span>
              </label>
              {isDuplicate && (
                <Badge variant="secondary" className="text-xs">
                  Ya existe
                </Badge>
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
          <Button variant="outline">
            Agregar Predefinidos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Agregar Insumos Predefinidos</DialogTitle>
          <DialogDescription>
            Selecciona los insumos predefinidos que deseas agregar a la obra.
            Los insumos que ya existen aparecen deshabilitados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Rubro selector */}
          <div className="flex-shrink-0">
            <label className="text-sm font-medium mb-2 block">
              Seleccionar Rubro
            </label>
            <select
              value={selectedRubro}
              onChange={e => setSelectedRubro(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              {rubros.map(rubro => (
                <option key={rubro} value={rubro}>
                  {rubro}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-shrink-0">
            <Input
              placeholder="Buscar insumo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Select all / Deselect all */}
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Seleccionar todos
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deseleccionar todos
            </Button>
            <span className="text-sm text-muted-foreground self-center ml-auto">
              {selectedCount} de {totalAvailable} seleccionados
            </span>
          </div>

          {/* Insumos list with tabs */}
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Cargando insumos...
              </div>
            ) : (
              <Tabs defaultValue="materiales" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                  <TabsTrigger value="materiales">
                    Materiales ({filteredInsumos.materiales.length})
                  </TabsTrigger>
                  <TabsTrigger value="mano_de_obra">
                    Mano de Obra ({filteredInsumos.mano_de_obra.length})
                  </TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1 mt-2">
                  <TabsContent value="materiales" className="mt-0">
                    {renderInsumoList(filteredInsumos.materiales, 'material')}
                  </TabsContent>
                  <TabsContent value="mano_de_obra" className="mt-0">
                    {renderInsumoList(filteredInsumos.mano_de_obra, 'mano_de_obra')}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            )}
          </div>

          {/* Duplicates warning */}
          {duplicados.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm flex-shrink-0">
              <p className="font-medium text-yellow-800">
                {duplicados.length} insumo(s) ya existen en la obra
              </p>
              <p className="text-yellow-700 mt-1">
                Estos insumos estan deshabilitados y no se agregaran nuevamente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCount === 0 || submitting}
            className="bg-[#0066cc] hover:bg-[#004499] text-white"
          >
            {submitting ? 'Agregando...' : `Agregar ${selectedCount} insumo(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
