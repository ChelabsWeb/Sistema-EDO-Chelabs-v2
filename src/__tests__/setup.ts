import { vi, afterEach } from 'vitest'

// Global mock clearance
afterEach(() => {
  vi.clearAllMocks()
  vi.resetAllMocks()
})
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock costos actions
vi.mock('@/app/actions/costos', () => ({
  updateOTCostoReal: vi.fn(() => Promise.resolve({ success: true, data: 0 })),
  calculateOTCostoReal: vi.fn(),
  getOTCostSummary: vi.fn(),
}))
