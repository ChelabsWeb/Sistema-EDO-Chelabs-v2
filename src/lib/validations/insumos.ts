import { z } from 'zod'

export const createInsumoSchema = z.object({
  obra_id: z.string().uuid('ID de obra inválido'),
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  unidad: z
    .string()
    .min(1, 'La unidad es requerida')
    .max(20, 'La unidad no puede tener más de 20 caracteres'),
  tipo: z.enum(['material', 'mano_de_obra']),
  precio_referencia: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .nullable()
    .optional(),
})

export const updateInsumoSchema = createInsumoSchema.partial().extend({
  id: z.string().uuid('ID de insumo inválido'),
})

export type CreateInsumoInput = z.infer<typeof createInsumoSchema>
export type UpdateInsumoInput = z.infer<typeof updateInsumoSchema>
