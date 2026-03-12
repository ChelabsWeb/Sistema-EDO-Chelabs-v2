'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, User, Mail, Shield, Building2, Trash2, Loader2 } from 'lucide-react'
import { getObra } from '@/app/actions/obras'
import {
  getUsuariosByObra,
  getUnassignedUsuarios,
  assignUsuarioToObra,
  unassignUsuarioFromObra,
} from '@/app/actions/usuarios-obra'
import type { Obra, Usuario } from '@/types/database'
import { UserPresenceBadge } from '@/components/shared/UserPresenceBadge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipo del Proyecto</h2>
          <p className="text-muted-foreground">Gestión de integrantes y roles asignados a la obra.</p>
        </div>
        <Link href={`/obras/${obraId}/usuarios/vincular`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Vincular Usuario
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-4 py-3 rounded-lg text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios Asignados */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Usuarios en esta Obra
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {usuariosAsignados.length} miembros activos
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {usuariosAsignados.length > 0 ? (
              <div className="space-y-4">
                {usuariosAsignados.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {usuario.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {usuario.nombre}
                          <UserPresenceBadge userId={usuario.id} />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {usuario.email}
                        </div>
                        <Badge variant="secondary" className="mt-2 text-[10px] uppercase font-semibold">
                          {rolLabels[usuario.rol] || usuario.rol}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnassign(usuario.id)}
                      disabled={processing === usuario.id}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {processing === usuario.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No hay usuarios asignados a esta obra</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usuarios Disponibles */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                Usuarios Disponibles
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sin obra asignada en el sistema
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {usuariosDisponibles.length > 0 ? (
              <div className="space-y-4">
                {usuariosDisponibles.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {usuario.nombre}
                          <UserPresenceBadge userId={usuario.id} />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {usuario.email}
                        </div>
                        <Badge variant="outline" className="mt-2 text-[10px] uppercase font-semibold">
                          {rolLabels[usuario.rol] || usuario.rol}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAssign(usuario.id)}
                      disabled={processing === usuario.id}
                    >
                      {processing === usuario.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Asignar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No hay usuarios disponibles para asignar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
