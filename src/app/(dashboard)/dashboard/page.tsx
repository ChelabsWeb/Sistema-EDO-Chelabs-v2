import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

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
    <DashboardContent
      userName={profile?.nombre?.split(' ')[0] || 'Usuario'}
      obrasCount={obrasCount || 0}
      otEnEjecucion={otByStatus['en_ejecucion'] || 0}
      otPendientes={(otByStatus['borrador'] || 0) + (otByStatus['aprobada'] || 0)}
      otCerradas={otByStatus['cerrada'] || 0}
      otsConDesvio={otsConDesvio}
      otsConDesvioCritico={otsConDesvioCritico}
    />
  )
}
