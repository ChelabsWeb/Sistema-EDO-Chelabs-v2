'use client'

import { useState, useEffect } from 'react'
import type { Insumo } from '@/types/database'
import { getAvailableInsumosForRubro, addInsumoToRubro } from '@/app/actions/rubro-insumos'
import { Search, Plus, Package, Users, Info, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  const mtCount = insumos.filter(i => i.tipo === 'material').length
  const moCount = insumos.filter(i => i.tipo === 'mano_de_obra').length

  return (
    <div className="bg-background border rounded-2xl shadow-sm overflow-hidden mt-4">
      {/* Header */}
      <div className="px-4 py-3 bg-muted/20 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Vincular Suministro</h4>
            <p className="text-xs font-semibold text-muted-foreground">Maestro de obra actual</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'material' | 'mano_de_obra')} className="w-full sm:w-auto">
            <TabsList className="inline-flex w-full sm:w-auto">
              <TabsTrigger value="material" className="text-xs uppercase tracking-wider font-semibold">
                Materiales ({mtCount})
              </TabsTrigger>
              <TabsTrigger value="mano_de_obra" className="text-xs uppercase tracking-wider font-semibold">
                Recursos ({moCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nombre o unidad..."
              className="pl-9"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">Consultando Maestro...</p>
            </div>
          ) : filteredInsumos.length === 0 ? (
            <div className="py-12 text-center rounded-xl border-2 border-dashed bg-muted/10">
              <Package className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">
                {search ? 'No se encontraron coincidencias' : 'Todos los ítems están vinculados'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredInsumos.map((insumo) => (
                <div
                  key={insumo.id}
                  className="group p-3 bg-background border rounded-xl hover:border-primary/30 hover:bg-muted/5 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {insumo.tipo === 'material' ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{insumo.nombre}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{insumo.unidad}</span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-xs font-bold text-muted-foreground">{formatPesos(insumo.precio_unitario || insumo.precio_referencia)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={adding === insumo.id ? "secondary" : "default"}
                    onClick={() => handleAdd(insumo.id)}
                    disabled={adding === insumo.id}
                    className="shrink-0"
                  >
                    {adding === insumo.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                    {adding === insumo.id ? 'Añadiendo' : 'Añadir'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 bg-muted/20 border-t flex items-center gap-2">
        <Info className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-xs font-semibold text-muted-foreground">
          Los insumos aquí listados provienen del Maestro General de esta obra.
        </p>
      </div>
    </div>
  )
}
