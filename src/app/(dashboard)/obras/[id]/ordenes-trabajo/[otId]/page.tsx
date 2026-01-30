import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Calendar, ClipboardList, Clock,
  DollarSign, LayoutGrid, MapPin, Plus, TrendingUp,
  Users, Wallet, Activity, ArrowUpRight, AlertTriangle,
  Camera, Package, Receipt, CheckCircle2
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
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="min-h-screen antialiased bg-[#f5f5f7] dark:bg-black p-6 md:p-14 space-y-10">
      {/* Premium Navigation Header */}
      <nav className="flex items-center justify-between mb-8 animate-apple-fade-in">
        <div className="flex items-center gap-6">
          <Link
            href={`/obras/${obraId}/ordenes-trabajo`}
            className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 text-apple-gray-500 group-hover:text-apple-blue transition-colors" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em]">Orden de Trabajo</span>
              <span className="w-1 h-1 rounded-full bg-apple-gray-200" />
              <span className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest">#{ot.numero}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tighter">
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
        <div className="lg:col-span-2 space-y-8 animate-apple-fade-in" style={{ animationDelay: '0.1s' }}>

          {/* Header Widget - Hero Bento */}
          <div className="p-10 bg-white dark:bg-apple-gray-50 rounded-[40px] border border-apple-gray-100 dark:border-white/[0.05] shadow-apple-float relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-apple-blue/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Contexto de Obra</p>
                    <p className="text-lg font-bold text-foreground">{ot.obras?.nombre}</p>
                  </div>
                </div>
                <p className="text-xl text-apple-gray-400 font-medium leading-relaxed max-w-xl">
                  {ot.descripcion}
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-6 min-w-[140px]">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-apple-gray-100 dark:text-white/5" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * progreso) / 100} className="text-apple-blue transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-foreground tracking-tighter">{progreso}%</span>
                    <span className="text-[8px] font-black text-apple-gray-300 uppercase tracking-widest">Avance</span>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Tareas</p>
                  <p className="text-sm font-bold text-foreground">{tareasCompletadas} de {totalTareas} completadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Costs Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[32px] border border-apple-gray-100 dark:border-white/[0.05] shadow-apple group hover:-translate-y-2 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                <DollarSign className="w-5 h-5 text-apple-gray-400" />
              </div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Costo Estimado</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{formatPesos(ot.costo_estimado)}</p>
            </div>

            <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[32px] border border-apple-gray-100 dark:border-white/[0.05] shadow-apple group hover:-translate-y-2 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center mb-6">
                <Wallet className="w-5 h-5 text-apple-blue" />
              </div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Costo Real</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">{ot.costo_real != null ? formatPesos(ot.costo_real) : '-'}</p>
            </div>

            <div className={cn(
              "p-8 rounded-[32px] border shadow-apple group hover:-translate-y-2 transition-transform",
              desvio > 0
                ? "bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-500/20"
                : "bg-white dark:bg-apple-gray-50 border-apple-gray-100 dark:border-white/[0.05]"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-6",
                desvio > 0 ? "bg-red-100 dark:bg-red-500/20" : "bg-apple-gray-50 dark:bg-white/5"
              )}>
                <TrendingUp className={cn("w-5 h-5", desvio > 0 ? "text-red-600" : "text-emerald-500")} />
              </div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Desviación</p>
              <div className="flex items-baseline gap-2">
                <p className={cn("text-3xl font-black tracking-tighter", desvio > 0 ? "text-red-600" : "text-emerald-500")}>
                  {desvio > 0 ? '+' : ''}{desvioPercent.toFixed(1)}%
                </p>
                {desvio > 0 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse-soft" />}
              </div>
            </div>
          </div>

          {/* Detailed Sections - Premium Stack */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Fórmula e Insumos</h2>
              <div className="h-px flex-1 bg-apple-gray-100 dark:bg-white/5" />
            </div>
            <OTInsumosEstimados insumos={insumosEstimados} cantidad={ot.cantidad} />

            {(ot.estado === 'en_ejecucion' || ot.estado === 'cerrada') && (
              <>
                <div className="flex items-center gap-4 px-4 pt-10">
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Ejecución y Registro</h2>
                  <div className="h-px flex-1 bg-apple-gray-100 dark:bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-[32px] border-none shadow-apple overflow-hidden">
                    <div className="p-8 pb-0 flex items-center justify-between">
                      <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-apple-blue" />
                        Progreso de Tareas
                      </h3>
                      <span className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">{tareasCompletadas}/{totalTareas} OK</span>
                    </div>
                    <OTTareas
                      otId={otId}
                      obraId={obraId}
                      tareas={ot.tareas || []}
                      canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
                      rubroUnidad={ot.rubros?.unidad}
                    />
                  </Card>

                  <Card className="rounded-[32px] border-none shadow-apple overflow-hidden">
                    <div className="p-8 pb-0 flex items-center justify-between">
                      <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <Camera className="w-5 h-5 text-apple-gray-400" />
                        Registro Fotográfico
                      </h3>
                      <Link href="#" className="w-8 h-8 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center hover:scale-110 transition-all">
                        <Plus className="w-4 h-4" />
                      </Link>
                    </div>
                    <OTFotos
                      otId={otId}
                      obraId={obraId}
                      fotos={fotos}
                      canEdit={ot.estado === 'en_ejecucion' && canExecute || false}
                    />
                  </Card>
                </div>

                <div className="space-y-8 pt-10">
                  <div className="flex items-center gap-4 px-4">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Materiales y Logística</h2>
                    <div className="h-px flex-1 bg-apple-gray-100 dark:bg-white/5" />
                  </div>

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

        {/* Sidebar - Context & History */}
        <div className="space-y-8 animate-apple-fade-in" style={{ animationDelay: '0.2s' }}>

          {/* Info Tile */}
          <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[32px] border border-apple-gray-100 dark:border-white/[0.05] shadow-apple">
            <h3 className="text-sm font-black text-apple-gray-300 uppercase tracking-[0.2em] mb-6">Detalles de Gestión</h3>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Rubro</p>
                  <p className="text-sm font-bold text-foreground">{ot.rubros?.nombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Responsable</p>
                  <p className="text-sm font-bold text-foreground">{ot.usuarios?.nombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Creación</p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(ot.created_at || '').toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Progress - Tiny Widgets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-[28px] border border-apple-blue/10 flex flex-col items-center justify-center text-center">
              <Package className="w-5 h-5 text-apple-blue mb-2" />
              <span className="text-lg font-black text-apple-blue tracking-tighter">{ot.cantidad}</span>
              <span className="text-[8px] font-black text-apple-blue/60 uppercase tracking-widest">{ot.rubros?.unidad} Estimado</span>
            </div>
            <div className="p-6 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[28px] border border-emerald-500/10 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
              <span className="text-lg font-black text-emerald-500 tracking-tighter">{tareasCompletadas}</span>
              <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Listas</span>
            </div>
          </div>

          {/* History Timeline */}
          <OTHistoryTimeline historial={historial || []} />
        </div>
      </div>
    </div>
  )
}
