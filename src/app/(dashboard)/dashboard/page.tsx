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
        <h1 className="text-2xl md:text-3xl font-semibold text-[--color-apple-gray-600] tracking-tight">
          Bienvenido, {profile?.nombre?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-[--color-apple-gray-400] mt-1">Resumen del estado de tus obras</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-[20px] p-5 md:p-6 border border-[--color-apple-gray-200]/50 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
          <div className="text-sm text-[--color-apple-gray-400] font-medium">Obras Activas</div>
          <div className="text-2xl md:text-3xl font-bold text-[--color-apple-gray-600] mt-2">
            {obrasCount || 0}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 md:p-6 border border-[--color-apple-gray-200]/50 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
          <div className="text-sm text-[--color-apple-gray-400] font-medium">OT en Ejecución</div>
          <div className="text-2xl md:text-3xl font-bold text-[--color-apple-blue] mt-2">
            {otByStatus['en_ejecucion'] || 0}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 md:p-6 border border-[--color-apple-gray-200]/50 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
          <div className="text-sm text-[--color-apple-gray-400] font-medium">OT Pendientes</div>
          <div className="text-2xl md:text-3xl font-bold text-[--color-apple-orange] mt-2">
            {(otByStatus['borrador'] || 0) + (otByStatus['aprobada'] || 0)}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-5 md:p-6 border border-[--color-apple-gray-200]/50 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
          <div className="text-sm text-[--color-apple-gray-400] font-medium">OT Cerradas</div>
          <div className="text-2xl md:text-3xl font-bold text-[--color-apple-green] mt-2">
            {otByStatus['cerrada'] || 0}
          </div>
        </div>
      </div>

      {/* Deviation Alerts */}
      {otsConDesvio > 0 && (
        <div className={`mb-8 p-5 rounded-[16px] border ${otsConDesvioCritico > 0 ? 'bg-[--color-apple-red]/5 border-[--color-apple-red]/20' : 'bg-[--color-apple-orange]/5 border-[--color-apple-orange]/20'}`}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${otsConDesvioCritico > 0 ? 'bg-[--color-apple-red]/10' : 'bg-[--color-apple-orange]/10'}`}>
              <svg className={`w-5 h-5 ${otsConDesvioCritico > 0 ? 'text-[--color-apple-red]' : 'text-[--color-apple-orange]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className={`font-medium ${otsConDesvioCritico > 0 ? 'text-[--color-apple-red]' : 'text-[--color-apple-orange]'}`}>
                {otsConDesvio} OT{otsConDesvio > 1 ? 's' : ''} con desvio de presupuesto
                {otsConDesvioCritico > 0 && (
                  <span className="ml-2 text-sm font-normal opacity-80">
                    ({otsConDesvioCritico} critico{otsConDesvioCritico > 1 ? 's' : ''} &gt;20%)
                  </span>
                )}
              </p>
              <p className="text-sm text-[--color-apple-gray-500] mt-0.5">
                Revisa las ordenes de trabajo que exceden su costo estimado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-[20px] p-5 md:p-6 border border-[--color-apple-gray-200]/50 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-[--color-apple-gray-600] mb-5 tracking-tight">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/obras"
            className="flex flex-col items-center p-5 bg-[--color-apple-gray-50] rounded-[16px] hover:bg-[--color-apple-gray-100] transition-all duration-200 min-h-[100px] active:scale-[0.97]"
          >
            <svg
              className="w-8 h-8 text-[--color-apple-gray-500] mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-sm font-medium text-[--color-apple-gray-600] text-center">
              Ver Obras
            </span>
          </Link>

          <Link
            href="/obras/nueva"
            className="flex flex-col items-center p-5 bg-[--color-apple-blue]/5 rounded-[16px] hover:bg-[--color-apple-blue]/10 transition-all duration-200 min-h-[100px] active:scale-[0.97]"
          >
            <svg
              className="w-8 h-8 text-[--color-apple-blue] mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm font-medium text-[--color-apple-blue] text-center">
              Nueva Obra
            </span>
          </Link>

          <Link
            href="/ordenes-trabajo"
            className="flex flex-col items-center p-5 bg-[--color-apple-gray-50] rounded-[16px] hover:bg-[--color-apple-gray-100] transition-all duration-200 min-h-[100px] active:scale-[0.97]"
          >
            <svg
              className="w-8 h-8 text-[--color-apple-gray-500] mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <span className="text-sm font-medium text-[--color-apple-gray-600] text-center">
              Órdenes de Trabajo
            </span>
          </Link>

          <Link
            href="/ordenes-compra"
            className="flex flex-col items-center p-5 bg-[--color-apple-gray-50] rounded-[16px] hover:bg-[--color-apple-gray-100] transition-all duration-200 min-h-[100px] active:scale-[0.97]"
          >
            <svg
              className="w-8 h-8 text-[--color-apple-gray-500] mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm font-medium text-[--color-apple-gray-600] text-center">
              Compras
            </span>
          </Link>
        </div>
      </div>

      {/* Placeholder alert */}
      <div className="mt-6 bg-[--color-apple-orange]/5 border border-[--color-apple-orange]/20 rounded-[16px] p-5">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-[--color-apple-orange]/10 flex items-center justify-center mr-4">
            <svg
              className="w-5 h-5 text-[--color-apple-orange]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <span className="text-sm text-[--color-apple-gray-600]">
            Sistema en configuración inicial. Creá tu primera obra para
            comenzar.
          </span>
        </div>
      </div>
    </div>
  )
}
