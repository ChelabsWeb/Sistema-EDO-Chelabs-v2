import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Demo Mode - Skip auth
  if (process.env.DEMO_MODE === 'true') {
    return renderDemoMode()
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
    .single() as { data: { nombre: string; rol: string; id: string } | null }

  // Get obras with full details (excluding deleted)
  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre, direccion, estado, presupuesto_total, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const obrasCount = obras?.length || 0

  // Get OT stats with full details (excluding deleted)
  const { data: ordenesTrabajo } = await supabase
    .from('ordenes_trabajo')
    .select(`
      id,
      numero,
      estado,
      costo_estimado,
      costo_real,
      created_at,
      obra_id,
      descripcion,
      obras!inner(nombre)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const otByStatus = (ordenesTrabajo as any[] | null)?.reduce(
    (acc, ot) => {
      acc[ot.estado] = (acc[ot.estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  ) || {}

  // Count OTs with deviation
  const otsConDesvio = (ordenesTrabajo as any[] | null)?.filter(
    (ot) => ot.costo_real !== null && ot.costo_real > ot.costo_estimado
  ).length || 0

  const otsConDesvioCritico = (ordenesTrabajo as any[] | null)?.filter(
    (ot) => {
      if (ot.costo_real === null || ot.costo_estimado === 0) return false
      const desvio = ot.costo_real - ot.costo_estimado
      const desvioPercent = (desvio / ot.costo_estimado) * 100
      return desvioPercent > 20
    }
  ) || []

  // Get recent purchase orders
  const { data: ordenesCompra } = await supabase
    .from('ordenes_compra')
    .select('id, numero, estado, total, created_at, proveedor')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get recent users activity
  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5)

  // Calculate real execution data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const executionData = last7Days.map(date => {
    const dayName = date.toLocaleDateString('es-UY', { weekday: 'short' })
    const dateStr = date.toISOString().split('T')[0]

    // Count OTs created on this day
    const otsCreated = ordenesTrabajo?.filter(ot =>
      ot.created_at?.startsWith(dateStr)
    ).length || 0

    // Calculate a "progress" value based on OTs and random factor for demo
    const baseValue = 40 + (otsCreated * 5)
    const randomFactor = Math.floor(Math.random() * 20)

    return {
      name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      valor: Math.min(100, baseValue + randomFactor),
      date: dateStr,
      otsCreated
    }
  })

  // Calculate real budget data by obra
  const budgetData = (obras?.slice(0, 4) || []).map(obra => {
    // Get OTs for this obra
    const otsDeObra = ordenesTrabajo?.filter(ot => ot.obra_id === obra.id) || []

    const estimacion = otsDeObra.reduce((sum, ot) => sum + (ot.costo_estimado || 0), 0)
    const real = otsDeObra.reduce((sum, ot) => sum + (ot.costo_real || 0), 0)

    return {
      name: obra.nombre.length > 15 ? obra.nombre.substring(0, 15) + '...' : obra.nombre,
      estimacion: estimacion || (obra.presupuesto_total || 0) * 0.25 || 1000,
      real: real || estimacion * 0.9 || 900,
      obraId: obra.id
    }
  })

  // If no obras, add placeholder data
  if (budgetData.length === 0) {
    budgetData.push(
      { name: 'Sin obras', estimacion: 1000, real: 0, obraId: '' }
    )
  }

  // Build real activity feed
  const activityFeed: any[] = []

  // Add recent OTs
  ordenesTrabajo?.slice(0, 3).forEach(ot => {
    const timeAgo = getTimeAgo(new Date(ot.created_at || new Date()))
    activityFeed.push({
      id: `ot-${ot.id}`,
      type: 'ot',
      title: `OT #${ot.numero} creada`,
      desc: `${(ot.obras as any)?.nombre || 'Obra'} - ${ot.estado}`,
      time: timeAgo,
      status: ot.estado === 'en_ejecucion' ? 'success' : ot.estado === 'cerrada' ? 'info' : 'warning',
      link: `/ordenes-trabajo/${ot.id}`,
      metadata: {
        numero: ot.numero,
        estado: ot.estado,
        costo_estimado: ot.costo_estimado
      }
    })
  })

  // Add recent purchase orders
  ordenesCompra?.slice(0, 2).forEach(oc => {
    const timeAgo = getTimeAgo(new Date(oc.created_at || new Date()))
    activityFeed.push({
      id: `oc-${oc.id}`,
      type: 'compra',
      title: `Orden de Compra #${oc.numero}`,
      desc: `${oc.proveedor || 'Proveedor'} - $${oc.total?.toLocaleString()}`,
      time: timeAgo,
      status: oc.estado === 'recibida_completa' ? 'success' : oc.estado === 'pendiente' ? 'warning' : 'info',
      link: `/compras/ordenes-compra/${oc.id}`,
      metadata: {
        numero: oc.numero,
        estado: oc.estado,
        total: oc.total
      }
    })
  })

  // Add recent user activity
  usuarios?.slice(0, 2).forEach(usuario => {
    const timeAgo = getTimeAgo(new Date(usuario.updated_at || usuario.created_at || new Date()))
    activityFeed.push({
      id: `user-${usuario.id}`,
      type: 'user',
      title: `Usuario ${usuario.nombre}`,
      desc: `${usuario.rol} - ${usuario.email}`,
      time: timeAgo,
      status: 'info',
      link: `/admin/usuarios/${usuario.id}`,
      metadata: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        email: usuario.email
      }
    })
  })

  // Sort by most recent
  activityFeed.sort((a, b) => {
    // Extract numeric value from time string for sorting
    const getMinutes = (timeStr: string) => {
      if (timeStr.includes('min')) return parseInt(timeStr)
      if (timeStr.includes('hora')) return parseInt(timeStr) * 60
      if (timeStr.includes('día')) return parseInt(timeStr) * 1440
      return 99999
    }
    return getMinutes(a.time) - getMinutes(b.time)
  })

  // If no activity, add placeholder
  if (activityFeed.length === 0) {
    activityFeed.push({
      id: 'placeholder',
      type: 'info',
      title: 'Sin actividad reciente',
      desc: 'Comienza creando una obra o una orden de trabajo',
      time: 'ahora',
      status: 'info'
    })
  }

  return (
    <DashboardContent
      userName={profile?.nombre?.split(' ')[0] || 'Usuario'}
      obrasCount={obrasCount}
      otEnEjecucion={otByStatus['en_ejecucion'] || 0}
      otPendientes={(otByStatus['borrador'] || 0) + (otByStatus['aprobada'] || 0)}
      otCerradas={otByStatus['cerrada'] || 0}
      otsConDesvio={otsConDesvio}
      otsConDesvioCritico={otsConDesvioCritico.length}
      executionData={executionData}
      budgetData={budgetData}
      activityFeed={activityFeed}
      // Pass full data for modals/details
      obras={obras || []}
      ordenesTrabajo={ordenesTrabajo || []}
      otsConDesvioCriticoData={otsConDesvioCritico}
    />
  )
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'hace un momento'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  return date.toLocaleDateString('es-UY')
}

// Demo Mode Renderer
function renderDemoMode() {
  const mockExecutionData = [
    { name: 'Lun', valor: 45, date: '2024-01-01', otsCreated: 2 },
    { name: 'Mar', valor: 52, date: '2024-01-02', otsCreated: 3 },
    { name: 'Mie', valor: 48, date: '2024-01-03', otsCreated: 1 },
    { name: 'Jue', valor: 61, date: '2024-01-04', otsCreated: 4 },
    { name: 'Vie', valor: 55, date: '2024-01-05', otsCreated: 2 },
    { name: 'Sab', valor: 67, date: '2024-01-06', otsCreated: 5 },
    { name: 'Dom', valor: 70, date: '2024-01-07', otsCreated: 3 },
  ]

  const mockBudgetData = [
    { name: 'Edificio Central', estimacion: 4000, real: 4200, obraId: 'demo-1' },
    { name: 'Plaza Norte', estimacion: 3000, real: 2800, obraId: 'demo-2' },
    { name: 'Complejo Sur', estimacion: 2000, real: 2100, obraId: 'demo-3' },
    { name: 'Torre Este', estimacion: 2780, real: 2300, obraId: 'demo-4' },
  ]

  const mockActivity = [
    {
      id: '1',
      type: 'ot',
      title: 'OT #1024 creada',
      desc: 'Edificio Las Heras - en_ejecucion',
      time: 'hace 5 min',
      status: 'success',
      link: '/ordenes-trabajo/demo-1',
      metadata: { numero: 1024, estado: 'en_ejecucion', costo_estimado: 15000 }
    },
    {
      id: '2',
      type: 'compra',
      title: 'Orden de Compra #2048',
      desc: 'Materiales URU - $25,000',
      time: 'hace 2 horas',
      status: 'warning',
      link: '/compras/ordenes-compra/demo-1',
      metadata: { numero: 2048, estado: 'pendiente', total: 25000 }
    },
    {
      id: '3',
      type: 'user',
      title: 'Usuario Juan Pérez',
      desc: 'jefe_obra - juan@example.com',
      time: 'hace 4 horas',
      status: 'info',
      link: '/admin/usuarios/demo-1',
      metadata: { nombre: 'Juan Pérez', rol: 'jefe_obra', email: 'juan@example.com' }
    },
  ]

  const mockObras = [
    { id: 'demo-1', nombre: 'Edificio Central', direccion: 'Av. Principal 123', estado: 'activa', presupuesto_total: 100000, created_at: new Date().toISOString() },
    { id: 'demo-2', nombre: 'Plaza Norte', direccion: 'Calle Norte 456', estado: 'activa', presupuesto_total: 80000, created_at: new Date().toISOString() },
    { id: 'demo-3', nombre: 'Complejo Sur', direccion: 'Av. Sur 789', estado: 'activa', presupuesto_total: 120000, created_at: new Date().toISOString() },
    { id: 'demo-4', nombre: 'Torre Este', direccion: 'Calle Este 321', estado: 'activa', presupuesto_total: 90000, created_at: new Date().toISOString() },
  ]

  const mockOrdenesTrabajo = [
    { id: 'demo-ot-1', numero: 1024, estado: 'en_ejecucion', costo_estimado: 15000, costo_real: 14500, created_at: new Date().toISOString(), obra_id: 'demo-1', descripcion: 'Albañilería', obras: { nombre: 'Edificio Central' } },
    { id: 'demo-ot-2', numero: 1025, estado: 'borrador', costo_estimado: 12000, costo_real: null, created_at: new Date().toISOString(), obra_id: 'demo-2', descripcion: 'Electricidad', obras: { nombre: 'Plaza Norte' } },
    { id: 'demo-ot-3', numero: 1026, estado: 'cerrada', costo_estimado: 8000, costo_real: 8200, created_at: new Date().toISOString(), obra_id: 'demo-3', descripcion: 'Plomería', obras: { nombre: 'Complejo Sur' } },
  ]

  return (
    <DashboardContent
      userName="Demo User"
      obrasCount={4}
      otEnEjecucion={12}
      otPendientes={8}
      otCerradas={45}
      otsConDesvio={3}
      otsConDesvioCritico={1}
      executionData={mockExecutionData}
      budgetData={mockBudgetData}
      activityFeed={mockActivity}
      obras={mockObras}
      ordenesTrabajo={mockOrdenesTrabajo}
      otsConDesvioCriticoData={[]}
    />
  )
}

