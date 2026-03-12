'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createInsumo } from '@/app/actions/insumos'
import { getObra } from '@/app/actions/obras'
import { ArrowLeft, Package, CheckCircle2, Loader2, Info, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  params: Promise<{ id: string }>
}

export default function NuevoInsumoPage({ params }: Props) {
  const router = useRouter()
  const [obraId, setObraId] = useState<string | null>(null)
  const [obraNombre, setObraNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    unidad: 'unidad',
    tipo: 'material' as 'material' | 'mano_de_obra',
    precio_referencia: '',
  })

  useEffect(() => {
    async function loadObra() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)

      const result = await getObra(resolvedParams.id)
      if (result.success) {
        setObraNombre(result.data.nombre)
      }
      setLoading(false)
    }

    loadObra()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
      setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId) return
    setSaving(true)
    setError(null)
    const result = await createInsumo({
      obra_id: obraId,
      nombre: formData.nombre,
      unidad: formData.unidad,
      tipo: formData.tipo,
      precio_referencia: formData.precio_referencia ? parseFloat(formData.precio_referencia) : null,
    })
    if (!result.success) {
      setError(result.error)
      setSaving(false)
      return
    }
    router.push(`/obras/${obraId}/insumos`)
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Preparando Suministros...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col space-y-8 pb-10">
      {/* Navigation Header */}
      <nav className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link href={`/obras/${obraId}/insumos`}>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{obraNombre}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Nuevo Insumo
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-3">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <Card>
             <CardHeader>
                <CardTitle>Detalles del Suministro</CardTitle>
                <CardDescription>Crea un nuevo insumo genérico (material o recurso de mano de obra).</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                   <Label htmlFor="nombre">Nombre del Insumo</Label>
                   <Input
                     id="nombre"
                     name="nombre"
                     required
                     autoFocus
                     value={formData.nombre}
                     onChange={handleChange}
                     placeholder="Ej: Cemento Portland, Oficial Albañil..."
                   />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label htmlFor="unidad">Unidad de Medida</Label>
                       <Select value={formData.unidad} onValueChange={(val) => handleSelectChange('unidad', val)}>
                          <SelectTrigger>
                             <SelectValue placeholder="Seleccione unidad..." />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="unidad">Unidad (un)</SelectItem>
                             <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                             <SelectItem value="lt">Litro (lt)</SelectItem>
                             <SelectItem value="m2">Metro cuadrado (m2)</SelectItem>
                             <SelectItem value="m3">Metro cúbico (m3)</SelectItem>
                             <SelectItem value="ml">Metro lineal (ml)</SelectItem>
                             <SelectItem value="bolsa">Bolsa</SelectItem>
                             <SelectItem value="hr">Hora (hr)</SelectItem>
                             <SelectItem value="jornal">Jornal</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="tipo">Tipo de Insumo</Label>
                       <Select value={formData.tipo} onValueChange={(val) => handleSelectChange('tipo', val)}>
                          <SelectTrigger>
                             <SelectValue placeholder="Seleccione tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="material">Material</SelectItem>
                             <SelectItem value="mano_de_obra">Mano de Obra</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="precio_referencia">Precio de Referencia (UYU)</Label>
                   <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                         $
                      </div>
                      <Input
                        id="precio_referencia"
                        name="precio_referencia"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precio_referencia}
                        onChange={handleChange}
                        className="pl-8"
                        placeholder="0.00"
                      />
                   </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex gap-3 text-sm">
                   <Info className="w-5 h-5 text-primary shrink-0" />
                   <p className="text-muted-foreground">
                      Este insumo estará disponible para ser utilizado en cualquier <strong>Fórmula de Rubro</strong> dentro de esta obra.
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t mt-4">
                   <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                       <Link href={`/obras/${obraId}/insumos`}>
                           Cancelar
                       </Link>
                   </Button>
                   <Button type="submit" disabled={saving || !formData.nombre} className="w-full sm:w-auto min-w-[200px]">
                       {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                       {saving ? 'Guardando...' : 'Crear Insumo'}
                   </Button>
                </div>
             </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
