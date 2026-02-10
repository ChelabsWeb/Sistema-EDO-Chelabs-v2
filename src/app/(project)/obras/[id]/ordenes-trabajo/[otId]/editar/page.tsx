import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getOT } from '@/app/actions/ordenes-trabajo'
import { OTCreateForm } from '@/components/edo/ot/ot-create-form'
import { ArrowLeft, Edit3 } from 'lucide-react'
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
        <div className="min-h-screen antialiased bg-[#f5f5f7] dark:bg-black p-6 md:p-14 space-y-12">
            {/* Premium Apple Header */}
            <nav className="flex items-center justify-between animate-apple-fade-in mb-8">
                <div className="flex items-center gap-6">
                    <Link
                        href={`/obras/${obraId}/ordenes-trabajo/${otId}`}
                        className="w-12 h-12 glass rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-apple-gray-500 group-hover:text-apple-blue transition-colors" />
                    </Link>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em]">Editor de Documento</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-apple-gray-200" />
                            <span className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest">Modo Borrador</span>
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">
                            Editar Orden #{ot.numero}
                        </h1>
                    </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shadow-inner relative overflow-hidden hidden sm:flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <Edit3 className="w-7 h-7 relative z-10" />
                </div>
            </nav>

            <div className="max-w-7xl mx-auto">
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
            </div>
        </div>
    )
}
