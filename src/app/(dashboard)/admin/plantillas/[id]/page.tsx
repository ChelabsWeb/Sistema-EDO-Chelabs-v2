import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { getPlantillaWithDetails } from '@/app/actions/plantillas'
import { formatPesos } from '@/lib/utils/currency'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlantillaDetailPage({ params }: PageProps) {
  const { id } = await params
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
    .select('rol, id')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole; id: string } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    redirect('/dashboard?error=no_autorizado')
  }

  // Get plantilla details
  const plantillaResult = await getPlantillaWithDetails(id)

  if (!plantillaResult.success || !plantillaResult.data) {
    notFound()
  }

  const plantilla = plantillaResult.data
  const canEdit = currentProfile.rol === 'admin' ||
    (!plantilla.es_sistema && plantilla.created_by === currentProfile.id)

  // Group insumos by type
  const materiales = plantilla.insumos?.filter(i => i.tipo === 'material') || []
  const manoDeObra = plantilla.insumos?.filter(i => i.tipo === 'mano_de_obra') || []

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/admin/plantillas" className="hover:text-gray-700">
              Plantillas
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{plantilla.nombre}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{plantilla.nombre}</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                plantilla.es_sistema
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {plantilla.es_sistema ? 'Sistema' : 'Personal'}
              </span>
            </div>
            <p className="text-gray-600 mt-2">Unidad: {plantilla.unidad}</p>
            {plantilla.descripcion && (
              <p className="text-gray-600 mt-2">{plantilla.descripcion}</p>
            )}
            {plantilla.creador && (
              <p className="text-sm text-gray-500 mt-2">
                Creada por: {plantilla.creador.nombre}
              </p>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Link
                href={`/admin/plantillas/${plantilla.id}/editar`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {plantilla.insumos?.length || 0}
          </div>
          <div className="text-sm text-gray-500">Insumos Totales</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {materiales.length}
          </div>
          <div className="text-sm text-gray-500">Materiales</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {manoDeObra.length}
          </div>
          <div className="text-sm text-gray-500">Mano de Obra</div>
        </div>
      </div>

      {/* Insumos List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Insumos de la Plantilla
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Estos insumos se copiaran al catalogo de la obra al usar esta plantilla
          </p>
        </div>

        {(!plantilla.insumos || plantilla.insumos.length === 0) ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Esta plantilla no tiene insumos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Materials Section */}
            {materiales.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Materiales ({materiales.length})
                </h3>
                <div className="space-y-2">
                  {materiales.map((insumo) => (
                    <div
                      key={insumo.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {insumo.nombre}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({insumo.unidad})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {insumo.precio_referencia
                          ? formatPesos(insumo.precio_referencia)
                          : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Labor Section */}
            {manoDeObra.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Mano de Obra ({manoDeObra.length})
                </h3>
                <div className="space-y-2">
                  {manoDeObra.map((insumo) => (
                    <div
                      key={insumo.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {insumo.nombre}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({insumo.unidad})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {insumo.precio_referencia
                          ? formatPesos(insumo.precio_referencia)
                          : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link
          href="/admin/plantillas"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Plantillas
        </Link>
      </div>
    </div>
  )
}
