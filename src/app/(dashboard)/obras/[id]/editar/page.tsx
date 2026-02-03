'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getObra, updateObra, archiveObra } from '@/app/actions/obras'
import type { Obra, ObraEstado } from '@/types/database'
import {
  ArrowLeft, Building2, MapPin, Users, DollarSign,
  Calendar, Check, Loader2, AlertCircle, Archive,
  Activity, Clock, CheckCircle2, Settings, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DatePicker } from '@/components/ui/date-picker'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditarObraPage({ params }: Props) {
  const router = useRouter()
  const [id, setId] = useState<string | null>(null)
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
      const resolvedParams = await params
      setId(resolvedParams.id)

      const result = await getObra(resolvedParams.id)
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
  }, [params])

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

    // Add a small vibrate for physical feedback
    if ('vibrate' in navigator) navigator.vibrate(50)

    // Smooth redirect after success
    setTimeout(() => {
      router.push(`/obras/${id}`)
    }, 1500)
  }

  const handleArchive = async () => {
    if (!id) return
    if (!confirm('Esta acción archivará la obra permanentemente de la vista principal. ¿Deseas continuar?')) return

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
      <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
        <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] animate-pulse">Cargando Parámetros...</p>
      </div>
    )
  }

  const estados: { val: ObraEstado; label: string; icon: any; color: string }[] = [
    { val: 'activa', label: 'Activa', icon: Activity, color: 'text-emerald-500' },
    { val: 'pausada', label: 'Pausada', icon: Clock, color: 'text-amber-500' },
    { val: 'finalizada', label: 'Finalizada', icon: CheckCircle2, color: 'text-apple-gray-400' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased selection:bg-apple-blue/10">
      {/* Premium Navigation Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-16 animate-apple-fade-in">
        <div className="flex items-center gap-6">
          <Link
            href={`/obras/${id}`}
            className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-apple-blue" />
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Configuración del Sistema</p>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Editar Obra</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
          <span className="text-[10px] font-black text-apple-blue tracking-widest uppercase">ID: {id?.substring(0, 8)}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto animate-apple-slide-up">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 overflow-hidden relative">
          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="p-10 md:p-16 space-y-16 relative z-10">
            {/* Status Segmented Control */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <Activity className="w-4 h-4 text-apple-blue" />
                <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Estado Operativo</label>
              </div>
              <div className="grid grid-cols-3 gap-4 p-2 bg-apple-gray-50/50 dark:bg-black/20 rounded-3xl border border-apple-gray-100 dark:border-white/5 shadow-inner">
                {estados.map((est) => (
                  <button
                    key={est.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: est.val })}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-500",
                      formData.estado === est.val
                        ? "bg-white dark:bg-apple-gray-50 shadow-apple text-foreground"
                        : "text-apple-gray-300 hover:text-apple-gray-400 hover:bg-white/50 dark:hover:bg-white/5"
                    )}
                  >
                    <est.icon className={cn("w-5 h-5 transition-transform", formData.estado === est.val && "scale-110", est.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{est.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* General Information */}
            <div className="space-y-10 pt-10 border-t border-apple-gray-100 dark:border-white/5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <Building2 className="w-4 h-4 text-apple-blue" />
                  <label htmlFor="nombre" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Identidad del Proyecto</label>
                </div>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre de la Obra"
                  className="w-full text-4xl md:text-5xl font-black text-foreground tracking-tighter bg-transparent border-b-2 border-apple-gray-50 dark:border-white/5 focus:border-apple-blue outline-none transition-all pb-6 placeholder:text-apple-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <Users className="w-4 h-4 text-apple-gray-300" />
                    <label htmlFor="cooperativa" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Entidad / Cooperativa</label>
                  </div>
                  <input
                    type="text"
                    id="cooperativa"
                    name="cooperativa"
                    value={formData.cooperativa}
                    onChange={handleChange as any}
                    placeholder="Cooperativa / Propietario"
                    className="w-full h-14 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <MapPin className="w-4 h-4 text-apple-gray-300" />
                    <label htmlFor="direccion" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Ubicación</label>
                  </div>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange as any}
                    placeholder="Dirección completa"
                    className="w-full h-14 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Financial Group */}
            <div className="pt-10 border-t border-apple-gray-100 dark:border-white/5 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <DollarSign className="w-4 h-4 text-apple-blue" />
                <label htmlFor="presupuesto_total" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Presupuesto Total UYU</label>
              </div>
              <div className="relative group max-w-md">
                <div className="absolute inset-y-0 left-8 flex items-center">
                  <span className="text-3xl font-black text-apple-gray-100 group-focus-within:text-apple-blue transition-colors">$</span>
                </div>
                <input
                  type="number"
                  id="presupuesto_total"
                  name="presupuesto_total"
                  value={formData.presupuesto_total}
                  onChange={handleChange as any}
                  step="0.01"
                  min="0"
                  className="w-full h-24 pl-16 pr-8 text-4xl font-black text-foreground rounded-[32px] bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/10 focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue transition-all outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Timeline Group */}
            <div className="pt-10 border-t border-apple-gray-100 dark:border-white/5 space-y-10">
              <div className="flex items-center gap-3 px-2">
                <Calendar className="w-4 h-4 text-apple-blue" />
                <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Cronograma</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest ml-4">Fecha de Inicio</p>
                  <div className="p-4 bg-apple-gray-50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 shadow-inner">
                    <DatePicker
                      date={fechaInicio}
                      onSelect={setFechaInicio}
                      placeholder="Fijar inicio"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest ml-4">Cierre Estimado</p>
                  <div className="p-4 bg-apple-gray-50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 shadow-inner">
                    <DatePicker
                      date={fechaFin}
                      onSelect={setFechaFin}
                      placeholder="Fijar fin"
                    />
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-6 rounded-3xl flex items-center gap-4 border shadow-sm",
                    error ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                      : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {error ? <AlertCircle className="w-6 h-6 shrink-0" /> : <CheckCircle2 className="w-6 h-6 shrink-0" />}
                  <p className="text-sm font-bold uppercase tracking-tight">{error || success}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Action Bar */}
          <footer className="px-10 py-10 bg-apple-gray-50/50 dark:bg-black/20 backdrop-blur-md border-t border-apple-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
            <button
              type="button"
              onClick={handleArchive}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-30"
            >
              <Archive className="w-4 h-4" />
              Archivar Proyecto
            </button>

            <div className="flex items-center gap-6 w-full md:w-auto">
              <Link
                href={`/obras/${id}`}
                className="flex-1 md:flex-none px-10 py-5 text-apple-gray-400 font-black text-xs uppercase tracking-widest hover:text-foreground transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.nombre}
                className="flex-[2] md:flex-none h-20 px-14 rounded-[28px] bg-apple-blue text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-apple-blue-dark active:scale-95 transition-all shadow-apple-float disabled:opacity-30 flex items-center justify-center gap-4 group"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    Guardar Cambios
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>

        <div className="mt-12 text-center text-[10px] font-black text-apple-gray-200 uppercase tracking-[0.4em]">
          Sistema de Gestión EDO • v2.0 Ultimate Edition
        </div>
      </main>
    </div>
  )
}
