'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RubroCard } from './rubro-card'
import { getRubrosWithInsumos } from '@/app/actions/rubro-insumos'
import type { RubroWithInsumos, UserRole } from '@/types/database'
import { Plus, Layers, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RubrosListProps {
  obraId: string
  userRole: UserRole
  valorUr: number
}

export function RubrosList({ obraId, userRole, valorUr }: RubrosListProps) {
  const [rubros, setRubros] = useState<RubroWithInsumos[]>([])
  const [loading, setLoading] = useState(true)

  const loadRubros = async () => {
    const result = await getRubrosWithInsumos(obraId)
    if (result.success && result.data) {
      setRubros(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRubros()
  }, [obraId])

  const handleRefresh = () => {
    loadRubros()
  }

  const predefinidos = rubros.filter(r => r.es_predefinido)
  const personalizados = rubros.filter(r => !r.es_predefinido)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="w-12 h-12 text-apple-blue animate-spin mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-gray-400">Sincronizando Estructura...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Info (Subtle) */}
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-[10px] font-black text-apple-gray-500 uppercase tracking-[0.2em]">
            {predefinidos.length} PREDEFINIDOS <span className="mx-2 text-apple-gray-100 dark:text-white/5">•</span> {personalizados.length} PERSONALIZADOS
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/rubros/nuevo`}
          className="flex items-center gap-2 text-[10px] font-black text-apple-blue uppercase tracking-widest hover:underline transition-all group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Nuevo Rubro
        </Link>
      </div>

      <div>
        {rubros.length === 0 ? (
          <div className="text-center py-20 space-y-8 bg-white/[0.02] backdrop-blur-xl rounded-[40px] border border-dashed border-white/5 mx-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center mx-auto shadow-2xl relative z-10">
              <Layers className="w-10 h-10 text-slate-700" />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black text-white tracking-tight">Estructura Vacía</h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">Comienza agregando los rubros que compondrán el presupuesto de esta obra.</p>
            </div>
            <Link
              href={`/obras/${obraId}/rubros/nuevo`}
              className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-blue-500 transition-all active:scale-[0.95] shadow-xl shadow-blue-600/20 relative z-10"
            >
              Agregar primer rubro
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {rubros.map((rubro) => (
              <RubroCard
                key={rubro.id}
                rubro={rubro}
                userRole={userRole}
                valorUr={valorUr}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
