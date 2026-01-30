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
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-8 md:p-14 max-w-7xl mx-auto space-y-12 animate-apple-fade-in antialiased">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-6 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 rounded-b-[40px] shadow-apple-sm transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/obras" className="w-12 h-12 rounded-full glass dark:glass-dark flex items-center justify-center text-apple-gray-400 hover:text-foreground hover:scale-110 active:scale-95 transition-all shadow-apple-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{obra.nombre}</h1>
                <div className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-apple-sm", statusBg, statusColor, statusBorder)}>
                  {statusLabel}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-apple-gray-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-apple-blue" />
                  <span className="text-sm">{obra.direccion || 'Sin dirección registrada'}</span>
                </div>
                <span className="text-apple-gray-100 dark:text-white/10">•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold tracking-tight">{obra.cooperativa}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 self-end md:self-center">
            <Link href={`/obras/${id}/editar`} className="px-6 py-3 glass dark:glass-dark border border-apple-gray-100 dark:border-white/10 rounded-2xl text-sm font-bold text-foreground hover:bg-white dark:hover:bg-apple-gray-50 transition-all flex items-center gap-2 shadow-apple-sm active:scale-95">
              <Settings className="w-4 h-4 text-apple-gray-400" />
              Configuración
            </Link>
            {isAdmin && (
              <div className="opacity-80 hover:opacity-100 transition-all">
                <DeleteObraButton obraId={id} obraNombre={obra.nombre} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue mb-6">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Inversión Total</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter">{formatPesos(obra.presupuesto_total)}</h2>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Presupuesto Rubros</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter">{formatUR(presupuestoRubrosUR)}</h2>
              <p className="text-[11px] font-bold text-indigo-500/60 tracking-tight mt-1">{formatPesos(presupuestoRubrosPesos)}</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Cotización UR</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter">{formatPesos(cotizacion)}</h2>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-apple-gray-50 rounded-[40px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Capacidad Ejecución</p>
              <h2 className="text-3xl font-black text-foreground tracking-tighter">{ordenesTrabajo.length} <span className="text-apple-gray-300 font-medium">OTs</span></h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area (8/12) */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white dark:bg-apple-gray-50 rounded-[40px] shadow-apple-lg border border-apple-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-apple-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Estructura de Rubros</h2>
                  <p className="text-sm font-medium text-apple-gray-400">Presupuestación detallada por ítem</p>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-10">
              <RubrosList
                obraId={id}
                userRole={(profile?.rol || 'jefe_obra') as UserRole}
                valorUr={cotizacion}
              />
            </div>
          </section>
        </div>

        {/* Sidebar Space (4/12) */}
        <div className="lg:col-span-4 space-y-10">
          {/* Recent OTs Styled as iOS Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Actividad OT</h2>
              </div>
              <Link href={`/obras/${id}/ordenes-trabajo`} className="text-xs font-black text-apple-blue uppercase tracking-widest hover:bg-apple-blue/5 px-4 py-2 rounded-full transition-all">Explorar Todo</Link>
            </div>

            <div className="space-y-4">
              {ordenesTrabajo.length > 0 ? (
                ordenesTrabajo.map((ot) => (
                  <Link
                    key={ot.id}
                    href={`/obras/${id}/ordenes-trabajo/${ot.id}`}
                    className="flex items-center justify-between p-6 bg-white dark:bg-apple-gray-50 rounded-[32px] border border-apple-gray-100 dark:border-white/5 hover:border-apple-blue/40 hover:shadow-apple-float transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-apple-gray-50 dark:bg-apple-gray-50 flex items-center justify-center text-apple-gray-300 font-black text-xs group-hover:bg-apple-blue/10 group-hover:text-apple-blue transition-colors">
                        {ot.numero}
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground group-hover:text-apple-blue transition-colors">Orden N° {ot.numero}</p>
                        <p className="text-xs font-medium text-apple-gray-400 line-clamp-1">{ot.descripcion}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-apple-gray-200 group-hover:text-apple-blue transition-all" />
                  </Link>
                ))
              ) : (
                <div className="p-16 bg-apple-gray-50 dark:bg-white/5 rounded-[40px] text-center space-y-4">
                  <FileText className="w-12 h-12 text-apple-gray-200 mx-auto" />
                  <p className="text-apple-gray-400 font-bold">Sin órdenes activas</p>
                </div>
              )}
              <Link href={`/obras/${id}/ordenes-trabajo/nueva`} className="flex items-center justify-center gap-2 w-full py-5 bg-foreground dark:bg-white text-background dark:text-black rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-apple-lg">
                <Plus className="w-4 h-4" />
                Nueva Orden
              </Link>
            </div>
          </div>

          {/* Deviation Analytics */}
          <div className="p-10 bg-white dark:bg-apple-gray-50 rounded-[40px] shadow-apple-lg border border-apple-gray-100 dark:border-white/5 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Análisis Costos</h2>
            </div>
            <RubroDeviations deviations={deviations} />
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/obras/${id}/insumos`} className="flex flex-col gap-6 p-6 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[32px] border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all group shadow-apple-sm">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center text-emerald-500 shadow-sm"><Wallet className="w-5 h-5" /></div>
              <span className="font-bold text-sm text-foreground">Insumos<br />Maestro</span>
            </Link>
            <Link href={`/obras/${id}/usuarios`} className="flex flex-col gap-6 p-6 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-[32px] border border-apple-blue/10 hover:border-apple-blue/30 hover:bg-apple-blue/10 transition-all group shadow-apple-sm">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center text-apple-blue shadow-sm"><Users className="w-5 h-5" /></div>
              <span className="font-bold text-sm text-foreground">Equipo de<br />Trabajo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
