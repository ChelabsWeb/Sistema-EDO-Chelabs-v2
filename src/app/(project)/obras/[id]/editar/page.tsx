'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getObra, updateObra, archiveObra } from '@/app/actions/obras'
import type { ObraEstado } from '@/types/database'
import {
  ArrowLeft, Building2, MapPin, Users, DollarSign,
  Calendar, Loader2, AlertCircle, Archive, CheckCircle2,
  Activity, Clock, Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DatePicker } from '@/components/ui/date-picker'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditarObraPage({ params }: Props) {
  const router = useRouter()
  // React 19 unwrapping of params
  const { id } = use(params)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    cooperativa: '',
    presupuesto_total: '',
    estado: 'activa' as ObraEstado,
  })

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>()
  const [fechaFin, setFechaFin] = useState<Date | undefined>()

  useEffect(() => {
    async function loadObra() {
      const result = await getObra(id)
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      const obra = result.data
      setFormData({
        nombre: obra.nombre,
        direccion: obra.direccion || '',
        cooperativa: obra.cooperativa || '',
        presupuesto_total: obra.presupuesto_total?.toString() || '',
        estado: obra.estado || 'activa',
      })

      if (obra.fecha_inicio) setFechaInicio(parseISO(obra.fecha_inicio))
      if (obra.fecha_fin_estimada) setFechaFin(parseISO(obra.fecha_fin_estimada))

      setLoading(false)
    }

    loadObra()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    const result = await updateObra({
      id,
      nombre: formData.nombre,
      direccion: formData.direccion || null,
      cooperativa: formData.cooperativa || null,
      presupuesto_total: formData.presupuesto_total ? parseFloat(formData.presupuesto_total) : null,
      fecha_inicio: fechaInicio ? format(fechaInicio, 'yyyy-MM-dd') : null,
      fecha_fin_estimada: fechaFin ? format(fechaFin, 'yyyy-MM-dd') : null,
      estado: formData.estado,
    })

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    setSuccess('Obra actualizada correctamente')
    setSaving(false)

    setTimeout(() => {
      router.push(`/obras/${id}`)
    }, 1500)
  }

  const handleArchive = async () => {
    if (!id) return
    if (!confirm('Esta acción archivará la obra permanentemente. ¿Deseas continuar?')) return

    setSaving(true)
    setError(null)

    const result = await archiveObra(id)

    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }

    router.push('/obras')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Cargando datos de la obra...</p>
      </div>
    )
  }

  const estados: { val: ObraEstado; label: string; icon: any; color: string }[] = [
    { val: 'activa', label: 'Activa', icon: Activity, color: 'text-emerald-500' },
    { val: 'pausada', label: 'Pausada', icon: Clock, color: 'text-amber-500' },
    { val: 'finalizada', label: 'Finalizada', icon: CheckCircle2, color: 'text-slate-400' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/obras/${id}`} title="Volver a la Obra">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Obra</h1>
          <p className="text-sm text-muted-foreground">ID: {id.split('-')[0].toUpperCase()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Actualiza la información principal y el estado operativo del proyecto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Estado Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-muted-foreground"><Activity className="w-4 h-4" /> Estado Operativo</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {estados.map((est) => (
                  <button
                    key={est.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: est.val })}
                    className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                      formData.estado === est.val
                        ? "border-primary bg-primary/5 text-foreground font-semibold"
                        : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <est.icon className={cn("w-4 h-4", est.color)} />
                    <span>{est.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /> Nombre del Proyecto</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Edificio Las Heras"
                  className="text-lg font-medium h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cooperativa" className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> Entidad / Cooperativa</Label>
                  <Input
                    id="cooperativa"
                    name="cooperativa"
                    value={formData.cooperativa}
                    onChange={handleChange}
                    placeholder="Ej. COVICO IV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> Ubicación</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ej. Av. 18 de Julio 1234"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="presupuesto_total" className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" /> Presupuesto Total (UYU)</Label>
                <Input
                  type="number"
                  id="presupuesto_total"
                  name="presupuesto_total"
                  value={formData.presupuesto_total}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="font-mono text-lg"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> Cronograma</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Fecha de Inicio</span>
                    <div className="w-full">
                      <DatePicker
                        date={fechaInicio}
                        onSelect={setFechaInicio}
                        placeholder="Seleccionar fecha"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Cierre Estimado</span>
                    <div className="w-full">
                      <DatePicker
                        date={fechaFin}
                        onSelect={setFechaFin}
                        placeholder="Seleccionar fecha"
                      />
                    </div>
                  </div>
                </div>
            </div>

            {(error || success) && (
              <div className={cn(
                "p-4 rounded-md flex items-center gap-3 text-sm font-medium",
                error ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              )}>
                {error ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                <p>{error || success}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t bg-muted/20">
            <Button
              type="button"
              variant="destructive"
              onClick={handleArchive}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archivar Proyecto
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button type="button" variant="ghost" asChild className="w-full sm:w-auto">
                <Link href={`/obras/${id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving || !formData.nombre} className="w-full sm:w-auto">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Cambios
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
