import * as z from 'zod'

export const updateOTDatesSchema = z.object({
  id: z.string().uuid('ID de OT inválido'),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').nullable(),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)').nullable(),
})

export type UpdateOTDatesInput = z.infer<typeof updateOTDatesSchema>
