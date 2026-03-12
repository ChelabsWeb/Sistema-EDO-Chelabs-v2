import { getObra } from '@/app/actions/obras'
import { getUnassignedUsuarios } from '@/app/actions/usuarios-obra'
import { VincularUsuarioForm } from '@/components/edo/usuarios/vincular-usuario-form'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VincularUsuarioPage({ params }: Props) {
  const resolvedParams = await params
  const obraId = resolvedParams.id

  const obraResult = await getObra(obraId)
  if (!obraResult.success) {
    return (
      <div className="flex justify-center py-10">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg font-medium">Obra no encontrada</div>
      </div>
    )
  }

  const usuariosResult = await getUnassignedUsuarios()
  const usuariosDisponibles = usuariosResult.success ? usuariosResult.data : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href={`/obras/${obraId}/usuarios`} className="w-fit">
          <Button variant="ghost" size="sm" className="text-muted-foreground -ml-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Equipo
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Vincular Usuario
            <Users className="w-5 h-5 text-muted-foreground" />
          </h2>
          <p className="text-muted-foreground mt-1">
            Obra: {obraResult.data.nombre}
          </p>
        </div>
      </div>

      <VincularUsuarioForm obraId={obraId} usuariosDisponibles={usuariosDisponibles} />
    </div>
  )
}
