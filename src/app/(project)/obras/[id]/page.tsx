import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos, formatUR, convertURtoPesos } from '@/lib/utils/currency'
import { getCotizacionUR } from '@/app/actions/configuracion'
import { getDeviationsByRubro } from '@/app/actions/costos'
import { DeleteObraButton } from '@/components/edo/obra/delete-obra-button'
import { RubroDeviations } from '@/components/edo/costos/rubro-deviations'
import { RubrosList } from '@/components/edo/rubros'
import type { UserRole } from '@/types/database'
import {
  Building2, MapPin, Users, ClipboardList, TrendingUp, DollarSign,
  Wallet, ChevronRight, ArrowLeft, Calendar, FileText, LayoutGrid,
  Activity, Settings, Plus, Layers
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ObraDetailPage({ params }: Props) {
  const { id } = await params
  const isDemo = id.startsWith('demo-') || process.env.DEMO_MODE === 'true'
  const supabase = await createClient()

  let user = null
  let profile = null
  let obra: any = null
  let cotizacion = 0
  let rubros: any[] = []
  let ordenesTrabajo: any[] = []
  let deviations: any[] = []

  if (isDemo) {
    user = { id: 'demo-user' }
    profile = { rol: 'admin' }
    obra = {
      id: id,
      nombre: id === 'demo-1' ? 'Edificio Las Heras' : 'Planta Industrial',
      direccion: 'Av. Las Heras 1234, Montevideo',
      cooperativa: 'COVICO IV',
      presupuesto_total: 1500000,
      estado: 'activa'
    }
    cotizacion = 1450.50
    rubros = [
      { id: 'r1', nombre: 'Albañilería', unidad: 'm2', presupuesto: 50000, presupuesto_ur: 34.47, es_predefinido: true },
      { id: 'r2', nombre: 'Estructura', unidad: 'm3', presupuesto: 120000, presupuesto_ur: 82.72, es_predefinido: true }
    ]
    ordenesTrabajo = [
      { id: 'ot-1', numero: 1, descripcion: 'Fundaciones y platea de hormigón', estado: 'en_ejecucion', rubros: { nombre: 'Estructura' } },
      { id: 'ot-2', numero: 2, descripcion: 'Levantado de muros planta baja', estado: 'aprobada', rubros: { nombre: 'Albañilería' } }
    ]
    deviations = []
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
    deviations = deviationsResult.success ? deviationsResult.data : []
  }

  const isAdmin = profile?.rol === 'admin'
  const presupuestoRubrosUR = rubros.reduce((sum, r) => sum + Number(r.presupuesto_ur || 0), 0)
  const presupuestoRubrosPesos = convertURtoPesos(presupuestoRubrosUR, cotizacion)

  const estadoConfig: Record<string, { label: string; color: string; border: string; bg: string }> = {
    activa: { label: 'En Ejecución', color: 'text-emerald-600', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
    pausada: { label: 'En Espera', color: 'text-amber-600', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
    finalizada: { label: 'Completada', color: 'text-apple-gray-400', border: 'border-apple-gray-200', bg: 'bg-apple-gray-50' },
  }

  const otStatusColors: Record<string, string> = {
    borrador: 'bg-apple-gray-50 text-apple-gray-400 border-apple-gray-100',
    aprobada: 'bg-blue-500/10 text-blue-600 border-blue-500/10',
    en_ejecucion: 'bg-amber-500/10 text-amber-600 border-amber-500/10',
    cerrada: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10',
  }

  const { label: statusLabel, color: statusColor, border: statusBorder, bg: statusBg } = estadoConfig[obra.estado] || estadoConfig.activa

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 antialiased pb-20 px-8 pt-10">
      {/* Project Status Summary Card */}
      {/* Project Status Bar */}
      <div className="premium-card p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className={cn("px-5 py-2 rounded-full border text-xs font-black uppercase tracking-[0.2em] shadow-sm", statusBg, statusColor, statusBorder)}>
            {statusLabel}
          </div>
          <div className="h-10 w-px bg-apple-gray-100 dark:bg-white/10 hidden md:block" />
          <div className="flex items-center gap-6 flex-wrap text-apple-gray-500 font-medium font-inter">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-apple-blue" />
              <span className="text-sm tracking-tight text-foreground/80">{obra.direccion || 'Sin dirección registrada'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-apple-blue" />
              <span className="text-sm font-black text-foreground tracking-tight uppercase">{obra.cooperativa}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/obras/${id}/editar`} className="px-6 py-3 bg-apple-gray-50 dark:bg-white/5 border border-apple-gray-100 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-apple-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 shadow-sm active:scale-95 group">
            <Settings className="w-4 h-4 text-apple-gray-400 group-hover:rotate-90 transition-transform duration-500" />
            Configurar
          </Link>
          {isAdmin && (
            <div className="opacity-80 hover:opacity-100 transition-all">
              <DeleteObraButton obraId={id} obraNombre={obra.nombre} />
            </div>
          )}
        </div>
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="premium-card p-8 group">
          <div className="flex flex-col justify-between h-full space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 border border-apple-blue/20 flex items-center justify-center text-apple-blue transition-transform group-hover:scale-110">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mb-1.5">Inversión Total</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none font-display">{formatPesos(obra.presupuesto_total)}</h2>
            </div>
          </div>
        </div>

        <div className="premium-card p-8 group">
          <div className="flex flex-col justify-between h-full space-y-8">
            <div className="size-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500 transition-transform group-hover:scale-110">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mb-1.5">Presupuesto Rubros</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none font-display">{formatUR(presupuestoRubrosUR)}</h2>
              <p className="text-xs font-bold text-purple-600/80 tracking-tight mt-1 px-1">{formatPesos(presupuestoRubrosPesos)}</p>
            </div>
          </div>
        </div>

        <div className="premium-card p-8 group">
          <div className="flex flex-col justify-between h-full space-y-8">
            <div className="size-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mb-1.5">Cotización UR</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none font-display">{formatPesos(cotizacion)}</h2>
            </div>
          </div>
        </div>

        <div className="premium-card p-8 group">
          <div className="flex flex-col justify-between h-full space-y-8">
            <div className="size-14 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest mb-1.5">Órdenes de Trabajo</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none uppercase">{ordenesTrabajo.length} <span className="text-apple-gray-400 font-medium">OTs</span></h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Integrated Analytics Card */}
          <section className="premium-card p-10 space-y-8 h-full flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight font-display uppercase">Desempeño Económico</h2>
                  <p className="text-sm font-medium text-apple-gray-400 text-foreground/60">Análisis prospectivo de desvíos por rubro</p>
                </div>
              </div>
              <Link href={`/obras/${id}/analitica`} className="text-[10px] font-black text-apple-blue uppercase tracking-widest hover:underline">Ver Reporte Detallado</Link>
            </div>

            <div className="pt-4 flex-1">
              <RubroDeviations deviations={deviations} />
            </div>
          </section>
        </div>

        {/* Sidebar Space (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/obras/${id}/insumos`} className="flex flex-col gap-6 p-6 bg-emerald-500/5 backdrop-blur-md rounded-[32px] border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/10"><Wallet className="w-5 h-5" /></div>
              <span className="font-black text-xs text-foreground tracking-tight uppercase">Insumos<br />Maestro</span>
            </Link>
            <Link href={`/obras/${id}/usuarios`} className="flex flex-col gap-6 p-6 bg-apple-blue/5 backdrop-blur-md rounded-[32px] border border-apple-blue/10 hover:border-apple-blue/30 hover:bg-apple-blue/10 transition-all group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-apple-blue shadow-sm border border-apple-blue/10"><Users className="w-5 h-5" /></div>
              <span className="font-black text-xs text-foreground tracking-tight uppercase">Equipo de<br />Trabajo</span>
            </Link>
          </div>

          {/* Activity Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <ClipboardList className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight font-display uppercase">Actividad OT</h2>
              </div>
              <Link href={`/obras/${id}/ordenes-trabajo`} className="text-[10px] font-black text-apple-blue uppercase tracking-widest hover:underline transition-all">Explorar Todo</Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ordenesTrabajo.length > 0 ? (
                ordenesTrabajo.map((ot) => (
                  <Link
                    key={ot.id}
                    href={`/obras/${id}/ordenes-trabajo/${ot.id}`}
                    className="flex items-center justify-between p-6 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 rounded-3xl border border-apple-gray-100 dark:border-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-black text-xs border border-apple-blue/10">
                        {ot.numero}
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground group-hover:text-apple-blue transition-colors font-display">Orden N° {ot.numero}</p>
                        <p className="text-[10px] font-medium text-apple-gray-400 line-clamp-1">{ot.descripcion}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-apple-gray-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))
              ) : (
                <div className="p-16 premium-card text-center space-y-4">
                  <FileText className="w-12 h-12 text-apple-gray-200 mx-auto" />
                  <p className="text-apple-gray-400 font-bold">Sin órdenes activas</p>
                </div>
              )}
              <Link href={`/obras/${id}/ordenes-trabajo/nueva`} className="flex items-center justify-center gap-2 w-full py-5 bg-apple-blue text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-apple-blue/20 mt-4">
                <Plus className="w-4 h-4" />
                Nueva Orden
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
