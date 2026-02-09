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
    <div className="max-w-7xl mx-auto space-y-12 antialiased pb-20">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 pt-4 pb-12 transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link href="/obras" className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-2xl">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="space-y-3">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">{obra.nombre}</h1>
                <div className={cn("px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-lg", statusBg, statusColor, statusBorder)}>
                  {statusLabel}
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm tracking-tight">{obra.direccion || 'Sin dirección registrada'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-black text-slate-300 tracking-tight uppercase">{obra.cooperativa}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/obras/${id}/editar`} className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-3 shadow-xl active:scale-95 group">
              <Settings className="w-4 h-4 text-slate-500 group-hover:rotate-90 transition-transform duration-500" />
              Configurar
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="p-8 bg-white/[0.03] backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-8 transition-transform group-hover:scale-110">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Inversión Total</p>
              <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{formatPesos(obra.presupuesto_total)}</h2>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.03] backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-8 transition-transform group-hover:scale-110">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Presupuesto Rubros</p>
              <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{formatUR(presupuestoRubrosUR)}</h2>
              <p className="text-xs font-bold text-purple-400/80 tracking-tight mt-1 px-1">{formatPesos(presupuestoRubrosPesos)}</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.03] backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-8 transition-transform group-hover:scale-110">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cotización UR</p>
              <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{formatPesos(cotizacion)}</h2>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.03] backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-8 transition-transform group-hover:scale-110">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Capacidad Ejecución</p>
              <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{ordenesTrabajo.length} <span className="text-slate-600 font-medium">OTs</span></h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area (8/12) */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <LayoutGrid className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Estructura de Rubros</h2>
                  <p className="text-sm font-medium text-slate-500">Presupuestación detallada por ítem</p>
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
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <ClipboardList className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Actividad OT</h2>
              </div>
              <Link href={`/obras/${id}/ordenes-trabajo`} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-all">Explorar Todo</Link>
            </div>

            <div className="space-y-4">
              {ordenesTrabajo.length > 0 ? (
                ordenesTrabajo.map((ot) => (
                  <Link
                    key={ot.id}
                    href={`/obras/${id}/ordenes-trabajo/${ot.id}`}
                    className="flex items-center justify-between p-6 bg-white/[0.03] backdrop-blur-md rounded-[32px] border border-white/5 hover:border-blue-500/30 hover:shadow-2xl transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors border border-white/5">
                        {ot.numero}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Orden N° {ot.numero}</p>
                        <p className="text-xs font-medium text-slate-500 line-clamp-1">{ot.descripcion}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-all group-hover:translate-x-0.5" />
                  </Link>
                ))
              ) : (
                <div className="p-16 bg-white/5 rounded-[40px] text-center space-y-4 border border-white/5">
                  <FileText className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-slate-500 font-bold">Sin órdenes activas</p>
                </div>
              )}
              <Link href={`/obras/${id}/ordenes-trabajo/nueva`} className="flex items-center justify-center gap-2 w-full py-5 bg-blue-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20">
                <Plus className="w-4 h-4" />
                Nueva Orden
              </Link>
            </div>
          </div>

          {/* Deviation Analytics */}
          <div className="p-10 bg-white/[0.03] backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Análisis Costos</h2>
            </div>
            <RubroDeviations deviations={deviations} />
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/obras/${id}/insumos`} className="flex flex-col gap-6 p-6 bg-emerald-500/5 backdrop-blur-md rounded-[32px] border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all group shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 shadow-sm border border-white/5"><Wallet className="w-5 h-5" /></div>
              <span className="font-bold text-sm text-white tracking-tight">Insumos<br />Maestro</span>
            </Link>
            <Link href={`/obras/${id}/usuarios`} className="flex flex-col gap-6 p-6 bg-blue-500/5 backdrop-blur-md rounded-[32px] border border-blue-500/10 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-500 shadow-sm border border-white/5"><Users className="w-5 h-5" /></div>
              <span className="font-bold text-sm text-white tracking-tight">Equipo de<br />Trabajo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
