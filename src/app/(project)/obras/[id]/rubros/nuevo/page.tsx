'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createRubro } from '@/app/actions/rubros'
import { getObra } from '@/app/actions/obras'
import { getPlantillasRubros, applyPlantillaToObra } from '@/app/actions/plantillas'
import { UNIDADES_RUBRO } from '@/lib/constants/rubros-predefinidos'
import type { PlantillaRubroWithDetails } from '@/types/database'
import {
  ArrowLeft, Layers, Plus, Sparkles, Settings,
  CheckCircle2, Loader2, Info, AlertTriangle,
  ChevronRight, Box, Calculator, Smartphone, Layout, ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  params: Promise<{ id: string }>
}

type CreationMode = 'select' | 'template' | 'manual'

export default function NuevoRubroPage({ params }: Props) {
  const router = useRouter()
  const [obraId, setObraId] = useState<string | null>(null)
  const [obraNombre, setObraNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<CreationMode>('select')
  const [plantillas, setPlantillas] = useState<PlantillaRubroWithDetails[]>([])
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaRubroWithDetails | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    unidad: 'm2',
    presupuesto_ur: '',
  })

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)

      const [obraResult, plantillasResult] = await Promise.all([
        getObra(resolvedParams.id),
        getPlantillasRubros()
      ])

      if (obraResult.success) {
        setObraNombre(obraResult.data.nombre)
      }

      if (plantillasResult.success && plantillasResult.data) {
        setPlantillas(plantillasResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUnidadChange = (val: string) => {
    setFormData({ ...formData, unidad: val })
  }

  const handleSelectPlantilla = (plantilla: PlantillaRubroWithDetails) => {
    setSelectedPlantilla(plantilla)
    setFormData({
      nombre: plantilla.nombre,
      unidad: plantilla.unidad,
      presupuesto_ur: '',
    })
  }

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId) return
    setSaving(true)
    setError(null)
    const result = await createRubro({
      obra_id: obraId,
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
  }

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId || !selectedPlantilla) return
    setSaving(true)
    setError(null)
    const presupuestoUr = parseFloat(formData.presupuesto_ur) || 0
    const result = await applyPlantillaToObra(
      selectedPlantilla.id,
      obraId,
      0,
      presupuestoUr
    )
    if (!result.success) {
      setError(result.error || 'Error al crear el rubro')
      setSaving(false)
      return
    }
    router.push(`/obras/${obraId}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Configurando Entorno...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col space-y-8 pb-10">
      {/* Navigation Header */}
      <nav className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={() => {
              if (selectedPlantilla) setSelectedPlantilla(null)
              else if (mode !== 'select') setMode('select')
              else router.back()
            }}
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asistente de Presupuesto</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === 'select' ? 'Crear Nuevo Rubro' : mode === 'template' ? (selectedPlantilla ? `Configurar: ${selectedPlantilla.nombre}` : 'Plantillas Inteligentes') : 'Configuración Manual'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <span className="text-xs font-semibold text-muted-foreground leading-none">{obraNombre}</span>
        </div>
      </nav>

      <main className="max-w-5xl w-full mx-auto">
          {mode === 'select' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                 className="group cursor-pointer hover:border-primary/50 transition-colors"
                 onClick={() => setMode('template')}
              >
                  <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center space-y-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-bold">Smart Templates</h3>
                         <p className="text-sm text-muted-foreground">Importa estructuras preconfiguradas con insumos y cuadrillas ya vinculadas y estandarizadas.</p>
                      </div>
                      <div className="pt-4 flex items-center gap-2 text-primary font-semibold text-sm">
                         <Box className="w-4 h-4" /> {plantillas.length} disponibles
                      </div>
                  </CardContent>
              </Card>

              <Card 
                 className="group cursor-pointer hover:border-primary/50 transition-colors"
                 onClick={() => setMode('manual')}
              >
                  <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center space-y-6">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                          <Settings className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-bold">Configuración Manual</h3>
                         <p className="text-sm text-muted-foreground">Crea un rubro desde cero definiendo nombre, unidad y presupuesto base tú mismo.</p>
                      </div>
                      <div className="pt-4 flex items-center gap-2 text-muted-foreground font-semibold text-sm">
                         <Calculator className="w-4 h-4" /> Control total
                      </div>
                  </CardContent>
              </Card>
            </div>
          )}

          {mode === 'template' && !selectedPlantilla && (
            <div className="space-y-10">
              {['Catálogo de Sistema', 'Plantillas de Empresa'].map((title, idx) => {
                const isFirst = idx === 0
                const items = isFirst ? plantillas.filter(p => p.es_sistema) : plantillas.filter(p => !p.es_sistema)
                if (items.length === 0) return null

                return (
                  <div key={title} className="space-y-6">
                    <div className="flex items-center gap-3 border-b pb-2">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((p) => (
                        <Card 
                           key={p.id}
                           className="group cursor-pointer hover:border-primary/50 transition-colors flex flex-col justify-between"
                           onClick={() => handleSelectPlantilla(p)}
                        >
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Layout className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-foreground leading-tight">{p.nombre}</h4>
                                    <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                                      <Box className="w-4 h-4" />
                                      <p className="text-[10px] font-bold uppercase tracking-widest">{p.insumos?.length || 0} RECURSOS</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-6 mt-6 border-t">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.unidad}</span>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                            </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {(mode === 'manual' || (mode === 'template' && selectedPlantilla)) && (
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={mode === 'manual' ? handleSubmitManual : handleSubmitTemplate}
                className="space-y-6"
              >
                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <Card>
                    <CardHeader>
                       <CardTitle>Identidad del Rubro</CardTitle>
                       <CardDescription>
                          {mode === 'template' ? 'Configura el presupuesto para la plantilla seleccionada.' : 'Define los detalles generales y el presupuesto inicial.'}
                       </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {mode === 'template' && selectedPlantilla && (
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-4">
                                <Smartphone className="w-6 h-6 text-primary shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground text-sm">Herencia Activa</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Has seleccionado <span className="font-bold">{selectedPlantilla.nombre}</span>. Se importarán automáticamente todos los insumos y ratios de producción.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                           <Label htmlFor="nombre">Nombre del Rubro</Label>
                           <Input
                             id="nombre"
                             name="nombre"
                             required
                             disabled={mode === 'template'}
                             value={formData.nombre}
                             onChange={handleChange}
                             placeholder="Ej: Albañilería de Elevación"
                           />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <Label htmlFor="unidad">Unidad de Medida</Label>
                               <Select 
                                  value={formData.unidad} 
                                  onValueChange={handleUnidadChange}
                                  disabled={mode === 'template'}
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

                            <div className="space-y-2">
                               <Label htmlFor="presupuesto_ur">Presupuesto Inicial (UR)</Label>
                               <div className="relative">
                                  <Input
                                    id="presupuesto_ur"
                                    name="presupuesto_ur"
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    autoFocus={mode === 'template'}
                                    value={formData.presupuesto_ur}
                                    onChange={handleChange}
                                    className="pr-12"
                                    placeholder="0.00"
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">
                                     UR
                                  </div>
                               </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t mt-4">
                           <Button 
                              type="button" 
                              variant="outline" 
                              className="w-full sm:w-auto"
                              onClick={() => {
                                  if (selectedPlantilla) setSelectedPlantilla(null)
                                  else setMode('select')
                              }}
                           >
                               Cancelar
                           </Button>
                           <Button type="submit" disabled={saving || !formData.presupuesto_ur} className="w-full sm:w-auto min-w-[200px]">
                               {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                               {saving ? 'Procesando...' : mode === 'template' ? 'Aplicar Plantilla' : 'Crear Rubro'}
                           </Button>
                        </div>
                    </CardContent>
                </Card>
              </form>
            </div>
          )}
      </main>
    </div>
  )
}
