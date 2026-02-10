import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NuevoUsuarioForm } from './NuevoUsuarioForm'
import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { ArrowLeft, UserPlus, Shield, Sparkles } from 'lucide-react'

export default async function NuevoUsuarioPage() {
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

  // Get obras for dropdown
  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre')
    .eq('estado', 'activa')
    .order('nombre')

  return (
    <div className="min-h-screen bg-apple-gray-50/20 dark:bg-black/20 p-6 md:p-14 antialiased">
      {/* Premium Header Container */}
      <header className="max-w-4xl mx-auto pt-16 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10 animate-apple-fade-in">
        <div className="flex items-start gap-8">
          <Link
            href="/admin/usuarios"
            className="w-14 h-14 rounded-full bg-apple-gray-100 dark:bg-white/5 border border-apple-gray-200 dark:border-white/10 flex items-center justify-center text-apple-gray-400 hover:text-apple-blue hover:scale-110 active:scale-95 transition-all shadow-xl mt-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-apple-blue fill-apple-blue" />
                <span className="text-[10px] font-black text-apple-blue uppercase tracking-widest">Seguridad de Acceso</span>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[0.9]">
                Nuevo Acceso<span className="text-apple-blue">.</span>
              </h1>
              <p className="text-lg text-apple-gray-400 font-medium tracking-tight max-w-xl leading-relaxed">
                Registra un nuevo colaborador y define sus niveles de autoridad dentro del ecosistema operativo.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto animate-apple-slide-up">
        <NuevoUsuarioForm obras={obras || []} />
      </main>

      <div className="mt-16 text-center text-[10px] font-black text-apple-gray-100 uppercase tracking-[0.5em] animate-apple-fade-in">
        Sistema de Gestión EDO • Seguridad de Datos Nivel 4
      </div>
    </div>
  )
}
