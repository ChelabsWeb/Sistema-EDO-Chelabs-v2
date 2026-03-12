import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import { OTStatusBadge } from '@/components/edo/ot/ot-status-badge'
import { OTFilters } from '@/components/edo/ot/ot-filters'
import {
  Plus, FileText, ClipboardCheck,
  Activity, CheckCircle2, AlertCircle, Box, LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    <div className="flex-1 flex flex-col space-y-8 pb-10">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h2>
          <p className="text-muted-foreground mt-1">
            Gestión de tareas, costos y progreso en la obra.
          </p>
        </div>
        <Button asChild>
          <Link href={`/obras/${obraId}/ordenes-trabajo/nueva`}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.borrador}</div>
            <p className="text-xs text-muted-foreground mt-1 text-transparent select-none">.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{stats.aprobada}</div>
            <p className="text-xs text-muted-foreground mt-1 text-transparent select-none">.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Ejecución</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{stats.en_ejecucion}</div>
            <p className="text-xs text-muted-foreground mt-1">Actividad principal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cerrada}</div>
            <p className="text-xs text-muted-foreground mt-1 text-transparent select-none">.</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OTFilters currentEstado={estado} currentSearch={search} />

      {/* Data Table */}
      <Card>
        {otsWithProgress.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px] font-semibold text-xs uppercase tracking-wider">Orden Nº</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Rubro / Categoría</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Estado</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Avance</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Cert. Est.</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Desvío</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otsWithProgress.map((ot) => {
                  const desvio = ot.costo_real != null ? ot.costo_real - ot.costo_estimado : null
                  const desvioPercent = desvio != null && ot.costo_estimado > 0
                    ? (desvio / ot.costo_estimado) * 100
                    : null
                  const hasWarning = desvio != null && desvio > 0
                  const isCritical = desvioPercent != null && desvioPercent > 20

                  return (
                    <TableRow key={ot.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="align-middle">
                        <Link href={`/obras/${obraId}/ordenes-trabajo/${ot.id}`} className="block">
                          <div className="font-bold text-base hover:text-primary transition-colors">
                            OT-{ot.numero}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px] mt-1">
                            {ot.descripcion || 'Sin descripción'}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="align-middle">
                         <div className="font-medium text-sm">{(ot.rubros as any)?.nombre || '-'}</div>
                         <div className="text-xs text-muted-foreground mt-1">Unidad: {(ot.rubros as any)?.unidad || '-'}</div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <OTStatusBadge estado={ot.estado || 'borrador'} />
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-3">
                           <div className="w-24 bg-secondary rounded-full h-2 overflow-hidden">
                             <div
                               className={cn(
                                 "h-full rounded-full transition-all",
                                 ot.progreso === 100 ? "bg-emerald-500" : "bg-primary"
                               )}
                               style={{ width: `${ot.progreso}%` }}
                             />
                           </div>
                           <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                             {ot.progreso}%
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold align-middle">
                        {formatPesos(ot.costo_estimado)}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {desvio != null ? (
                            <div className="flex flex-col items-end">
                              <span className={cn(
                                "text-sm font-bold",
                                desvio > 0 ? 'text-destructive' : 'text-emerald-500'
                              )}>
                                {desvio > 0 ? '+' : ''}{formatPesos(desvio)}
                              </span>
                              {desvioPercent != null && (
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider",
                                  desvio > 0 ? 'text-destructive/80' : 'text-emerald-500/80'
                                )}>
                                  ({desvioPercent > 0 ? '+' : ''}{desvioPercent.toFixed(1)}%)
                                </span>
                              )}
                            </div>
                        ) : (
                           <span className="text-xs text-muted-foreground">Sin registro</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <LayoutGrid className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Central de Operaciones</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {estado && estado !== 'todos'
                ? 'No se encontraron órdenes con el filtro seleccionado.'
                : 'Aún no se han generado órdenes de trabajo para este proyecto.'}
            </p>
            <Button asChild>
              <Link href={`/obras/${obraId}/ordenes-trabajo/nueva`}>
                <Plus className="w-4 h-4 mr-2" /> Emitir Primera Orden
              </Link>
            </Button>
          </div>
        )}
      </Card>
      
      <div className="text-center text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest pt-4">
          Sistema de Gestión EDO • V2
      </div>
    </div>
  )
}
