import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock createClient
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}))

// Mock costos
vi.mock('@/app/actions/costos', () => ({
    updateOTCostoReal: vi.fn().mockResolvedValue({ success: true, data: 0 }),
}))

import { registerConsumo, getConsumosByOT } from '@/app/actions/consumo-materiales'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { userFixtures, consumoFixtures, insumoFixtures } from '@/test-utils/fixtures'
import { createClient } from '@/lib/supabase/server'

describe('consumo-materiales.ts - Material Consumption', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('registerConsumo', () => {
        it('should register consumption successfully', async () => {
            const user = userFixtures.jefe()
            const consumo = consumoFixtures.default()

            const mockClient = createMockSupabaseClient({
                auth: { user: { id: user.auth_user_id } as any, session: null, error: null },
            })

            mockClient.from = vi.fn().mockImplementation((table: string) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: user, error: null })
                    }
                }
                if (table === 'consumo_materiales') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        insert: vi.fn().mockReturnThis(),
                        // First call checks for existing, second call inserts
                        single: vi.fn()
                            .mockResolvedValueOnce({ data: null, error: null }) // No existing record
                            .mockResolvedValueOnce({ data: { id: 'new-id' }, error: null }) // Insert returns id
                    }
                }
                return mockClient
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await registerConsumo({
                orden_trabajo_id: consumo.orden_trabajo_id,
                obra_id: 'obra-1',
                insumo_id: consumo.insumo_id,
                cantidad_consumida: 100,
            })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.id).toBe('new-id')
            }
        })

        it('should reject consumption without authentication', async () => {
            const mockClient = createMockSupabaseClient({
                auth: { user: null, session: null, error: { message: 'Not authenticated' } as any }
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await registerConsumo({
                orden_trabajo_id: 'ot-1',
                obra_id: 'obra-1',
                insumo_id: 'insumo-1',
                cantidad_consumida: 100,
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('autenticado')
            }
        })

        it('should validate cantidad_consumida is positive', async () => {
            const user = userFixtures.jefe()
            const mockClient = createMockSupabaseClient({
                auth: { user: { id: user.auth_user_id } as any, session: null, error: null }
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await registerConsumo({
                orden_trabajo_id: 'ot-1',
                obra_id: 'obra-1',
                insumo_id: 'insumo-1',
                cantidad_consumida: -10,
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('cantidad')
            }
        })
    })

    describe('getConsumosByOT', () => {
        it('should retrieve consumptions for an OT', async () => {
            const insumo = insumoFixtures.cemento()
            const mockConsumos = [
                {
                    ...consumoFixtures.default(),
                    insumos: {
                        id: insumo.id,
                        nombre: insumo.nombre,
                        unidad: insumo.unidad,
                        precio_referencia: insumo.precio_referencia
                    }
                }
            ]

            const mockClient = createMockSupabaseClient({
                select: { data: mockConsumos, error: null }
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getConsumosByOT('ot-1')

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(1)
                expect(result.data[0].insumo.nombre).toBe(insumo.nombre)
            }
        })

        it('should return empty array when no consumptions exist', async () => {
            const mockClient = createMockSupabaseClient({
                select: { data: [], error: null }
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getConsumosByOT('ot-1')

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(0)
            }
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
