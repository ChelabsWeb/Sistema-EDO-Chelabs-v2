'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createObra } from '@/app/actions/obras'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Building2, MapPin, Users, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'

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
    <div className="min-h-screen bg-[--color-apple-gray-100]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[--color-apple-gray-200]/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link
            href="/obras"
            className="w-10 h-10 rounded-full bg-[--color-apple-gray-100] hover:bg-[--color-apple-gray-200] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[--color-apple-gray-500]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[--color-apple-gray-600]">Nueva Obra</h1>
            <p className="text-sm text-[--color-apple-gray-400]">Crea un nuevo proyecto de construccion</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/50 overflow-hidden">
          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 text-red-700 px-4 py-3 rounded-[16px] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500 text-lg">!</span>
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="p-6 md:p-8 space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-semibold text-[--color-apple-gray-600]">
                <Building2 className="w-4 h-4 text-[--color-apple-gray-400]" />
                Nombre de la Obra *
              </label>
              <Input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Edificio Torres del Parque"
              />
            </div>

            {/* Cooperativa */}
            <div className="space-y-2">
              <label htmlFor="cooperativa" className="flex items-center gap-2 text-sm font-semibold text-[--color-apple-gray-600]">
                <Users className="w-4 h-4 text-[--color-apple-gray-400]" />
                Cooperativa
              </label>
              <Input
                type="text"
                id="cooperativa"
                name="cooperativa"
                value={formData.cooperativa}
                onChange={handleChange}
                placeholder="Ej: Cooperativa Las Acacias"
              />
            </div>

            {/* Direccion */}
            <div className="space-y-2">
              <label htmlFor="direccion" className="flex items-center gap-2 text-sm font-semibold text-[--color-apple-gray-600]">
                <MapPin className="w-4 h-4 text-[--color-apple-gray-400]" />
                Direccion
              </label>
              <Input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Av. Rivera 1234, Montevideo"
              />
            </div>

            {/* Presupuesto */}
            <div className="space-y-2">
              <label htmlFor="presupuesto_total" className="flex items-center gap-2 text-sm font-semibold text-[--color-apple-gray-600]">
                <DollarSign className="w-4 h-4 text-[--color-apple-gray-400]" />
                Presupuesto Total (UYU)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[--color-apple-gray-400] font-medium">$</span>
                <Input
                  type="number"
                  id="presupuesto_total"
                  name="presupuesto_total"
                  value={formData.presupuesto_total}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Fechas con DatePicker moderno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[--color-apple-gray-600]">
                  <Calendar className="w-4 h-4 text-[--color-apple-gray-400]" />
                  Fecha de Inicio
                </label>
                <DatePicker
                  date={fechaInicio}
                  onSelect={setFechaInicio}
                  placeholder="Seleccionar fecha"
                  toDate={fechaFin}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[--color-apple-gray-600]">
                  <Calendar className="w-4 h-4 text-[--color-apple-gray-400]" />
                  Fecha Fin Estimada
                </label>
                <DatePicker
                  date={fechaFin}
                  onSelect={setFechaFin}
                  placeholder="Seleccionar fecha"
                  fromDate={fechaInicio}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 py-6 bg-[--color-apple-gray-50] border-t border-[--color-apple-gray-200]/50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/obras')}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px] btn-glow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Crear Obra'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
