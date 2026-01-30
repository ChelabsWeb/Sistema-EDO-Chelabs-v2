'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createObra } from '@/app/actions/obras'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Building2, MapPin, Users, DollarSign, Calendar, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function NuevaObraPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    cooperativa: '',
    presupuesto_total: '',
  })

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>()
  const [fechaFin, setFechaFin] = useState<Date | undefined>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createObra({
      nombre: formData.nombre,
      direccion: formData.direccion || null,
      cooperativa: formData.cooperativa || null,
      presupuesto_total: formData.presupuesto_total ? parseFloat(formData.presupuesto_total) : null,
      fecha_inicio: fechaInicio ? format(fechaInicio, 'yyyy-MM-dd') : null,
      fecha_fin_estimada: fechaFin ? format(fechaFin, 'yyyy-MM-dd') : null,
    })

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/obras')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased selection:bg-apple-blue/10">
      {/* Premium Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-16 animate-apple-fade-in">
        <div className="flex items-center gap-6">
          <Link
            href="/obras"
            className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue" />
          </Link>
          <div>
            <p className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em] mb-0.5">Gestión de Portafolio</p>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Nueva Iniciación</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
          <Sparkles className="w-4 h-4 text-apple-blue" />
          <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Proyecto Nivel 1</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="max-w-4xl mx-auto animate-apple-slide-up">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 overflow-hidden relative">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-apple-blue/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {error && (
            <div className="mx-10 mt-10 p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400 animate-apple-slide-up">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="p-10 md:p-16 space-y-14 relative z-10">
            {/* Identity Group */}
            <div className="space-y-10">
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
                  placeholder="Ej: Edificio Torres del Parque"
                  className="w-full text-4xl md:text-5xl font-black text-foreground tracking-tighter bg-transparent border-b-2 border-apple-gray-50 dark:border-white/5 focus:border-apple-blue outline-none transition-all pb-6 placeholder:text-apple-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <Users className="w-4 h-4 text-apple-gray-300" />
                    <label htmlFor="cooperativa" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Entidad / Cooperativa</label>
                  </div>
                  <Input
                    type="text"
                    id="cooperativa"
                    name="cooperativa"
                    value={formData.cooperativa}
                    onChange={handleChange}
                    placeholder="Nombre oficial..."
                    className="h-14 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <MapPin className="w-4 h-4 text-apple-gray-300" />
                    <label htmlFor="direccion" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Ubicación de Obra</label>
                  </div>
                  <Input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Dirección exacta..."
                    className="h-14 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Financial Group */}
            <div className="pt-10 border-t border-apple-gray-100 dark:border-white/5 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <DollarSign className="w-4 h-4 text-apple-blue" />
                <label htmlFor="presupuesto_total" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Presupuesto Total de Inversión UYU</label>
              </div>
              <div className="relative group max-w-md">
                <div className="absolute inset-y-0 left-8 flex items-center">
                  <span className="text-3xl font-black text-apple-gray-100 group-focus-within:text-apple-blue transition-colors">$</span>
                </div>
                <Input
                  type="number"
                  id="presupuesto_total"
                  name="presupuesto_total"
                  value={formData.presupuesto_total}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="h-24 pl-16 pr-8 text-4xl font-black text-foreground rounded-[32px] bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/10 focus:ring-8 focus:ring-apple-blue/10 focus:border-apple-blue transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Timeline Group */}
            <div className="pt-10 border-t border-apple-gray-100 dark:border-white/5 space-y-8">
              <div className="flex items-center gap-3 px-2">
                <Calendar className="w-4 h-4 text-apple-blue" />
                <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-[0.2em]">Cronograma Estimado</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest ml-4">Arranque de Obra</p>
                  <div className="p-4 bg-apple-gray-50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 shadow-inner">
                    <DatePicker
                      date={fechaInicio}
                      onSelect={setFechaInicio}
                      placeholder="Fijar fecha de inicio"
                      toDate={fechaFin}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest ml-4">Entrega Proyectada</p>
                  <div className="p-4 bg-apple-gray-50 dark:bg-black/20 rounded-[32px] border border-apple-gray-100 dark:border-white/5 shadow-inner">
                    <DatePicker
                      date={fechaFin}
                      onSelect={setFechaFin}
                      placeholder="Fijar cierre estimado"
                      fromDate={fechaInicio}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Apple-Style Footer */}
          <footer className="px-10 py-10 bg-apple-gray-50/50 dark:bg-black/20 backdrop-blur-md border-t border-apple-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
            <div className="flex items-center gap-4 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">
              <Check className="w-5 h-5 text-emerald-500" />
              Los datos podrán editarse después
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
              <button
                type="button"
                onClick={() => router.push('/obras')}
                className="flex-1 md:flex-none px-10 py-5 text-apple-gray-400 font-black text-xs uppercase tracking-widest hover:text-foreground transition-all"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.nombre}
                className="flex-[2] md:flex-none h-20 px-14 rounded-[28px] bg-apple-blue text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-apple-blue-dark active:scale-95 transition-all shadow-apple-float disabled:opacity-30 flex items-center justify-center gap-4 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    Crear Nueva Obra
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>

        {/* Semantic Hint Area */}
        <div className="mt-12 text-center text-[10px] font-black text-apple-gray-200 uppercase tracking-[0.4em]">
          Sistema de Gestión EDO • v2.0 Ultimate Edition
        </div>
      </main>
    </div>
  )
}
