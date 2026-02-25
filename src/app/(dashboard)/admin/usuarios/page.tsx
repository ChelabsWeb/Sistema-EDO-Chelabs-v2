import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Usuario, UserRole } from '@/types/database'
import { getRoleDisplayName } from '@/lib/roles'
import { Users, UserPlus, Shield, CheckCircle2, Mail, Calendar, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserPresenceBadge } from '@/components/shared/UserPresenceBadge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  let user = null
  if (!isDemo) {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser
  }

  if (!isDemo) {
    const { data: currentProfile } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('auth_user_id', user!.id)
      .single() as { data: { rol: UserRole } | null }

    if (!currentProfile || !['admin', 'director_obra'].includes(currentProfile.rol)) {
      redirect('/dashboard?error=no_autorizado')
    }
  }

  let userList: Usuario[] = []
  let error = null

  if (isDemo) {
    userList = [
      { id: '1', nombre: 'Juan Pérez', email: 'juan.perez@chelabs.com', rol: 'admin', activo: true, created_at: '2023-01-10', auth_user_id: '1', obra_id: null, updated_at: null },
      { id: '2', nombre: 'María García', email: 'maria.garcia@chelabs.com', rol: 'director_obra', activo: true, created_at: '2023-02-15', auth_user_id: '2', obra_id: null, updated_at: null },
      { id: '3', nombre: 'Carlos Rodríguez', email: 'carlos.rod@chelabs.com', rol: 'jefe_obra', activo: true, created_at: '2023-03-20', auth_user_id: '3', obra_id: null, updated_at: null },
      { id: '4', nombre: 'Ana López', email: 'ana.lopez@chelabs.com', rol: 'compras', activo: false, created_at: '2023-04-25', auth_user_id: '4', obra_id: null, updated_at: null },
      { id: '5', nombre: 'Roberto Silva', email: 'r.silva@chelabs.com', rol: 'jefe_obra', activo: true, created_at: '2023-05-30', auth_user_id: '5', obra_id: null, updated_at: null },
    ]
  } else {
    const { data, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    userList = (data as Usuario[]) || []
    error = fetchError
  }

  return (
    <div className="flex-1 flex flex-col space-y-8 h-full">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between py-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipo</h2>
          <p className="text-muted-foreground mt-1">Administración centralizada de perfiles y niveles de autoridad operativa.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {userList.length} Miembros Activos
          </Badge>
          <Button asChild>
            <Link href="/admin/usuarios/nuevo">
              <UserPlus className="mr-2 w-4 h-4" /> Registrar Usuario
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filtrar por nombre o email..."
              className="pl-9 w-full"
            />
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="w-4 h-4 mr-2" /> Permisos
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userList.map((usuario) => (
          <Link key={usuario.id} href={`/admin/usuarios/${usuario.id}`} className="group">
            <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-sm">
                    {usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background",
                    usuario.activo ? "bg-emerald-500" : "bg-muted-foreground"
                  )} />
                </div>
                <Badge variant={
                  usuario.rol === 'admin' ? 'default' :
                    usuario.rol === 'director_obra' ? 'secondary' :
                      'outline'
                } className="uppercase text-[10px] tracking-wider">
                  {getRoleDisplayName(usuario.rol)}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 mt-2">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                    {usuario.nombre}
                    <UserPresenceBadge userId={usuario.id} />
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{usuario.email}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ingreso 2023</span>
                </div>
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4].map(i => (
                    <Shield key={i} className={cn(
                      "w-3 h-3",
                      i <= (usuario.rol === 'admin' ? 4 : usuario.rol === 'director_obra' ? 3 : 2)
                        ? "text-primary fill-primary" : "text-muted opacity-20"
                    )} />
                  ))}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

    </div>
  )
}
