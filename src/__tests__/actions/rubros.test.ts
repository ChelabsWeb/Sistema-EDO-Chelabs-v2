import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRubro, updateRubro, deleteRubro, getRubrosByObra } from '@/app/actions/rubros'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

const MOCK_IDS = {
    OBRA: '123e4567-e89b-12d3-a456-426614174000',
    RUBRO: '123e4567-e89b-12d3-a456-426614174001',
    RUBRO_2: '123e4567-e89b-12d3-a456-426614174002'
}

describe('rubros.ts - Rubros Management', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('createRubro', () => {
        it('should create a rubro successfully as admin', async () => {
            const admin = userFixtures.admin()
            const input = {
                obra_id: MOCK_IDS.OBRA,
                nombre: 'Hormigón',
                unidad: 'm3',
                presupuesto_ur: 100,
            }

            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table: string) => {
                const mockBuilder = {
                    select: vi.fn().mockReturnThis(),
                    insert: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: {
                            id: MOCK_IDS.RUBRO,
                            ...input,
                            presupuesto: 100 * 40
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
                if (table === 'configuracion') {
                    return {
                        ...mockBuilder,
                        single: vi.fn().mockResolvedValue({ data: { valor: '40' }, error: null })
                    }
                }
                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            const result = await createRubro(input)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.nombre).toBe(input.nombre)
                expect(result.data.presupuesto).toBe(4000)
            }
        })

        it('should deny access to unauthorized users', async () => {
            const user = userFixtures.jefe()
            const input = { obra_id: MOCK_IDS.OBRA, nombre: 'Test', unidad: 'u', presupuesto_ur: 10 }

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: user.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: user, error: null })
                    }
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createRubro(input)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('permisos')
            }
        })

        it('should handle unauthenticated user', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null } as any)
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createRubro({ obra_id: MOCK_IDS.OBRA, nombre: 'Test', unidad: 'u', presupuesto_ur: 10 })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('autenticado')
            }
        })

        it('should handle database insertion error', async () => {
            const admin = userFixtures.admin()
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
                if (table === 'configuracion') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: { valor: '40' }, error: null })
                    }
                }
                if (table === 'rubros') {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
                    }
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createRubro({ obra_id: MOCK_IDS.OBRA, nombre: 'Test', unidad: 'u', presupuesto_ur: 10 })

            expect(result.success).toBe(false)
        })
    })

    describe('updateRubro', () => {
        it('should update rubro and recalculate budget', async () => {
            const admin = userFixtures.admin()
            const input = {
                id: MOCK_IDS.RUBRO,
                presupuesto_ur: 200
            }

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    update: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: { id: MOCK_IDS.RUBRO, obra_id: MOCK_IDS.OBRA, presupuesto: 8000 }, error: null }),
                }

                if (table === 'usuarios') {
                    return { ...mockBuilder, single: vi.fn().mockResolvedValue({ data: admin, error: null }) }
                }
                if (table === 'configuracion') {
                    return { ...mockBuilder, single: vi.fn().mockResolvedValue({ data: { valor: '40' }, error: null }) }
                }
                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateRubro(input)

            expect(result.success).toBe(true)
            expect(mockClient.from).toHaveBeenCalledWith('configuracion')
        })

        it('should handle missing rubro on update', async () => {
            const admin = userFixtures.admin()
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
                if (table === 'configuracion') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: { valor: '40' }, error: null })
                    }
                }
                if (table === 'rubros') {
                    return {
                        update: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
                    }
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateRubro({ id: 'nonexistent', presupuesto_ur: 100 })

            expect(result.success).toBe(false)
        })
    })

    describe('deleteRubro', () => {
        it('should soft-delete when no OTs exist', async () => {
            const admin = userFixtures.admin()
            const rubroId = MOCK_IDS.RUBRO

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
                if (table === 'rubros') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: { id: rubroId, obra_id: MOCK_IDS.OBRA }, error: null }),
                        update: vi.fn().mockReturnThis(),
                        then: vi.fn((resolve) => resolve({ error: null }))
                    }
                }
                if (table === 'ordenes_trabajo') {
                    const mockChain: any = {
                        then: vi.fn((resolve) => resolve({ count: 0, error: null }))
                    }
                    mockChain.select = vi.fn().mockReturnValue(mockChain)
                    mockChain.eq = vi.fn().mockReturnValue(mockChain)
                    mockChain.is = vi.fn().mockReturnValue(mockChain)
                    return mockChain
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await deleteRubro(rubroId)

            expect(result.success).toBe(true)
        })

        it('should block deletion if OTs exist', async () => {
            const admin = userFixtures.admin()
            const rubroId = MOCK_IDS.RUBRO_2

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
                if (table === 'rubros') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: { id: rubroId, obra_id: MOCK_IDS.OBRA }, error: null })
                    }
                }
                if (table === 'ordenes_trabajo') {
                    const mockChain: any = {
                        then: vi.fn((resolve) => resolve({ count: 5, error: null }))
                    }
                    mockChain.select = vi.fn().mockReturnValue(mockChain)
                    mockChain.eq = vi.fn().mockReturnValue(mockChain)
                    mockChain.is = vi.fn().mockReturnValue(mockChain)
                    return mockChain
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await deleteRubro(rubroId)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('ordenes de trabajo')
            }
        })
    })
})
