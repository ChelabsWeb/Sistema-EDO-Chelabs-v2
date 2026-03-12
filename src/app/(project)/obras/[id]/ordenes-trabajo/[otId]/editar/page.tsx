import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getOT } from '@/app/actions/ordenes-trabajo'
import { OTCreateForm } from '@/components/edo/ot/ot-create-form'
import { ArrowLeft, Edit3, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
    params: Promise<{ id: string; otId: string }>
}

export default async function OTEditPage({ params }: Props) {
    const { id: obraId, otId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const result = await getOT(otId)
    if (!result.success || !result.data) notFound()

    const ot = result.data

    // Allow editing only in Draft state
    if (ot.estado !== 'borrador') {
        redirect(`/obras/${obraId}/ordenes-trabajo/${otId}`)
    }

    // Fetch rubros and insumos for the selectors
    const { data: rubros } = await supabase
        .from('rubros')
        .select('id, nombre, unidad, presupuesto')
        .eq('obra_id', obraId)
        .is('deleted_at', null)
        .order('nombre')

    const { data: insumosObra } = await supabase
        .from('insumos')
        .select('id, nombre, unidad, tipo, precio_referencia, precio_unitario')
        .eq('obra_id', obraId)
        .is('deleted_at', null)
        .order('nombre')

    return (
        <div className="flex-1 flex flex-col space-y-8 pb-10">
            {/* Header */}
            <nav className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="rounded-full">
                        <Link href={`/obras/${obraId}/ordenes-trabajo/${otId}`}>
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Editor de Documento</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-xs font-semibold text-primary">Modo Borrador</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Editar Orden #{ot.numero}
                        </h1>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl w-full mx-auto">
                <Card className="overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <OTCreateForm
                            obraId={obraId}
                            rubros={rubros || []}
                            insumosObra={(insumosObra as any) || []}
                            initialData={{
                                id: ot.id,
                                rubro_id: ot.rubro_id,
                                descripcion: ot.descripcion || '',
                                insumos_estimados: (ot.insumos_estimados || []).map(ie => ({
                                    insumo_id: ie.insumo_id,
                                    cantidad_estimada: ie.cantidad_estimada,
                                    insumo: {
                                        precio_referencia: ie.precio_estimado / (ie.cantidad_estimada || 1) // Fallback calculation
                                    } as any
                                }))
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
