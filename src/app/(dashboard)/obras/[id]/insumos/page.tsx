import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPesos } from '@/lib/utils/currency'
import { DeleteInsumoButton } from '@/components/edo/insumo/delete-insumo-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InsumosPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  type ObraRow = { id: string; nombre: string }
  type InsumoRow = {
    id: string
    nombre: string
    unidad: string
    tipo: 'material' | 'mano_de_obra' | null
    precio_referencia: number | null
  }

  const { data: obra, error } = await supabase
    .from('obras')
    .select('id, nombre')
    .eq('id', id)
    .single() as { data: ObraRow | null; error: Error | null }

  if (error || !obra) {
    notFound()
  }

  const { data: insumos } = await supabase
    .from('insumos')
    .select('*')
    .eq('obra_id', id)
    .order('nombre') as { data: InsumoRow[] | null }

  const tipoLabels: Record<string, string> = {
    material: 'Material',
    mano_de_obra: 'Mano de Obra',
  }

  const tipoColors: Record<string, string> = {
    material: 'bg-blue-100 text-blue-800',
    mano_de_obra: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/obras/${id}`} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Catalogo de Insumos</h1>
                <p className="text-sm text-gray-500">{obra.nombre}</p>
              </div>
            </div>
            <Link
              href={`/obras/${id}/insumos/nuevo`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              + Nuevo Insumo
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar insumo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Todos los tipos</option>
              <option value="material">Materiales</option>
              <option value="mano_de_obra">Mano de Obra</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {insumos && insumos.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Referencia
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insumos.map((insumo) => (
                  <tr key={insumo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{insumo.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{insumo.unidad}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          insumo.tipo ? tipoColors[insumo.tipo] : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {insumo.tipo ? tipoLabels[insumo.tipo] : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPesos(insumo.precio_referencia)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/obras/${id}/insumos/${insumo.id}/editar`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </Link>
                      <DeleteInsumoButton insumoId={insumo.id} insumoNombre={insumo.nombre} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No hay insumos</h3>
              <p className="text-gray-500 mt-1">Comenza creando el catalogo de insumos para esta obra</p>
              <Link
                href={`/obras/${id}/insumos/nuevo`}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Crear primer insumo
              </Link>
            </div>
          )}
        </div>

        {/* Summary */}
        {insumos && insumos.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Insumos</div>
              <div className="text-2xl font-bold text-gray-900">{insumos.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Materiales</div>
              <div className="text-2xl font-bold text-blue-600">
                {insumos.filter((i) => i.tipo === 'material').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Mano de Obra</div>
              <div className="text-2xl font-bold text-purple-600">
                {insumos.filter((i) => i.tipo === 'mano_de_obra').length}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
