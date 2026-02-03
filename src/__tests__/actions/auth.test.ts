import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn, signOut, getCurrentUser, hasRole } from '@/app/actions/auth'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { redirect } from 'next/navigation'
import { userFixtures } from '@/test-utils/fixtures'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(),
    getClientIdentifier: vi.fn().mockResolvedValue('127.0.0.1'),
}))

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock Supabase is handled via setup.ts for import, but we need to control return value
// Note: signIn calls createClient inside.

describe('auth.ts - Authentication', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('signIn', () => {
        it('should sign in successfully', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'password123')

            // Mock rate limit
            vi.mocked(checkRateLimit).mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: 0 })

            // Mock Supabase
            const mockClient = createMockSupabaseClient()
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            // Execute
            // signIn throws redirect on success
            try {
                await signIn(formData)
            } catch (e) {
                // Ignore redirect error if it's strictly throwing (Next.js behavior)
                // But in mock it calls vi.fn(), so it might not throw unless we mock redirect to throw.
                // Our mock for redirect does NOT throw by default.
            }

            expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            })
            expect(redirect).toHaveBeenCalledWith('/dashboard')
        })

        it('should handle missing credentials', async () => {
            const formData = new FormData()
            // Empty

            const result = await signIn(formData)

            expect(result.success).toBe(false)
            expect(result.error).toContain('requeridos')
        })

        it('should handle rate limiting', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'password123')

            vi.mocked(checkRateLimit).mockResolvedValue({
                success: false,
                error: 'Too many requests',
                limit: 5,
                remaining: 0,
                reset: 100
            })

            const result = await signIn(formData)

            expect(result.success).toBe(false)
            expect(result.error).toContain('Too many requests')
            expect(createClient).not.toHaveBeenCalled()
        })

        it('should handle Supabase login error', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'wrong')

            vi.mocked(checkRateLimit).mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: 0 })

            const mockClient = createMockSupabaseClient({
                auth: {
                    user: null,
                    session: null,
                    error: { message: 'Invalid login credentials' } as any
                }
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await signIn(formData)

            expect(result.success).toBe(false)
            expect(result.error).toContain('Email o contraseña incorrectos')
        })
    })

    describe('signOut', () => {
        it('should sign out and redirect', async () => {
            const mockClient = createMockSupabaseClient()
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            try {
                await signOut()
            } catch (e) { }

            expect(mockClient.auth.signOut).toHaveBeenCalled()
            expect(redirect).toHaveBeenCalledWith('/auth/login')
        })
    })

    describe('getCurrentUser', () => {
        it('should return user and profile when authenticated', async () => {
            const user = userFixtures.jefe()

            const mockClient = createMockSupabaseClient({
                auth: { user: { id: user.auth_user_id } as any, session: null, error: null }
            })

            mockClient.from = vi.fn().mockImplementation((table) => {
                if (table === 'usuarios') {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: user, error: null })
                    }
                }
                return { select: vi.fn().mockReturnThis() }
            })

            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getCurrentUser()

            expect(result).not.toBeNull()
            expect(result?.user?.id).toBe(user.auth_user_id)
            expect(result?.profile?.rol).toBe('jefe_obra')
        })

        it('should return null when not authenticated', async () => {
            const mockClient = createMockSupabaseClient({
                auth: { user: null, session: null, error: { message: 'No session' } as any }
            })
            vi.mocked(createClient).mockResolvedValue(mockClient as any)

            const result = await getCurrentUser()

            expect(result).toBeNull()
        })
    })

    describe('hasRole', () => {
        it('should return true if user has allowed role', async () => {
            const user = userFixtures.admin()

            const mockClient = createMockSupabaseClient({
                auth: { user: { id: user.auth_user_id } as any, session: null, error: null }
            })

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

            const allowed = await hasRole(['admin', 'director_obra'])
            expect(allowed).toBe(true)
        })

        it('should return false if user does not have allowed role', async () => {
            const user = userFixtures.jefe() // role: jefe_obra

            const mockClient = createMockSupabaseClient({
                auth: { user: { id: user.auth_user_id } as any, session: null, error: null }
            })

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

            const allowed = await hasRole(['admin'])
            expect(allowed).toBe(false)
        })
    })
})
