import { z } from 'zod'

export const createRubroSchema = z.object({
  obra_id: z.string().uuid('ID de obra inválido'),
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  unidad: z
    .string()
    .min(1, 'La unidad es requerida')
    .max(20, 'La unidad no puede tener más de 20 caracteres'),
  presupuesto_ur: z
    .number()
    .min(0, 'El presupuesto no puede ser negativo'),
})

export const updateRubroSchema = createRubroSchema.partial().extend({
  id: z.string().uuid('ID de rubro inválido'),
})

export type CreateRubroInput = z.infer<typeof createRubroSchema>
export type UpdateRubroInput = z.infer<typeof updateRubroSchema>
