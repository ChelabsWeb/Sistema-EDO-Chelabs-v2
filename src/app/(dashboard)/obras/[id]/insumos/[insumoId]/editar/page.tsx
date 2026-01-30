'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateInsumo, getInsumo } from '@/app/actions/insumos'
import { getObra } from '@/app/actions/obras'
import { ArrowLeft, Package, Tag, DollarSign, CheckCircle2, Loader2, Info, Users, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string; insumoId: string }>
}

export default function EditarInsumoPage({ params }: Props) {
  const router = useRouter()
  const [obraId, setObraId] = useState<string | null>(null)
  const [insumoId, setInsumoId] = useState<string | null>(null)
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
    async function loadData() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)
      setInsumoId(resolvedParams.insumoId)

      const [obraResult, insumoResult] = await Promise.all([
        getObra(resolvedParams.id),
        getInsumo(resolvedParams.insumoId)
      ])

      if (obraResult.success) {
        setObraNombre(obraResult.data.nombre)
      }

      if (insumoResult.success) {
        const insumo = insumoResult.data
        setFormData({
          nombre: insumo.nombre,
          unidad: insumo.unidad,
          tipo: insumo.tipo || 'material',
          precio_referencia: insumo.precio_referencia?.toString() || '',
        })
      } else {
        setError('No se pudo cargar el insumo')
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obraId || !insumoId) return
    setSaving(true)
    setError(null)
    const result = await updateInsumo({
      id: insumoId,
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-apple-gray-50/20 dark:bg-black/20 animate-pulse">
        <Loader2 className="w-12 h-12 text-apple-blue animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-300">Cargando Suministro...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black/40 p-6 md:p-14 antialiased">
      {/* Header Glassmorphic */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 shadow-apple-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href={`/obras/${obraId}/insumos`}
            className="w-10 h-10 rounded-full glass dark:glass-dark flex items-center justify-center text-apple-gray-400 hover:text-foreground transition-all active:scale-95 shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">Editar Insumo</h1>
            <p className="text-[10px] font-black text-apple-blue uppercase tracking-widest">{obraNombre}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto pt-28 pb-20 animate-apple-slide-up">
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] text-red-600 flex items-center gap-4">
              <Info className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold tracking-tight">{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 border border-apple-gray-100 dark:border-white/5 shadow-apple-float space-y-12">

            {/* Field: Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.3em] ml-2 block">Nombre del Insumo</label>
              <div className="relative group">
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-8 py-6 bg-apple-gray-50 dark:bg-black/20 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-8 focus:ring-apple-blue/5 transition-all text-xl font-bold"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center text-apple-blue">
                  <Package className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Field Group: Unity & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.3em] ml-2 block">Unidad de Medida</label>
                <div className="relative">
                  <select
                    name="unidad"
                    value={formData.unidad}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-apple-gray-50 dark:bg-black/20 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue transition-all text-lg font-bold appearance-none"
                  >
                    <option value="unidad">Unidad (un)</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="lt">Litro (lt)</option>
                    <option value="m2">Metro cuadrado (m2)</option>
                    <option value="m3">Metro cúbico (m3)</option>
                    <option value="ml">Metro lineal (ml)</option>
                    <option value="bolsa">Bolsa</option>
                    <option value="hr">Hora (hr)</option>
                    <option value="jornal">Jornal</option>
                  </select>
                  <Tag className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.3em] ml-2 block">Tipo de Insumo</label>
                <div className="flex gap-2 p-1.5 bg-apple-gray-50 dark:bg-black/20 rounded-[24px] border border-apple-gray-100 dark:border-white/10">
                  {(['material', 'mano_de_obra'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, tipo: t }))}
                      className={cn(
                        "flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                        formData.tipo === t
                          ? "bg-white dark:bg-apple-gray-50 text-foreground shadow-apple-sm scale-[1.02]"
                          : "text-apple-gray-400 hover:text-foreground"
                      )}
                    >
                      {t === 'material' ? <Package className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                      {t === 'material' ? 'Material' : 'Recurso'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field: Price */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.3em] ml-2 block">Precio Referencia (UYU)</label>
              <div className="relative group">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="text-xl font-black text-apple-blue">$</span>
                </div>
                <input
                  type="number"
                  name="precio_referencia"
                  step="0.01"
                  min="0"
                  value={formData.precio_referencia}
                  onChange={handleChange}
                  className="w-full pl-16 pr-8 py-6 bg-apple-gray-50 dark:bg-black/20 rounded-[28px] border border-apple-gray-100 dark:border-white/10 focus:outline-none focus:border-apple-blue focus:ring-8 focus:ring-apple-blue/5 transition-all text-3xl font-black tracking-tighter"
                  placeholder="0.00"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-apple-gray-200 uppercase tracking-widest pointer-events-none">
                  POR {formData.unidad.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <Link
                href={`/obras/${obraId}/insumos`}
                className="flex-1 py-6 bg-apple-gray-100 dark:bg-white/5 text-apple-gray-400 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] border border-apple-gray-100 dark:border-white/5 hover:text-foreground transition-all text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.nombre}
                className="flex-[2] py-6 bg-apple-blue text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-apple-float hover:bg-apple-blue-dark transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
