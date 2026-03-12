'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  registerConsumo,
  getInsumosEstimadosParaConsumo,
  deleteConsumo,
} from '@/app/actions/consumo-materiales'
import { formatPesos } from '@/lib/utils/currency'
import {
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Container
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Consumo {
  id: string
  insumo_id: string
  cantidad_consumida: number
  cantidad_estimada: number | null
  notas: string | null
  registrado_en: string | null
  insumo: {
    id: string
    nombre: string
    unidad: string
    precio_referencia: number | null
  }
  diferencia: number
  porcentaje_diferencia: number | null
}

interface InsumoEstimado {
  insumo_id: string
  nombre: string
  unidad: string
  cantidad_estimada: number
  precio_referencia: number | null
  ya_registrado: boolean
  cantidad_consumida: number | null
}

interface OTConsumosProps {
  otId: string
  obraId: string
  consumos: Consumo[]
  canEdit: boolean
}

export function OTConsumos({ otId, obraId, consumos: initialConsumos, canEdit }: OTConsumosProps) {
  const router = useRouter()
  const [consumos, setConsumos] = useState(initialConsumos)
  const [insumosEstimados, setInsumosEstimados] = useState<InsumoEstimado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingInsumo, setEditingInsumo] = useState<string | null>(null)
  const [cantidadInput, setCantidadInput] = useState('')
  const [notasInput, setNotasInput] = useState('')

  useEffect(() => { loadInsumosEstimados() }, [otId])
  useEffect(() => { setConsumos(initialConsumos) }, [initialConsumos])

  const loadInsumosEstimados = async () => {
    setIsLoading(true)
    const result = await getInsumosEstimadosParaConsumo(otId)
    if (result.success) setInsumosEstimados(result.data)
    setIsLoading(false)
  }

  const handleStartEdit = (insumo: InsumoEstimado) => {
    setEditingInsumo(insumo.insumo_id)
    setCantidadInput(insumo.cantidad_consumida?.toString() || '')
    setNotasInput('')
  }

  const handleCancelEdit = () => {
    setEditingInsumo(null)
    setCantidadInput('')
    setNotasInput('')
  }

  const handleSaveConsumo = async (insumo: InsumoEstimado) => {
    if (!cantidadInput) {
      setError('Ingrese la cantidad consumida')
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await registerConsumo({
      orden_trabajo_id: otId,
      obra_id: obraId,
      insumo_id: insumo.insumo_id,
      cantidad_consumida: parseFloat(cantidadInput),
      cantidad_estimada: insumo.cantidad_estimada,
      notas: notasInput || undefined,
    })

    if (result.success) {
      handleCancelEdit()
      router.refresh()
      if ('vibrate' in navigator) navigator.vibrate(50)
    } else {
      setError(result.error)
    }
    setIsSaving(false)
  }

  const handleDeleteConsumo = async (consumoId: string) => {
    if (!confirm('¿Eliminar este registro de consumo?')) return
    const result = await deleteConsumo(consumoId, obraId, otId)
    if (result.success) router.refresh()
    else setError(result.error)
  }

  const totalEstimado = consumos.reduce((sum, c) => sum + (c.cantidad_estimada || 0) * (c.insumo?.precio_referencia || 0), 0)
  const totalReal = consumos.reduce((sum, c) => sum + c.cantidad_consumida * (c.insumo?.precio_referencia || 0), 0)
  const desvioTotal = totalReal - totalEstimado
  const desvioPercent = totalEstimado > 0 ? (desvioTotal / totalEstimado) * 100 : 0

  const getStatusColor = (percent: number | null) => {
    if (percent === null) return "text-muted-foreground bg-muted"
    if (percent > 10) return "text-destructive bg-destructive/10"
    if (percent > 0) return "text-orange-600 bg-orange-50 dark:bg-orange-500/10"
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
  }

  if (isLoading) {
    return <div className="p-6 space-y-4 animate-pulse"><div className="h-16 bg-muted rounded-xl" /><div className="h-32 bg-muted/50 rounded-xl" /></div>
  }

  return (
    <div className="flex flex-col h-full bg-background space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Insumos Registrados</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{consumos.length} <span className="text-muted-foreground">/ {insumosEstimados.length}</span></p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
              <Container className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-colors",
          desvioPercent > 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"
        )}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Desvío de Materiales</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-2xl font-bold tracking-tight", desvioPercent > 0 ? "text-red-500" : "text-emerald-500")}>
                  {desvioTotal >= 0 ? '+' : ''}{formatPesos(desvioTotal)}
                </p>
                <div className={cn("text-[10px] px-2 py-0.5 rounded-md font-bold", desvioPercent > 0 ? "bg-red-500 text-white" : "bg-emerald-500 text-white")}>
                  {desvioPercent.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", desvioPercent > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
              {desvioPercent > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {insumosEstimados.map((insumo) => {
          const consumo = consumos.find((c) => c.insumo_id === insumo.insumo_id)
          const isEditing = editingInsumo === insumo.insumo_id

          return (
            <Card
              key={insumo.insumo_id}
              className={cn(
                "transition-all overflow-hidden",
                isEditing ? "border-primary ring-1 ring-primary/20" : "hover:border-primary/20"
              )}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      consumo ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                    )}>
                      {consumo ? <CheckCircle2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{insumo.nombre}</h3>
                      <p className="text-xs text-muted-foreground font-semibold">Planificado: {insumo.cantidad_estimada.toFixed(2)} {insumo.unidad}</p>
                    </div>
                  </div>

                  {consumo && !isEditing ? (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real Consumido</p>
                        <p className="text-base font-bold text-foreground tracking-tight">{consumo.cantidad_consumida.toFixed(2)} {insumo.unidad}</p>
                      </div>
                      <div className={cn("px-3 py-1.5 rounded-lg flex flex-col items-end", getStatusColor(consumo.porcentaje_diferencia))}>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Delta</p>
                        <p className="text-xs font-bold">{consumo.diferencia >= 0 ? '+' : ''}{consumo.diferencia.toFixed(2)}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleStartEdit(insumo)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteConsumo(consumo.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : canEdit && !isEditing ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleStartEdit(insumo)}
                      className="text-xs uppercase font-bold tracking-wider"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Registrar Consumo
                    </Button>
                  ) : null}
                </div>

                {isEditing && (
                  <div className="mt-6 pt-6 border-t space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cantidad Utilizada</label>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{insumo.unidad} actual</span>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            value={cantidadInput}
                            onChange={(e) => setCantidadInput(e.target.value)}
                            autoFocus
                            placeholder="0.00"
                            className="h-16 text-2xl font-bold pl-6 pr-16 bg-background"
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <span className="text-sm font-bold text-muted-foreground">{insumo.unidad}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Notas / Observaciones de Campo</label>
                        <Textarea
                          value={notasInput}
                          onChange={(e) => setNotasInput(e.target.value)}
                          placeholder="Ej: Desperdicio por rotura de bolsa, excedente..."
                          className="h-16 resize-none bg-background"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Afectará el costo real directamente
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="flex-1 md:flex-none text-xs uppercase font-bold tracking-wider"
                        >
                          Descartar
                        </Button>
                        <Button
                          onClick={() => handleSaveConsumo(insumo)}
                          disabled={isSaving}
                          className="flex-1 md:flex-none text-xs uppercase font-bold tracking-wider"
                        >
                          {isSaving ? (
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          Registrar Consumo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {consumos.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inversión Planificada</p>
                <p className="text-lg font-bold tracking-tight text-foreground">{formatPesos(totalEstimado)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inversión Real</p>
                <p className="text-lg font-bold tracking-tight text-foreground">{formatPesos(totalReal)}</p>
              </div>
              <div className="space-y-1 text-right col-span-2 md:col-span-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Eficiencia</p>
                <p className={cn("text-lg font-bold tracking-tight", desvioPercent > 0 ? "text-red-500" : "text-emerald-500")}>
                  {desvioPercent >= 0 ? '+' : ''}{desvioPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
