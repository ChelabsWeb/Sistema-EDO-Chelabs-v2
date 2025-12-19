import { z } from 'zod'

export const createFormulaSchema = z.object({
  rubro_id: z.string().uuid('ID de rubro inválido'),
  insumo_id: z.string().uuid('ID de insumo inválido'),
  cantidad_por_unidad: z
    .number()
    .min(0.0001, 'La cantidad debe ser mayor a 0'),
})

export const updateFormulaSchema = z.object({
  id: z.string().uuid('ID de fórmula inválido'),
  cantidad_por_unidad: z
    .number()
    .min(0.0001, 'La cantidad debe ser mayor a 0'),
})

export type CreateFormulaInput = z.infer<typeof createFormulaSchema>
export type UpdateFormulaInput = z.infer<typeof updateFormulaSchema>
