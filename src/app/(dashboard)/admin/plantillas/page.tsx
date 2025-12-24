import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { getPlantillasRubros } from '@/app/actions/plantillas'

export default async function PlantillasPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check role - only admin and director_obra can access
  const { data: currentProfile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    redirect('/dashboard?error=no_autorizado')
  }

  // Get plantillas
  const plantillasResult = await getPlantillasRubros()
  const plantillas = plantillasResult.success ? plantillasResult.data || [] : []

  // Separate system and personal templates
  const plantillasSistema = plantillas.filter(p => p.es_sistema)
  const plantillasPersonales = plantillas.filter(p => !p.es_sistema)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas de Rubros</h1>
          <p className="text-gray-600 mt-1">
            Plantillas predefinidas con insumos para crear rubros rapidamente
          </p>
        </div>
        {currentProfile.rol === 'admin' && (
          <Link
            href="/admin/plantillas/nueva"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nueva Plantilla
          </Link>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Como usar las plantillas</h4>
            <p className="text-sm text-blue-700 mt-1">
              Al crear un nuevo rubro en una obra, podras seleccionar una plantilla para pre-cargar los insumos.
              Los insumos se copian al catalogo de la obra y quedan disponibles para usar en las OTs.
            </p>
          </div>
        </div>
      </div>

      {/* System Templates */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Plantillas del Sistema ({plantillasSistema.length})
        </h2>

        {plantillasSistema.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No hay plantillas del sistema disponibles</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plantillasSistema.map((plantilla) => (
              <div
                key={plantilla.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{plantilla.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Unidad: {plantilla.unidad}
                    </p>
                    {plantilla.descripcion && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {plantilla.descripcion}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    Sistema
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {plantilla.insumos?.length || 0} insumos
                  </span>
                  <Link
                    href={`/admin/plantillas/${plantilla.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Templates */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Mis Plantillas ({plantillasPersonales.length})
        </h2>

        {plantillasPersonales.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">No tenes plantillas personales</p>
            <p className="text-sm text-gray-400 mt-1">
              Podes crear plantillas desde rubros existentes en tus obras
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plantillasPersonales.map((plantilla) => (
              <div
                key={plantilla.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{plantilla.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Unidad: {plantilla.unidad}
                    </p>
                    {plantilla.descripcion && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {plantilla.descripcion}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Personal
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {plantilla.insumos?.length || 0} insumos
                  </span>
                  <Link
                    href={`/admin/plantillas/${plantilla.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
