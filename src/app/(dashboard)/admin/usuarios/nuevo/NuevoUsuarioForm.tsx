'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUsuario } from '@/app/actions/usuarios'
import type { UserRole } from '@/types/database'
import {
  UserPlus, Mail, User, Shield, Building2,
  ArrowLeft, Save, Loader2, AlertCircle,
  CheckCircle2, Sparkles, Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Obra {
  id: string
  nombre: string
}

interface NuevoUsuarioFormProps {
  obras: Obra[]
}

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: 'director_obra', label: 'Director de Obra (DO)', desc: 'Gestión estratégica, presupuestos y control de personal.' },
  { value: 'jefe_obra', label: 'Jefe de Obra (JO)', desc: 'Ejecución en campo, gestión de OTs y reporte de consumos.' },
  { value: 'compras', label: 'Gerencia Compras', desc: 'Suministros, proveedores y logística de materiales.' },
]

export function NuevoUsuarioForm({ obras }: NuevoUsuarioFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createUsuario(formData)

    if (!result.success) {
      setError(result.error || 'Error al crear usuario')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/admin/usuarios')
    }, 2500)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-16 text-center shadow-apple-float border border-apple-gray-100 dark:border-white/5 space-y-8"
      >
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
          <Send className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">Invitación Enviada</h3>
          <p className="text-xl text-apple-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
            Hemos enviado un correo de configuración a la casilla de correo provista.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-500/10 py-3 px-6 rounded-2xl w-fit mx-auto">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest pt-0.5">Usuario Registrado</span>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 overflow-hidden relative">
      {/* Accent Decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-apple-blue/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />

      <div className="p-10 md:p-16 space-y-12 relative z-10">

        {/* Core Info Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-b border-apple-gray-50 dark:border-white/5 pb-8">
            <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue shadow-sm">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Registro de Cuenta</h3>
              <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Credenciales y acceso básico</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <Mail className="w-4 h-4 text-apple-blue" />
                <label htmlFor="email" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Dirección de Email</label>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="ejemplo@chelabs.com"
                className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <User className="w-4 h-4 text-apple-blue" />
                <label htmlFor="nombre" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Nombre Completo</label>
              </div>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                placeholder="Nombre y Apellido"
                className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Role & Scope Section */}
        <div className="space-y-10 pt-10 border-t border-apple-gray-50 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">Permisos y Alcance</h3>
              <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Definición de rol en el sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <label htmlFor="rol" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Asignar Rol</label>
              </div>
              <select
                id="rol"
                name="rol"
                required
                className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none appearance-none"
              >
                <option value="">Seleccionar nivel...</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <div className="px-4 py-3 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-xl border border-apple-blue/10">
                <p className="text-[10px] font-bold text-apple-blue uppercase leading-relaxed tracking-wider">
                  Selecciona un rol para definir qué partes del sistema podrá operar el usuario.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <Building2 className="w-4 h-4 text-apple-blue" />
                <label htmlFor="obra_id" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Obra Designada</label>
              </div>
              <select
                id="obra_id"
                name="obra_id"
                className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none appearance-none"
              >
                <option value="">Global / Sin asignar</option>
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nombre}
                  </option>
                ))}
              </select>
              <p className="px-4 text-[10px] font-bold text-apple-gray-300 uppercase tracking-widest">
                Obligatorio para Jefes de Obra.
              </p>
            </div>
          </div>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-black uppercase tracking-tight">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <footer className="px-10 py-10 bg-apple-gray-50/50 dark:bg-black/10 border-t border-apple-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-apple-blue" />
          </div>
          <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
            El alta de usuario requiere validación por correo electrónico.
          </p>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <Link href="/admin/usuarios" className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest hover:text-foreground transition-all">Cancelar</Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] md:flex-none h-18 px-12 py-5 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.96] flex items-center justify-center gap-4 disabled:opacity-30"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                Registrar Usuario
                <Save className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </footer>
    </form>
  )
}
