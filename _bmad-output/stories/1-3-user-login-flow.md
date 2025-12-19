# Story 1.3: User Login Flow

Status: completed

## Story

As a user (DO, JO, or Compras),
I want to log in with my email and password,
So that I can access the system securely.

## Acceptance Criteria

1. **AC1:** User can access login page at /login
2. **AC2:** User can enter email and password and authenticate via Supabase Auth
3. **AC3:** A secure session cookie is created on successful login
4. **AC4:** User is redirected to /dashboard after successful login
5. **AC5:** Error messages are displayed in Spanish ("Email o contraseña incorrectos")
6. **AC6:** Unauthenticated users are redirected to /login when accessing protected routes

## Tasks / Subtasks

- [x] Task 1: Review existing auth infrastructure (AC: 1-6)
  - [x] 1.1: Found login page at /auth/login with Supabase integration
  - [x] 1.2: Found middleware.ts with route protection
  - [x] 1.3: Found Supabase client/server helpers
  - [x] 1.4: Found auth callback and signout routes

- [x] Task 2: Add Spanish error messages (AC: 5)
  - [x] 2.1: Created translateError function with Spanish translations
  - [x] 2.2: Updated login page to use translated errors

- [x] Task 3: Create auth Server Actions (AC: 2, 3)
  - [x] 3.1: Created src/app/actions/auth.ts
  - [x] 3.2: Implemented signIn action with form data handling
  - [x] 3.3: Implemented signOut action
  - [x] 3.4: Implemented getCurrentUser helper
  - [x] 3.5: Implemented hasRole helper for role-based access

- [x] Task 4: Add /login redirect route (AC: 1)
  - [x] 4.1: Created src/app/login/page.tsx that redirects to /auth/login

- [x] Task 5: Verify TypeScript compilation (AC: 1-6)
  - [x] 5.1: Fixed type issues in auth.ts
  - [x] 5.2: `npx tsc --noEmit` passes with no errors

## Dev Notes

### Technical Implementation

**Login Flow:**
1. User visits /login → redirected to /auth/login
2. User enters credentials → client-side Supabase auth
3. On success → cookie set automatically by @supabase/ssr
4. Router pushes to /dashboard and refreshes

**Route Protection:**
- Middleware in src/middleware.ts intercepts all routes
- Uses updateSession from src/lib/supabase/middleware.ts
- Unauthenticated users → redirect to /auth/login
- Authenticated users on /auth/* → redirect to /dashboard

**Error Translation:**
- Supabase errors are translated to Spanish
- Common errors: "Invalid login credentials" → "Email o contraseña incorrectos"

### Files Structure

```
src/
├── app/
│   ├── actions/
│   │   └── auth.ts           # Server Actions for auth
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx      # Login page component
│   │   └── callback/
│   │       └── route.ts      # OAuth callback handler
│   ├── login/
│   │   └── page.tsx          # Redirect to /auth/login
│   └── api/
│       └── auth/
│           └── signout/
│               └── route.ts  # Signout API route
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser client
│       ├── server.ts         # Server client
│       └── middleware.ts     # Session management
└── middleware.ts             # Route protection
```

### Covers

- FR7: Authentication with email/password via Supabase Auth
- NFR10: Email + password authentication
- NFR14: JWT with cookie-based sessions
- ARCH11: @supabase/ssr for cookie-based sessions
- ARCH12: middleware.ts for route protection
- ARCH13: Server Actions in src/app/actions/auth.ts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Auth infrastructure was already largely in place from Story 1.1
- Added Spanish error translations for better UX
- Created Server Actions following ARCH13 pattern
- Added /login redirect for AC compliance
- All TypeScript compilation passes

### File List

**Created:**
- `src/app/actions/auth.ts` - Server Actions for authentication
- `src/app/login/page.tsx` - Redirect to /auth/login

**Modified:**
- `src/app/auth/login/page.tsx` - Added translateError function for Spanish errors

**Pre-existing (verified):**
- `src/middleware.ts` - Route protection
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/lib/supabase/middleware.ts` - Session management
- `src/app/auth/callback/route.ts` - OAuth callback
- `src/app/api/auth/signout/route.ts` - Signout handler
- `src/app/dashboard/page.tsx` - Dashboard with auth check

### Change Log

- 2025-12-18: Story implemented - Login flow with Spanish errors and Server Actions
