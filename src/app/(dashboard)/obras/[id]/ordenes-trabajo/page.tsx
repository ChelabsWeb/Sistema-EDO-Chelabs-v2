import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import { OTStatusBadge } from '@/components/edo/ot/ot-status-badge'
import { OTFilters } from '@/components/edo/ot/ot-filters'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ estado?: string; search?: string }>
}

export default async function OrdenesTrabajoPage({ params, searchParams }: Props) {
  const { id: obraId } = await params
  const { estado, search } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get obra info
  const { data: obra } = await supabase
    .from('obras')
    .select('id, nombre')
    .eq('id', obraId)
    .single()

  if (!obra) notFound()

  // Build query
  let query = supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      rubros (
        id,
        nombre
      ),
      usuarios!ordenes_trabajo_created_by_fkey (
        id,
        nombre
      ),
      tareas (
        id,
        completada
      )
    `)
    .eq('obra_id', obraId)
    .order('created_at', { ascending: false })

  if (estado && estado !== 'todos') {
    query = query.eq('estado', estado as 'borrador' | 'aprobada' | 'en_ejecucion' | 'cerrada')
  }

  if (search) {
    const searchNum = parseInt(search)
    if (!isNaN(searchNum)) {
      query = query.or(`descripcion.ilike.%${search}%,numero.eq.${searchNum}`)
    } else {
      query = query.ilike('descripcion', `%${search}%`)
    }
  }

  const { data: ordenesTrabajo } = await query

  // Calculate progress for each OT
  const otsWithProgress = (ordenesTrabajo || []).map((ot) => {
    const tareas = ot.tareas as { id: string; completada: boolean | null }[] | null
    const totalTareas = tareas?.length || 0
    const tareasCompletadas = tareas?.filter(t => t.completada).length || 0
    const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0

    return {
      ...ot,
      progreso,
      totalTareas,
      tareasCompletadas,
    }
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/obras/${obraId}`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ordenes de Trabajo</h1>
              <p className="text-sm text-gray-500">{obra.nombre}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Actions and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <OTFilters currentEstado={estado} currentSearch={search} />
          <Link
            href={`/obras/${obraId}/ordenes-trabajo/nueva`}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva OT
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">
              {otsWithProgress.filter(ot => ot.estado === 'borrador').length}
            </div>
            <div className="text-sm text-gray-500">Borradores</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {otsWithProgress.filter(ot => ot.estado === 'aprobada').length}
            </div>
            <div className="text-sm text-gray-500">Aprobadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {otsWithProgress.filter(ot => ot.estado === 'en_ejecucion').length}
            </div>
            <div className="text-sm text-gray-500">En Ejecución</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {otsWithProgress.filter(ot => ot.estado === 'cerrada').length}
            </div>
            <div className="text-sm text-gray-500">Cerradas</div>
          </div>
        </div>

        {/* OT List */}
        {otsWithProgress.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rubro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progreso
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo Est.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desvío
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {otsWithProgress.map((ot) => {
                    const desvio = ot.costo_real != null ? ot.costo_real - ot.costo_estimado : null
                    const desvioPercent = desvio != null && ot.costo_estimado > 0
                      ? (desvio / ot.costo_estimado) * 100
                      : null
                    const hasWarning = desvio != null && desvio > 0
                    const isCritical = desvioPercent != null && desvioPercent > 20

                    return (
                      <tr key={ot.id} className={`hover:bg-gray-50 ${isCritical ? 'bg-red-50' : hasWarning ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isCritical && (
                              <span className="flex-shrink-0" title="Desvio critico (>20%)">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                            {hasWarning && !isCritical && (
                              <span className="flex-shrink-0" title="Desvio de presupuesto">
                                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                            <Link
                              href={`/obras/${obraId}/ordenes-trabajo/${ot.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              OT-{ot.numero}
                            </Link>
                          </div>
                          <p className="text-sm text-gray-500 truncate max-w-xs" title={ot.descripcion}>
                            {ot.descripcion}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(ot.rubros as { nombre: string } | null)?.nombre || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OTStatusBadge estado={ot.estado || 'borrador'} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${ot.progreso}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{ot.progreso}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatPesos(ot.costo_estimado)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {desvio != null ? (
                            <span className={desvio > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {desvio > 0 ? '+' : ''}{formatPesos(desvio)}
                              {desvioPercent != null && (
                                <span className="text-xs ml-1">
                                  ({desvioPercent > 0 ? '+' : ''}{desvioPercent.toFixed(1)}%)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link
                            href={`/obras/${obraId}/ordenes-trabajo/${ot.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes de trabajo</h3>
            <p className="mt-1 text-sm text-gray-500">
              {estado && estado !== 'todos'
                ? `No hay OTs con estado "${estado.replace('_', ' ')}"`
                : 'Comienza creando una nueva orden de trabajo'}
            </p>
            <div className="mt-6">
              <Link
                href={`/obras/${obraId}/ordenes-trabajo/nueva`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva OT
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
