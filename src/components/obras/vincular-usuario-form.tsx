"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"

// --------------------------------------------------------------------------------
// MOCK DATA: (A ser reemplazado por la data real/queries en tu Backend)
// --------------------------------------------------------------------------------
type UsuarioMin = {
  id: string
  nombre: string
  email: string
  avatar?: string
}

const MOCK_USUARIOS: UsuarioMin[] = [
  { id: "usr_1", nombre: "Carlos Silva", email: "carlos.silva@chelabs.com" },
  { id: "usr_2", nombre: "María Gómez", email: "maria.gomez@chelabs.com" },
  { id: "usr_3", nombre: "José Pérez", email: "jperez@constructora.com" },
  { id: "usr_4", nombre: "Laura Torres", email: "ltorres@arq.uy" },
]

const ROLES_OBRA = [
  { id: "jefe_obra", nombre: "Jefe de Obra", desc: "Supervisión total y estratégica" },
  { id: "arquitecto", nombre: "Arquitecto", desc: "Planificación comercial y diseño" },
  { id: "residente", nombre: "Residente", desc: "Administración técnica continua" },
  { id: "capataz", nombre: "Capataz", desc: "Coordinación en terreno" },
  { id: "peon", nombre: "Peón", desc: "Mano de obra general" },
]

// --------------------------------------------------------------------------------
// COMPONENTE PRINCIPAL (CLIENTE)
// --------------------------------------------------------------------------------
interface VincularUsuarioFormProps {
  obraId: string
}

export function VincularUsuarioForm({ obraId }: VincularUsuarioFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Estados para Combobox (Usuario)
  const [openUser, setOpenUser] = useState(false)
  const [userId, setUserId] = useState<string>("")
  
  // Estado para Select (Rol)
  const [rolId, setRolId] = useState<string>("")

  const selectedUser = MOCK_USUARIOS.find((u) => u.id === userId)

  const handleVincular = () => {
    if (!userId || !rolId) {
      toast.error("Datos incompletos", {
        description: "Por favor, selecciona un usuario y un rol para continuar.",
      })
      return
    }

    // Iniciar transición de enrutamiento al mutar para no bloquear el Next App Router principal
    startTransition(async () => {
      try {
        // [AQUÍ IRÍA LA POST REQUEST A TU API O SERVER ACTION DE BD]
        // await vincularUsuarioAObra(obraId, userId, rolId)
        
        // Timeout simulando la latencia de tu DB (remover en producción)
        await new Promise((resolve) => setTimeout(resolve, 800))
        
        toast.success("Usuario Vinculado Exitosamente", {
          description: "El trabajador ha sido añadido al equipo de la obra.",
        })
        
        router.push(`/obras/${obraId}/usuarios`)
        router.refresh()
      } catch (error) {
        toast.error("Error del sistema", {
          description: "No se logró vincular al usuario a la obra. Por favor intentalo de nuevo.",
        })
      }
    })
  }

  return (
    <Card className="shadow-sm border-muted/60 overflow-hidden">
      <CardHeader className="bg-muted/10 pb-6 border-b">
        <CardTitle className="text-lg">Configuración de Vinculación</CardTitle>
        <CardDescription>
          Busca un usuario existente en la nómina corporativa general y asígnalo aquí de manera exclusiva.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-7 pt-6">
        {/* COMBOBOX DE USUARIO */}
        <div className="space-y-3 flex flex-col">
          <Label className="text-sm font-semibold">Usuario global a vincular</Label>
          <Popover open={openUser} onOpenChange={setOpenUser}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openUser}
                className={cn(
                  "justify-between h-14 px-4 shadow-sm border-input hover:bg-transparent",
                  !selectedUser && "text-muted-foreground"
                )}
              >
                {selectedUser ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7 border shadow-sm">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                        {selectedUser.nombre.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start leading-none gap-1.5">
                      <span className="text-sm font-semibold">{selectedUser.nombre}</span>
                      <span className="text-xs text-muted-foreground font-normal">{selectedUser.email}</span>
                    </div>
                  </div>
                ) : (
                  "Selecciona un usuario escribiendo su nombre o email..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            
            <PopoverContent className="w-[380px] p-0" align="start">
              <Command>
                <CommandInput placeholder="🔎 Buscar en la base de datos de usuarios..." />
                <CommandList>
                  <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
                    No se han encontrado usuarios con ese criterio.
                  </CommandEmpty>
                  <CommandGroup>
                    {MOCK_USUARIOS.map((usr) => (
                      <CommandItem
                        key={usr.id}
                        value={`${usr.nombre} ${usr.email}`} // Propósito de búsqueda indexada
                        onSelect={() => {
                          setUserId(usr.id)
                          setOpenUser(false) // Cierra el popover limpiamente post-click
                        }}
                        className="flex items-center gap-3 py-3 cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={usr.avatar} />
                          <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
                            {usr.nombre.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm">{usr.nombre}</span>
                          <span className="text-xs text-muted-foreground">{usr.email}</span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 transition-all text-primary",
                            userId === usr.id ? "opacity-100 scale-100" : "opacity-0 scale-75"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* SELECT NATIVO DE ROL */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Rol asignado para esta Obra</Label>
          <Select value={rolId} onValueChange={setRolId}>
            <SelectTrigger className="h-14 shadow-sm relative pt-1 pb-1">
              <SelectValue placeholder="Especifica el cargo (ej. Arquitecto, Peón)" />
            </SelectTrigger>
            <SelectContent>
              {ROLES_OBRA.map((rol) => (
                <SelectItem key={rol.id} value={rol.id} className="py-3 px-4 focus:bg-primary/5 cursor-pointer">
                  <div className="flex flex-col gap-0.5 max-w-[280px]">
                    <span className="font-semibold text-sm">{rol.nombre}</span>
                    <span className="text-xs text-muted-foreground truncate">{rol.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-5">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/obras/${obraId}/usuarios`)}
          disabled={isPending}
          className="shadow-sm"
        >
          Descartar Cambios
        </Button>
        <Button 
          onClick={handleVincular} 
          disabled={isPending || !userId || !rolId}
          className="min-w-[160px] shadow-sm font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando Vinculación...
            </>
          ) : (
            "Vincular Participante"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
