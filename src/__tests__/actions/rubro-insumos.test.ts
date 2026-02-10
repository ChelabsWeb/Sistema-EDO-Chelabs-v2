import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getRubroWithInsumos,
    getRubrosWithInsumos,
    addInsumoToRubro,
    removeInsumoFromRubro,
    updateRubroPresupuesto,
    updateInsumo,
    getAvailableInsumosForRubro,
} from '@/app/actions/rubro-insumos'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

vi.mock('@/app/actions/auth', () => ({
    getCurrentUser: vi.fn(),
}))

const MOCK_IDS = {
    OBRA: '123e4567-e89b-12d3-a456-426614174000',
    RUBRO: '123e4567-e89b-12d3-a456-426614174001',
    INSUMO: '123e4567-e89b-12d3-a456-426614174002',
}

describe('rubro-insumos.ts - Formula Management', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('getRubroWithInsumos', () => {
        it('should return rubro with linked insumos and budget status', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()
            const mockRubro = {
                id: MOCK_IDS.RUBRO,
                nombre: 'Test Rubro',
                presupuesto: 10000,
            }
            const mockInsumo = { id: MOCK_IDS.INSUMO, nombre: 'Test Insumo' }

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'rubros') {
                    mockBuilder.single.mockResolvedValue({ data: mockRubro, error: null })
                } else if (table === 'rubro_insumos') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({ data: [{ insumo_id: MOCK_IDS.INSUMO }], error: null })
                    )
                } else if (table === 'insumos') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({ data: [mockInsumo], error: null })
                    )
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({ data: [{ costo_estimado: 2000 }], error: null })
                    )
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getRubroWithInsumos(MOCK_IDS.RUBRO)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data!.insumos).toHaveLength(1)
                expect(result.data!.presupuesto_status!.gastado).toBe(2000)
                expect(result.data!.presupuesto_status!.disponible).toBe(8000)
            }
        })
    })

    describe('getRubrosWithInsumos', () => {
        it('should return all rubros with insumos for an obra', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()
            const mockRubros = [
                { id: MOCK_IDS.RUBRO, nombre: 'Rubro 1', presupuesto: 10000 },
            ]

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                }

                if (table === 'rubros') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({ data: mockRubros, error: null })
                    )
                } else if (table === 'rubro_insumos') {
                    mockBuilder.then = vi.fn((resolve) => resolve({ data: [], error: null }))
                } else if (table === 'insumos') {
                    mockBuilder.then = vi.fn((resolve) => resolve({ data: [], error: null }))
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.then = vi.fn((resolve) => resolve({ data: [], error: null }))
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getRubrosWithInsumos(MOCK_IDS.OBRA)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(1)
            }
        })
    })

    describe('addInsumoToRubro', () => {
        it('should add insumo to rubro', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()

            let callCount = 0
            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    insert: vi.fn(),
                }

                if (table === 'rubros') {
                    mockBuilder.single.mockResolvedValue({
                        data: { obra_id: MOCK_IDS.OBRA },
                        error: null,
                    })
                } else if (table === 'insumos') {
                    mockBuilder.single.mockResolvedValue({
                        data: { id: MOCK_IDS.INSUMO, obra_id: MOCK_IDS.OBRA },
                        error: null,
                    })
                } else if (table === 'rubro_insumos') {
                    mockBuilder.insert.mockResolvedValue({ error: null })
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await addInsumoToRubro(MOCK_IDS.RUBRO, MOCK_IDS.INSUMO)

            expect(result.success).toBe(true)
        })

        it('should reject if insumo from different obra', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'rubros') {
                    mockBuilder.single.mockResolvedValue({
                        data: { obra_id: MOCK_IDS.OBRA },
                        error: null,
                    })
                } else if (table === 'insumos') {
                    mockBuilder.single.mockResolvedValue({
                        data: { id: MOCK_IDS.INSUMO, obra_id: 'different-obra' },
                        error: null,
                    })
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await addInsumoToRubro(MOCK_IDS.RUBRO, MOCK_IDS.INSUMO)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('misma obra')
            }
        })
    })

    describe('removeInsumoFromRubro', () => {
        it('should remove insumo from rubro', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    delete: vi.fn().mockReturnThis(),
                }

                if (table === 'rubros') {
                    mockBuilder.single.mockResolvedValue({
                        data: { obra_id: MOCK_IDS.OBRA },
                        error: null,
                    })
                } else if (table === 'rubro_insumos') {
                    mockBuilder.then = vi.fn((resolve) => resolve({ error: null }))
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await removeInsumoFromRubro(MOCK_IDS.RUBRO, MOCK_IDS.INSUMO)

            expect(result.success).toBe(true)
        })
    })

    describe('updateRubroPresupuesto', () => {
        it('should update rubro budget', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'rubros') {
                    return {
                        update: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        is: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { obra_id: MOCK_IDS.OBRA },
                            error: null,
                        }),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateRubroPresupuesto(MOCK_IDS.RUBRO, 15000, 450000)

            expect(result.success).toBe(true)
        })

        it('should reject negative budget', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const result = await updateRubroPresupuesto(MOCK_IDS.RUBRO, -100)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('negativo')
            }
        })
    })

    describe('updateInsumo', () => {
        it('should update insumo details', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'insumos') {
                    return {
                        update: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        is: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: MOCK_IDS.INSUMO,
                                nombre: 'Updated Insumo',
                                obra_id: MOCK_IDS.OBRA,
                            },
                            error: null,
                        }),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateInsumo(MOCK_IDS.INSUMO, {
                nombre: 'Updated Insumo',
                precio_referencia: 150,
            })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data!.nombre).toBe('Updated Insumo')
            }
        })
    })

    describe('getAvailableInsumosForRubro', () => {
        it('should return insumos not linked to rubro', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                user: { id: 'user-1' } as any,
                profile: { id: 'profile-1', rol: 'admin', obra_id: MOCK_IDS.OBRA } as any,
            })

            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    not: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'rubros') {
                    mockBuilder.single.mockResolvedValue({
                        data: { obra_id: MOCK_IDS.OBRA },
                        error: null,
                    })
                } else if (table === 'rubro_insumos') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({ data: [{ insumo_id: 'linked-insumo' }], error: null })
                    )
                } else if (table === 'insumos') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({
                            data: [{ id: 'available-insumo', nombre: 'Available' }],
                            error: null,
                        })
                    )
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getAvailableInsumosForRubro(MOCK_IDS.RUBRO)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(1)
            }
        })
    })
})
