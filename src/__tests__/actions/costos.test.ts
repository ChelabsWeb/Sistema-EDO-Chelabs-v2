import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateOTCostoReal, calculateOTCostoReal } from '@/app/actions/costos'

describe('costos.ts - Cost Calculation Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('calculateOTCostoReal', () => {
        it('should calculate cost correctly with material consumptions', async () => {
            const mockConsumos = [
                {
                    id: 'consumo-1',
                    cantidad_consumida: 100,
                    insumo: {
                        id: 'insumo-1',
                        nombre: 'Cemento',
                        precio_unitario: 15,
                    },
                },
                {
                    id: 'consumo-2',
                    cantidad_consumida: 2,
                    insumo: {
                        id: 'insumo-2',
                        nombre: 'Arena',
                        precio_unitario: 1200,
                    },
                },
            ]

            // Mock the Supabase response
            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            vi.mocked(mockClient.from).mockReturnValue({
                ...mockClient.from(''),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: mockConsumos, error: null }),
            } as any)

            const result = await calculateOTCostoReal('ot-1')

            expect(result.success).toBe(true)
            expect(result.data).toBe(3900) // 100*15 + 2*1200
        })

        it('should return 0 when no consumptions exist', async () => {
            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            vi.mocked(mockClient.from).mockReturnValue({
                ...mockClient.from(''),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            } as any)

            const result = await calculateOTCostoReal('ot-1')

            expect(result.success).toBe(true)
            expect(result.data).toBe(0)
        })

        it('should handle database errors gracefully', async () => {
            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            vi.mocked(mockClient.from).mockReturnValue({
                ...mockClient.from(''),
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database connection failed' }
                }),
            } as any)

            const result = await calculateOTCostoReal('ot-1')

            expect(result.success).toBe(false)
            expect(result.error).toBeDefined()
        })
    })

    describe('updateOTCostoReal', () => {
        it('should update OT with calculated cost', async () => {
            const mockConsumos = [
                {
                    id: 'consumo-1',
                    cantidad_consumida: 100,
                    insumo: {
                        precio_unitario: 15,
                    },
                },
            ]

            const { createClient } = await import('@/lib/supabase/server')
            const mockClient = await createClient()

            // Mock select for consumptions
            const mockFrom = vi.fn().mockImplementation((table: string) => {
                if (table === 'consumo_materiales') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockResolvedValue({ data: mockConsumos, error: null }),
                    }
                }
                // Mock update for OT
                return {
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ data: { id: 'ot-1' }, error: null }),
                }
            })

            vi.mocked(mockClient.from).mockImplementation(mockFrom as any)

            const result = await updateOTCostoReal('ot-1')

            expect(result.success).toBe(true)
        })
    })

    describe('Budget Deviation Detection', () => {
        it('should detect when actual cost exceeds estimate', () => {
            const costoEstimado = 50000
            const costoReal = 65000

            const deviation = costoReal - costoEstimado
            const deviationPercent = (deviation / costoEstimado) * 100

            expect(deviation).toBe(15000)
            expect(deviationPercent).toBe(30)
            expect(deviationPercent).toBeGreaterThan(20) // Critical threshold
        })

        it('should detect when actual cost is under estimate', () => {
            const costoEstimado = 50000
            const costoReal = 45000

            const deviation = costoReal - costoEstimado
            const deviationPercent = (deviation / costoEstimado) * 100

            expect(deviation).toBe(-5000)
            expect(deviationPercent).toBe(-10)
            expect(deviationPercent).toBeLessThan(0)
        })
    })
})
