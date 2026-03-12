'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RubroCard } from './rubro-card'
import { getRubrosWithInsumos } from '@/app/actions/rubro-insumos'
import type { RubroWithInsumos, UserRole } from '@/types/database'
import { Plus, Layers, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Cargando Rubros...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <span className="text-xs font-semibold text-muted-foreground">{predefinidos.length} Predefinidos</span>
           <span className="text-muted-foreground">•</span>
           <span className="text-xs font-semibold text-muted-foreground">{personalizados.length} Personalizados</span>
        </div>
      </div>

      <div>
        {rubros.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed rounded-xl bg-muted/10 space-y-4">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Estructura Vacía</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                 Comienza agregando los rubros que compondrán el presupuesto de esta obra.
              </p>
            </div>
            <Button asChild className="mt-4">
               <Link href={`/obras/${obraId}/rubros/nuevo`}>
                 <Plus className="w-4 h-4 mr-2" />
                 Agregar primer rubro
               </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
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
