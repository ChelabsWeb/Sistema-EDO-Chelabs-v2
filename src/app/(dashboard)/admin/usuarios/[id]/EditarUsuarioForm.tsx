'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateUsuario, deactivateUsuario } from '@/app/actions/usuarios'
import type { Usuario, UserRole } from '@/types/database'

interface Obra {
  id: string
  nombre: string
}

interface EditarUsuarioFormProps {
  usuario: Usuario
  obras: Obra[]
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'director_obra', label: 'Director de Obra (DO)' },
  { value: 'jefe_obra', label: 'Jefe de Obra (JO)' },
  { value: 'compras', label: 'Compras' },
]

export function EditarUsuarioForm({ usuario, obras }: EditarUsuarioFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateUsuario(usuario.id, formData)

    if (!result.success) {
      setError(result.error || 'Error al actualizar usuario')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/admin/usuarios')
    }, 1500)
  }

  const handleDeactivate = async () => {
    setLoading(true)
    const result = await deactivateUsuario(usuario.id)

    if (!result.success) {
      setError(result.error || 'Error al desactivar usuario')
      setLoading(false)
      return
    }

    router.push('/admin/usuarios')
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-green-800">
          Usuario actualizado correctamente
        </h3>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={usuario.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              El email no se puede modificar.
            </p>
          </div>

          {/* Nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              defaultValue={usuario.nombre}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Rol */}
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rol *
            </label>
            <select
              id="rol"
              name="rol"
              required
              defaultValue={usuario.rol}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Obra */}
          <div>
            <label
              htmlFor="obra_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Obra asignada
            </label>
            <select
              id="obra_id"
              name="obra_id"
              defaultValue={usuario.obra_id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sin asignar</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Activo */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="activo"
                value="true"
                defaultChecked={usuario.activo ?? true}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Usuario activo
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500 ml-7">
              Los usuarios inactivos no pueden iniciar sesión.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-between rounded-b-lg">
          <button
            type="button"
            onClick={() => setShowDeactivateConfirm(true)}
            className="px-4 py-2 text-red-600 font-medium rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
          >
            Desactivar usuario
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/admin/usuarios"
              className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Desactivar usuario
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que querés desactivar a {usuario.nombre}? El
              usuario no podrá iniciar sesión hasta que sea reactivado.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
