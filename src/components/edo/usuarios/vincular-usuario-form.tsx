'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronsUpDown, Shield, User, Loader2 } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Asignar Nuevo Miembro</CardTitle>
        <CardDescription>Busca un usuario del sistema global y asígnale un rol en esta obra.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selección de Usuario */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-semibold">1. Buscar Usuario</label>
            </div>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] uppercase">
                        {selectedUser.nombre.charAt(0)}
                      </div>
                      <span>{selectedUser.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Buscar por nombre o email...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar usuario..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup>
                      {usuariosDisponibles.map((usuario) => (
                        <CommandItem
                          key={usuario.id}
                          value={`${usuario.nombre} ${usuario.email}`}
                          onSelect={() => {
                            setSelectedUser(usuario)
                            setOpen(false)
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 text-primary",
                              selectedUser?.id === usuario.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-[10px] uppercase flex-shrink-0">
                            {usuario.nombre.charAt(0)}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-sm truncate">{usuario.nombre}</span>
                            <span className="text-xs text-muted-foreground truncate">{usuario.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Asignación de Rol */}
          <div className={cn("space-y-3 transition-opacity duration-300", !selectedUser && "opacity-50 pointer-events-none")}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-semibold">2. Asignar Rol</label>
            </div>

            <Select 
              value={selectedRole} 
              onValueChange={(val) => setSelectedRole(val as UserRole)}
              disabled={!selectedUser}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione el rol..." />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((rol) => (
                  <SelectItem key={rol.value} value={rol.value}>
                    {rol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define los permisos dentro de esta obra.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 border-t pt-6 bg-muted/10 rounded-b-xl mt-6">
        <Link href={`/obras/${obraId}/usuarios`}>
          <Button variant="outline" type="button">Cancelar</Button>
        </Link>
        <Button
          onClick={handleAssign}
          disabled={!selectedUser || !selectedRole || loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Asignando...' : 'Vincular Usuario a Obra'}
        </Button>
      </CardFooter>
    </Card>
  )
}
