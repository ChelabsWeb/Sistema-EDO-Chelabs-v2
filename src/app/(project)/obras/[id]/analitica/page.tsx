import { Suspense } from 'react'
import { getObra } from '@/app/actions/obras'
import { getDeviationsByRubro } from '@/app/actions/costos'
import { AnaliticaClient } from './analitica-client'
import { notFound } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default async function ProjectAnaliticaPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [obra, deviations] = await Promise.all([
        getObra(id),
        getDeviationsByRubro(id)
    ])

    if (!obra) notFound()

    const deviationsData = deviations.success ? (deviations.data || []) : []

    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-apple-blue" />
            </div>
        }>
            <AnaliticaClient
                id={id}
                obra={obra}
                deviations={deviationsData}
            />
        </Suspense>
    )
}
