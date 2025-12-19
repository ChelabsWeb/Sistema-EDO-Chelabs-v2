# Story 1.1: Project Initialization

Status: completed

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to initialize the project with Next.js, shadcn/ui, and Supabase,
so that I have a solid foundation to build the application.

## Acceptance Criteria

1. **AC1:** A Next.js 14 project is created with App Router and TypeScript
2. **AC2:** shadcn/ui is configured with the default theme
3. **AC3:** Supabase client packages are installed (@supabase/supabase-js, @supabase/ssr)
4. **AC4:** Path aliases (@/*) are configured in tsconfig.json
5. **AC5:** Environment variables template (.env.example) is created
6. **AC6:** The project runs successfully on localhost:3000

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js project with correct flags (AC: 1, 4)
  - [x] 1.1: Run `npx create-next-app@latest` with --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  - [x] 1.2: Verify project structure matches App Router pattern (src/app/)
  - [x] 1.3: Verify TypeScript strict mode in tsconfig.json
  - [x] 1.4: Verify path aliases (@/*) work correctly

- [x] Task 2: Initialize shadcn/ui (AC: 2)
  - [x] 2.1: Run `npx shadcn@latest init --defaults`
  - [x] 2.2: Verify components.json is created with correct paths
  - [x] 2.3: Verify globals.css has CSS variables for theming
  - [x] 2.4: Install a test component (Button) to verify setup: `npx shadcn@latest add button`

- [x] Task 3: Install Supabase packages (AC: 3)
  - [x] 3.1: Run `npm install @supabase/supabase-js @supabase/ssr` (already installed)
  - [x] 3.2: Create `src/lib/supabase/client.ts` for browser client (already existed)
  - [x] 3.3: Create `src/lib/supabase/server.ts` for server client (already existed)
  - [x] 3.4: Create `src/lib/supabase/middleware.ts` for middleware helper (already existed)

- [x] Task 4: Configure environment variables (AC: 5)
  - [x] 4.1: Create `.env.local.example` with required Supabase variables
  - [x] 4.2: Create `.env.local` (gitignored) with placeholder values (user must configure)
  - [x] 4.3: Add .env.local to .gitignore if not already present

- [x] Task 5: Create base project structure (AC: 1)
  - [x] 5.1: Create directory structure per architecture document
  - [x] 5.2: Create `src/types/index.ts` with Result<T> type
  - [x] 5.3: Create `src/types/app.ts` with AppError type
  - [x] 5.4: Create `src/lib/utils.ts` with cn() utility from shadcn (created by shadcn init)

- [x] Task 6: Verify project runs (AC: 6)
  - [x] 6.1: Run `npm run dev` and verify localhost:3000 loads (Next.js 16.0.10 starts successfully)
  - [x] 6.2: Verify no TypeScript errors (`npx tsc --noEmit` passed)
  - [x] 6.3: Verify no ESLint errors with `npm run lint` (passed)

## Dev Notes

### Architecture Requirements (from architecture.md)

This story implements ARCH1-ARCH5 from the architecture document:

- **ARCH1:** Next.js 14 with App Router
- **ARCH2:** TypeScript strict mode
- **ARCH3:** Tailwind CSS 3.4+
- **ARCH4:** shadcn/ui with CSS variables
- **ARCH5:** Path aliases (@/*)

### Initialization Commands (EXACT)

```bash
# 1. Create Next.js project (use npm, NOT yarn or pnpm)
npx create-next-app@latest sistema-edo-chelabs \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm

# 2. Initialize shadcn/ui
cd sistema-edo-chelabs
npx shadcn@latest init -y

# 3. Install Supabase
npm install @supabase/supabase-js @supabase/ssr
```

### Project Structure Notes

The following directories MUST be created (per architecture.md):

```text
src/
├── app/
│   ├── (auth)/           # Route group for unauthenticated pages
│   ├── (dashboard)/      # Route group for authenticated pages
│   ├── actions/          # Server Actions
│   └── api/              # API routes (webhooks only)
├── components/
│   ├── ui/               # shadcn/ui (auto-generated)
│   ├── edo/              # Domain components
│   │   ├── shared/       # Shared components
│   │   ├── ot/           # OT-related
│   │   ├── obra/         # Obra-related
│   │   ├── tareas/       # Task-related
│   │   ├── consumos/     # Consumption-related
│   │   └── dashboard/    # Dashboard widgets
│   ├── forms/            # Reusable forms
│   └── layouts/          # Layout components
├── hooks/                # Custom hooks
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── queries/          # React Query hooks
│   └── validations/      # Zod schemas
├── stores/               # Zustand stores
└── types/                # TypeScript types
```

### Supabase Client Setup

#### Browser Client (src/lib/supabase/client.ts)

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### Server Client (src/lib/supabase/server.ts)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
      },
    }
  );
}
```

#### Middleware Helper (src/lib/supabase/middleware.ts)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
```

### Environment Variables Template (.env.example)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Type Definitions

#### Result Type (src/types/index.ts)

```typescript
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type { AppError } from './app';
```

#### AppError Type (src/types/app.ts)

```typescript
export type AppError = {
  code: string;
  message: string;
  details?: unknown;
};
```

### Critical Implementation Notes

1. **Package Manager:** Use npm ONLY (not yarn or pnpm) - per architecture decision
2. **TypeScript Strict:** Verify `strict: true` in tsconfig.json
3. **Path Aliases:** The `@/*` alias should point to `./src/*`
4. **ESLint:** Use the Next.js default ESLint config
5. **Do NOT install React Query or Zustand yet** - those are for Story 1.2+

### References

- [Source: _bmad-output/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/architecture.md#Initialization Commands]
- [Source: _bmad-output/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/project-context.md#Technology Stack & Versions]
- [Source: _bmad-output/epics.md#Story 1.1: Project Initialization]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- Project was already partially initialized with Next.js 16, TypeScript, Tailwind, and Supabase packages
- shadcn/ui was initialized using `npx shadcn@latest init --defaults` (the `-y` flag alone was insufficient)
- Button component added to verify shadcn/ui setup
- Directory structure created per architecture document with .gitkeep files for empty directories
- Result<T> and AppError types created in src/types/
- All TypeScript and ESLint checks pass

### File List

**Created/Modified:**
- `components.json` - shadcn/ui configuration
- `src/lib/utils.ts` - cn() utility (auto-created by shadcn)
- `src/components/ui/button.tsx` - Button component (auto-created by shadcn)
- `.env.local.example` - Updated with complete environment variables
- `src/types/app.ts` - AppError type definition
- `src/types/index.ts` - Result<T> type pattern
- `src/app/(auth)/.gitkeep` - Route group placeholder
- `src/app/(dashboard)/.gitkeep` - Route group placeholder
- `src/app/actions/.gitkeep` - Server Actions placeholder
- `src/app/api/.gitkeep` - API routes placeholder
- `src/components/edo/shared/.gitkeep` - Shared components placeholder
- `src/components/edo/ot/.gitkeep` - OT components placeholder
- `src/components/edo/obra/.gitkeep` - Obra components placeholder
- `src/components/edo/tareas/.gitkeep` - Task components placeholder
- `src/components/edo/consumos/.gitkeep` - Consumption components placeholder
- `src/components/edo/dashboard/.gitkeep` - Dashboard components placeholder
- `src/components/forms/.gitkeep` - Forms placeholder
- `src/components/layouts/.gitkeep` - Layouts placeholder
- `src/hooks/.gitkeep` - Hooks placeholder
- `src/stores/.gitkeep` - Zustand stores placeholder
- `src/lib/queries/.gitkeep` - React Query hooks placeholder
- `src/lib/validations/.gitkeep` - Zod schemas placeholder

**Pre-existing (verified):**
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/middleware.ts` - Middleware helper
- `src/types/database.ts` - Database types placeholder

### Change Log

- 2025-12-18: Story implemented - Project foundation established with Next.js 16, shadcn/ui, Supabase, and proper directory structure

