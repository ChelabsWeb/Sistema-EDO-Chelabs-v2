import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos, formatUR, convertURtoPesos } from '@/lib/utils/currency'
import { getCotizacionUR } from '@/app/actions/configuracion'
import { getDeviationsByRubro } from '@/app/actions/costos'
import { DeleteObraButton } from '@/components/edo/obra/delete-obra-button'
import { DeleteRubroButton } from '@/components/edo/rubro/delete-rubro-button'
import { RubroDeviations } from '@/components/edo/costos/rubro-deviations'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ObraDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get user profile to check permissions
  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single()

  const isAdmin = profile?.rol === 'admin'

  type ObraRow = {
    id: string
    nombre: string
    direccion: string | null
    cooperativa: string | null
    presupuesto_total: number | null
    estado: string
  }
  type RubroRow = {
    id: string
    nombre: string
    unidad: string
    presupuesto: number
    presupuesto_ur: number | null
    es_predefinido: boolean | null
  }
  type OTRow = {
    id: string
    numero: number
    descripcion: string
    estado: string
    rubros: { nombre: string } | null
  }

  const { data: obra, error } = await supabase
    .from('obras')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single() as { data: ObraRow | null; error: Error | null }

  if (error || !obra) {
    notFound()
  }

  // Get cotizacion
  const cotizacion = await getCotizacionUR()

  // Get rubros for this obra (excluding deleted)
  const { data: rubros } = await supabase
    .from('rubros')
    .select('*')
    .eq('obra_id', id)
    .is('deleted_at', null)
    .order('nombre') as { data: RubroRow[] | null }

  // Get OTs for this obra (excluding deleted)
  const { data: ordenesTrabajo } = await supabase
    .from('ordenes_trabajo')
    .select('*, rubros(nombre)')
    .eq('obra_id', id)
    .is('deleted_at', null)
    .order('numero', { ascending: false })
    .limit(5) as { data: OTRow[] | null }

  // Get deviations by rubro
  const deviationsResult = await getDeviationsByRubro(id)
  const deviations = deviationsResult.success ? deviationsResult.data : []

  // Calculate totals
  const presupuestoRubrosUR = rubros?.reduce((sum, r) => sum + Number(r.presupuesto_ur || 0), 0) || 0
  const presupuestoRubrosPesos = convertURtoPesos(presupuestoRubrosUR, cotizacion)

  const estadoColors: Record<string, string> = {
    activa: 'bg-green-100 text-green-800',
    pausada: 'bg-yellow-100 text-yellow-800',
    finalizada: 'bg-gray-100 text-gray-800',
  }

  const otStatusColors: Record<string, string> = {
    borrador: 'bg-gray-100 text-gray-800',
    aprobada: 'bg-blue-100 text-blue-800',
    en_ejecucion: 'bg-yellow-100 text-yellow-800',
    cerrada: 'bg-green-100 text-green-800',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/obras" className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{obra.nombre}</h1>
            <span className={`px-2 py-1 text-xs font-medium rounded ${estadoColors[obra.estado]}`}>
              {obra.estado.charAt(0).toUpperCase() + obra.estado.slice(1)}
            </span>
          </div>
          <div className="ml-9 space-y-1">
            {obra.cooperativa && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Cooperativa:</span> {obra.cooperativa}
              </p>
            )}
            {obra.direccion && (
              <p className="text-sm text-gray-500">{obra.direccion}</p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Presupuesto Total</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatPesos(obra.presupuesto_total)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Asignado a Rubros (UR)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatUR(presupuestoRubrosUR)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatPesos(presupuestoRubrosPesos)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Cotizacion UR</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatPesos(cotizacion)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500">Ordenes de Trabajo</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {ordenesTrabajo?.length || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rubros */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Rubros</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {rubros?.filter(r => r.es_predefinido).length || 0} predefinidos, {rubros?.filter(r => !r.es_predefinido).length || 0} personalizados
                </p>
              </div>
              <Link
                href={`/obras/${id}/rubros/nuevo`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Agregar Personalizado
              </Link>
            </div>
            <div className="p-6">
              {rubros && rubros.length > 0 ? (
                <div className="space-y-3">
                  {rubros.map((rubro) => (
                    <div
                      key={rubro.id}
                      className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">{rubro.nombre}</span>
                          <span className="text-sm text-gray-500">({rubro.unidad})</span>
                          {!rubro.es_predefinido && (
                            <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                              personalizado
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex gap-3">
                          <Link
                            href={`/obras/${id}/rubros/${rubro.id}/formula`}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Ver/Editar Formula
                          </Link>
                          <Link
                            href={`/obras/${id}/rubros/${rubro.id}/editar`}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Editar Presupuesto
                          </Link>
                          <DeleteRubroButton rubroId={rubro.id} rubroNombre={rubro.nombre} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatUR(rubro.presupuesto_ur)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPesos(convertURtoPesos(rubro.presupuesto_ur || 0, cotizacion))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay rubros definidos</p>
                  <Link
                    href={`/obras/${id}/rubros/nuevo`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Agregar primer rubro
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Ultimas OTs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Ultimas Ordenes de Trabajo</h2>
              <div className="flex gap-3">
                <Link
                  href={`/obras/${id}/ordenes-trabajo`}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Ver todas
                </Link>
                <Link
                  href={`/obras/${id}/ordenes-trabajo/nueva`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Nueva OT
                </Link>
              </div>
            </div>
            <div className="p-6">
              {ordenesTrabajo && ordenesTrabajo.length > 0 ? (
                <div className="space-y-3">
                  {ordenesTrabajo.map((ot) => (
                    <Link
                      key={ot.id}
                      href={`/obras/${id}/ordenes-trabajo/${ot.id}`}
                      className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-900">OT-{ot.numero}</span>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ot.descripcion}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${otStatusColors[ot.estado]}`}>
                          {ot.estado.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay ordenes de trabajo</p>
                  <Link
                    href={`/obras/${id}/ordenes-trabajo/nueva`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Crear primera OT
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deviations by Rubro */}
        <div className="mt-8">
          <RubroDeviations deviations={deviations} />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/obras/${id}/editar`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Editar Obra
          </Link>
          <Link
            href={`/obras/${id}/insumos`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Gestionar Insumos
          </Link>
          <Link
            href={`/obras/${id}/usuarios`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Usuarios Asignados
          </Link>
          {isAdmin && (
            <DeleteObraButton obraId={id} obraNombre={obra.nombre} />
          )}
        </div>
      </main>
    </div>
  )
}
