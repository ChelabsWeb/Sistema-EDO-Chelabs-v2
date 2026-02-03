'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateRubro, getRubro } from '@/app/actions/rubros'
import { getObra } from '@/app/actions/obras'
import { UNIDADES_RUBRO } from '@/lib/constants/rubros-predefinidos'
import { formatPesos } from '@/lib/utils/currency'
import { AppleSelector } from '@/components/ui/apple-selector'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Edit3, Settings, Calculator,
  CheckCircle2, Loader2, AlertTriangle,
  Sparkles, Layers, Info, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
        setPresupuestoPesos(rubro.presupuesto || 0)
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-black p-6">
        <Loader2 className="w-12 h-12 text-apple-blue animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Sincronizando Archivos...</p>
      </div>
    )
  }

  const formattedUnidades = UNIDADES_RUBRO.map(u => ({
    id: u.value,
    nombre: u.label,
    subtitle: `Unidad estándar para ${u.label.toLowerCase()}`
  }))

  return (
    <div className="min-h-screen antialiased bg-[#f5f5f7] dark:bg-black p-6 md:p-14 space-y-12">
      {/* Premium Apple Header */}
      <nav className="flex items-center justify-between animate-apple-fade-in mb-8">
        <div className="flex items-center gap-6">
          <Link
            href={`/obras/${obraId}`}
            className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 text-apple-gray-500 group-hover:text-apple-blue transition-colors" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em]">Configuración de Obra</span>
              <span className="w-1.5 h-1.5 rounded-full bg-apple-gray-200" />
              <span className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest italic">{obraNombre}</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter italic uppercase">
              Editar Rubro Presupuestal
            </h1>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shadow-inner relative overflow-hidden hidden sm:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <Settings className="w-7 h-7 relative z-10" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto space-y-12 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-12">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center gap-6 text-red-500 shadow-2xl shadow-red-500/5"
              >
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Error de Validación</p>
                  <p className="text-lg font-black tracking-tight">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-12 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-apple-blue/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-apple-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-apple-blue/20">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black text-foreground tracking-tight uppercase italic">General</h3>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block">Nombre del Rubro</label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleInputChange}
                        autoFocus
                        className="w-full px-8 py-5 bg-apple-gray-50/50 dark:bg-black/40 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-8 focus:ring-apple-blue/5 transition-all text-xl font-bold tracking-tight shadow-inner"
                        placeholder="Ej: Albañilería, Sanitaria..."
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block">Unidad de Medida</label>
                      <AppleSelector
                        options={formattedUnidades}
                        value={formData.unidad}
                        onSelect={handleUnidadChange}
                        placeholder="Seleccionar unidad..."
                        icon={<Layers className="w-4 h-4 text-apple-blue" />}
                        size="md"
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black text-foreground tracking-tight uppercase italic">Presupuesto</h3>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] ml-2 block">Asignación Base (UR)</label>
                      <div className="relative group">
                        <input
                          type="number"
                          name="presupuesto_ur"
                          required
                          step="0.01"
                          min="0"
                          value={formData.presupuesto_ur}
                          onChange={handleInputChange}
                          className="w-full px-8 py-5 bg-apple-gray-50/50 dark:bg-black/40 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-8 focus:ring-apple-blue/5 transition-all text-4xl font-black tracking-tighter pr-20 shadow-inner"
                          placeholder="0.00"
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-apple-blue tracking-widest text-xs">UR</span>
                      </div>
                    </div>

                    <div className="p-8 bg-apple-blue/[0.03] dark:bg-white/5 rounded-[32px] border border-apple-blue/10 flex items-start gap-6 group hover:translate-y-[-2px] transition-all">
                      <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-apple-blue shadow-sm shrink-0">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Equivalente Proyectado</p>
                        <p className="text-3xl font-black text-foreground tracking-tighter italic">
                          {formatPesos(presupuestoPesos)}
                        </p>
                        <p className="text-[9px] font-bold text-apple-gray-200 uppercase tracking-[0.2em] mt-1 shrink-0">
                          Basado en cotización actual
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row items-center justify-end gap-6 relative z-10 border-t border-apple-gray-100 dark:border-white/10">
                  <Link
                    href={`/obras/${obraId}`}
                    className="w-full sm:w-auto px-10 py-4 text-[11px] font-black uppercase tracking-widest text-apple-gray-400 hover:text-foreground transition-colors"
                  >
                    Descartar Cambios
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto h-20 px-16 bg-apple-blue text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-apple-float hover:bg-apple-blue-dark transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        PROCESANDO...
                      </>
                    ) : (
                      <>
                        Confirmar Cambios
                        <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </main>

      {/* Background Micro-elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-apple-blue/5 blur-[140px] rounded-full animate-apple-fade-in" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[140px] rounded-full animate-apple-fade-in" />
      </div>
    </div>
  )
}
