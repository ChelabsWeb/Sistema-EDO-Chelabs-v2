import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditarUsuarioForm } from './EditarUsuarioForm'
import Link from 'next/link'
import type { Usuario, UserRole } from '@/types/database'
import { ArrowLeft, User, Shield, Sparkles } from 'lucide-react'

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
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 antialiased">
      {/* Premium Header Container */}
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-16 animate-apple-fade-in text-left">
        <div className="flex items-center gap-6">
          <Link
            href="/admin/usuarios"
            className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue transition-colors" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-apple-blue" />
              <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em]">Administración de Usuarios</p>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Configuración de Perfil</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10 shadow-apple-sm">
          <Sparkles className="w-4 h-4 text-apple-blue" />
          <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest leading-none pt-0.5">Control de Accesos</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto animate-apple-slide-up">
        <EditarUsuarioForm usuario={usuario as Usuario} obras={obras || []} />
      </main>

      <div className="mt-16 text-center text-[10px] font-black text-apple-gray-100 uppercase tracking-[0.5em] animate-apple-fade-in">
        Sistema de Gestión EDO • Seguridad de Datos Nivel 4
      </div>
    </div>
  )
}
