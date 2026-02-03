'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateUsuario, deactivateUsuario } from '@/app/actions/usuarios'
import type { Usuario, UserRole } from '@/types/database'
import {
  ArrowLeft, User, Shield, Building2, Mail,
  CheckCircle2, XCircle, Trash2, Save, Loader2,
  AlertCircle, ChevronRight, Lock, Key
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Obra {
  id: string
  nombre: string
}

interface Props {
  usuario: Usuario
  obras: Obra[]
}

const roles: { value: UserRole; label: string; icon: any; color: string }[] = [
  { value: 'admin', label: 'Administrador', icon: Shield, color: 'text-indigo-500' },
  { value: 'director_obra', label: 'Director de Obra (DO)', icon: Building2, color: 'text-blue-500' },
  { value: 'jefe_obra', label: 'Jefe de Obra (JO)', icon: User, color: 'text-emerald-500' },
  { value: 'compras', label: 'Gerencia Compras', icon: Lock, color: 'text-amber-500' },
]

export function EditarUsuarioForm({ usuario, obras }: Props) {
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

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 overflow-hidden relative">
        {/* Accent Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="p-10 md:p-16 space-y-16 relative z-10">
          {/* Identity Header */}
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-apple-blue to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-500">
              <span className="text-white font-black text-4xl tracking-tighter uppercase leading-none pt-1">
                {usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">{usuario.nombre}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-apple-gray-300 uppercase tracking-widest">
                  <Mail className="w-4 h-4 text-apple-blue" />
                  {usuario.email}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-apple-gray-100" />
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                  usuario.activo ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-apple-gray-50 text-apple-gray-400 border-apple-gray-100 dark:bg-apple-gray-50/50 dark:border-white/5"
                )}>
                  {usuario.activo ? 'Cuenta Activa' : 'Cuenta Suspendida'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="pt-10 border-t border-apple-gray-100 dark:border-white/5 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Nombre Input */}
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
                  defaultValue={usuario.nombre}
                  className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none"
                />
              </div>

              {/* Rol Selection (Segmented Control style UI) */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <Shield className="w-4 h-4 text-apple-blue" />
                  <label htmlFor="rol" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Nivel de Acceso</label>
                </div>
                <select
                  id="rol"
                  name="rol"
                  required
                  defaultValue={usuario.rol}
                  className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none appearance-none"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Obra Assignment */}
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-apple-blue" />
                    <label htmlFor="obra_id" className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Obra Designada</label>
                  </div>
                  <span className="text-[9px] font-black text-apple-gray-300 uppercase tracking-widest italic">(Opcional)</span>
                </div>
                <select
                  id="obra_id"
                  name="obra_id"
                  defaultValue={usuario.obra_id || ''}
                  className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none appearance-none"
                >
                  <option value="">Global / Sin asignar</option>
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Status Switch */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <Key className="w-4 h-4 text-apple-blue" />
                  <label className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Estado Operativo</label>
                </div>
                <label className="flex items-center gap-6 p-1.5 px-4 bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-all h-16">
                  <input
                    type="checkbox"
                    name="activo"
                    value="true"
                    defaultChecked={usuario.activo ?? true}
                    className="w-6 h-6 rounded-lg text-apple-blue border-apple-gray-200 focus:ring-apple-blue/20 transition-all"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground uppercase tracking-tight">Cuenta Habilitada</span>
                    <span className="text-[9px] font-bold text-apple-gray-300 uppercase tracking-[0.2em]">Permite login y operaciones</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Error / Success feedback */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-8 rounded-[32px] border flex items-center gap-6 shadow-apple-sm",
                  error ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                    : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                )}
              >
                {error ? <AlertCircle className="w-8 h-8 shrink-0" /> : <CheckCircle2 className="w-8 h-8 shrink-0" />}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest">{error ? 'Se detectó un problema' : 'Operación exitosa'}</h4>
                  <p className="text-sm font-medium opacity-80">{error || 'Los datos han sido actualizados en la base maestra'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Bar Footer */}
        <footer className="px-10 py-10 bg-apple-gray-50/50 dark:bg-black/10 border-t border-apple-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
          <button
            type="button"
            onClick={() => setShowDeactivateConfirm(true)}
            className="px-8 py-3 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Desactivar Cuenta
          </button>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <Link href="/admin/usuarios" className="flex-1 md:flex-none px-6 py-3 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest hover:text-foreground transition-all">Cancelar</Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] md:flex-none h-18 px-12 py-5 bg-apple-blue text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.96] flex items-center justify-center gap-3 disabled:opacity-30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Perfil
                </>
              )}
            </button>
          </div>
        </footer>
      </form>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showDeactivateConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowDeactivateConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-apple-gray-50 w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden border border-apple-gray-100 dark:border-white/10"
            >
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic mb-2">¿Confirmar Suspensión?</h3>
                  <p className="text-sm font-medium text-apple-gray-400 leading-relaxed">
                    Estás a punto de desactivar a <span className="text-foreground font-black">{usuario.nombre}</span>. El acceso al sistema será revocado inmediatamente.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDeactivate}
                    disabled={loading}
                    className="w-full h-16 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg"
                  >
                    {loading ? 'Procesando...' : 'Desactivar Permanentemente'}
                  </button>
                  <button
                    onClick={() => setShowDeactivateConfirm(false)}
                    className="w-full h-16 bg-apple-gray-50 dark:bg-white/5 text-apple-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-foreground transition-all"
                  >
                    Mejor no
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
