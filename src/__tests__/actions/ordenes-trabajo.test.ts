import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    createOT,
    updateOT,
    approveOT,
    startOTExecution,
    closeOT,
    deleteOT,
    getRubroBudgetStatus,
} from '@/app/actions/ordenes-trabajo'
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
    OT: '123e4567-e89b-12d3-a456-426614174002',
    INSUMO: '123e4567-e89b-12d3-a456-426614174003',
    USER: '123e4567-e89b-12d3-a456-426614174004',
}

describe('ordenes-trabajo.ts - Work Orders', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('createOT', () => {
        it('should create OT with insumos and calculate cost correctly', async () => {
            const admin = userFixtures.admin()
            const input = {
                obra_id: MOCK_IDS.OBRA,
                rubro_id: MOCK_IDS.RUBRO,
                descripcion: 'Test OT',
                cantidad: 1,
                insumos_seleccionados: [
                    { insumo_id: MOCK_IDS.INSUMO, cantidad_estimada: 10 },
                ],
            }

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            let otInsertData: any = null

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null })
                    }
                } else if (table === 'insumos') {
                    // Return actual price data so calculation can run
                    return {
                        select: vi.fn().mockReturnThis(),
                        in: vi.fn().mockReturnThis(),
                        then: vi.fn((resolve) =>
                            resolve({
                                data: [{ id: MOCK_IDS.INSUMO, precio_referencia: 100, precio_unitario: 100 }],
                                error: null,
                            })
                        )
                    }
                } else if (table === 'ordenes_trabajo') {
                    // Capture what's being inserted to validate calculation
                    return {
                        insert: vi.fn((data) => {
                            otInsertData = data
                            return {
                                select: vi.fn().mockReturnThis(),
                                single: vi.fn().mockResolvedValue({
                                    data: {
                                        id: MOCK_IDS.OT,
                                        ...data,
                                    },
                                    error: null,
                                })
                            }
                        })
                    }
                } else if (table === 'ot_insumos_estimados') {
                    return {
                        insert: vi.fn().mockResolvedValue({ error: null })
                    }
                } else if (table === 'ot_historial') {
                    return {
                        insert: vi.fn().mockResolvedValue({ error: null })
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOT(input)

            // Validate result
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.estado).toBe('borrador')
                // ACTUAL BUSINESS LOGIC VALIDATION: Cost should be calculated as 10 * 100 = 1000
                expect(result.data.costo_estimado).toBe(1000)
            }

            // Validate the insert was called with correct calculated cost
            expect(otInsertData).toBeDefined()
            expect(otInsertData.costo_estimado).toBe(1000) // 10 qty * 100 price
            expect(otInsertData.estado).toBe('borrador')
            expect(otInsertData.created_by).toBe(admin.id)
        })

        it('should calculate cost correctly with multiple insumos', async () => {
            const admin = userFixtures.admin()
            const INSUMO_2 = '123e4567-e89b-12d3-a456-426614174005'
            const INSUMO_3 = '123e4567-e89b-12d3-a456-426614174006'

            const input = {
                obra_id: MOCK_IDS.OBRA,
                rubro_id: MOCK_IDS.RUBRO,
                descripcion: 'OT with multiple materials',
                cantidad: 1,
                insumos_seleccionados: [
                    { insumo_id: MOCK_IDS.INSUMO, cantidad_estimada: 10 },  // 10 * 100 = 1000
                    { insumo_id: INSUMO_2, cantidad_estimada: 5 },          // 5 * 200 = 1000
                    { insumo_id: INSUMO_3, cantidad_estimada: 20 },         // 20 * 50 = 1000
                ],
            }

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            let otInsertData: any = null

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null })
                    }
                } else if (table === 'insumos') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        in: vi.fn().mockReturnThis(),
                        then: vi.fn((resolve) =>
                            resolve({
                                data: [
                                    { id: MOCK_IDS.INSUMO, precio_referencia: 100, precio_unitario: 100 },
                                    { id: INSUMO_2, precio_referencia: 200, precio_unitario: 200 },
                                    { id: INSUMO_3, precio_referencia: 50, precio_unitario: 50 },
                                ],
                                error: null,
                            })
                        )
                    }
                } else if (table === 'ordenes_trabajo') {
                    return {
                        insert: vi.fn((data) => {
                            otInsertData = data
                            return {
                                select: vi.fn().mockReturnThis(),
                                single: vi.fn().mockResolvedValue({
                                    data: { id: MOCK_IDS.OT, ...data },
                                    error: null,
                                })
                            }
                        })
                    }
                } else if (table === 'ot_insumos_estimados') {
                    return { insert: vi.fn().mockResolvedValue({ error: null }) }
                } else if (table === 'ot_historial') {
                    return { insert: vi.fn().mockResolvedValue({ error: null }) }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOT(input)

            // BUSINESS LOGIC VALIDATION: Total should be 1000 + 1000 + 1000 = 3000
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.costo_estimado).toBe(3000)
            }

            expect(otInsertData).toBeDefined()
            expect(otInsertData.costo_estimado).toBe(3000)
        })

        it('should handle insumos with missing prices (default to 0)', async () => {
            const admin = userFixtures.admin()
            const input = {
                obra_id: MOCK_IDS.OBRA,
                rubro_id: MOCK_IDS.RUBRO,
                descripcion: 'OT with missing price',
                cantidad: 1,
                insumos_seleccionados: [
                    { insumo_id: MOCK_IDS.INSUMO, cantidad_estimada: 10 },
                ],
            }

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            let otInsertData: any = null

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null })
                    }
                } else if (table === 'insumos') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        in: vi.fn().mockReturnThis(),
                        then: vi.fn((resolve) =>
                            resolve({
                                // Insumo with null prices
                                data: [{ id: MOCK_IDS.INSUMO, precio_referencia: null, precio_unitario: null }],
                                error: null,
                            })
                        )
                    }
                } else if (table === 'ordenes_trabajo') {
                    return {
                        insert: vi.fn((data) => {
                            otInsertData = data
                            return {
                                select: vi.fn().mockReturnThis(),
                                single: vi.fn().mockResolvedValue({
                                    data: { id: MOCK_IDS.OT, ...data },
                                    error: null,
                                })
                            }
                        })
                    }
                } else if (table === 'ot_insumos_estimados') {
                    return { insert: vi.fn().mockResolvedValue({ error: null }) }
                } else if (table === 'ot_historial') {
                    return { insert: vi.fn().mockResolvedValue({ error: null }) }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOT(input)

            // BUSINESS LOGIC: Missing prices should default to 0
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.costo_estimado).toBe(0)
            }

            expect(otInsertData.costo_estimado).toBe(0)
        })

        it('should reject creation by unauthorized role', async () => {
            const capataz = { ...userFixtures.admin(), rol: 'capataz' }
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: capataz.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios')
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: capataz, error: null }),
                    }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOT({
                obra_id: MOCK_IDS.OBRA,
                rubro_id: MOCK_IDS.RUBRO,
                descripcion: 'Test',
                cantidad: 1,
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('permisos')
            }
        })
    })

    describe('updateOT', () => {
        it('should update OT in draft state', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    update: vi.fn().mockReturnThis(),
                    delete: vi.fn().mockReturnThis(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.single.mockResolvedValue({
                        data: {
                            id: MOCK_IDS.OT,
                            estado: 'borrador',
                            obra_id: MOCK_IDS.OBRA,
                            costo_estimado: 1000,
                        },
                        error: null,
                    })
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({
                            data: {
                                id: MOCK_IDS.OT,
                                descripcion: 'Updated',
                                estado: 'borrador',
                            },
                            error: null,
                        })
                    )
                } else if (table === 'ot_insumos_estimados') {
                    mockBuilder.delete.mockResolvedValue({ error: null })
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateOT({
                id: MOCK_IDS.OT,
                descripcion: 'Updated',
            })

            expect(result.success).toBe(true)
        })

        it('should reject update if OT is not in draft', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios')
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null }),
                    }
                if (table === 'ordenes_trabajo')
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { id: MOCK_IDS.OT, estado: 'aprobada' },
                            error: null,
                        }),
                    }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateOT({ id: MOCK_IDS.OT, descripcion: 'Test' })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('borrador')
            }
        })
    })

    describe('approveOT', () => {
        it('should approve OT within budget', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    neq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    update: vi.fn().mockReturnThis(),
                    insert: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.single.mockResolvedValue({
                        data: {
                            id: MOCK_IDS.OT,
                            estado: 'borrador',
                            rubro_id: MOCK_IDS.RUBRO,
                            costo_estimado: 1000,
                            rubros: { presupuesto: 10000, presupuesto_ur: null },
                        },
                        error: null,
                    })
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({
                            data: [{ costo_estimado: 2000 }],
                            error: null,
                        })
                    )
                    mockBuilder.update.mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: { id: MOCK_IDS.OT, estado: 'aprobada' },
                                    error: null,
                                }),
                            }),
                        }),
                    })
                } else if (table === 'ot_historial') {
                    mockBuilder.insert.mockResolvedValue({ error: null })
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await approveOT({ id: MOCK_IDS.OT, acknowledge_budget_exceeded: false })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.estado).toBe('aprobada')
            }
        })

        it('should require acknowledgment when exceeding budget', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    neq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.single.mockResolvedValue({
                        data: {
                            id: MOCK_IDS.OT,
                            estado: 'borrador',
                            rubro_id: MOCK_IDS.RUBRO,
                            costo_estimado: 5000,
                            rubros: { presupuesto: 6000, presupuesto_ur: null },
                        },
                        error: null,
                    })
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({
                            data: [{ costo_estimado: 3000 }],
                            error: null,
                        })
                    )
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await approveOT({ id: MOCK_IDS.OT, acknowledge_budget_exceeded: false })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('excede')
            }
        })
    })

    describe('startOTExecution', () => {
        it('should start execution for approved OT', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    update: vi.fn().mockReturnThis(),
                    insert: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.single.mockResolvedValue({
                        data: {
                            id: MOCK_IDS.OT,
                            estado: 'aprobada',
                            obra_id: MOCK_IDS.OBRA,
                        },
                        error: null,
                    })
                    mockBuilder.update.mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: { id: MOCK_IDS.OT, estado: 'en_ejecucion' },
                                    error: null,
                                }),
                            }),
                        }),
                    })
                } else if (table === 'ot_historial') {
                    mockBuilder.insert.mockResolvedValue({ error: null })
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await startOTExecution(MOCK_IDS.OT)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.estado).toBe('en_ejecucion')
            }
        })
    })

    describe('closeOT', () => {
        it('should close OT without deviation', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    update: vi.fn().mockReturnThis(),
                    insert: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.single.mockResolvedValue({
                        data: {
                            id: MOCK_IDS.OT,
                            estado: 'en_ejecucion',
                            obra_id: MOCK_IDS.OBRA,
                            costo_estimado: 1000,
                            costo_real: 1000,
                            tareas: [],
                        },
                        error: null,
                    })
                    mockBuilder.update.mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: { id: MOCK_IDS.OT, estado: 'cerrada' },
                                    error: null,
                                }),
                            }),
                        }),
                    })
                } else if (table === 'ot_historial') {
                    mockBuilder.insert.mockResolvedValue({ error: null })
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await closeOT({ id: MOCK_IDS.OT, acknowledge_deviation: false })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.estado).toBe('cerrada')
            }
        })

        it('should require acknowledgment for cost deviation', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios')
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null }),
                    }
                if (table === 'ordenes_trabajo')
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: MOCK_IDS.OT,
                                estado: 'en_ejecucion',
                                obra_id: MOCK_IDS.OBRA,
                                costo_estimado: 1000,
                                costo_real: 1500,
                                tareas: [],
                            },
                            error: null,
                        }),
                    }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await closeOT({ id: MOCK_IDS.OT, acknowledge_deviation: false })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('desvío')
            }
        })
    })

    describe('deleteOT', () => {
        it('should soft-delete OT', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                    update: vi.fn().mockReturnThis(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.single.mockResolvedValue({
                        data: { id: MOCK_IDS.OT, obra_id: MOCK_IDS.OBRA },
                        error: null,
                    })
                    mockBuilder.then = vi.fn((resolve) => resolve({ error: null }))
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await deleteOT(MOCK_IDS.OT)

            expect(result.success).toBe(true)
        })
    })

    describe('getRubroBudgetStatus', () => {
        it('should calculate budget status correctly', async () => {
            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'rubros') {
                    mockBuilder.single.mockResolvedValue({
                        data: { presupuesto: 10000 },
                        error: null,
                    })
                } else if (table === 'ordenes_trabajo') {
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({
                            data: [
                                { costo_estimado: 2000, costo_real: null, estado: 'aprobada' },
                                { costo_estimado: 3000, costo_real: 3500, estado: 'cerrada' },
                            ],
                            error: null,
                        })
                    )
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getRubroBudgetStatus(MOCK_IDS.RUBRO)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.presupuesto).toBe(10000)
                expect(result.data.gastado).toBe(5500) // 2000 + 3500
                expect(result.data.disponible).toBe(4500)
            }
        })
    })
})
