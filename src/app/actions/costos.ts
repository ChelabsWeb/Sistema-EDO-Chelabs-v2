'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

interface CostoRealResult {
  costo_real: number
  detalles: Array<{
    insumo_id: string
    insumo_nombre: string
    cantidad_consumida: number
    precio_unitario: number
    subtotal: number
    fuente_precio: 'oc' | 'insumo'
  }>
}

/**
 * Calculate real cost of an OT based on consumed materials
 *
 * Formula: costo_real = SUM(consumo.cantidad_consumida × precio_efectivo)
 *
 * precio_efectivo priority:
 * 1. lineas_oc.precio_unitario (actual OC purchase price for this OT+insumo)
 * 2. insumos.precio_unitario (reference price from catalog)
 */
export async function calculateOTCostoReal(otId: string): Promise<ActionResult<CostoRealResult>> {
  const supabase = await createClient()

  // Get all consumos for this OT with insumo details
  const { data: consumos, error: consumosError } = await supabase
    .from('consumo_materiales')
    .select(`
      id,
      insumo_id,
      cantidad_consumida,
      insumos (
        id,
        nombre,
        precio_unitario,
        precio_referencia
      )
    `)
    .eq('orden_trabajo_id', otId)

  if (consumosError) {
    console.error('Error fetching consumos:', consumosError)
    return { success: false, error: 'Error al obtener los consumos' }
  }

  if (!consumos || consumos.length === 0) {
    return {
      success: true,
      data: {
        costo_real: 0,
        detalles: []
      }
    }
  }

  // Get OC lineas for this OT to get actual purchase prices
  const { data: lineasOC } = await supabase
    .from('lineas_oc')
    .select(`
      insumo_id,
      precio_unitario,
      cantidad_recibida
    `)
    .eq('orden_trabajo_id', otId)
    .gt('cantidad_recibida', 0) // Only consider received materials

  // Create a map of insumo_id -> OC price (use average if multiple OCs)
  const preciosOC = new Map<string, number>()
  if (lineasOC && lineasOC.length > 0) {
    // Group by insumo_id and calculate weighted average price
    const insumoAggregates = new Map<string, { totalCost: number; totalQty: number }>()

    for (const linea of lineasOC) {
      const existing = insumoAggregates.get(linea.insumo_id) || { totalCost: 0, totalQty: 0 }
      const qty = linea.cantidad_recibida || 0
      const cost = (linea.precio_unitario || 0) * qty

      insumoAggregates.set(linea.insumo_id, {
        totalCost: existing.totalCost + cost,
        totalQty: existing.totalQty + qty
      })
    }

    for (const [insumoId, agg] of insumoAggregates) {
      if (agg.totalQty > 0) {
        preciosOC.set(insumoId, agg.totalCost / agg.totalQty)
      }
    }
  }

  // Calculate costo_real
  let costoReal = 0
  const detalles: CostoRealResult['detalles'] = []

  for (const consumo of consumos) {
    const insumo = consumo.insumos as {
      id: string
      nombre: string
      precio_unitario: number | null
      precio_referencia: number | null
    } | null

    if (!insumo) continue

    const cantidadConsumida = consumo.cantidad_consumida || 0

    // Get effective price: OC price first, then insumo price
    let precioUnitario = 0
    let fuentePrecio: 'oc' | 'insumo' = 'insumo'

    if (preciosOC.has(consumo.insumo_id)) {
      precioUnitario = preciosOC.get(consumo.insumo_id)!
      fuentePrecio = 'oc'
    } else {
      precioUnitario = insumo.precio_unitario || insumo.precio_referencia || 0
    }

    const subtotal = cantidadConsumida * precioUnitario
    costoReal += subtotal

    detalles.push({
      insumo_id: consumo.insumo_id,
      insumo_nombre: insumo.nombre,
      cantidad_consumida: cantidadConsumida,
      precio_unitario: precioUnitario,
      subtotal,
      fuente_precio: fuentePrecio
    })
  }

  return {
    success: true,
    data: {
      costo_real: costoReal,
      detalles
    }
  }
}

/**
 * Recalculate and update costo_real for an OT
 * Call this after consumo changes or OC reception
 */
export async function updateOTCostoReal(otId: string): Promise<ActionResult<number>> {
  const supabase = await createClient()

  // Calculate the new costo_real
  const calcResult = await calculateOTCostoReal(otId)

  if (!calcResult.success) {
    return { success: false, error: calcResult.error }
  }

  const newCostoReal = calcResult.data.costo_real

  // Update the OT
  const { error: updateError } = await supabase
    .from('ordenes_trabajo')
    .update({
      costo_real: newCostoReal,
      updated_at: new Date().toISOString()
    })
    .eq('id', otId)

  if (updateError) {
    console.error('Error updating OT costo_real:', updateError)
    return { success: false, error: 'Error al actualizar el costo real' }
  }

  // Get obra_id for revalidation
  const { data: ot } = await supabase
    .from('ordenes_trabajo')
    .select('obra_id')
    .eq('id', otId)
    .single()

  if (ot) {
    revalidatePath(`/obras/${ot.obra_id}/ordenes-trabajo/${otId}`)
    revalidatePath(`/obras/${ot.obra_id}/ordenes-trabajo`)
    revalidatePath('/dashboard')
  }

  return { success: true, data: newCostoReal }
}

/**
 * Get cost summary for an OT including deviation
 */
export async function getOTCostSummary(otId: string): Promise<ActionResult<{
  costo_estimado: number
  costo_real: number
  desvio: number
  desvio_porcentaje: number
  detalles: CostoRealResult['detalles']
}>> {
  const supabase = await createClient()

  // Get OT with costo_estimado
  const { data: ot, error: otError } = await supabase
    .from('ordenes_trabajo')
    .select('costo_estimado, costo_real')
    .eq('id', otId)
    .single()

  if (otError || !ot) {
    return { success: false, error: 'OT no encontrada' }
  }

  // Calculate current costo_real
  const calcResult = await calculateOTCostoReal(otId)

  if (!calcResult.success) {
    return { success: false, error: calcResult.error }
  }

  const costoEstimado = ot.costo_estimado || 0
  const costoReal = calcResult.data.costo_real
  const desvio = costoReal - costoEstimado
  const desvioPorcentaje = costoEstimado > 0
    ? (desvio / costoEstimado) * 100
    : 0

  return {
    success: true,
    data: {
      costo_estimado: costoEstimado,
      costo_real: costoReal,
      desvio,
      desvio_porcentaje: desvioPorcentaje,
      detalles: calcResult.data.detalles
    }
  }
}

/**
 * Get deviation summary aggregated by rubro for an obra
 */
export interface RubroDeviationSummary {
  rubro_id: string
  rubro_nombre: string
  presupuesto: number
  costo_estimado_total: number
  costo_real_total: number
  desvio: number
  desvio_porcentaje: number
  ots_count: number
  status: 'ok' | 'warning' | 'alert'
}

export async function getDeviationsByRubro(obraId: string): Promise<ActionResult<RubroDeviationSummary[]>> {
  const supabase = await createClient()

  // Get all rubros for this obra
  const { data: rubros, error: rubrosError } = await supabase
    .from('rubros')
    .select('id, nombre, presupuesto')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('nombre')

  if (rubrosError) {
    return { success: false, error: 'Error al obtener rubros' }
  }

  if (!rubros || rubros.length === 0) {
    return { success: true, data: [] }
  }

  // Get all OTs for this obra grouped by rubro
  const { data: ots, error: otsError } = await supabase
    .from('ordenes_trabajo')
    .select('id, rubro_id, costo_estimado, costo_real, estado')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .in('estado', ['aprobada', 'en_ejecucion', 'cerrada'])

  if (otsError) {
    return { success: false, error: 'Error al obtener OTs' }
  }

  // Aggregate by rubro
  const rubroMap = new Map<string, {
    costo_estimado_total: number
    costo_real_total: number
    ots_count: number
  }>()

  for (const ot of ots || []) {
    const existing = rubroMap.get(ot.rubro_id) || {
      costo_estimado_total: 0,
      costo_real_total: 0,
      ots_count: 0
    }

    rubroMap.set(ot.rubro_id, {
      costo_estimado_total: existing.costo_estimado_total + (ot.costo_estimado || 0),
      costo_real_total: existing.costo_real_total + (ot.costo_real || 0),
      ots_count: existing.ots_count + 1
    })
  }

  // Build result
  const result: RubroDeviationSummary[] = rubros.map((rubro) => {
    const aggregated = rubroMap.get(rubro.id) || {
      costo_estimado_total: 0,
      costo_real_total: 0,
      ots_count: 0
    }

    const desvio = aggregated.costo_real_total - aggregated.costo_estimado_total
    const desvioPorcentaje = aggregated.costo_estimado_total > 0
      ? (desvio / aggregated.costo_estimado_total) * 100
      : 0

    // Determine status based on deviation percentage
    let status: 'ok' | 'warning' | 'alert' = 'ok'
    if (desvioPorcentaje > 20) {
      status = 'alert'
    } else if (desvioPorcentaje > 0) {
      status = 'warning'
    }

    return {
      rubro_id: rubro.id,
      rubro_nombre: rubro.nombre,
      presupuesto: rubro.presupuesto || 0,
      costo_estimado_total: aggregated.costo_estimado_total,
      costo_real_total: aggregated.costo_real_total,
      desvio,
      desvio_porcentaje: desvioPorcentaje,
      ots_count: aggregated.ots_count,
      status
    }
  })

  return { success: true, data: result }
}
