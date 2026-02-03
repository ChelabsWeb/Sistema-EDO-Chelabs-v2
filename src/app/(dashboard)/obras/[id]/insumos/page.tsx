import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InsumosClient } from './insumos-client'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InsumosPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  type ObraRow = { id: string; nombre: string }
  type InsumoRow = {
    id: string
    nombre: string
    unidad: string
    tipo: 'material' | 'mano_de_obra' | null
    precio_referencia: number | null
  }

  const { data: obra, error } = await supabase
    .from('obras')
    .select('id, nombre')
    .eq('id', id)
    .single() as { data: ObraRow | null; error: Error | null }

  if (error || !obra) {
    notFound()
  }

  const { data: insumos } = await supabase
    .from('insumos')
    .select('*')
    .eq('obra_id', id)
    .order('nombre') as { data: InsumoRow[] | null }

  return (
    <>
      <InsumosClient
        obraId={id}
        obraNombre={obra.nombre}
        initialInsumos={insumos || []}
      />
    </>
  )
}
