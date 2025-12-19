import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import { OTStatusBadge } from '@/components/edo/ot/ot-status-badge'
import { OTActions } from '@/components/edo/ot/ot-actions'
import { OTHistoryTimeline } from '@/components/edo/ot/ot-history-timeline'
import { OTInsumosEstimados } from '@/components/edo/ot/ot-insumos-estimados'
import { OTTareas } from '@/components/edo/ot/ot-tareas'
import { OTFotos } from '@/components/edo/ot/ot-fotos'
import { OTConsumos } from '@/components/edo/ot/ot-consumos'
import { OTRequisiciones } from '@/components/edo/requisiciones'

interface Props {
  params: Promise<{ id: string; otId: string }>
}

export default async function OTDetailPage({ params }: Props) {
  const { id: obraId, otId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get user role
  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol, obra_id')
    .eq('auth_user_id', user.id)
    .single()

  // Get OT with all relations
  const { data: ot, error } = await supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      obras (
        id,
        nombre
      ),
      rubros (
        id,
        nombre,
        unidad,
        presupuesto,
        presupuesto_ur
      ),
      usuarios!ordenes_trabajo_created_by_fkey (
        id,
        nombre,
        email
      ),
      tareas (
        id,
        descripcion,
        completada,
        orden,
        created_at,
        cantidad,
        unidad
      )
    `)
    .eq('id', otId)
    .single()

  if (error || !ot) notFound()

  // Get estimated insumos
  const { data: insumosEstimados } = await supabase
    .from('ot_insumos_estimados')
    .select(`
      *,
      insumos (
        id,
        nombre,
        unidad,
        tipo
      )
    `)
    .eq('orden_trabajo_id', otId)

  // Get history
  const { data: historialRaw } = await supabase
    .from('ot_historial')
    .select(`
      *,
      usuarios!ot_historial_usuario_id_fkey (
        id,
        nombre
      )
    `)
    .eq('orden_trabajo_id', otId)
    .order('created_at', { ascending: false })

  // For acknowledged_by, fetch user names separately if needed
  const historial = await Promise.all((historialRaw || []).map(async (h) => {
    let acknowledged_usuario = null
    if (h.acknowledged_by) {
      // If acknowledged_by equals usuario_id, use the same user
      if (h.acknowledged_by === h.usuario_id) {
        acknowledged_usuario = h.usuarios
      } else {
        // Fetch the acknowledging user separately
        const { data: ackUser } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('id', h.acknowledged_by)
          .single()
        acknowledged_usuario = ackUser
      }
    }
    return { ...h, acknowledged_usuario }
  }))

  // Get photos
  const { data: fotosData } = await supabase
    .from('ot_fotos')
    .select(`
      id,
      storage_path,
      nombre_archivo,
      descripcion,
      tomada_en,
      latitud,
      longitud,
      usuarios!ot_fotos_subida_por_fkey (
        nombre
      )
    `)
    .eq('orden_trabajo_id', otId)
    .order('tomada_en', { ascending: false })

  // Get public URLs for photos
  const fotos = (fotosData || []).map((foto) => {
    const { data: urlData } = supabase.storage
      .from('ot-fotos')
      .getPublicUrl(foto.storage_path)

    return {
      id: foto.id,
      url: urlData.publicUrl,
      nombre_archivo: foto.nombre_archivo,
      descripcion: foto.descripcion,
      tomada_en: foto.tomada_en,
      latitud: foto.latitud,
      longitud: foto.longitud,
      subida_por: foto.usuarios as { nombre: string } | null,
    }
  })

  // Get consumption records
  const { data: consumosData } = await supabase
    .from('consumo_materiales')
    .select(`
      id,
      insumo_id,
      cantidad_consumida,
      cantidad_estimada,
      notas,
      registrado_en,
      insumos (
        id,
        nombre,
        unidad,
        precio_referencia
      )
    `)
    .eq('orden_trabajo_id', otId)
    .order('registrado_en', { ascending: false })

  // Calculate consumption differences
  const consumos = (consumosData || []).map((c) => {
    const diferencia = c.cantidad_estimada
      ? c.cantidad_consumida - c.cantidad_estimada
      : 0
    const porcentaje = c.cantidad_estimada && c.cantidad_estimada > 0
      ? (diferencia / c.cantidad_estimada) * 100
      : null

    return {
      id: c.id,
      insumo_id: c.insumo_id,
      cantidad_consumida: c.cantidad_consumida,
      cantidad_estimada: c.cantidad_estimada,
      notas: c.notas,
      registrado_en: c.registrado_en,
      insumo: c.insumos as {
        id: string
        nombre: string
        unidad: string
        precio_referencia: number | null
      },
      diferencia,
      porcentaje_diferencia: porcentaje,
    }
  })

  // Get requisiciones for this OT
  const { data: requisicionesData } = await supabase
    .from('requisiciones')
    .select(`
      *,
      creador:usuarios!requisiciones_created_by_fkey(id, nombre),
      items:requisicion_items(
        *,
        insumo:insumos(id, nombre, unidad, tipo)
      )
    `)
    .eq('ot_id', otId)
    .order('created_at', { ascending: false })

  // Get all insumos for this obra (for the requisicion form)
  const { data: insumosObra } = await supabase
    .from('insumos')
    .select('*')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('nombre')

  // Calculate progress
  const tareas = ot.tareas as { id: string; completada: boolean | null }[] | null
  const totalTareas = tareas?.length || 0
  const tareasCompletadas = tareas?.filter(t => t.completada).length || 0
  const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0

  // Calculate deviation
  const costoReal = ot.costo_real ?? ot.costo_estimado
  const desvio = costoReal - ot.costo_estimado
  const desvioPercent = ot.costo_estimado > 0 ? (desvio / ot.costo_estimado) * 100 : 0

  const obra = ot.obras as { id: string; nombre: string } | null
  const rubro = ot.rubros as { id: string; nombre: string; unidad: string; presupuesto: number } | null
  const createdBy = ot.usuarios as { id: string; nombre: string; email: string } | null

  const canApprove = profile && ['admin', 'director_obra'].includes(profile.rol)
  const canExecute = profile && ['admin', 'director_obra', 'jefe_obra'].includes(profile.rol)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/obras/${obraId}/ordenes-trabajo`} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">OT-{ot.numero}</h1>
                  <OTStatusBadge estado={ot.estado || 'borrador'} />
                </div>
                <p className="text-sm text-gray-500">{obra?.nombre}</p>
              </div>
            </div>
            <OTActions
              otId={otId}
              obraId={obraId}
              estado={ot.estado || 'borrador'}
              canApprove={canApprove || false}
              canExecute={canExecute || false}
              costoEstimado={ot.costo_estimado}
              costoReal={costoReal}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{ot.descripcion}</p>
            </div>

            {/* Costs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Costos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Cantidad</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {ot.cantidad} {rubro?.unidad}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Costo Estimado</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatPesos(ot.costo_estimado)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Costo Real</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {ot.costo_real != null ? formatPesos(ot.costo_real) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Desvío</div>
                  <div className={`text-lg font-semibold ${
                    desvio > 0 ? 'text-red-600' : desvio < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {ot.costo_real != null ? (
                      <>
                        {desvio > 0 ? '+' : ''}{formatPesos(desvio)}
                        <span className="text-sm ml-1">
                          ({desvio > 0 ? '+' : ''}{desvioPercent.toFixed(1)}%)
                        </span>
                      </>
                    ) : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Insumos */}
            <OTInsumosEstimados insumos={insumosEstimados || []} cantidad={ot.cantidad} />

            {/* Tasks - only show for en_ejecucion or cerrada */}
            {(ot.estado === 'en_ejecucion' || ot.estado === 'cerrada') && (
              <OTTareas
                otId={otId}
                obraId={obraId}
                tareas={ot.tareas as { id: string; descripcion: string; completada: boolean | null; orden: number | null; created_at: string | null; cantidad: number | null; unidad: string | null }[] || []}
                canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
                rubroUnidad={rubro?.unidad}
              />
            )}

            {/* Photos - only show for en_ejecucion or cerrada */}
            {(ot.estado === 'en_ejecucion' || ot.estado === 'cerrada') && (
              <OTFotos
                otId={otId}
                obraId={obraId}
                fotos={fotos}
                canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
              />
            )}

            {/* Material Consumption - only show for en_ejecucion or cerrada */}
            {(ot.estado === 'en_ejecucion' || ot.estado === 'cerrada') && (
              <OTConsumos
                otId={otId}
                obraId={obraId}
                consumos={consumos}
                canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
              />
            )}

            {/* Requisiciones - only show for en_ejecucion or cerrada */}
            {(ot.estado === 'en_ejecucion' || ot.estado === 'cerrada') && (
              <OTRequisiciones
                otId={otId}
                obraId={obraId}
                requisiciones={(requisicionesData || []) as import('@/types/database').RequisicionWithRelations[]}
                insumos={(insumosObra || []) as import('@/types/database').Insumo[]}
                canCreate={ot.estado === 'en_ejecucion' && canExecute || false}
                canCancel={ot.estado === 'en_ejecucion' && canExecute || false}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Rubro</dt>
                  <dd className="text-sm font-medium text-gray-900">{rubro?.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Creado por</dt>
                  <dd className="text-sm font-medium text-gray-900">{createdBy?.nombre}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Fecha de Creación</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(ot.created_at || '').toLocaleDateString('es-UY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                {ot.fecha_inicio && (
                  <div>
                    <dt className="text-sm text-gray-500">Fecha de Inicio</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(ot.fecha_inicio).toLocaleDateString('es-UY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
                {ot.fecha_fin && (
                  <div>
                    <dt className="text-sm text-gray-500">Fecha de Cierre</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(ot.fecha_fin).toLocaleDateString('es-UY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progreso</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Tareas completadas</span>
                    <span className="font-medium">{tareasCompletadas}/{totalTareas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-blue-600">{progreso}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            <OTHistoryTimeline historial={historial || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
