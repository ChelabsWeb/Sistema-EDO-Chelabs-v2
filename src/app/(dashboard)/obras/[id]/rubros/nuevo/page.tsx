'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createRubro } from '@/app/actions/rubros'
import { getObra } from '@/app/actions/obras'
import { getPlantillasRubros, applyPlantillaToObra } from '@/app/actions/plantillas'
import { UNIDADES_RUBRO } from '@/lib/constants/rubros-predefinidos'
import type { PlantillaRubroWithDetails } from '@/types/database'
import { ArrowLeft, Layers, Plus, Sparkles, Settings, CheckCircle2, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-apple-gray-50/20 dark:bg-black/20 animate-pulse">
        <Loader2 className="w-12 h-12 text-apple-blue animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Preparando Configurador...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 antialiased">
      {/* Header Glassmorphic */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 shadow-apple-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (selectedPlantilla) setSelectedPlantilla(null)
              else if (mode !== 'select') setMode('select')
              else router.back()
            }}
            className="w-10 h-10 rounded-full glass dark:glass-dark flex items-center justify-center text-apple-gray-400 hover:text-foreground transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">
              {mode === 'select' ? 'Nuevo Rubro' : mode === 'template' ? (selectedPlantilla ? `Configurar: ${selectedPlantilla.nombre}` : 'Seleccionar Plantilla') : 'Rubro Personalizado'}
            </h1>
            <p className="text-[10px] font-black text-apple-blue uppercase tracking-widest">{obraNombre}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-28 space-y-12 pb-20">
        {mode === 'select' && (
          <div className="grid md:grid-cols-2 gap-8 animate-apple-slide-up">
            <button
              onClick={() => setMode('template')}
              className="group relative h-[400px] bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 text-left border border-apple-gray-100 dark:border-white/5 shadow-apple-float hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-16 h-16 bg-apple-blue/10 rounded-[28px] flex items-center justify-center text-apple-blue shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-foreground tracking-tighter mb-4 leading-none">Usar<br />Plantilla</h3>
                  <p className="text-lg text-apple-gray-400 font-medium leading-relaxed mb-6">
                    Acelera el proceso con configuraciones predefinidas del sistema o las tuyas propias.
                  </p>
                  <p className="text-xs font-black text-apple-blue uppercase tracking-widest flex items-center gap-2">
                    {plantillas.length} Disponibles <ArrowLeft className="w-4 h-4 rotate-180" />
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('manual')}
              className="group relative h-[400px] bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 text-left border border-apple-gray-100 dark:border-white/5 shadow-apple-float hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-[28px] flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Settings className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-foreground tracking-tighter mb-4 leading-none">Crear<br />Manual</h3>
                  <p className="text-lg text-apple-gray-400 font-medium leading-relaxed mb-6">
                    Define cada detalle desde cero para necesidades específicas fuera del estándar.
                  </p>
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    Configuración libre <ArrowLeft className="w-4 h-4 rotate-180" />
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {mode === 'template' && !selectedPlantilla && (
          <div className="space-y-12 animate-apple-slide-up">
            {['Sistema', 'Mis Plantillas'].map((title, idx) => {
              const isFirst = idx === 0
              const items = isFirst ? plantillas.filter(p => p.es_sistema) : plantillas.filter(p => !p.es_sistema)
              if (items.length === 0) return null

              return (
                <div key={title} className="space-y-6">
                  <h2 className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.3em] px-4">{title}</h2>
                  <div className="grid md:grid-cols-2 gap-4 px-2">
                    {items.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPlantilla(p)}
                        className="group flex items-center justify-between p-6 bg-white dark:bg-apple-gray-50 rounded-[32px] border border-apple-gray-100 dark:border-white/5 hover:border-apple-blue/40 transition-all duration-500 hover:shadow-apple-lg hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isFirst ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500")}>
                            <Layers className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-black text-foreground group-hover:text-apple-blue transition-colors">{p.nombre}</h4>
                            <p className="text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest">{p.unidad} • {p.insumos?.length || 0} Insumos</p>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-apple-gray-100 group-hover:text-apple-blue transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {(mode === 'manual' || (mode === 'template' && selectedPlantilla)) && (
          <form
            onSubmit={mode === 'manual' ? handleSubmitManual : handleSubmitTemplate}
            className="max-w-2xl mx-auto space-y-10 animate-apple-slide-up"
          >
            {error && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] text-red-600 flex items-center gap-4">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-bold tracking-tight">{error}</p>
              </div>
            )}

            <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 border border-apple-gray-100 dark:border-white/5 shadow-apple-lg space-y-8">
              {mode === 'template' && selectedPlantilla && (
                <div className="p-6 bg-apple-blue/[0.03] dark:bg-white/[0.02] rounded-[32px] border border-apple-blue/10 flex items-start gap-5">
                  <div className="w-12 h-12 bg-apple-blue text-white rounded-2xl flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground tracking-tight">Utilizando "{selectedPlantilla.nombre}"</h4>
                    <p className="text-xs text-apple-gray-400 font-medium leading-relaxed mt-1">
                      Se copiarán automáticamente {selectedPlantilla.insumos?.length || 0} insumos base de esta plantilla al catálogo de la obra una vez confirmes.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 mb-2 block">Nombre del Rubro</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    disabled={mode === 'template'}
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-apple-gray-50 dark:bg-black/20 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all text-lg font-bold disabled:opacity-50"
                    placeholder="Ej: Albañilería de Elevación"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 mb-2 block">Unidad de Medida</label>
                  <select
                    name="unidad"
                    disabled={mode === 'template'}
                    value={formData.unidad}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-apple-gray-50 dark:bg-black/20 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all text-lg font-bold disabled:opacity-50 appearance-none"
                  >
                    {UNIDADES_RUBRO.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 mb-2 block">Presupuesto Estimado (UR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="presupuesto_ur"
                      required
                      step="0.01"
                      min="0"
                      autoFocus
                      value={formData.presupuesto_ur}
                      onChange={handleChange}
                      className="w-full px-8 py-5 bg-apple-gray-50 dark:bg-black/20 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all text-2xl font-black tracking-tighter pr-16"
                      placeholder="0.00"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-apple-blue tracking-widest text-xs">UR</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !formData.presupuesto_ur}
                className="w-full py-6 bg-apple-blue text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-apple-float hover:bg-apple-blue-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {saving ? 'PROCESANDO...' : 'GUARDAR RUBRO'}
              </button>
            </div>

            <p className="text-center text-[10px] font-bold text-apple-gray-300 uppercase tracking-[0.2em]">
              Se creará un rubro estático vinculado a este presupuesto. Podrás añadir insumos adicionales más tarde.
            </p>
          </form>
        )}
      </main>
    </div>
  )
}

function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  )
}
