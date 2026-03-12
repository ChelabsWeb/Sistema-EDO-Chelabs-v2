import { getObra } from '@/app/actions/obras'
import { getUnassignedUsuarios } from '@/app/actions/usuarios-obra'
import { VincularUsuarioForm } from '@/components/edo/usuarios/vincular-usuario-form'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VincularUsuarioPage({ params }: Props) {
  const resolvedParams = await params
  const obraId = resolvedParams.id

  const obraResult = await getObra(obraId)
  if (!obraResult.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 font-bold bg-red-500/10 px-8 py-4 rounded-3xl">Obra no encontrada</div>
      </div>
    )
  }

  const usuariosResult = await getUnassignedUsuarios()
  const usuariosDisponibles = usuariosResult.success ? usuariosResult.data : []

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto space-y-12 antialiased pb-32 px-8 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 premium-card p-8 animate-apple-fade-in font-inter">
          <div className="space-y-4">
            <Link
              href={`/obras/${obraId}/usuarios`}
              className="inline-flex items-center gap-2 text-sm font-bold text-apple-gray-400 hover:text-foreground transition-colors group w-fit"
            >
              <div className="size-8 rounded-full bg-apple-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-white/10 group-hover:shadow-sm transition-all">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
              Volver al Equipo
            </Link>
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight font-display flex items-center gap-3">
                Vincular Usuario
                <div className="size-8 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                  <Users className="w-4 h-4" />
                </div>
              </h2>
              <p className="text-sm font-bold text-apple-gray-400 uppercase tracking-widest mt-2">
                Obra: <span className="text-foreground">{obraResult.data.nombre}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contenido / Formulario */}
        <VincularUsuarioForm obraId={obraId} usuariosDisponibles={usuariosDisponibles} />
      </div>
    </div>
  )
}
