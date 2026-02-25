'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ArrowLeft, User, Mail, Shield, Building2, Trash2 } from 'lucide-react'
import { getObra } from '@/app/actions/obras'
import {
  getUsuariosByObra,
  getUnassignedUsuarios,
  assignUsuarioToObra,
  unassignUsuarioFromObra,
} from '@/app/actions/usuarios-obra'
import type { Obra, Usuario } from '@/types/database'
import { UserPresenceBadge } from '@/components/shared/UserPresenceBadge'

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
      <div className="max-w-[1600px] mx-auto space-y-12 antialiased pb-32 px-8 pt-10">
        {/* Quick Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 premium-card p-8 animate-apple-fade-in font-inter">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight font-display">Equipo del Proyecto</h2>
            <p className="text-sm font-medium text-apple-gray-400">Gestión de integrantes y roles asignados</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/obras/${obraId}/usuarios/vincular`}
              className="h-14 px-8 bg-apple-blue text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-lg active:scale-95 flex items-center gap-3 group"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Vincular Usuario
            </Link>
          </div>
        </div>

        {/* Content */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 font-inter">
          <div className="lg:col-span-12">
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-3xl font-bold flex items-center gap-3 animate-apple-fade-in shadow-sm">
                <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-4 rounded-3xl font-bold flex items-center gap-3 animate-apple-fade-in shadow-sm">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {success}
              </div>
            )}
          </div>

          {/* Assigned Users */}
          <div className="lg:col-span-7 space-y-6">
            <div className="premium-card p-8 relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="px-2 py-4 border-b border-white/5 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-apple-blue/10 border border-apple-blue/20 flex items-center justify-center text-apple-blue shadow-sm">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight font-display">Usuarios en esta Obra</h2>
                    <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">{usuariosAsignados.length} Miembros Activos</p>
                  </div>
                </div>
              </div>

              {usuariosAsignados.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {usuariosAsignados.map((usuario) => (
                    <div key={usuario.id} className="p-6 bg-apple-gray-50/50 dark:bg-white/[0.02] hover:bg-white/[0.05] rounded-[32px] border border-apple-gray-100 dark:border-white/5 transition-all duration-500 flex items-center justify-between group/user shadow-sm hover:shadow-xl hover:border-apple-blue/20">
                      <div className="flex items-center gap-5">
                        <div className="size-14 rounded-full bg-gradient-to-br from-apple-blue to-indigo-600 p-[2px] shadow-lg shadow-apple-blue/10 group-hover/user:scale-105 transition-transform">
                          <div className="w-full h-full rounded-full bg-white dark:bg-black/40 flex items-center justify-center overflow-hidden">
                            <span className="text-foreground dark:text-white font-black text-lg tracking-tighter">
                              {usuario.nombre?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-base font-black text-foreground font-display flex items-center gap-2">
                            {usuario.nombre}
                            <UserPresenceBadge userId={usuario.id} />
                          </div>
                          <div className="text-xs font-medium text-apple-gray-500 flex items-center gap-2">
                            <Mail className="w-3 h-3 text-apple-blue/60" />
                            {usuario.email}
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-apple-blue/10 text-apple-blue border border-apple-blue/20 mt-2">
                            {rolLabels[usuario.rol] || usuario.rol}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnassign(usuario.id)}
                        disabled={processing === usuario.id}
                        className="size-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-90 disabled:opacity-50 shadow-sm"
                      >
                        {processing === usuario.id ? (
                          <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center space-y-4">
                  <div className="size-20 bg-apple-gray-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-apple-gray-100 dark:border-white/5">
                    <User className="w-10 h-10 text-apple-gray-300" />
                  </div>
                  <p className="text-apple-gray-400 font-bold">No hay usuarios asignados a esta obra</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Users */}
          <div className="lg:col-span-5 space-y-6">
            <div className="premium-card p-8 relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="px-2 py-4 border-b border-apple-gray-100 dark:border-white/5 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight font-display">Disponibles</h2>
                    <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Sin Obra Asignada</p>
                  </div>
                </div>
              </div>

              {usuariosDisponibles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {usuariosDisponibles.map((usuario) => (
                    <div key={usuario.id} className="p-6 bg-apple-gray-50/50 dark:bg-white/[0.02] hover:bg-white/[0.05] rounded-[32px] border border-apple-gray-100 dark:border-white/5 transition-all duration-500 flex items-center justify-between group/user shadow-sm hover:shadow-xl hover:border-indigo-500/20">
                      <div className="flex items-center gap-5">
                        <div className="size-12 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 border border-apple-gray-100 dark:border-white/5">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-foreground font-display flex items-center gap-2">
                            {usuario.nombre}
                            <UserPresenceBadge userId={usuario.id} />
                          </div>
                          <div className="text-[10px] font-medium text-apple-gray-500">{usuario.email}</div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-apple-gray-100 dark:bg-white/10 text-apple-gray-500 border border-apple-gray-200 dark:border-white/10 mt-1.5">
                            {rolLabels[usuario.rol] || usuario.rol}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssign(usuario.id)}
                        disabled={processing === usuario.id}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all transform active:scale-95 disabled:opacity-50 shadow-sm"
                      >
                        {processing === usuario.id ? (
                          <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Asignar'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center space-y-4">
                  <div className="size-16 bg-white/5 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <Shield className="w-8 h-8 text-apple-gray-100/20" />
                  </div>
                  <p className="text-apple-gray-400 font-bold max-w-[200px] mx-auto text-sm">No hay usuarios disponibles para asignar</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
