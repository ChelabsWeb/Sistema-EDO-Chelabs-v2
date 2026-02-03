import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createInsumo, updateInsumo, deleteInsumo } from '@/app/actions/insumos'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

const MOCK_IDS = {
    OBRA: '123e4567-e89b-12d3-a456-426614174000',
    INSUMO: '123e4567-e89b-12d3-a456-426614174001',
    INSUMO_BUSY: '123e4567-e89b-12d3-a456-426614174002'
}

describe('insumos.ts - Insumos Management', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('createInsumo', () => {
        it('should create an insumo successfully as admin', async () => {
            const admin = userFixtures.admin()
            const input = {
                obra_id: MOCK_IDS.OBRA,
                nombre: 'Cemento',
                unidad: 'kg',
                tipo: 'material' as const,
                precio_referencia: 150
            }

            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table: string) => {
                const mockBuilder = {
                    select: vi.fn().mockReturnThis(),
                    insert: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: {
                            id: MOCK_IDS.INSUMO,
                            ...input,
                            precio_unitario: 150 // Backwards compat check
                        },
                        error: null
                    }),
                    eq: vi.fn().mockReturnThis(),
                }

                if (table === 'usuarios') {
                    return {
                        ...mockBuilder,
                        single: vi.fn().mockResolvedValue({ data: admin, error: null })
                    }
                }
                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            const result = await createInsumo(input)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.nombre).toBe(input.nombre)
                expect(result.data.precio_unitario).toBe(150)
            }
        })
    })

    describe('updateInsumo', () => {
        it('should update insumo and sync legacy price field', async () => {
            const admin = userFixtures.admin()
            const input = {
                id: MOCK_IDS.INSUMO,
                precio_referencia: 200
            }

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    update: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: {
                            id: MOCK_IDS.INSUMO,
                            obra_id: MOCK_IDS.OBRA,
                            precio_referencia: 200,
                            precio_unitario: 200
                        },
                        error: null
                    }),
                }

                if (table === 'usuarios') {
                    return { ...mockBuilder, single: vi.fn().mockResolvedValue({ data: admin, error: null }) }
                }
                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateInsumo(input)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.precio_unitario).toBe(200)
            }
        })
    })

    describe('deleteInsumo', () => {
        it('should soft-delete when no usage exists', async () => {
            const admin = userFixtures.admin()
            const insumoId = MOCK_IDS.INSUMO

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null })
                    }
                }
                if (table === 'insumos') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: { id: insumoId, obra_id: MOCK_IDS.OBRA }, error: null }),
                        update: vi.fn().mockReturnThis(),
                        then: vi.fn((resolve) => resolve({ error: null }))
                    }
                }
                if (table === 'formulas') {
                    const mockChain: any = {
                        then: vi.fn((resolve) => resolve({ count: 0, error: null }))
                    }
                    mockChain.select = vi.fn().mockReturnValue(mockChain)
                    mockChain.eq = vi.fn().mockReturnValue(mockChain)
                    return mockChain
                }
                if (table === 'ot_insumos_estimados') {
                    // Return empty list of usages
                    const mockChain: any = {
                        then: vi.fn((resolve) => resolve({ data: [], error: null }))
                    }
                    mockChain.select = vi.fn().mockReturnValue(mockChain)
                    mockChain.eq = vi.fn().mockReturnValue(mockChain)
                    return mockChain
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await deleteInsumo(insumoId)

            expect(result.success).toBe(true)
        })

        it('should block deletion if used in active OTs', async () => {
            const admin = userFixtures.admin()
            const insumoId = MOCK_IDS.INSUMO_BUSY

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null })
                    }
                }
                if (table === 'insumos') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: { id: insumoId, obra_id: MOCK_IDS.OBRA }, error: null })
                    }
                }
                if (table === 'formulas') {
                    const mockChain: any = {
                        then: vi.fn((resolve) => resolve({ count: 0, error: null }))
                    }
                    mockChain.select = vi.fn().mockReturnValue(mockChain)
                    mockChain.eq = vi.fn().mockReturnValue(mockChain)
                    return mockChain
                }
                if (table === 'ot_insumos_estimados') {
                    const mockChain: any = {
                        then: vi.fn((resolve) => resolve({
                            data: [{ orden_trabajo_id: 'ot-1' }],
                            error: null
                        }))
                    }
                    mockChain.select = vi.fn().mockReturnValue(mockChain)
                    mockChain.eq = vi.fn().mockReturnValue(mockChain)
                    return mockChain
                }
                if (table === 'ordenes_trabajo') {
                    const mockChain: any = {
                        then: vi.fn((resolve) => resolve({ count: 1, error: null }))
                    }
                    mockChain.select = vi.fn().mockReturnValue(mockChain)
                    mockChain.in = vi.fn().mockReturnValue(mockChain)
                    mockChain.is = vi.fn().mockReturnValue(mockChain)
                    return mockChain
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await deleteInsumo(insumoId)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('ordenes de trabajo')
            }
        })
    })
})
