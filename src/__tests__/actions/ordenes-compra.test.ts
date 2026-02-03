import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrdenCompra, updateOCEstado, getOrdenesCompra } from '@/app/actions/ordenes-compra'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

const MOCK_IDS = {
    OBRA: '123e4567-e89b-12d3-a456-426614174000',
    OT: '123e4567-e89b-12d3-a456-426614174001',
    OC: '123e4567-e89b-12d3-a456-426614174002',
    INSUMO: '123e4567-e89b-12d3-a456-426614174003',
    USER: '123e4567-e89b-12d3-a456-426614174004'
}

describe('ordenes-compra.ts - Purchase Orders', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('createOrdenCompra', () => {
        const validLineas = [
            { insumo_id: MOCK_IDS.INSUMO, cantidad: 10, precio_unitario: 100 }
        ]

        const validInput = {
            obra_id: MOCK_IDS.OBRA,
            ot_id: MOCK_IDS.OT,
            proveedor: 'Acme Corp',
            rut_proveedor: '211234560014',
            condiciones_pago: '30 días',
            lineas: validLineas
        }

        it('should create OC successfully when OT is valid', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()

            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn(),
                    insert: vi.fn(),
                    update: vi.fn(),
                    eq: vi.fn(),
                    is: vi.fn(),
                    single: vi.fn(),
                }

                // Chain defaults
                mockBuilder.select.mockReturnThis()
                mockBuilder.insert.mockReturnThis()
                mockBuilder.update.mockReturnThis()
                mockBuilder.eq.mockReturnThis()
                mockBuilder.is.mockReturnThis()

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                    return mockBuilder
                }

                if (table === 'ordenes_trabajo') {
                    // Check OT existence and validation
                    mockBuilder.single.mockResolvedValue({
                        data: { id: MOCK_IDS.OT, obra_id: MOCK_IDS.OBRA, estado: 'en_ejecucion' },
                        error: null
                    })
                    return mockBuilder
                }

                if (table === 'ordenes_compra') {
                    mockBuilder.single.mockResolvedValue({
                        data: { id: MOCK_IDS.OC, numero: 1, total: 1000 },
                        error: null
                    })
                    return mockBuilder
                }

                if (table === 'lineas_oc') {
                    mockBuilder.insert.mockResolvedValue({ error: null })
                    return mockBuilder
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOrdenCompra(validInput)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.id).toBe(MOCK_IDS.OC)
            }
        })

        it('should fail if OT does not belong to obra', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: admin, error: null })
                }
                if (table === 'ordenes_trabajo') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: { id: MOCK_IDS.OT, obra_id: 'other-obra-id', estado: 'en_ejecucion' },
                        error: null
                    })
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOrdenCompra(validInput)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('no pertenece')
            }
        })

        it('should handle unauthenticated user', async () => {
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null } as any)
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOrdenCompra(validInput)
            expect(result.success).toBe(false)
        })

        it('should handle missing OT', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: admin, error: null })
                }
                if (table === 'ordenes_trabajo') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOrdenCompra(validInput)
            expect(result.success).toBe(false)
        })

        it('should handle database insertion error', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: admin, error: null })
                }
                if (table === 'ordenes_trabajo') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    is: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: { id: MOCK_IDS.OT, obra_id: MOCK_IDS.OBRA, estado: 'en_ejecucion' },
                        error: null
                    })
                }
                if (table === 'ordenes_compra') return {
                    insert: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await createOrdenCompra(validInput)
            expect(result.success).toBe(false)
        })
    })

    describe('updateOCEstado', () => {
        it('should allow valid transition from pendiente to enciada by compras', async () => {
            // Fix: 'compras' role user fixture? admin works too.
            const user = { ...userFixtures.admin(), rol: 'compras' }

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: user.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: user, error: null })
                }
                if (table === 'ordenes_compra') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: { id: MOCK_IDS.OC, estado: 'pendiente' }, error: null }),
                    update: vi.fn().mockReturnThis(),
                    then: vi.fn((resolve) => resolve({ error: null }))
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateOCEstado(MOCK_IDS.OC, 'enviada')

            expect(result.success).toBe(true)
        })

        it('should prevent invalid transitions', async () => {
            const user = { ...userFixtures.admin(), rol: 'compras' }
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: user.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: user, error: null })
                }
                if (table === 'ordenes_compra') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: { id: MOCK_IDS.OC, estado: 'pendiente' }, error: null }),
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateOCEstado(MOCK_IDS.OC, 'recibida_completa' as any) // Invalid from pendiente

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.code).toBe('BIZ_001')
            }
        })

        it('should handle missing OC on update', async () => {
            const user = { ...userFixtures.admin(), rol: 'compras' }
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: user.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: user, error: null })
                }
                if (table === 'ordenes_compra') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await updateOCEstado('nonexistent', 'enviada')
            expect(result.success).toBe(false)
        })
    })

    describe('getOrdenesCompra', () => {
        it('should list OCs with filters', async () => {
            const admin = userFixtures.admin()
            const mockData = [{ id: MOCK_IDS.OC, estado: 'pendiente' }]

            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({ data: { user: { id: admin.auth_user_id } }, error: null } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: admin, error: null })
                }
                if (table === 'ordenes_compra') {
                    const chain: any = {
                        then: vi.fn((resolve) => resolve({ data: mockData, error: null }))
                    }
                    chain.select = vi.fn().mockReturnValue(chain)
                    chain.eq = vi.fn().mockReturnValue(chain)
                    chain.gte = vi.fn().mockReturnValue(chain)
                    chain.lte = vi.fn().mockReturnValue(chain)
                    chain.order = vi.fn().mockReturnValue(chain)
                    return chain
                }
                return {}
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getOrdenesCompra({ estado: 'pendiente' })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(1)
            }
        })
    })
})
