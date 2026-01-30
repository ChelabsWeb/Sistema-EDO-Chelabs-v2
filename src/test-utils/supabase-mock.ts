import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a mock Supabase client for testing
 * Provides chainable methods for common Supabase operations
 */
export function createMockSupabaseClient(overrides: Partial<MockSupabaseConfig> = {}): SupabaseClient {
    const config: MockSupabaseConfig = {
        auth: {
            user: overrides.auth?.user || null,
            session: overrides.auth?.session || null,
            error: overrides.auth?.error || null,
        },
        select: overrides.select || { data: [], error: null },
        insert: overrides.insert || { data: null, error: null },
        update: overrides.update || { data: null, error: null },
        delete: overrides.delete || { data: null, error: null },
        single: overrides.single || { data: null, error: null },
    }

    const mockClient = {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: config.auth.user },
                error: config.auth.error,
            }),
            getSession: vi.fn().mockResolvedValue({
                data: { session: config.auth.session },
                error: config.auth.error,
            }),
            signInWithPassword: vi.fn().mockResolvedValue({
                data: { user: config.auth.user, session: config.auth.session },
                error: config.auth.error,
            }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        like: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        containedBy: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(config.single),
        maybeSingle: vi.fn().mockResolvedValue(config.single),
    } as unknown as SupabaseClient

        // Setup chainable responses
        ; (mockClient.select as any).mockImplementation(() => {
            const chain = {
                ...mockClient,
                then: (resolve: any) => resolve(config.select),
            }
            return chain
        })
        ; (mockClient.insert as any).mockImplementation(() => {
            const chain = {
                ...mockClient,
                then: (resolve: any) => resolve(config.insert),
            }
            return chain
        })
        ; (mockClient.update as any).mockImplementation(() => {
            const chain = {
                ...mockClient,
                then: (resolve: any) => resolve(config.update),
            }
            return chain
        })
        ; (mockClient.delete as any).mockImplementation(() => {
            const chain = {
                ...mockClient,
                then: (resolve: any) => resolve(config.delete),
            }
            return chain
        })

    return mockClient
}

/**
 * Mock Supabase configuration interface
 */
export interface MockSupabaseConfig {
    auth: {
        user: any
        session: any
        error: any
    }
    select: {
        data: any
        error: any
    }
    insert: {
        data: any
        error: any
    }
    update: {
        data: any
        error: any
    }
    delete: {
        data: any
        error: any
    }
    single: {
        data: any
        error: any
    }
}

/**
 * Mocks the createClient function from @/lib/supabase/server
 */
export function mockSupabaseServer(client: SupabaseClient) {
    vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(client),
    }))
}

/**
 * Clears all Supabase mocks
 */
export function clearSupabaseMocks() {
    vi.clearAllMocks()
}
