import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerRecepcion } from '@/app/actions/recepciones'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { userFixtures } from '@/test-utils/fixtures'
import * as costosActions from '@/app/actions/costos'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock costs update to avoid chain issues
vi.spyOn(costosActions, 'updateOTCostoReal').mockResolvedValue({ success: true, data: 0 } as any)

const MOCK_IDS = {
    OC: '123e4567-e89b-12d3-a456-426614174000',
    LINEA_1: '123e4567-e89b-12d3-a456-426614174001',
    OT: '123e4567-e89b-12d3-a456-426614174002'
}

describe('recepciones.ts - Material Receptions', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('registerRecepcion', () => {
        const admin = userFixtures.admin()

        it('should register partial reception successfully', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    not: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    insert: vi.fn(),
                    update: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'ordenes_compra') {
                    mockBuilder.single.mockResolvedValue({
                        data: {
                            id: MOCK_IDS.OC,
                            estado: 'enviada',
                            lineas: [{ id: MOCK_IDS.LINEA_1, cantidad_solicitada: 10, cantidad_recibida: 0 }]
                        },
                        error: null
                    })
                    mockBuilder.update.mockReturnThis()
                    mockBuilder.then = vi.fn((resolve) => resolve({ error: null }))
                } else if (table === 'lineas_oc') {
                    mockBuilder.update.mockReturnThis()
                    mockBuilder.then = vi.fn((resolve) => resolve({ error: null }))
                    mockBuilder.select.mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            not: vi.fn().mockReturnValue({
                                then: vi.fn((resolve) => resolve({ data: [{ orden_trabajo_id: MOCK_IDS.OT }], error: null }))
                            })
                        })
                    })
                } else {
                    mockBuilder.insert.mockResolvedValue({ error: null })
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const input = {
                orden_compra_id: MOCK_IDS.OC,
                items: [{ linea_oc_id: MOCK_IDS.LINEA_1, cantidad_a_recibir: 5 }]
            }

            const result = await registerRecepcion(input)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.message).toContain('parcial')
            }
        })

        it('should fail if OC is not in valid state', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: admin, error: null })
                }
                if (table === 'ordenes_compra') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: { id: MOCK_IDS.OC, estado: 'pendiente' }, // Invalid state
                        error: null
                    })
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const input = {
                orden_compra_id: MOCK_IDS.OC,
                items: [{ linea_oc_id: MOCK_IDS.LINEA_1, cantidad_a_recibir: 5 }]
            }

            const result = await registerRecepcion(input)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.code).toBe('BIZ_004')
            }
        })
    })
})
