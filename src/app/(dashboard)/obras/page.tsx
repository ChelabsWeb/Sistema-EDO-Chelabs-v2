import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ObrasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  type ObraRow = { id: string; nombre: string; direccion: string | null; presupuesto_total: number | null; fecha_inicio: string | null; estado: string }

  const { data: obras, error } = await supabase
    .from('obras')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false }) as { data: ObraRow[] | null; error: Error | null }

  const estadoColors: Record<string, string> = {
    activa: 'bg-green-100 text-green-800',
    pausada: 'bg-yellow-100 text-yellow-800',
    finalizada: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Obras</h1>
          <Link
            href="/obras/nueva"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            + Nueva Obra
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            Error al cargar obras: {error.message}
          </div>
        )}

        {obras && obras.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No hay obras</h3>
            <p className="text-gray-500 mt-1">Comenzá creando tu primera obra</p>
            <Link
              href="/obras/nueva"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Crear primera obra
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {obras?.map((obra) => (
              <Link
                key={obra.id}
                href={`/obras/${obra.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{obra.nombre}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${estadoColors[obra.estado]}`}>
                    {obra.estado.charAt(0).toUpperCase() + obra.estado.slice(1)}
                  </span>
                </div>

                {obra.direccion && (
                  <p className="text-sm text-gray-500 mb-3">{obra.direccion}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Presupuesto</span>
                    <p className="font-medium text-gray-900">
                      {obra.presupuesto_total
                        ? `$${Number(obra.presupuesto_total).toLocaleString('es-UY')}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Inicio</span>
                    <p className="font-medium text-gray-900">
                      {obra.fecha_inicio
                        ? new Date(obra.fecha_inicio).toLocaleDateString('es-UY')
                        : '-'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
