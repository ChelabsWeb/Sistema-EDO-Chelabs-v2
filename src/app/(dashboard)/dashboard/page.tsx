import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Mock data for charts
  const mockExecutionData = [
    { name: 'Lun', valor: 45 },
    { name: 'Mar', valor: 52 },
    { name: 'Mie', valor: 48 },
    { name: 'Jue', valor: 61 },
    { name: 'Vie', valor: 55 },
    { name: 'Sab', valor: 67 },
    { name: 'Dom', valor: 70 },
  ]

  const mockBudgetData = [
    { name: 'Cimientos', estimacion: 4000, real: 4200 },
    { name: 'Muros', estimacion: 3000, real: 2800 },
    { name: 'Cubierta', estimacion: 2000, real: 2100 },
    { name: 'Instalaciones', estimacion: 2780, real: 2300 },
  ]

  const mockActivity = [
    { id: '1', type: 'ot', title: 'Nueva OT creada', desc: 'Edificio Las Heras - Rubro Albañilería', time: 'hace 5 min', status: 'success' },
    { id: '2', type: 'compra', title: 'Recepción parcial', desc: 'Orden #1024 - Materiales URU', time: 'hace 2 horas', status: 'warning' },
    { id: '3', type: 'user', title: 'Usuario asignado', desc: 'Juan Pérez a Planta Industrial', time: 'hace 4 horas', status: 'info' },
  ]

  // Demo Mode Data
  if (process.env.DEMO_MODE === 'true') {
    return (
      <DashboardContent
        userName="Desarrollador"
        obrasCount={5}
        otEnEjecucion={12}
        otPendientes={8}
        otCerradas={45}
        otsConDesvio={3}
        otsConDesvioCritico={1}
        executionData={mockExecutionData}
        budgetData={mockBudgetData}
        activityFeed={mockActivity}
      />
    )
  }

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
    .select('estado, costo_estimado, costo_real, created_at')
    .is('deleted_at', null)

  const otByStatus = (otStats as any[] | null)?.reduce(
    (acc, ot) => {
      acc[ot.estado] = (acc[ot.estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  ) || {}

  // Count OTs with deviation
  const otsConDesvio = (otStats as any[] | null)?.filter(
    (ot) => ot.costo_real !== null && ot.costo_real > ot.costo_estimado
  ).length || 0

  const otsConDesvioCritico = (otStats as any[] | null)?.filter(
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
      executionData={mockExecutionData} // For now using mock, until we have history
      budgetData={mockBudgetData} // For now using mock
      activityFeed={mockActivity} // For now using mock
    />
  )
}
