import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getUsuariosByObra,
    getUnassignedUsuarios,
    assignUsuarioToObra,
    unassignUsuarioFromObra,
    getAllUsuarios,
} from '@/app/actions/usuarios-obra'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

const MOCK_IDS = {
    OBRA: '123e4567-e89b-12d3-a456-426614174000',
    USER: '123e4567-e89b-12d3-a456-426614174001',
}

describe('usuarios-obra.ts - User-Obra Assignments', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('getUsuariosByObra', () => {
        it('should return users assigned to obra', async () => {
            const mockClient = createMockSupabaseClient()
            const mockUsers = [{ id: MOCK_IDS.USER, nombre: 'Test User', obra_id: MOCK_IDS.OBRA }]

            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getUsuariosByObra(MOCK_IDS.OBRA)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(1)
            }
        })
    })

    describe('getUnassignedUsuarios', () => {
        it('should return unassigned users for admin', async () => {
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
                    is: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({ data: [{ id: 'unassigned-user', obra_id: null }], error: null })
                    )
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getUnassignedUsuarios()

            expect(result.success).toBe(true)
        })

        it('should reject non-admin', async () => {
            const jefe = { ...userFixtures.admin(), rol: 'jefe_obra' }
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: jefe.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: jefe, error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getUnassignedUsuarios()

            expect(result.success).toBe(false)
        })
    })

    describe('assignUsuarioToObra', () => {
        it('should assign user to obra as admin', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null }),
                        update: vi.fn().mockReturnThis(),
                        then: vi.fn((resolve) =>
                            resolve({ data: { id: MOCK_IDS.USER, obra_id: MOCK_IDS.OBRA }, error: null })
                        ),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await assignUsuarioToObra(MOCK_IDS.USER, MOCK_IDS.OBRA)

            expect(result.success).toBe(true)
        })
    })

    describe('unassignUsuarioFromObra', () => {
        it('should unassign user from obra as admin', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            let callCount = 0
            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    callCount++
                    const mockBuilder: any = {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn(),
                        update: vi.fn().mockReturnThis(),
                    }

                    if (callCount === 1) {
                        mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                    } else if (callCount === 2) {
                        mockBuilder.single.mockResolvedValue({
                            data: { obra_id: MOCK_IDS.OBRA },
                            error: null,
                        })
                    } else {
                        mockBuilder.then = vi.fn((resolve) => resolve({ error: null }))
                    }

                    return mockBuilder
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await unassignUsuarioFromObra(MOCK_IDS.USER)

            expect(result.success).toBe(true)
        })
    })

    describe('getAllUsuarios', () => {
        it('should return all users with obra info for admin', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: admin, error: null }),
                        order: vi.fn().mockResolvedValue({
                            data: [{ id: MOCK_IDS.USER, obras: { id: MOCK_IDS.OBRA, nombre: 'Test Obra' } }],
                            error: null,
                        }),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getAllUsuarios()

            expect(result.success).toBe(true)
        })
    })
})
