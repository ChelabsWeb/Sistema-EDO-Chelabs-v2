'use client'

import { useState } from 'react'
import type { Insumo } from '@/types/database'
import { updateInsumo } from '@/app/actions/rubro-insumos'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Package, Users, Tag, DollarSign, X, Loader2, Save, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency'

interface EditInsumoModalProps {
  insumo: Insumo
  onClose: () => void
  onSaved: () => void
}

export function EditInsumoModal({ insumo, onClose, onSaved }: EditInsumoModalProps) {
  const [nombre, setNombre] = useState(insumo.nombre)
  const [unidad, setUnidad] = useState(insumo.unidad)
  const [precioUnitario, setPrecioUnitario] = useState(
    String(insumo.precio_unitario || insumo.precio_referencia || 0)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!unidad.trim()) {
      setError('La unidad es requerida')
      return
    }

    const precio = parseFloat(precioUnitario)
    if (isNaN(precio) || precio < 0) {
      setError('El precio debe ser un número positivo')
      return
    }

    setSaving(true)
    const result = await updateInsumo(insumo.id, {
      nombre: nombre.trim(),
      unidad: unidad.trim(),
      precio_unitario: precio,
      precio_referencia: precio
    })
    setSaving(false)

    if (!result.success) {
      setError(result.error || 'Error al guardar')
      return
    }

    onSaved()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[40px] border-apple-gray-100 dark:border-white/10 shadow-apple-lg">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-apple-blue/5 to-transparent pointer-events-none" />

        <div className="p-10 relative z-10">
          <header className="flex items-center gap-6 mb-10">
            <div className={cn(
              "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transition-transform",
              insumo.tipo === 'material' ? "bg-apple-blue text-white" : "bg-indigo-500 text-white"
            )}>
              {insumo.tipo === 'material' ? <Package className="w-8 h-8" /> : <Users className="w-8 h-8" />}
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-foreground tracking-tight leading-none">Ajustar Insumo</DialogTitle>
              <DialogDescription className="text-xs font-black text-apple-gray-300 uppercase tracking-widest mt-2 flex items-center gap-2">
                Identificador: <span className="text-apple-blue">{insumo.id.substring(0, 8)}...</span>
              </DialogDescription>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2">Asignar Nombre</label>
                <div className="relative group">
                  <Input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="h-16 pl-6 pr-12 rounded-2xl bg-apple-gray-50 dark:bg-black/40 border-apple-gray-100 dark:border-white/10 text-lg font-bold focus:ring-8 focus:ring-apple-blue/10 transition-all"
                  />
                  <Tag className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-200 group-focus-within:text-apple-blue transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2">Medida</label>
                  <Input
                    type="text"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    className="h-14 px-6 rounded-2xl bg-apple-gray-50 dark:bg-black/40 border-apple-gray-100 dark:border-white/10 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2">Costo UYU</label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-apple-blue font-black">$</span>
                    <Input
                      type="number"
                      value={precioUnitario}
                      onChange={(e) => setPrecioUnitario(e.target.value)}
                      className="h-14 pl-12 pr-6 rounded-2xl bg-apple-gray-50 dark:bg-black/40 border-apple-gray-100 dark:border-white/10 font-black text-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest text-apple-gray-400 hover:text-foreground transition-all order-2 sm:order-1"
                disabled={saving}
              >
                Descartar
              </Button>
              <Button
                type="submit"
                className="h-14 flex-[2] rounded-2xl bg-apple-blue text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-apple-float hover:bg-apple-blue-dark active:scale-[0.98] transition-all order-1 sm:order-2"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sincronizando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
