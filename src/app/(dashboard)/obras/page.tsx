import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Plus, ChevronRight, MapPin, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default async function ObrasPage() {
  const supabase = await createClient()
  const isDemo = process.env.DEMO_MODE === 'true'

  let user = null
  if (!isDemo) {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser
  }

  type ObraRow = {
    id: string;
    nombre: string;
    direccion: string | null;
    presupuesto_total: number | null;
    fecha_inicio: string | null;
    estado: 'activa' | 'pausada' | 'finalizada'
  }

  let obras: ObraRow[] = []
  let error = null

  if (isDemo) {
    obras = [
      { id: '1', nombre: 'Torres Persea', direccion: 'Luis de la torre 942', presupuesto_total: 5000000, fecha_inicio: '2024-01-15', estado: 'activa' },
      { id: '2', nombre: 'Torre del Valle', direccion: 'Medellín, Colombia', presupuesto_total: 8240000, fecha_inicio: '2023-11-01', estado: 'activa' },
      { id: '3', nombre: 'Horizon Res.', direccion: 'Envigado, Ant.', presupuesto_total: 3120000, fecha_inicio: '2023-06-20', estado: 'activa' },
      { id: '4', nombre: 'Logístico S.J.', direccion: 'Rionegro, Col.', presupuesto_total: 12500000, fecha_inicio: '2023-08-15', estado: 'finalizada' },
    ]
  } else {
    const { data, error: fetchError } = await supabase
      .from('obras')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    obras = (data as ObraRow[]) || []
    error = fetchError
  }

  const getProgress = (id: string, estado: string) => {
    if (estado === 'finalizada') return 100;
    if (id === '1') return 65;
    if (id === '2') return 32;
    if (id === '3') return 88;
    return Math.floor(Math.random() * 60) + 10;
  }

  const getEjecutado = (total: number | null, progress: number) => {
    if (!total) return 0;
    return (total * progress) / 100;
  }

  return (
    <div className="flex-1 flex flex-col space-y-8 h-full">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between py-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Obras</h2>
          <p className="text-muted-foreground mt-1">
            Ecosistema centralizado para la orquestación de recursos y control de ejecución física.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="px-3 py-1">
            Activas: {obras.filter(o => o.estado === 'activa').length}
          </Badge>
          <Button asChild>
            <Link href="/obras/nueva">
              <Plus className="mr-2 h-4 w-4" /> Nueva Obra
            </Link>
          </Button>
        </div>
      </div>

      {/* Global Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">{error.message}</p>
        </div>
      )}

      {/* Obras Grid */}
      {obras.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Building2 className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Vacío Estratégico</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            No hay unidades operativas registradas. Comienza la expansión ahora.
          </p>
          <Button asChild>
            <Link href="/obras/nueva">Crear Obra</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => {
            const progress = getProgress(obra.id, obra.estado);
            const ejecutado = getEjecutado(obra.presupuesto_total, progress);
            const isFinalizada = obra.estado === 'finalizada';

            return (
              <Card key={obra.id} className={cn("flex flex-col transition-all hover:shadow-md", isFinalizada && "opacity-75 grayscale hover:grayscale-0 hover:opacity-100")}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl line-clamp-1">{obra.nombre}</CardTitle>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{obra.direccion}</span>
                    </div>
                  </div>
                  <Badge variant={obra.estado === 'activa' ? 'default' : obra.estado === 'pausada' ? 'secondary' : 'outline'} className="capitalize">
                    {obra.estado}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 mt-4">
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ejecución Física</span>
                        <span className="text-sm font-bold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Financial Boxes */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Certificado</p>
                        <p className="text-sm font-bold truncate">
                          {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(ejecutado)}
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Presupuesto</p>
                        <p className="text-sm font-bold truncate">
                          {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(obra.presupuesto_total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button variant="ghost" className="w-full justify-between" asChild>
                    <Link href={`/obras/${obra.id}`}>
                      <span>Ver Detalles</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">1-{obras.length}</span> de <span className="font-medium text-foreground">{obras.length}</span> obras
        </p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>Anterior</Button>
          <Button variant="outline" size="sm" disabled>Siguiente</Button>
        </div>
      </div>
    </div>
  )
}
