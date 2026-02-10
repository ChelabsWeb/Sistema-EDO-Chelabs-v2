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
  ChevronRight, Box, Calculator, Smartphone, Layout
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppleSelector } from '@/components/ui/apple-selector'
import { motion, AnimatePresence } from 'framer-motion'

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-black p-6">
        <Loader2 className="w-12 h-12 text-apple-blue animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Configurando Entorno...</p>
      </div>
    )
  }

  const formattedUnidades = UNIDADES_RUBRO.map(u => ({
    id: u.value,
    nombre: u.label,
    subtitle: `Unidad de medida: ${u.label}`
  }))

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased selection:bg-apple-blue/10">
      {/* Premium Apple Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 backdrop-blur-3xl bg-white/70 dark:bg-black/70 border-b border-apple-gray-100 dark:border-white/5 shadow-apple-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (selectedPlantilla) setSelectedPlantilla(null)
              else if (mode !== 'select') setMode('select')
              else router.back()
            }}
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-apple-gray-400 hover:text-apple-blue transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-apple-blue uppercase tracking-[0.2em]">Asistente de Presupuesto</span>
            </div>
            <h1 className="text-xl font-black text-foreground tracking-tight uppercase">
              {mode === 'select' ? 'Crear Nuevo Rubro' : mode === 'template' ? (selectedPlantilla ? `Configurar: ${selectedPlantilla.nombre}` : 'Plantillas Inteligentes') : 'Configuración Manual'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right hidden sm:block">
          <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest leading-none">Obra Destino</p>
          <p className="text-sm font-bold text-foreground">{obraNombre}</p>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-32 space-y-12 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid md:grid-cols-2 gap-10"
            >
              <button
                onClick={() => setMode('template')}
                className="group relative h-[480px] bg-white dark:bg-apple-gray-50 rounded-[56px] p-12 text-left border border-apple-gray-100 dark:border-white/5 shadow-apple-float hover:shadow-apple-lg hover:-translate-y-2 transition-all duration-700 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-apple-blue/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-20 h-20 bg-apple-blue/10 rounded-[32px] flex items-center justify-center text-apple-blue shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-5xl font-black text-foreground tracking-tighter leading-none uppercase">Smart<br />Templates</h3>
                    <p className="text-xl text-apple-gray-400 font-medium leading-relaxed max-w-xs">
                      Importa estructuras preconfiguradas con insumos y cuadrillas ya vinculadas.
                    </p>
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-apple-gray-50 bg-apple-gray-100 dark:bg-white/10 flex items-center justify-center">
                            <Box className="w-4 h-4 text-apple-blue" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-black text-apple-blue uppercase tracking-widest">{plantillas.length} disponibles</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 right-12 w-14 h-14 bg-apple-blue text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-500 shadow-xl shadow-apple-blue/20">
                  <ChevronRight className="w-8 h-8" />
                </div>
              </button>

              <button
                onClick={() => setMode('manual')}
                className="group relative h-[480px] bg-white dark:bg-apple-gray-50 rounded-[56px] p-12 text-left border border-apple-gray-100 dark:border-white/5 shadow-apple-float hover:shadow-apple-lg hover:-translate-y-2 transition-all duration-700 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Settings className="w-10 h-10" />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-5xl font-black text-foreground tracking-tighter leading-none uppercase">Configurable<br />Manual</h3>
                    <p className="text-xl text-apple-gray-400 font-medium leading-relaxed max-w-xs">
                      Crea un rubro desde cero definiendo nombre, unidad y presupuesto base.
                    </p>
                    <div className="h-10 flex items-center gap-2">
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">Full Control</span>
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">Custom Metrics</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 right-12 w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-500 shadow-xl shadow-emerald-500/20">
                  <ChevronRight className="w-8 h-8" />
                </div>
              </button>
            </motion.div>
          )}

          {mode === 'template' && !selectedPlantilla && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-16"
            >
              {['Catálogo de Sistema', 'Plantillas de Empresa'].map((title, idx) => {
                const isFirst = idx === 0
                const items = isFirst ? plantillas.filter(p => p.es_sistema) : plantillas.filter(p => !p.es_sistema)
                if (items.length === 0) return null

                return (
                  <div key={title} className="space-y-8">
                    <div className="flex items-center gap-4 px-4">
                      <div className={cn("w-1.5 h-6 rounded-full", isFirst ? "bg-apple-blue" : "bg-emerald-500")} />
                      <h2 className="text-[11px] font-black text-apple-gray-300 uppercase tracking-[0.4em]">{title}</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((p, pIdx) => (
                        <motion.button
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: pIdx * 0.05 }}
                          onClick={() => handleSelectPlantilla(p)}
                          className="group p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] border border-apple-gray-100 dark:border-white/5 hover:border-apple-blue transition-all duration-500 shadow-apple-sm hover:shadow-apple-float text-left flex flex-col justify-between gap-10 active:scale-[0.98]"
                        >
                          <div className="space-y-4">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", isFirst ? "bg-apple-blue/10 text-apple-blue" : "bg-emerald-500/10 text-emerald-500")}>
                              <Layout className="w-7 h-7" />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-foreground group-hover:text-apple-blue transition-colors leading-tight uppercase tracking-tight">{p.nombre}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Box size={14} className="text-apple-gray-300" />
                                <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{p.insumos?.length || 0} RECURSOS VINCULADOS</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-apple-gray-50 dark:border-white/5">
                            <span className="text-[10px] font-black text-apple-blue tracking-[0.2em]">{p.unidad.toUpperCase()}</span>
                            <div className="w-10 h-10 bg-apple-blue/5 rounded-full flex items-center justify-center group-hover:bg-apple-blue group-hover:text-white transition-all">
                              <Plus className="w-5 h-5" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}

          {(mode === 'manual' || (mode === 'template' && selectedPlantilla)) && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              <form
                onSubmit={mode === 'manual' ? handleSubmitManual : handleSubmitTemplate}
                className="space-y-12"
              >
                {error && (
                  <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[40px] text-red-600 flex items-center gap-6 shadow-2xl shadow-red-500/5">
                    <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Error de Configuración</p>
                      <p className="text-lg font-black tracking-tight">{error}</p>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-apple-gray-50 rounded-[56px] p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-apple-blue/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

                  {mode === 'template' && selectedPlantilla && (
                    <div className="p-8 bg-apple-blue/[0.03] dark:bg-white/[0.02] rounded-[40px] border border-apple-blue/10 flex items-start gap-6 relative z-10">
                      <button type="button" className="h-14 w-14 rounded-2xl bg-apple-blue text-white flex items-center justify-center shrink-0 shadow-lg shadow-apple-blue/20">
                        <Smartphone className="w-7 h-7" />
                      </button>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-foreground tracking-tight uppercase">Herencia Activa</h4>
                        <p className="text-sm text-apple-gray-400 font-medium leading-relaxed">
                          Has seleccionado <span className="text-apple-blue font-black">{selectedPlantilla.nombre}</span>. Se importarán automáticamente todos los insumos y ratios de producción asociados.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-10 relative z-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-4 block">Identidad del Rubro</label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        disabled={mode === 'template'}
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full px-10 py-6 bg-apple-gray-50/50 dark:bg-black/40 rounded-[32px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-8 focus:ring-apple-blue/5 transition-all text-2xl font-black tracking-tight disabled:opacity-50 shadow-inner"
                        placeholder="Ej: Albañilería de Elevación"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-4 block">Unidad de Gestión</label>
                        <AppleSelector
                          options={formattedUnidades}
                          value={formData.unidad}
                          onSelect={handleUnidadChange}
                          disabled={mode === 'template'}
                          icon={<Layers className="w-4 h-4 text-apple-blue" />}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-4 block">Presupuesto Inicial (UR)</label>
                        <div className="relative group/field">
                          <input
                            type="number"
                            name="presupuesto_ur"
                            required
                            step="0.01"
                            min="0"
                            autoFocus
                            value={formData.presupuesto_ur}
                            onChange={handleChange}
                            className="w-full px-10 py-6 bg-apple-gray-50/50 dark:bg-black/40 rounded-[32px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-8 focus:ring-apple-blue/5 transition-all text-3xl font-black tracking-tighter pr-20 shadow-inner"
                            placeholder="0.00"
                          />
                          <span className="absolute right-10 top-1/2 -translate-y-1/2 font-black text-apple-blue tracking-widest text-xs">UR</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 relative z-10">
                    <button
                      type="submit"
                      disabled={saving || !formData.presupuesto_ur}
                      className="w-full h-24 bg-apple-blue text-white rounded-[32px] font-black text-[13px] uppercase tracking-[0.3em] shadow-[0_25px_50px_rgba(0,122,255,0.3)] hover:bg-apple-blue-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:active:scale-100 flex items-center justify-center gap-4 group"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-7 h-7 animate-spin" />
                          PROCESANDO CONFIGURACIÓN...
                        </>
                      ) : (
                        <>
                          IMPLEMENTAR RUBRO EN OBRA
                          <CheckCircle2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-center mt-6 text-[9px] font-black text-apple-gray-400 dark:text-apple-gray-500 uppercase tracking-[0.3em]">
                      Acción irreversible. Podrás editar el presupuesto en cualquier momento.
                    </p>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-apple-blue/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-emerald-500/[0.03] blur-[150px] rounded-full" />
      </div>
    </div>
  )
}
