import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ rubroId: string }> }
) {
  const { rubroId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: formulas, error } = await supabase
    .from('formulas')
    .select(`
      id,
      cantidad_por_unidad,
      insumos (
        id,
        nombre,
        unidad,
        precio_referencia,
        precio_unitario
      )
    `)
    .eq('rubro_id', rubroId)

  if (error) {
    return NextResponse.json({ error: 'Error al cargar fórmula' }, { status: 500 })
  }

  const items = (formulas || []).map((f) => {
    const insumo = f.insumos as {
      id: string
      nombre: string
      unidad: string
      precio_referencia: number | null
      precio_unitario: number | null
    } | null

    return {
      insumo_id: insumo?.id || '',
      nombre: insumo?.nombre || '',
      unidad: insumo?.unidad || '',
      cantidad_por_unidad: f.cantidad_por_unidad || 0,
      precio_referencia: insumo?.precio_referencia || insumo?.precio_unitario || 0,
    }
  })

  return NextResponse.json({ items })
}
