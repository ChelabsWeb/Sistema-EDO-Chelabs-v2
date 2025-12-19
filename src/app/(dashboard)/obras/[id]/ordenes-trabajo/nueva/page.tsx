import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { OTCreateForm } from '@/components/edo/ot/ot-create-form'

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

  // Check if there are rubros available
  if (!rubros || rubros.length === 0) {
    return (
      <div className="min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href={`/obras/${obraId}/ordenes-trabajo`} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
                <p className="text-sm text-gray-500">{obra.nombre}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay rubros definidos</h3>
            <p className="mt-2 text-gray-500">
              Debe crear al menos un rubro antes de crear órdenes de trabajo.
            </p>
            <div className="mt-6">
              <Link
                href={`/obras/${obraId}/rubros/nuevo`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Crear Rubro
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/obras/${obraId}/ordenes-trabajo`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
              <p className="text-sm text-gray-500">{obra.nombre}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Datos de la OT</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete los datos para crear una nueva orden de trabajo en estado borrador.
            </p>
          </div>
          <div className="p-6">
            <OTCreateForm obraId={obraId} rubros={rubros} />
          </div>
        </div>
      </main>
    </div>
  )
}
