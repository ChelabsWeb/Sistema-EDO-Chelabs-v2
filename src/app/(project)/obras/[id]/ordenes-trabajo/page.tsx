import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import { OTStatusBadge } from '@/components/edo/ot/ot-status-badge'
import { OTFilters } from '@/components/edo/ot/ot-filters'
import {
  ArrowLeft, Plus, LayoutGrid, ClipboardCheck,
  Activity, CheckCircle2, AlertCircle, TrendingUp,
  FileText, Search, User, Calendar, ArrowUpRight,
  Sparkles, Layers, Box
} from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ estado?: string; search?: string }>
}

export default async function OrdenesTrabajoPage({ params, searchParams }: Props) {
  const { id: obraId } = await params
  const { estado, search } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get obra info
  const { data: obra } = await supabase
    .from('obras')
    .select('id, nombre')
    .eq('id', obraId)
    .single()

  if (!obra) notFound()

  // Build query
  let query = supabase
    .from('ordenes_trabajo')
    .select(`
      *,
      rubros (
        id,
        nombre,
        unidad
      ),
      usuarios!ordenes_trabajo_created_by_fkey (
        id,
        nombre
      ),
      tareas (
        id,
        completada
      )
    `)
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (estado && estado !== 'todos') {
    query = query.eq('estado', estado as 'borrador' | 'aprobada' | 'en_ejecucion' | 'cerrada')
  }

  if (search) {
    const searchNum = parseInt(search)
    if (!isNaN(searchNum)) {
      query = query.or(`descripcion.ilike.%${search}%,numero.eq.${searchNum}`)
    } else {
      query = query.ilike('descripcion', `%${search}%`)
    }
  }

  const { data: ordenesTrabajo } = await query

  // Calculate progress for each OT
  const otsWithProgress = (ordenesTrabajo || []).map((ot) => {
    const tareas = ot.tareas as { id: string; completada: boolean | null }[] | null
    const totalTareas = tareas?.length || 0
    const tareasCompletadas = tareas?.filter(t => t.completada).length || 0
    const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0

    return {
      ...ot,
      progreso,
      totalTareas,
      tareasCompletadas,
    }
  })

  const stats = {
    borrador: otsWithProgress.filter(ot => ot.estado === 'borrador').length,
    aprobada: otsWithProgress.filter(ot => ot.estado === 'aprobada').length,
    en_ejecucion: otsWithProgress.filter(ot => ot.estado === 'en_ejecucion').length,
    cerrada: otsWithProgress.filter(ot => ot.estado === 'cerrada').length,
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 antialiased pb-32 px-8 pt-10">
      {/* Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 premium-card p-8 animate-apple-fade-in">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight font-display">Órdenes de Trabajo</h2>
          <p className="text-sm font-medium text-apple-gray-400">Planificación y seguimiento de ejecución</p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={`/obras/${obraId}/ordenes-trabajo/nueva`}
            className="h-14 px-8 bg-apple-blue text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-lg active:scale-95 flex items-center gap-3 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Nueva Orden
          </Link>
        </div>
      </div>

      <main className="space-y-12 pb-32">
        {/* Bento Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-apple-slide-up">
          <div className="p-8 premium-card group hover:-translate-y-2 transition-transform duration-500">
            <div className="w-10 h-10 rounded-xl bg-apple-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 text-apple-gray-400">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Borradores</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{stats.borrador}</p>
          </div>

          <div className="p-8 premium-card group hover:-translate-y-2 transition-transform duration-500">
            <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center mb-6 text-apple-blue">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Aprobadas</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{stats.aprobada}</p>
          </div>

          <div className="p-8 premium-card group hover:-translate-y-2 transition-transform duration-500">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500 uppercase tracking-widest">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">En Ejecución</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{stats.en_ejecucion}</p>
          </div>

          <div className="p-8 premium-card group hover:-translate-y-2 transition-transform duration-500">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest mb-1">Finalizadas</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{stats.cerrada}</p>
          </div>
        </div>

        {/* Filters & Navigation */}
        <section className="animate-apple-slide-up" style={{ animationDelay: '0.1s' }}>
          <OTFilters currentEstado={estado} currentSearch={search} />
        </section>

        {/* Main List Table */}
        <section className="animate-apple-slide-up" style={{ animationDelay: '0.2s' }}>
          {otsWithProgress.length > 0 ? (
            <div className="premium-card overflow-hidden overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-apple-gray-50/50 dark:bg-apple-gray-50/10">
                  <TableRow className="border-b border-apple-gray-50 dark:border-white/5 hover:bg-transparent">
                    <TableHead className="px-8 py-6 text-left text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Orden nº</TableHead>
                    <TableHead className="px-8 py-6 text-left text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Rubro / Categoría</TableHead>
                    <TableHead className="px-8 py-6 text-left text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Estado</TableHead>
                    <TableHead className="px-8 py-6 text-left text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Avance Operativo</TableHead>
                    <TableHead className="px-8 py-6 text-right text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Certificado Est.</TableHead>
                    <TableHead className="px-8 py-6 text-right text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Ratio Desvío</TableHead>
                    <TableHead className="px-8 py-6 text-right text-[10px] font-black text-apple-gray-400 uppercase tracking-widest"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-apple-gray-50 dark:divide-white/5">
                  {otsWithProgress.map((ot) => {
                    const desvio = ot.costo_real != null ? ot.costo_real - ot.costo_estimado : null
                    const desvioPercent = desvio != null && ot.costo_estimado > 0
                      ? (desvio / ot.costo_estimado) * 100
                      : null
                    const hasWarning = desvio != null && desvio > 0
                    const isCritical = desvioPercent != null && desvioPercent > 20

                    return (
                      <TableRow
                        key={ot.id}
                        className={cn(
                          "group hover:bg-apple-gray-50/50 dark:hover:bg-white/[0.02] transition-colors border-none",
                          isCritical && "bg-red-500/[0.03] dark:bg-red-500/[0.05]",
                          hasWarning && !isCritical && "bg-amber-500/[0.02]"
                        )}
                      >
                        <TableCell className="px-8 py-8 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                              isCritical ? "bg-red-500/10 text-red-500" :
                                hasWarning ? "bg-amber-500/10 text-amber-500" :
                                  "bg-apple-gray-100 dark:bg-white/5 text-apple-gray-300"
                            )}>
                              {isCritical || hasWarning ? <AlertCircle className="w-5 h-5 text-current animate-pulse-soft" /> : <Box className="w-5 h-5" />}
                            </div>
                            <div>
                              <Link
                                href={`/obras/${obraId}/ordenes-trabajo/${ot.id}`}
                                className="text-lg font-black text-foreground tracking-tighter hover:text-apple-blue transition-colors uppercase"
                              >
                                OT-{ot.numero}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest truncate max-w-[140px]">{ot.descripcion || 'Sin descripción'}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-8 whitespace-nowrap align-middle">
                          <div className="text-[15px] font-bold text-foreground">{(ot.rubros as any)?.nombre || '-'}</div>
                          <div className="text-[10px] font-black text-apple-gray-300 uppercase tracking-widest">Unidad: {(ot.rubros as any)?.unidad || '-'}</div>
                        </TableCell>
                        <TableCell className="px-8 py-8 whitespace-nowrap align-middle">
                          <OTStatusBadge estado={ot.estado || 'borrador'} />
                        </TableCell>
                        <TableCell className="px-8 py-8 whitespace-nowrap align-middle">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-apple-gray-300">
                              <span>{ot.progreso}% completado</span>
                              <span>{ot.tareasCompletadas}/{ot.totalTareas} items</span>
                            </div>
                            <div className="w-48 bg-apple-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  ot.progreso === 100 ? "bg-emerald-500" : "bg-apple-blue"
                                )}
                                style={{ width: `${ot.progreso}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-8 whitespace-nowrap text-right font-black text-foreground text-lg tracking-tighter align-middle">
                          {formatPesos(ot.costo_estimado)}
                        </TableCell>
                        <TableCell className="px-8 py-8 whitespace-nowrap text-right align-middle">
                          {desvio != null ? (
                            <div className="flex flex-col items-end">
                              <span className={cn(
                                "text-[15px] font-black tracking-tighter",
                                desvio > 0 ? 'text-red-500' : 'text-emerald-500'
                              )}>
                                {desvio > 0 ? '+' : ''}{formatPesos(desvio)}
                              </span>
                              {desvioPercent != null && (
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest",
                                  desvio > 0 ? 'text-red-400' : 'text-emerald-400'
                                )}>
                                  ({desvioPercent > 0 ? '+' : ''}{desvioPercent.toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-apple-gray-300 dark:text-apple-gray-400 uppercase tracking-widest">Sin registro real</span>
                          )}
                        </TableCell>
                        <TableCell className="px-8 py-8 text-right whitespace-nowrap align-middle">
                          <Link
                            href={`/obras/${obraId}/ordenes-trabajo/${ot.id}`}
                            className="size-12 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform duration-500 overflow-hidden ml-auto"
                          >
                            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-24 text-center border border-apple-gray-100 dark:border-white/5 shadow-apple">
              <div className="w-20 h-20 bg-apple-gray-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-apple-gray-100 dark:border-white/5">
                <LayoutGrid className="w-10 h-10 text-apple-gray-200" />
              </div>
              <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">Central de Operaciones</h3>
              <p className="text-xl text-apple-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                {estado && estado !== 'todos'
                  ? `No se encontraron órdenes con el filtro seleccionado.`
                  : 'Aún no se han generado órdenes de trabajo para este proyecto.'}
              </p>
              <div className="mt-12">
                <Link
                  href={`/obras/${obraId}/ordenes-trabajo/nueva`}
                  className="inline-flex items-center px-10 py-5 bg-foreground text-background dark:bg-white dark:text-black rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  Emitir Primera Orden
                </Link>
              </div>
            </div>
          )}
        </section>

        <div className="mt-12 text-center text-[10px] font-black text-apple-gray-300 dark:text-apple-gray-400 uppercase tracking-[0.5em]">
          Sistema de Gestión EDO • Control de Campo v2
        </div>
      </main>
    </div>
  )
}
