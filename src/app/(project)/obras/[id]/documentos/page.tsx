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
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Documentación Técnica</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Gestión de planos y renders para la obra <span className="font-semibold text-foreground">{obraNombre}</span>
                </p>
            </div>

            <ProjectDocuments obraId={id} />
        </div>
    )
}
