'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getObra } from '@/app/actions/obras'
import {
  getUsuariosByObra,
  getUnassignedUsuarios,
  assignUsuarioToObra,
  unassignUsuarioFromObra,
} from '@/app/actions/usuarios-obra'
import type { Obra, Usuario } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

const rolLabels: Record<string, string> = {
  admin: 'Administrador',
  director_obra: 'Director de Obra',
  jefe_obra: 'Jefe de Obra',
  compras: 'Compras',
}

export default function UsuariosObraPage({ params }: Props) {
  const [obraId, setObraId] = useState<string | null>(null)
  const [obra, setObra] = useState<Obra | null>(null)
  const [usuariosAsignados, setUsuariosAsignados] = useState<Usuario[]>([])
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params
      setObraId(resolvedParams.id)

      // Load obra
      const obraResult = await getObra(resolvedParams.id)
      if (!obraResult.success) {
        setError('Obra no encontrada')
        setLoading(false)
        return
      }
      setObra(obraResult.data)

      // Load assigned users
      const asignadosResult = await getUsuariosByObra(resolvedParams.id)
      if (asignadosResult.success) {
        setUsuariosAsignados(asignadosResult.data)
      }

      // Load available users
      const disponiblesResult = await getUnassignedUsuarios()
      if (disponiblesResult.success) {
        setUsuariosDisponibles(disponiblesResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [params])

  const handleAssign = async (usuarioId: string) => {
    if (!obraId) return
    setProcessing(usuarioId)
    setError(null)
    setSuccess(null)

    const result = await assignUsuarioToObra(usuarioId, obraId)

    if (!result.success) {
      setError(result.error)
      setProcessing(null)
      return
    }

    // Move user from disponibles to asignados
    const usuario = usuariosDisponibles.find((u) => u.id === usuarioId)
    if (usuario) {
      setUsuariosAsignados([...usuariosAsignados, { ...usuario, obra_id: obraId }])
      setUsuariosDisponibles(usuariosDisponibles.filter((u) => u.id !== usuarioId))
    }

    setSuccess('Usuario asignado correctamente')
    setProcessing(null)
  }

  const handleUnassign = async (usuarioId: string) => {
    if (!confirm('¿Desasignar este usuario de la obra?')) return

    setProcessing(usuarioId)
    setError(null)
    setSuccess(null)

    const result = await unassignUsuarioFromObra(usuarioId)

    if (!result.success) {
      setError(result.error)
      setProcessing(null)
      return
    }

    // Move user from asignados to disponibles
    const usuario = usuariosAsignados.find((u) => u.id === usuarioId)
    if (usuario) {
      setUsuariosDisponibles([...usuariosDisponibles, { ...usuario, obra_id: null }])
      setUsuariosAsignados(usuariosAsignados.filter((u) => u.id !== usuarioId))
    }

    setSuccess('Usuario desasignado correctamente')
    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/obras/${obraId}`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Usuarios Asignados</h1>
              <p className="text-sm text-gray-500">{obra?.nombre}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Assigned Users */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuarios en esta Obra ({usuariosAsignados.length})
            </h2>
          </div>

          {usuariosAsignados.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {usuariosAsignados.map((usuario) => (
                <li key={usuario.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                    <div className="text-sm text-gray-500">{usuario.email}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {rolLabels[usuario.rol] || usuario.rol}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnassign(usuario.id)}
                    disabled={processing === usuario.id}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {processing === usuario.id ? 'Procesando...' : 'Desasignar'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No hay usuarios asignados a esta obra
            </div>
          )}
        </div>

        {/* Available Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuarios Disponibles ({usuariosDisponibles.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Usuarios sin obra asignada que pueden ser agregados
            </p>
          </div>

          {usuariosDisponibles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {usuariosDisponibles.map((usuario) => (
                <li key={usuario.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                    <div className="text-sm text-gray-500">{usuario.email}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                      {rolLabels[usuario.rol] || usuario.rol}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAssign(usuario.id)}
                    disabled={processing === usuario.id}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {processing === usuario.id ? 'Asignando...' : 'Asignar a esta obra'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No hay usuarios disponibles para asignar.
              <br />
              <span className="text-sm">
                Los usuarios deben ser creados primero y no estar asignados a otra obra.
              </span>
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="mt-6">
          <Link href={`/obras/${obraId}`} className="text-blue-600 hover:text-blue-800">
            Volver a la obra
          </Link>
        </div>
      </main>
    </div>
  )
}
