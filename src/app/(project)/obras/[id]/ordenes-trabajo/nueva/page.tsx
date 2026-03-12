import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { OTCreateForm } from '@/components/edo/ot/ot-create-form'
import { ArrowLeft, Hammer, Info, LayoutGrid, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  params: Promise<{ id: string }>
}

export default async function NuevaOTPage({ params }: Props) {
  const { id: obraId } = await params
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

  // Get rubros for this obra
  const { data: rubros } = await supabase
    .from('rubros')
    .select('id, nombre, unidad, presupuesto')
    .eq('obra_id', obraId)
    .order('nombre')

  // Get insumos for this obra
  const { data: insumosObra } = await supabase
    .from('insumos')
    .select('id, nombre, unidad, tipo, precio_referencia, precio_unitario')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('nombre')

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
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gestión de Obra</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Nueva Orden de Trabajo
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
          <LayoutGrid className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">{obra.nombre}</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto">
        {(!rubros || rubros.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 rounded-xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <Hammer className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">No hay rubros de base</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm">
              Necesitas definir al menos un rubro en esta obra para poder asignar órdenes de trabajo.
            </p>
            <Button asChild>
              <Link href={`/obras/${obraId}/rubros/nuevo`}>
                Crear primer rubro
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-tight">Configuración de Tarea</h2>
              <p className="text-sm text-muted-foreground">Define el alcance, selecciona los recursos y monitorea el presupuesto.</p>
            </div>

            <Card className="overflow-hidden">
               <CardContent className="p-6 md:p-8">
                 <OTCreateForm
                   obraId={obraId}
                   rubros={rubros}
                   insumosObra={(insumosObra || []) as any}
                 />
               </CardContent>
            </Card>

            {/* Hint Box */}
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/50 rounded-xl border text-sm">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="text-muted-foreground font-medium">
                La Orden se creará en estado <span className="font-bold text-foreground">Borrador</span>. Deberá ser aprobada antes de iniciar el consumo.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
