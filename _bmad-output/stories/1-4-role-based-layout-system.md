# Story 1.4: Role-Based Layout System

Status: completed

## Story

As a user,
I want to see a layout appropriate to my role,
So that I have an optimized experience for my work context.

## Acceptance Criteria

1. **AC1:** JO always sees mobile layout with bottom navigation (h-16), even on desktop
2. **AC2:** DO and Compras on desktop (≥768px) see sidebar navigation (w-64)
3. **AC3:** DO and Compras on mobile (<768px) see mobile layout with collapsible navigation
4. **AC4:** Hook `useRoleBasedLayout()` determines correct layout based on role and viewport
5. **AC5:** Layout components are organized in src/components/layouts/

## Tasks / Subtasks

- [x] Task 1: Review existing layout components (AC: 5)
  - [x] 1.1: Found only shadcn/ui button component exists
  - [x] 1.2: No hooks directory existed

- [x] Task 2: Create useRoleBasedLayout hook (AC: 4)
  - [x] 2.1: Created src/hooks/useRoleBasedLayout.ts
  - [x] 2.2: Implemented viewport detection with resize listener
  - [x] 2.3: JO always returns mobile layout
  - [x] 2.4: DO/Compras/Admin respect viewport breakpoint (768px)
  - [x] 2.5: Added helper functions: getRoleDisplayName, getRoleAbbreviation

- [x] Task 3: Create DesktopSidebar layout (AC: 2)
  - [x] 3.1: Created src/components/layouts/DesktopSidebar.tsx
  - [x] 3.2: Fixed width w-64 per UX spec
  - [x] 3.3: Navigation items filtered by role
  - [x] 3.4: User info section with signout

- [x] Task 4: Create MobileBottomNav layout (AC: 1)
  - [x] 4.1: Created src/components/layouts/MobileBottomNav.tsx
  - [x] 4.2: Fixed height h-16 per UX spec
  - [x] 4.3: Touch targets min 48px per UX9
  - [x] 4.4: Camera shortcut for JO role

- [x] Task 5: Create MobileHeader component (AC: 3)
  - [x] 5.1: Created src/components/layouts/MobileHeader.tsx
  - [x] 5.2: Compact header with role badge

- [x] Task 6: Create RoleBasedLayout wrapper (AC: 1-3)
  - [x] 6.1: Created src/components/layouts/RoleBasedLayout.tsx
  - [x] 6.2: Conditionally renders sidebar or mobile nav based on hook
  - [x] 6.3: Proper content offsets (ml-64 for desktop, pt-14 pb-16 for mobile)

- [x] Task 7: Update dashboard with new layouts (AC: 1-5)
  - [x] 7.1: Created (dashboard) route group with layout.tsx
  - [x] 7.2: Layout fetches user profile and passes to client component
  - [x] 7.3: Created DashboardLayoutClient wrapper
  - [x] 7.4: Created new dashboard page with proper structure
  - [x] 7.5: Created profile page for mobile nav

- [x] Task 8: Verify TypeScript compilation (AC: 1-5)
  - [x] 8.1: `npx tsc --noEmit` passes with no errors

## Dev Notes

### Layout Strategy

Per UX design specification:
- JO (jefe_obra) ALWAYS gets mobile layout regardless of viewport
- DO (director_obra), Compras, Admin get desktop layout on ≥768px
- Mobile breakpoint: 768px (md in Tailwind)

### Component Structure

```
src/
├── hooks/
│   ├── index.ts
│   └── useRoleBasedLayout.ts
└── components/
    └── layouts/
        ├── index.ts
        ├── RoleBasedLayout.tsx      # Main wrapper
        ├── DesktopSidebar.tsx       # w-64 sidebar for desktop
        ├── MobileBottomNav.tsx      # h-16 bottom nav for mobile
        ├── MobileHeader.tsx         # Header for mobile
        └── DashboardLayoutClient.tsx # Client wrapper for layout
```

### Route Groups

```
src/app/
├── (auth)/              # Auth routes (login, etc)
├── (dashboard)/         # Protected routes with RoleBasedLayout
│   ├── layout.tsx       # Server component that provides user context
│   ├── dashboard/
│   │   └── page.tsx
│   └── perfil/
│       └── page.tsx
├── auth/                # Auth pages (callback, login)
└── api/                 # API routes
```

### Hook Usage

```typescript
const { layoutType, isMobile, isDesktop, showBottomNav, showSidebar } = useRoleBasedLayout({
  role: userRole
})
```

### UX Requirements Implemented

- UX1: JO always mobile layout ✅
- UX2: Desktop sidebar w-64 ✅
- UX3: Mobile bottom nav h-16 ✅
- UX4: useRoleBasedLayout() hook ✅
- UX9: Touch targets ≥48px ✅

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created complete layout system from scratch
- Hook detects role and viewport to determine layout type
- JO forced to mobile layout regardless of screen size
- Navigation items filtered by role permissions
- Profile page created for mobile nav destination

### File List

**Created:**
- `src/hooks/index.ts` - Hook exports
- `src/hooks/useRoleBasedLayout.ts` - Layout determination hook
- `src/components/layouts/index.ts` - Layout component exports
- `src/components/layouts/RoleBasedLayout.tsx` - Main layout wrapper
- `src/components/layouts/DesktopSidebar.tsx` - Desktop sidebar
- `src/components/layouts/MobileBottomNav.tsx` - Mobile bottom navigation
- `src/components/layouts/MobileHeader.tsx` - Mobile header
- `src/components/layouts/DashboardLayoutClient.tsx` - Client wrapper
- `src/app/(dashboard)/layout.tsx` - Dashboard route group layout
- `src/app/(dashboard)/dashboard/page.tsx` - Dashboard page
- `src/app/(dashboard)/perfil/page.tsx` - Profile page

### Change Log

- 2025-12-18: Story implemented - Role-based layout system with hook and components
