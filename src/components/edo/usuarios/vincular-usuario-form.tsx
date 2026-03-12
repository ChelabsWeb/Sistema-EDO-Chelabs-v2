'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronsUpDown, Shield, User, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Usuario, UserRole } from '@/types/database'
import { assignUsuarioToObraWithRole } from '@/app/actions/usuarios-obra'

interface Props {
  obraId: string
  usuariosDisponibles: Usuario[]
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'director_obra', label: 'Director de Obra' },
  { value: 'jefe_obra', label: 'Jefe de Obra' },
  { value: 'encargado_stock', label: 'Encargado de Stock' },
  { value: 'compras', label: 'Compras' },
]

export function VincularUsuarioForm({ obraId, usuariosDisponibles }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) return
    
    setLoading(true)
    setError(null)
    
    const result = await assignUsuarioToObraWithRole(selectedUser.id, obraId, selectedRole)
    
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }
    
    router.push(`/obras/${obraId}/usuarios`)
    router.refresh()
  }

  return (
    <div className="space-y-8 animate-apple-fade-in font-inter">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-3xl font-bold flex items-center gap-3 shadow-sm">
          <div className="size-2 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selección de Usuario */}
        <div className="premium-card p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center gap-4 border-b border-apple-gray-100 dark:border-white/5 pb-4">
            <div className="size-12 rounded-2xl bg-apple-blue/10 border border-apple-blue/20 flex items-center justify-center text-apple-blue shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight font-display">1. Buscar Usuario</h3>
              <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Seleccione del sistema global</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-sm font-bold text-apple-gray-500 mb-2 block">Usuario Disponible</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-14 rounded-2xl border-apple-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-apple-gray-50 dark:hover:bg-white/5 text-base shadow-sm"
                >
                  {selectedUser ? (
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold text-xs uppercase">
                        {selectedUser.nombre.charAt(0)}
                      </div>
                      <span className="font-semibold">{selectedUser.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-apple-gray-400">Buscar por nombre o email...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl overflow-hidden border-apple-gray-200 dark:border-white/10 shadow-xl">
                <Command className="bg-white dark:bg-apple-gray-900 w-full">
                  <CommandInput placeholder="Buscar usuario..." className="h-12 border-none ring-0 focus:ring-0" />
                  <CommandList className="max-h-[300px] overflow-y-auto w-full">
                    <CommandEmpty className="py-6 text-center text-sm text-apple-gray-400 font-medium">No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup>
                      {usuariosDisponibles.map((usuario) => (
                        <CommandItem
                          key={usuario.id}
                          value={`${usuario.nombre} ${usuario.email}`}
                          onSelect={() => {
                            setSelectedUser(usuario)
                            setOpen(false)
                          }}
                          className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-apple-gray-50 dark:hover:bg-white/5 w-full"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 text-apple-blue",
                              selectedUser?.id === usuario.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="size-8 rounded-full bg-apple-gray-100 dark:bg-white/5 flex items-center justify-center text-apple-gray-500 font-bold text-xs uppercase flex-shrink-0">
                            {usuario.nombre.charAt(0)}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-sm truncate">{usuario.nombre}</span>
                            <span className="text-xs text-apple-gray-400 truncate">{usuario.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Asignación de Rol */}
        <div className={cn("premium-card p-8 space-y-6 relative overflow-hidden transition-all duration-500", !selectedUser ? 'opacity-50 pointer-events-none grayscale-[50%]' : 'opacity-100')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

          <div className="flex items-center gap-4 border-b border-apple-gray-100 dark:border-white/5 pb-4">
            <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight font-display">2. Asignar Rol</h3>
              <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest">Responsabilidad en la obra</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-sm font-bold text-apple-gray-500 mb-2 block">Rol / Puesto</label>
            <Select 
              value={selectedRole} 
              onValueChange={(val) => setSelectedRole(val as UserRole)}
              disabled={!selectedUser}
            >
              <SelectTrigger className="w-full h-14 rounded-2xl border-apple-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 focus:ring-indigo-500/20 shadow-sm text-base">
                <SelectValue placeholder="Seleccione el rol..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-apple-gray-200 dark:border-white/10">
                {ROLES.map((rol) => (
                  <SelectItem key={rol.value} value={rol.value} className="py-3 font-medium cursor-pointer focus:bg-apple-gray-50 dark:focus:bg-white/5">
                    {rol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs font-medium text-apple-gray-400 mt-3">
              Este rol definirá los permisos y accesos del usuario dentro de esta obra específica.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-apple-gray-100 dark:border-white/5">
        <Link 
          href={`/obras/${obraId}/usuarios`}
          className="h-12 px-8 rounded-full font-bold text-sm bg-apple-gray-100 dark:bg-white/5 text-foreground hover:bg-apple-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center shadow-sm"
        >
          Cancelar
        </Link>
        <button
          onClick={handleAssign}
          disabled={!selectedUser || !selectedRole || loading}
          className="h-12 px-8 bg-apple-blue text-white rounded-full font-black text-sm uppercase tracking-wider hover:bg-apple-blue-dark transition-all shadow-lg active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:pointer-events-none group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Asignando...
            </>
          ) : (
            <>
              Vincular Usuario a Obra
              <Check className="w-5 h-5 transition-transform group-hover:scale-110" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
