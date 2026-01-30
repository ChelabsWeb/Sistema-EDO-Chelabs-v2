import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerConsumo, getConsumosByOT } from '@/app/actions/consumo-materiales'

describe('consumo-materiales.ts - Material Consumption', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('registerConsumo', () => {
        it('should register consumption successfully', async () => {
            const newConsumo = {
                orden_trabajo_id: 'ot-1',
                obra_id: 'obra-1',
                insumo_id: 'insumo-1',
                cantidad_consumida: 100,
                cantidad_estimada: 90,
            }

            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            // Mock auth
            vi.mocked(mockClient.auth.getUser).mockResolvedValue({
                data: { user: { id: 'user-1', email: 'test@test.com' } as any },
                error: null,
            })

            // Mock insert
            vi.mocked(mockClient.from).mockReturnValue({
                ...mockClient.from(''),
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockResolvedValue({
                    data: [{ ...newConsumo, id: 'consumo-new' }],
                    error: null
                }),
            } as any)

            const result = await registerConsumo(newConsumo)

            expect(result.success).toBe(true)
        })

        it('should reject consumption without authentication', async () => {
            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            vi.mocked(mockClient.auth.getUser).mockResolvedValue({
                data: { user: null },
                error: { message: 'Not authenticated' } as any,
            })

            const result = await registerConsumo({
                orden_trabajo_id: 'ot-1',
                obra_id: 'obra-1',
                insumo_id: 'insumo-1',
                cantidad_consumida: 100,
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('autenticado')
        })

        it('should validate cantidad_consumida is positive', async () => {
            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            vi.mocked(mockClient.auth.getUser).mockResolvedValue({
                data: { user: { id: 'user-1' } as any },
                error: null,
            })

            const result = await registerConsumo({
                orden_trabajo_id: 'ot-1',
                obra_id: 'obra-1',
                insumo_id: 'insumo-1',
                cantidad_consumida: -10,
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('cantidad')
        })
    })

    describe('getConsumosByOT', () => {
        it('should retrieve consumptions for an OT', async () => {
            const mockConsumos = [
                {
                    id: 'consumo-1',
                    cantidad_consumida: 100,
                    insumo: { nombre: 'Cemento', precio_unitario: 15 },
                },
                {
                    id: 'consumo-2',
                    cantidad_consumida: 2,
                    insumo: { nombre: 'Arena', precio_unitario: 1200 },
                },
            ]

            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            vi.mocked(mockClient.from).mockReturnValue({
                ...mockClient.from(''),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: mockConsumos, error: null }),
            } as any)

            const result = await getConsumosByOT('ot-1')

            expect(result.success).toBe(true)
            expect(result.data).toHaveLength(2)
        })

        it('should return empty array when no consumptions exist', async () => {
            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            vi.mocked(mockClient.from).mockReturnValue({
                ...mockClient.from(''),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            } as any)

            const result = await getConsumosByOT('ot-1')

            expect(result.success).toBe(true)
            expect(result.data).toHaveLength(0)
        })
    })

    describe('Consumption Validation Logic', () => {
        it('should detect over-consumption vs estimate', () => {
            const cantidadConsumida = 150
            const cantidadEstimada = 100

            const deviation = cantidadConsumida - cantidadEstimada
            const deviationPercent = (deviation / cantidadEstimada) * 100

            expect(deviation).toBe(50)
            expect(deviationPercent).toBe(50)
            expect(deviationPercent).toBeGreaterThan(20) // Warning threshold
        })

        it('should calculate total consumption cost', () => {
            const cantidadConsumida = 100
            const precioUnitario = 15

            const totalCost = cantidadConsumida * precioUnitario

            expect(totalCost).toBe(1500)
        })
    })
})
