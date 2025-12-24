'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RubroCard } from './rubro-card'
import { getRubrosWithInsumos } from '@/app/actions/rubro-insumos'
import type { RubroWithInsumos, UserRole } from '@/types/database'

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
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Rubros</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Rubros</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {predefinidos.length} predefinidos, {personalizados.length} personalizados
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/rubros/nuevo`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Rubro
        </Link>
      </div>
      <div className="p-4">
        {rubros.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-gray-500 mb-4">No hay rubros definidos</p>
            <Link
              href={`/obras/${obraId}/rubros/nuevo`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Agregar primer rubro
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
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
