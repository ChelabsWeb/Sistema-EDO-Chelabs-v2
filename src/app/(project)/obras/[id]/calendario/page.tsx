import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GanttChart } from '@/components/edo/obra/calendario/GanttChart'

interface Props {
    params: Promise<{ id: string }>
}

export default async function CalendarioObraPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // Validate session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !id.startsWith('demo-')) {
        redirect('/auth/login')
    }

    // Fetch Obra details to get the name
    let obraNombre = 'Obra Demo'
    let ots = []

    if (id.startsWith('demo-')) {
        // Fake data for demo
        ots = [
            { id: '1', numero: 1, descripcion: 'Zanjas y fundaciones', estado: 'cerrada', fecha_inicio: new Date().toISOString(), fecha_fin: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: '2', numero: 2, descripcion: 'Paredes Planta Baja', estado: 'en_ejecucion', fecha_inicio: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), fecha_fin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), tareas: [{ completada: true }, { completada: false }] },
            { id: '3', numero: 3, descripcion: 'Techo y chapa', estado: 'aprobada', fecha_inicio: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), fecha_fin: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString() },
            { id: '4', numero: 4, descripcion: 'Muros interiores', estado: 'borrador', fecha_inicio: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(), fecha_fin: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString() },
        ]
    } else {
        // Fetch real data
        const { data: obra, error: obraError } = await supabase
            .from('obras')
            .select('nombre')
            .eq('id', id)
            .single()

        if (obraError || !obra) notFound()
        obraNombre = obra.nombre

        const { data: otRows } = await supabase
            .from('ordenes_trabajo')
            .select(`
        id, numero, descripcion, estado, fecha_inicio, fecha_fin,
        tareas (
          completada
        )
      `)
            .eq('obra_id', id)
            .is('deleted_at', null)
            .order('fecha_inicio', { ascending: true })

        ots = otRows || []
    }

    return (
        <div className="max-w-[1700px] mx-auto space-y-8 antialiased px-4 sm:px-8 pt-10 pb-20">
            <div className="px-2">
                <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Planificación Temporal</h1>
                <p className="text-sm font-medium text-apple-gray-400 mt-2">
                    Línea de tiempo interactiva de la obra <span className="font-bold text-foreground">{obraNombre}</span>
                </p>
            </div>

            <GanttChart initialOts={ots} />
        </div>
    )
}
