import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single() as { data: { nombre: string; rol: string } | null }

  // Get obras count (excluding deleted)
  const { count: obrasCount } = await supabase
    .from('obras')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Get OT stats (excluding deleted)
  const { data: otStats } = await supabase
    .from('ordenes_trabajo')
    .select('estado, costo_estimado, costo_real')
    .is('deleted_at', null)

  const otByStatus = (otStats as Array<{ estado: string; costo_estimado: number; costo_real: number | null }> | null)?.reduce(
    (acc, ot) => {
      acc[ot.estado] = (acc[ot.estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  ) || {}

  // Count OTs with deviation (costo_real > costo_estimado)
  const otsConDesvio = (otStats as Array<{ estado: string; costo_estimado: number; costo_real: number | null }> | null)?.filter(
    (ot) => ot.costo_real !== null && ot.costo_real > ot.costo_estimado
  ).length || 0

  // Count OTs with critical deviation (> 20%)
  const otsConDesvioCritico = (otStats as Array<{ estado: string; costo_estimado: number; costo_real: number | null }> | null)?.filter(
    (ot) => {
      if (ot.costo_real === null || ot.costo_estimado === 0) return false
      const desvio = ot.costo_real - ot.costo_estimado
      const desvioPercent = (desvio / ot.costo_estimado) * 100
      return desvioPercent > 20
    }
  ).length || 0

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {profile?.nombre?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-gray-600 mt-1">Resumen del estado de tus obras</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-sm text-gray-500">Obras Activas</div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            {obrasCount || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-sm text-gray-500">OT en Ejecución</div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
            {otByStatus['en_ejecucion'] || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-sm text-gray-500">OT Pendientes</div>
          <div className="text-2xl md:text-3xl font-bold text-yellow-600 mt-2">
            {(otByStatus['borrador'] || 0) + (otByStatus['aprobada'] || 0)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="text-sm text-gray-500">OT Cerradas</div>
          <div className="text-2xl md:text-3xl font-bold text-green-600 mt-2">
            {otByStatus['cerrada'] || 0}
          </div>
        </div>
      </div>

      {/* Deviation Alerts */}
      {otsConDesvio > 0 && (
        <div className={`mb-8 p-4 rounded-lg border-l-4 ${otsConDesvioCritico > 0 ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
          <div className="flex items-center">
            <svg className={`w-6 h-6 mr-3 ${otsConDesvioCritico > 0 ? 'text-red-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className={`font-medium ${otsConDesvioCritico > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                {otsConDesvio} OT{otsConDesvio > 1 ? 's' : ''} con desvio de presupuesto
                {otsConDesvioCritico > 0 && (
                  <span className="ml-2 text-sm">
                    ({otsConDesvioCritico} critico{otsConDesvioCritico > 1 ? 's' : ''} &gt;20%)
                  </span>
                )}
              </p>
              <p className={`text-sm ${otsConDesvioCritico > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                Revisa las ordenes de trabajo que exceden su costo estimado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/obras"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-h-[88px]"
          >
            <svg
              className="w-8 h-8 text-gray-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 text-center">
              Ver Obras
            </span>
          </Link>

          <Link
            href="/obras/nueva"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors min-h-[88px]"
          >
            <svg
              className="w-8 h-8 text-blue-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm font-medium text-blue-700 text-center">
              Nueva Obra
            </span>
          </Link>

          <Link
            href="/ordenes-trabajo"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-h-[88px]"
          >
            <svg
              className="w-8 h-8 text-gray-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 text-center">
              Órdenes de Trabajo
            </span>
          </Link>

          <Link
            href="/ordenes-compra"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-h-[88px]"
          >
            <svg
              className="w-8 h-8 text-gray-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 text-center">
              Compras
            </span>
          </Link>
        </div>
      </div>

      {/* Placeholder alert */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm text-yellow-800">
            Sistema en configuración inicial. Creá tu primera obra para
            comenzar.
          </span>
        </div>
      </div>
    </div>
  )
}
