import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProjectDocuments } from '@/components/edo/obra/documentos/ProjectDocuments'

interface Props {
    params: Promise<{ id: string }>
}

export default async function DocumentosObraPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // Validate session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user && id !== 'demo-1' && id !== 'demo-2') {
        redirect('/auth/login')
    }

    // Fetch Obra details to get the name
    let obraNombre = 'Obra Demo'
    if (!id.startsWith('demo-')) {
        const { data: obra, error } = await supabase
            .from('obras')
            .select('nombre')
            .eq('id', id)
            .single()

        if (error || !obra) notFound()
        obraNombre = obra.nombre
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 antialiased px-8 pt-10 pb-20">
            <div>
                <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Documentación Técnica</h1>
                <p className="text-sm font-medium text-apple-gray-400 mt-2">
                    Gestión de planos y renders para la obra <span className="font-bold text-foreground">{obraNombre}</span>
                </p>
            </div>

            <ProjectDocuments obraId={id} />
        </div>
    )
}
