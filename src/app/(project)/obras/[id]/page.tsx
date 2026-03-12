import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos, formatUR, convertURtoPesos } from '@/lib/utils/currency'
import { getCotizacionUR } from '@/app/actions/configuracion'
import { getDeviationsByRubro } from '@/app/actions/costos'
import { DeleteObraButton } from '@/components/edo/obra/delete-obra-button'
import { RubroDeviations } from '@/components/edo/costos/rubro-deviations'
import type { Database } from '@/types/database'
import {
  Building2, MapPin, ClipboardList, DollarSign,
  Activity, Settings, Plus, Layers, AlertCircle,
  TrendingUp, Clock, Zap, Users
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ObraDetailPage({ params }: Props) {
  const { id } = await params
  const isDemo = id.startsWith('demo-') || process.env.DEMO_MODE === 'true'
  const supabase = await createClient()

  type Obra = Database['public']['Tables']['obras']['Row']
  type Rubro = Database['public']['Tables']['rubros']['Row']
  type OrdenTrabajo = Database['public']['Tables']['ordenes_trabajo']['Row'] & { rubros: { nombre: string } | null }
  
  let user = null
  let profile = null
  let obra: Obra | null = null
  let cotizacion = 0
  let rubros: Rubro[] = []
  let ordenesTrabajo: OrdenTrabajo[] = []
  let desviaciones: any[] = []

  if (isDemo) {
    user = { id: 'demo-user' }
    profile = { rol: 'admin' }
    obra = {
      id: id,
      nombre: id === 'demo-1' ? 'Edificio Las Heras' : 'Planta Industrial',
      direccion: 'Av. Las Heras 1234, Montevideo',
      cooperativa: 'COVICO IV',
      presupuesto_total: 2500000,
      estado: 'activa'
    } as unknown as Obra
    cotizacion = 1850.00
    rubros = [
      { id: 'r1', nombre: 'Albañilería', unidad: 'm2', presupuesto: 50000, presupuesto_ur: 34.47, es_predefinido: true },
      { id: 'r2', nombre: 'Estructura', unidad: 'm3', presupuesto: 120000, presupuesto_ur: 82.72, es_predefinido: true }
    ] as unknown as Rubro[]
    ordenesTrabajo = [
      { id: 'ot-1', numero: 1, descripcion: 'Fundaciones y platea de hormigón', estado: 'en_ejecucion', rubros: { nombre: 'Estructura' }, created_at: new Date().toISOString() },
      { id: 'ot-2', numero: 2, descripcion: 'Levantado de muros planta baja', estado: 'aprobada', rubros: { nombre: 'Albañilería' }, created_at: new Date().toISOString() }
    ] as unknown as OrdenTrabajo[]
    desviaciones = []
  } else {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser

    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('auth_user_id', user.id)
      .single()
    profile = userProfile

    const { data: obraRow, error } = await supabase
      .from('obras')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !obraRow) notFound()
    obra = obraRow

    cotizacion = await getCotizacionUR()
    const { data: rubrosRows } = await supabase
      .from('rubros')
      .select('*')
      .eq('obra_id', id)
      .is('deleted_at', null)
      .order('nombre')
    rubros = rubrosRows || []

    const { data: otRows } = await supabase
      .from('ordenes_trabajo')
      .select('*, rubros(nombre)')
      .eq('obra_id', id)
      .is('deleted_at', null)
      .order('numero', { ascending: false })
      .limit(5)
    ordenesTrabajo = otRows || []

    const deviationsResult = await getDeviationsByRubro(id)
    desviaciones = deviationsResult.success ? deviationsResult.data : []
  }

  const isAdmin = profile?.rol === 'admin'
  const presupuestoRubrosUR = rubros.reduce((sum, r) => sum + Number(r.presupuesto_ur || 0), 0)
  const presupuestoRubrosPesos = convertURtoPesos(presupuestoRubrosUR, cotizacion)

  const opsEnCola = ordenesTrabajo.filter(ot => ot.estado === 'borrador' || ot.estado === 'aprobada').length

  return (
    <div className="flex-1 flex flex-col space-y-8 h-full">
      {/* Metrics Row replacing weird floating Bento cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inversión Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${obra.presupuesto_total?.toLocaleString('es-UY') || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-emerald-500" />
              Presupuesto asignado
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Rubros</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presupuestoRubrosUR.toLocaleString('es-UY', {maximumFractionDigits:2})} UR</div>
            <p className="text-xs text-muted-foreground mt-1">
               ${presupuestoRubrosPesos.toLocaleString('es-UY')} a cot. actual
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operativa en Cola</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opsEnCola}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Órdenes pendientes
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold capitalize", obra.estado === 'activa' ? "text-emerald-500" : "text-amber-500")}>
              {obra.estado === 'activa' ? 'En Ejecución' : obra.estado}
            </div>
            <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary transition-colors">
              <Link href={`/obras/${id}/editar`}>Ver configuración</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Card - Similar to Avance Dinámico */}
        <Card className="col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Desempeño Económico</CardTitle>
              <CardDescription>
                Análisis prospectivo de desvíos por rubro en la obra
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/obras/${id}/analitica`}>Ver Reporte</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
             {/* Instead of deeply nested cards, we use the simple wrapper provided in deviations component */}
             <div className="h-full w-full -ml-4">
                 <RubroDeviations deviations={desviaciones} />
             </div>
          </CardContent>
        </Card>

        {/* Activity Feed Card - Similar to Pulsaciones */}
        <Card className="col-span-3 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Pulsaciones de Obra</CardTitle>
              <CardDescription>Actividad reciente del proyecto</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/obras/${id}/ordenes-trabajo`}>Histórico</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar-hide max-h-[300px]">
              {ordenesTrabajo.length > 0 ? (
                ordenesTrabajo.map((ot) => (
                  <div key={ot.id} className="flex gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                      ot.estado === 'en_ejecucion' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20' :
                        ot.estado === 'aprobada' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20' :
                          'bg-primary/10 text-primary border-primary/20'
                    )}>
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Link href={`/obras/${id}/ordenes-trabajo/${ot.id}`} className="hover:underline">
                         <p className="text-sm font-medium leading-none">OT #{ot.numero} {ot.estado === 'en_ejecucion' ? 'en ejecución' : ot.estado}</p>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ot.descripcion}</p>
                      <p className="text-xs text-muted-foreground pt-1">
                        Hace poco
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                   Comienza creando tu primera orden de trabajo.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Section - Replicating Dashboard Bottom Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href={`/obras/${id}/editar`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <Settings className="w-6 h-6 mb-2 text-muted-foreground" />
              <span className="font-semibold text-sm">Configuración</span>
              <span className="text-xs text-muted-foreground mt-1">Ajustes Generales</span>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/obras/${id}/ordenes-trabajo/nueva`}>
          <Card className="bg-primary hover:bg-primary/90 transition-colors cursor-pointer text-primary-foreground border-transparent">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <Plus className="w-6 h-6 mb-2" />
              <span className="font-semibold text-sm">Nueva Orden</span>
              <span className="text-xs text-primary-foreground/70 mt-1">Apertura OT</span>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/obras/${id}/insumos`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <Layers className="w-6 h-6 mb-2 text-muted-foreground" />
              <span className="font-semibold text-sm">Recursos</span>
              <span className="text-xs text-muted-foreground mt-1">Insumos & Maestro</span>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/obras/${id}/usuarios`}>
          <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-[120px]">
              <Users className="w-6 h-6 mb-2 text-muted-foreground" />
              <span className="font-semibold text-sm">Equipo</span>
              <span className="text-xs text-muted-foreground mt-1">Talento & Roles</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
