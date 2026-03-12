'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateRubro, getRubro } from '@/app/actions/rubros'
import { getObra } from '@/app/actions/obras'
import { UNIDADES_RUBRO } from '@/lib/constants/rubros-predefinidos'
import { formatPesos } from '@/lib/utils/currency'
import {
  CheckCircle2, Loader2, AlertTriangle, ChevronLeft, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  params: Promise<{ id: string; rubroId: string }>
}

export default function EditarRubroPage({ params }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [obraId, setObraId] = useState<string | null>(null)
  const [rubroId, setRubroId] = useState<string | null>(null)
  const [obraNombre, setObraNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [presupuestoPesos, setPresupuestoPesos] = useState<number>(0)

  const [formData, setFormData] = useState({
    nombre: '',
    unidad: 'm2',
    presupuesto_ur: '',
  })

  // Cotizacion UR aproximada para mostrar equivalencia
  const COTIZACION_UR_APROX = 1800

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)
      setRubroId(resolvedParams.rubroId)

      // Load obra info
      const obraResult = await getObra(resolvedParams.id)
      if (obraResult.success) {
        setObraNombre(obraResult.data.nombre)
      }

      // Load rubro data
      const rubroResult = await getRubro(resolvedParams.rubroId)
      if (rubroResult.success) {
        const rubro = rubroResult.data
        setFormData({
          nombre: rubro.nombre,
          unidad: rubro.unidad || 'm2',
          presupuesto_ur: rubro.presupuesto_ur?.toString() || '',
        })
        setPresupuestoPesos((rubro.presupuesto_ur || 0) * COTIZACION_UR_APROX)
      } else {
        setError('No se pudo cargar el rubro')
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const handleUnidadChange = (val: string) => {
    setFormData(prev => ({ ...prev, unidad: val }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'presupuesto_ur') {
      const ur = parseFloat(value) || 0
      setPresupuestoPesos(ur * COTIZACION_UR_APROX)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId || !rubroId) return

    setSaving(true)
    setError(null)

    try {
      const result = await updateRubro({
        id: rubroId,
        nombre: formData.nombre,
        unidad: formData.unidad,
        presupuesto_ur: parseFloat(formData.presupuesto_ur) || 0,
      })

      if (!result.success) {
        setError(result.error)
        setSaving(false)
        return
      }

      router.push(`/obras/${obraId}`)
      router.refresh()
    } catch (err) {
      setError('Error al guardar los cambios')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Cargando Rubro...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col space-y-8 pb-10">
      {/* Navigation Header */}
      <nav className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link href={`/obras/${obraId}`}>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Configuración de Obra</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Editar Rubro Presupuestal
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <span className="text-xs font-semibold text-muted-foreground leading-none">{obraNombre}</span>
        </div>
      </nav>

      <main className="max-w-4xl w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="flex flex-col">
                    <CardHeader>
                       <CardTitle>Detalles Principales</CardTitle>
                       <CardDescription>Modifica el nombre y unidad de este rubro.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                        <div className="space-y-2">
                           <Label htmlFor="nombre">Nombre del Rubro</Label>
                           <Input
                             id="nombre"
                             name="nombre"
                             required
                             value={formData.nombre}
                             onChange={handleInputChange}
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="unidad">Unidad de Gestión</Label>
                           <Select 
                              value={formData.unidad} 
                              onValueChange={handleUnidadChange}
                           >
                              <SelectTrigger>
                                 <SelectValue placeholder="Seleccione unidad..." />
                              </SelectTrigger>
                              <SelectContent>
                                 {UNIDADES_RUBRO.map(u => (
                                     <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                       <CardTitle>Presupuesto</CardTitle>
                       <CardDescription>Actualiza el presupuesto asignado en Unidades Reajustables.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                           <Label htmlFor="presupuesto_ur">Asignación Base (UR)</Label>
                           <div className="relative">
                              <Input
                                id="presupuesto_ur"
                                name="presupuesto_ur"
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.presupuesto_ur}
                                onChange={handleInputChange}
                                className="pr-12 text-xl font-bold"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">
                                 UR
                              </div>
                           </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-xl border flex items-center gap-4">
                            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border shadow-sm shrink-0">
                                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Equivalente Proyectado</p>
                                <p className="text-xl font-bold text-foreground">{formatPesos(presupuestoPesos)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-end gap-4 bg-muted/30">
                   <Button 
                      type="button" 
                      variant="outline" 
                      asChild
                      className="w-full sm:w-auto"
                   >
                       <Link href={`/obras/${obraId}`}>
                           Descartar Cambios
                       </Link>
                   </Button>
                   <Button type="submit" disabled={saving || !formData.presupuesto_ur} className="w-full sm:w-auto min-w-[200px]">
                       {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                       {saving ? 'Guardando...' : 'Confirmar Cambios'}
                   </Button>
                </CardContent>
            </Card>
        </form>
      </main>
    </div>
  )
}
