import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Calendar, ClipboardList, Clock,
  DollarSign, LayoutGrid, MapPin, Plus, TrendingUp,
  Users, Wallet, Activity, ArrowUpRight, AlertTriangle,
  Camera, Package, Receipt, CheckCircle2, ChevronLeft
} from 'lucide-react'
import { formatPesos } from '@/lib/utils/currency'
import { OTStatusBadge } from '@/components/edo/ot/ot-status-badge'
import { OTActions } from '@/components/edo/ot/ot-actions'
import { OTHistoryTimeline } from '@/components/edo/ot/ot-history-timeline'
import { OTInsumosEstimados } from '@/components/edo/ot/ot-insumos-estimados'
import { OTTareas } from '@/components/edo/ot/ot-tareas'
import { OTFotos } from '@/components/edo/ot/ot-fotos'
import { OTConsumos } from '@/components/edo/ot/ot-consumos'
import { OTOrdenesCompra } from '@/components/edo/ot/ot-ordenes-compra'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string; otId: string }>
}

export default async function OTDetailPage({ params }: Props) {
  const { id: obraId, otId } = await params
  const isDemo = otId.startsWith('demo-') || process.env.DEMO_MODE === 'true'
  const supabase = await createClient()

  let user = null
  let profile = null
  let ot: any = null
  let insumosEstimados: any[] = []
  let historial: any[] = []
  let fotos: any[] = []
  let consumos: any[] = []
  let ordenesCompraData: any[] = []
  let insumosObra: any[] = []

  if (isDemo) {
    user = { id: 'demo-user' }
    profile = { rol: 'admin', nombre: 'Admin Demo' }

    // Mock OT
    ot = {
      id: otId,
      numero: '942',
      estado: 'en_ejecucion',
      descripcion: 'Ejecución de muros exteriores en planta baja, incluyendo nivelación y colocación de aberturas de aluminio según plano detallado E-04.',
      cantidad: 120,
      costo_estimado: 450000,
      costo_real: 485000,
      created_at: new Date().toISOString(),
      fecha_inicio: new Date().toISOString(),
      obras: { id: obraId, nombre: 'Edificio Residencial Las Palmas' },
      rubros: { id: 'r1', nombre: 'Albañilería de Elevación', unidad: 'm2', presupuesto: 2500000 },
      usuarios: { id: 'u1', nombre: 'Juan Capataz', email: 'juan@chelabs.com' },
      tareas: [
        { id: 't1', descripcion: 'Replanteo de muros', completada: true, orden: 1 },
        { id: 't2', descripcion: 'Levantado de muros h=1.00m', completada: true, orden: 2 },
        { id: 't3', descripcion: 'Colocación de marcos', completada: false, orden: 3 },
        { id: 't4', descripcion: 'Levantado final hasta dintel', completada: false, orden: 4 }
      ]
    }

    insumosEstimados = [
      { id: 'ie1', insumo_id: 'i1', cantidad_estimada: 1500, precio_estimado: 120000, insumos: { nombre: 'Ladrillo hueco 12x18x33', unidad: 'un', tipo: 'material' } },
      { id: 'ie2', insumo_id: 'i2', cantidad_estimada: 45, precio_estimado: 45000, insumos: { nombre: 'Cemento Portland (bolsa 50kg)', unidad: 'bol', tipo: 'material' } },
      { id: 'ie3', insumo_id: 'i3', cantidad_estimada: 120, precio_estimado: 280000, insumos: { nombre: 'Oficial Albañil', unidad: 'h', tipo: 'mano_de_obra' } }
    ]

    historial = [
      { id: 'h1', estado_anterior: 'aprobada', estado_nuevo: 'en_ejecucion', created_at: new Date().toISOString(), usuarios: { nombre: 'Admin Demo' }, notas: 'Inicio de obra tras confirmación de acopio.' },
      { id: 'h2', estado_anterior: 'borrador', estado_nuevo: 'aprobada', created_at: new Date(Date.now() - 86400000).toISOString(), usuarios: { nombre: 'Director Obra' }, acknowledged_by: 'u1', acknowledged_usuario: { nombre: 'Director Obra' } }
    ]

    fotos = [
      { id: 'f1', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800', nombre_archivo: 'inicio.jpg', descripcion: 'Replanteo completado', tomada_en: new Date().toISOString(), subida_por: { nombre: 'Juan Capataz' } }
    ]

    consumos = [
      { id: 'c1', insumo_id: 'i1', cantidad_consumida: 1550, cantidad_estimada: 1500, registrado_en: new Date().toISOString(), insumo: { nombre: 'Ladrillo hueco', unidad: 'un', precio_referencia: 85 }, diferencia: 50, porcentaje_diferencia: 3.3 }
    ]

    ordenesCompraData = [
      { id: 'oc1', numero: '1024', estado: 'recibida_completa', total: 150000, created_at: new Date().toISOString(), obra: { nombre: 'Edificio Residencial Las Palmas' }, creador: { nombre: 'Admin Demo' }, lineas: [] }
    ]

    insumosObra = []
  } else {
    // Standard Supabase fetching
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser

    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('rol, obra_id')
      .eq('auth_user_id', user.id)
      .single()
    profile = userProfile

    const { data: otData, error: otError } = await supabase
      .from('ordenes_trabajo')
      .select(`
        *,
        obras (id, nombre),
        rubros (id, nombre, unidad, presupuesto, presupuesto_ur),
        usuarios!ordenes_trabajo_created_by_fkey (id, nombre, email),
        tareas (id, descripcion, completada, orden, created_at, cantidad, unidad)
      `)
      .eq('id', otId)
      .single()

    if (otError || !otData) notFound()
    ot = otData

    const { data: ieData } = await supabase
      .from('ot_insumos_estimados')
      .select('*, insumos (id, nombre, unidad, tipo)')
      .eq('orden_trabajo_id', otId)
    insumosEstimados = ieData || []

    const { data: histData } = await supabase
      .from('ot_historial')
      .select('*, usuarios!ot_historial_usuario_id_fkey (id, nombre)')
      .eq('orden_trabajo_id', otId)
      .order('created_at', { ascending: false })
    historial = histData || []

    const { data: fData } = await supabase
      .from('ot_fotos')
      .select('id, storage_path, nombre_archivo, descripcion, tomada_en, latitud, longitud, usuarios!ot_fotos_subida_por_fkey (nombre)')
      .eq('orden_trabajo_id', otId)
      .order('tomada_en', { ascending: false })

    fotos = (fData || []).map((foto: any) => {
      const { data: urlData } = supabase.storage.from('ot-fotos').getPublicUrl(foto.storage_path)
      return { ...foto, url: urlData.publicUrl, subida_por: foto.usuarios }
    })

    const { data: cData } = await supabase
      .from('consumo_materiales')
      .select('id, insumo_id, cantidad_consumida, cantidad_estimada, notas, registrado_en, insumos (id, nombre, unidad, precio_referencia)')
      .eq('orden_trabajo_id', otId)
      .order('registrado_en', { ascending: false })

    consumos = (cData || []).map((c: any) => {
      const diferencia = c.cantidad_estimada ? c.cantidad_consumida - c.cantidad_estimada : 0
      const porcentaje = c.cantidad_estimada && c.cantidad_estimada > 0 ? (diferencia / c.cantidad_estimada) * 100 : null
      return { ...c, insumo: c.insumos, diferencia, porcentaje_diferencia: porcentaje }
    })

    const { data: ocData } = await supabase
      .from('ordenes_compra')
      .select('*, obra:obras(id, nombre), creador:usuarios!ordenes_compra_created_by_fkey(id, nombre), lineas:lineas_oc!lineas_oc_orden_compra_id_fkey(*, insumo:insumos(id, nombre, unidad, tipo))')
      .eq('ot_id', otId)
      .order('created_at', { ascending: false })
    ordenesCompraData = ocData || []

    const { data: iObra } = await supabase.from('insumos').select('*').eq('obra_id', obraId).is('deleted_at', null).order('nombre')
    insumosObra = iObra || []
  }

  // Common calculations
  const totalTareas = ot.tareas?.length || 0
  const tareasCompletadas = ot.tareas?.filter((t: any) => t.completada).length || 0
  const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0
  const costoReal = ot.costo_real ?? ot.costo_estimado
  const desvio = costoReal - ot.costo_estimado
  const desvioPercent = ot.costo_estimado > 0 ? (desvio / ot.costo_estimado) * 100 : 0

  const canApprove = profile && ['admin', 'director_obra'].includes(profile.rol)
  const canExecute = profile && ['admin', 'director_obra', 'jefe_obra'].includes(profile.rol)

  return (
    <div className="flex-1 flex flex-col space-y-8 pb-10">
      {/* Navigation Header */}
      <nav className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link href={`/obras/${obraId}/ordenes-trabajo`}>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orden de Trabajo</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-sm font-semibold text-foreground">OT-{ot.numero}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {ot.rubros?.nombre}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <OTStatusBadge estado={ot.estado || 'borrador'} />
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
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area - Span 2 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Context & Progress Header Card */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contexto de Obra</p>
                    <p className="text-base font-semibold text-foreground flex items-center gap-2">
                       <Building2 className="w-4 h-4 text-muted-foreground" />
                       {ot.obras?.nombre}
                    </p>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
                    {ot.descripcion}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="relative w-24 h-24 flex items-center justify-center bg-muted/20 rounded-full border">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold tracking-tight">{progreso}%</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Avance</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Tareas</p>
                    <p className="text-sm font-medium">{tareasCompletadas} de {totalTareas}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Row */}
          <div className="grid gap-4 md:grid-cols-3">
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">Costo Estimado</CardTitle>
                   <DollarSign className="w-4 h-4 text-muted-foreground" />
                 </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">{formatPesos(ot.costo_estimado)}</div>
                 </CardContent>
             </Card>

             <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">Costo Real</CardTitle>
                   <Wallet className="w-4 h-4 text-primary" />
                 </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">{ot.costo_real != null ? formatPesos(ot.costo_real) : '-'}</div>
                 </CardContent>
             </Card>

             <Card className={cn(desvio > 0 ? "border-destructive dark:border-destructive/50" : "border-emerald-500/20")}>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">Desviación</CardTitle>
                   <TrendingUp className={cn("w-4 h-4", desvio > 0 ? "text-destructive" : "text-emerald-500")} />
                 </CardHeader>
                 <CardContent>
                   <div className="flex items-center gap-2">
                     <span className={cn("text-2xl font-bold", desvio > 0 ? "text-destructive" : "text-emerald-500")}>
                         {desvio > 0 ? '+' : ''}{desvioPercent.toFixed(1)}%
                     </span>
                     {desvio > 0 && <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />}
                   </div>
                 </CardContent>
             </Card>
          </div>

          <div className="space-y-6 pt-4">
             <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold tracking-tight">Fórmula e Insumos</h3>
             </div>
             <OTInsumosEstimados insumos={insumosEstimados} cantidad={ot.cantidad} />

             {(ot.estado === 'en_ejecucion' || ot.estado === 'cerrada') && (
               <>
                 <div className="flex items-center justify-between border-b pb-2 pt-6">
                    <h3 className="text-lg font-semibold tracking-tight">Ejecución y Registro</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="flex flex-col h-full">
                     <CardHeader className="pb-3 border-b">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <ClipboardList className="w-4 h-4 text-primary" />
                               Progreso de Tareas
                            </CardTitle>
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full">{tareasCompletadas}/{totalTareas} OK</span>
                         </div>
                     </CardHeader>
                     <CardContent className="p-0 flex-1">
                        <OTTareas
                          otId={otId}
                          obraId={obraId}
                          tareas={ot.tareas || []}
                          canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
                          rubroUnidad={ot.rubros?.unidad}
                        />
                     </CardContent>
                   </Card>

                   <Card className="flex flex-col h-full">
                     <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                           <CardTitle className="text-base flex items-center gap-2">
                               <Camera className="w-4 h-4 text-muted-foreground" />
                               Registro Fotográfico
                           </CardTitle>
                           <TooltipProvider>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button variant="ghost" size="icon" className="w-6 h-6 opacity-50 cursor-not-allowed">
                                   <Plus className="w-3 h-3" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>Próximamente</TooltipContent>
                             </Tooltip>
                           </TooltipProvider>
                        </div>
                     </CardHeader>
                     <CardContent className="p-0 flex-1">
                        <OTFotos
                          otId={otId}
                          obraId={obraId}
                          fotos={fotos}
                          canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
                        />
                     </CardContent>
                   </Card>
                 </div>

                 <div className="flex items-center justify-between border-b pb-2 pt-6">
                    <h3 className="text-lg font-semibold tracking-tight">Materiales y Logística</h3>
                 </div>
                 
                 <div className="space-y-6">
                   <OTConsumos
                     otId={otId}
                     obraId={obraId}
                     consumos={consumos}
                     canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
                   />

                   <OTOrdenesCompra
                     otId={otId}
                     obraId={obraId}
                     ordenesCompra={ordenesCompraData}
                     insumos={insumosObra}
                     canCreate={ot.estado === 'en_ejecucion' && canExecute || false}
                   />
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
               <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detalles de Gestión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border bg-muted/50 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Rubro</p>
                  <p className="text-sm font-medium">{ot.rubros?.nombre}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border bg-muted/50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Responsable</p>
                  <p className="text-sm font-medium">{ot.usuarios?.nombre}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border bg-muted/50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Creación</p>
                  <p className="text-sm font-medium">
                    {new Date(ot.created_at || '').toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
             <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                   <Package className="w-4 h-4 text-primary mb-2" />
                   <span className="text-lg font-bold text-primary">{ot.cantidad}</span>
                   <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest mt-1">{ot.rubros?.unidad} Estimado</span>
                </CardContent>
             </Card>
             <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                   <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 mb-2" />
                   <span className="text-lg font-bold text-emerald-600 dark:text-emerald-500">{tareasCompletadas}</span>
                   <span className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-widest mt-1">Listas</span>
                </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader>
               <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Historial Cronológico</CardTitle>
            </CardHeader>
            <CardContent>
              <OTHistoryTimeline historial={historial || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
