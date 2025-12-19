import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditarUsuarioForm } from './EditarUsuarioForm'
import type { Usuario, UserRole } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarUsuarioPage({ params }: PageProps) {
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
    .select('rol')
    .eq('auth_user_id', user.id)
    .single() as { data: { rol: UserRole } | null }

  if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
    redirect('/dashboard?error=no_autorizado')
  }

  // Get user to edit
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !usuario) {
    notFound()
  }

  // Get obras for dropdown
  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre')
    .order('nombre')

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
        <p className="text-gray-600 mt-1">
          Modificar información de {(usuario as Usuario).nombre}
        </p>
      </div>

      <EditarUsuarioForm usuario={usuario as Usuario} obras={obras || []} />
    </div>
  )
}
