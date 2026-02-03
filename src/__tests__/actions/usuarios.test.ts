import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    getUsuarios,
    getUsuario,
    createUsuario,
    updateUsuario,
    deactivateUsuario,
} from '@/app/actions/usuarios'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}))

const MOCK_IDS = {
    USER: '123e4567-e89b-12d3-a456-426614174000',
    AUTH_USER: '123e4567-e89b-12d3-a456-426614174001',
}

describe('usuarios.ts - User Management', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    describe('getUsuarios', () => {
        it('should return all users for admin', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: admin.auth_user_id } },
                error: null,
            } as any)

            const mockUsers = [admin, { ...admin, id: 'user-2', email: 'user2@test.com' }]

            mockClient.from = vi.fn().mockImplementation((table) => {
                const mockBuilder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    single: vi.fn(),
                }

                if (table === 'usuarios') {
                    mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                    mockBuilder.then = vi.fn((resolve) =>
                        resolve({ data: mockUsers, error: null })
                    )
                }

                return mockBuilder
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getUsuarios()

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toHaveLength(2)
            }
        })

        it('should reject unauthorized role', async () => {
            const capataz = { ...userFixtures.admin(), rol: 'capataz' }
            const mockClient = createMockSupabaseClient()
            mockClient.auth.getUser = vi.fn().mockResolvedValue({
                data: { user: { id: capataz.auth_user_id } },
                error: null,
            } as any)

            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: capataz, error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getUsuarios()

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('autorizado')
            }
        })
    })

    describe('getUsuario', () => {
        it('should return a single user by ID', async () => {
            const admin = userFixtures.admin()
            const mockClient = createMockSupabaseClient()

            mockClient.from = vi.fn().mockImplementation(() => ({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: admin, error: null }),
            }))

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getUsuario(MOCK_IDS.USER)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.id).toBe(admin.id)
            }
        })
    })

    describe('createUsuario', () => {
        it('should create a new user as admin', async () => {
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
                    }

                    // First call: get current user profile
                    // Second call: check for existing email
                    if (callCount === 1) {
                        mockBuilder.single.mockResolvedValue({ data: admin, error: null })
                    } else {
                        mockBuilder.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
                    }

                    return mockBuilder
                }
                return {}
            })

            // Mock admin client
            const mockAdminClient: any = {
                auth: {
                    admin: {
                        createUser: vi.fn().mockResolvedValue({
                            data: { user: { id: MOCK_IDS.AUTH_USER, email: 'newuser@test.com' } },
                            error: null,
                        }),
                        generateLink: vi.fn().mockResolvedValue({ data: {}, error: null }),
                    },
                },
                from: vi.fn().mockReturnValue({
                    update: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            }

            vi.mocked(createAdminClient).mockReturnValue(mockAdminClient)
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const formData = new FormData()
            formData.append('email', 'newuser@test.com')
            formData.append('nombre', 'New User')
            formData.append('rol', 'jefe_obra')

            const result = await createUsuario(formData)

            expect(result.success).toBe(true)
            expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalled()
        })

        it('should reject duplicate email', async () => {
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
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: callCount === 1 ? admin : { id: 'existing', email: 'existing@test.com' },
                            error: null,
                        }),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const formData = new FormData()
            formData.append('email', 'existing@test.com')
            formData.append('nombre', 'Existing User')
            formData.append('rol', 'jefe_obra')

            const result = await createUsuario(formData)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('Ya existe')
            }
        })
    })

    describe('updateUsuario', () => {
        it('should update user profile as admin', async () => {
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
                        then: vi.fn((resolve) => resolve({ error: null })),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const formData = new FormData()
            formData.append('nombre', 'Updated Name')
            formData.append('rol', 'jefe_obra')
            formData.append('activo', 'true')

            const result = await updateUsuario(MOCK_IDS.USER, formData)

            expect(result.success).toBe(true)
        })
    })

    describe('deactivateUsuario', () => {
        it('should deactivate user as admin', async () => {
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
                        then: vi.fn((resolve) => resolve({ error: null })),
                    }
                }
                return {}
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await deactivateUsuario(MOCK_IDS.USER)

            expect(result.success).toBe(true)
        })

        it('should reject deactivation by unauthorized role', async () => {
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

            const result = await deactivateUsuario(MOCK_IDS.USER)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('autorizado')
            }
        })
    })
})
