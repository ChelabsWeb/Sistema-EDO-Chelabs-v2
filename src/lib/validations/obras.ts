import { z } from 'zod'

export const createObraSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  direccion: z
    .string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .optional()
    .nullable(),
  cooperativa: z
    .string()
    .max(100, 'El nombre de la cooperativa no puede tener más de 100 caracteres')
    .optional()
    .nullable(),
  presupuesto_total: z
    .number()
    .min(0, 'El presupuesto no puede ser negativo')
    .optional()
    .nullable(),
  fecha_inicio: z.string().optional().nullable(),
  fecha_fin_estimada: z.string().optional().nullable(),
})

export const updateObraSchema = createObraSchema.partial().extend({
  id: z.string().uuid('ID de obra inválido'),
  estado: z.enum(['activa', 'pausada', 'finalizada']).optional(),
})

export type CreateObraInput = z.infer<typeof createObraSchema>
export type UpdateObraInput = z.infer<typeof updateObraSchema>
