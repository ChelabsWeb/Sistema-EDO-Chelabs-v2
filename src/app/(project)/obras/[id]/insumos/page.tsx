import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InsumosClient } from './insumos-client'
import { getCotizacionUR } from '@/app/actions/configuracion'
import type { UserRole } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InsumosPage({ params }: Props) {
  const { id } = await params
  const isDemo = id.startsWith('demo-') || process.env.DEMO_MODE === 'true'
  const supabase = await createClient()

  let user = null
  let profile = null
  let obra: any = null
  let cotizacion = 0
  let insumos: any[] = []

  if (isDemo) {
    user = { id: 'demo-user' }
    profile = { rol: 'admin' }
    obra = { id, nombre: 'Proyecto Demo' }
    cotizacion = 1450.50
    insumos = [
      { id: 'i1', nombre: 'Cemento Portland', unidad: 'bolsa', tipo: 'material', precio_referencia: 450 },
      { id: 'i2', nombre: 'Oficial Albañil', unidad: 'hora', tipo: 'mano_de_obra', precio_referencia: 320 }
    ]
  } else {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/auth/login')
    user = authUser

    const [profileRes, obraRes, cotizacionRes] = await Promise.all([
      supabase.from('usuarios').select('rol').eq('auth_user_id', user.id).single(),
      supabase.from('obras').select('id, nombre').eq('id', id).is('deleted_at', null).single(),
      getCotizacionUR()
    ])

    if (!obraRes.data) notFound()

    profile = profileRes.data
    obra = obraRes.data
    cotizacion = cotizacionRes

    const { data: insumosRows } = await supabase
      .from('insumos')
      .select('*')
      .eq('obra_id', id)
      .is('deleted_at', null)
      .order('nombre')

    insumos = insumosRows || []
  }

  return (
    <InsumosClient
      obraId={id}
      obraNombre={obra.nombre}
      initialInsumos={insumos}
      userRole={(profile?.rol || 'visitante') as UserRole}
      valorUr={cotizacion}
    />
  )
}
