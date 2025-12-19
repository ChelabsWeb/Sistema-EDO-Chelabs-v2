import { z } from 'zod'

export const createOTSchema = z.object({
  obra_id: z.string().uuid('ID de obra inválido'),
  rubro_id: z.string().uuid('ID de rubro inválido'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción no puede tener más de 500 caracteres'),
  cantidad: z
    .number()
    .min(0.01, 'La cantidad debe ser mayor a 0')
    .default(1),
})

export const updateOTSchema = z.object({
  id: z.string().uuid('ID de OT inválido'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  cantidad: z
    .number()
    .min(0.01, 'La cantidad debe ser mayor a 0')
    .optional(),
  rubro_id: z.string().uuid('ID de rubro inválido').optional(),
})

export const changeOTStatusSchema = z.object({
  id: z.string().uuid('ID de OT inválido'),
  estado: z.enum(['borrador', 'aprobada', 'en_ejecucion', 'cerrada']),
  notas: z.string().max(500, 'Las notas no pueden tener más de 500 caracteres').optional(),
})

export const approveOTSchema = z.object({
  id: z.string().uuid('ID de OT inválido'),
  notas: z.string().max(500).optional(),
  acknowledge_budget_exceeded: z.boolean().optional().default(false),
})

export const closeOTSchema = z.object({
  id: z.string().uuid('ID de OT inválido'),
  notas: z.string().max(500).optional(),
  acknowledge_deviation: z.boolean().optional().default(false),
})

export type CreateOTInput = z.infer<typeof createOTSchema>
export type UpdateOTInput = z.infer<typeof updateOTSchema>
export type ChangeOTStatusInput = z.infer<typeof changeOTStatusSchema>
export type ApproveOTInput = z.infer<typeof approveOTSchema>
export type CloseOTInput = z.infer<typeof closeOTSchema>
