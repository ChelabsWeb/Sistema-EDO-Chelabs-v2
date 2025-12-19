---
project_name: 'Sistema-EDO-Chelabs-v2'
user_name: 'Estudiante UCU'
date: '2025-12-17'
status: 'complete'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 (App Router) | Full-stack framework |
| React | 18/19 | UI library |
| TypeScript | Strict mode | Type safety |
| Tailwind CSS | 3.4+ | Styling |
| shadcn/ui | latest | UI components |
| Supabase | latest | PostgreSQL + Auth + Storage |
| React Query | TanStack v5 | Server state management |
| Zustand | 4.x | Client state (UI only) |
| Zod | 3.x | Validation |
| React Hook Form | 7.x | Form handling |

---

## Critical Implementation Rules

### 1. Core Philosophy: "Alertar, no bloquear"

The system NEVER blocks user actions. It alerts and warns but always allows continuation.

```typescript
// CORRECT: Alert but don't block
if (consumo > estimado * 1.2) {
  showWarning("Desvio critico detectado");
  // Still allow the operation to proceed
}

// WRONG: Blocking the user
if (consumo > estimado * 1.2) {
  throw new Error("Cannot exceed budget");
}
```

### 2. Database-First Modeling

ALWAYS design schema first, then generate types. NEVER manually create TypeScript types for database entities.

```bash
# Workflow:
1. Create/modify SQL in supabase/migrations/
2. Apply: supabase db push
3. Generate: supabase gen types typescript --local > src/types/database.ts
4. Use: Database['public']['Tables']['ots']['Row']
```

### 3. Result Pattern for Server Actions

ALL Server Actions MUST return `Result<T, E>`. Never throw errors.

```typescript
// CORRECT
export async function createOT(data: OTInput): Promise<Result<OT>> {
  const validation = otSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.message } };
  }
  // ...
  return { success: true, data: newOT };
}

// WRONG
export async function createOT(data: OTInput): Promise<OT> {
  if (!isValid(data)) throw new Error("Invalid");
  return newOT;
}
```

### 4. RLS is the Security Layer

Trust RLS policies. Don't duplicate authorization logic in code.

```typescript
// CORRECT: Let RLS handle filtering
const { data } = await supabase.from('ots').select('*');
// RLS automatically filters by user's obra_id

// WRONG: Manual filtering
const { data } = await supabase.from('ots').select('*');
const filtered = data.filter(ot => userObras.includes(ot.obra_id));
```

### 5. Role-Based Layout (JO is ALWAYS Mobile)

```typescript
// JO users ALWAYS get mobile layout regardless of viewport
const layout = user.role === 'JO' ? 'mobile' : getResponsiveLayout();
```

---

## Naming Conventions

### Database (PostgreSQL)

| Element | Pattern | Example |
|---------|---------|---------|
| Tables | snake_case, plural | `obras`, `orden_trabajos`, `usuario_obras` |
| Columns | snake_case | `obra_id`, `fecha_inicio`, `costo_estimado` |
| Foreign Keys | `{singular}_id` | `obra_id`, `usuario_id`, `ot_id` |
| Enums | snake_case | `estado_ot`, `rol_usuario` |

### TypeScript/React

| Element | Pattern | Example |
|---------|---------|---------|
| Components | PascalCase | `OTCard`, `SemaforoStatus` |
| Files | kebab-case.tsx | `ot-card.tsx`, `semaforo-status.tsx` |
| Hooks | use + camelCase | `useOTs`, `useSyncStatus`, `useObra` |
| Types | PascalCase | `OTRow`, `ObraInsert`, `UserRole` |
| Variables | camelCase | `obraActual`, `isLoading`, `pendingOps` |

---

## File Organization

```text
src/
├── app/
│   ├── (auth)/          # Unauthenticated routes
│   ├── (dashboard)/     # Authenticated routes
│   ├── actions/         # Server Actions (one per domain)
│   └── api/             # Only for webhooks
├── components/
│   ├── ui/              # shadcn/ui (DO NOT MODIFY)
│   ├── edo/             # Domain components
│   │   ├── ot/
│   │   ├── obra/
│   │   ├── tareas/
│   │   ├── consumos/
│   │   ├── dashboard/
│   │   └── shared/      # SemaforoStatus, SyncIndicator, etc.
│   ├── forms/           # Reusable form components
│   └── layouts/         # Layout components
├── hooks/               # Custom hooks (use-*.ts)
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── queries/         # React Query hooks
│   └── validations/     # Zod schemas
├── stores/              # Zustand stores (*-store.ts)
└── types/               # TypeScript types
```

---

## State Management Rules

### Server State (React Query)

- ALL data from Supabase
- Cache with automatic invalidation
- Use `queryKeys` factory from `lib/queries/keys.ts`

```typescript
// Use the factory
const { data } = useQuery({
  queryKey: queryKeys.ots(obraId),
  queryFn: () => getOTs(obraId),
});
```

### Client State (Zustand)

- ONLY for UI state: sidebar, modals, preferences
- NEVER for server data

```typescript
// CORRECT uses
const { sidebarOpen, toggleSidebar } = useUIStore();

// WRONG - this should be React Query
const { ots, setOTs } = useOTStore(); // NO!
```

### URL State

- Filters, search, pagination
- Makes state shareable

```typescript
// Use query params for filters
/ots?obra=abc&estado=pendiente&page=2
```

---

## Semaforo System

The traffic light system is the CORE visual language. Always use `SemaforoStatus` component.

```typescript
type SemaforoStatus = 'ok' | 'warning' | 'alert';

// Thresholds
// ok: avance >= 90% of expected
// warning: avance between 70-90% of expected
// alert: avance < 70% of expected OR desvio > 20%
```

Colors use CSS variables:

```css
--status-ok: 142 76% 36%;      /* Green */
--status-warning: 38 92% 50%;   /* Yellow/Amber */
--status-alert: 0 84% 60%;      /* Red */
```

---

## Validation Flow

Always validate in this order:

1. **Client**: Zod schema (immediate feedback)
2. **Server Action**: Zod re-validation (never trust client)
3. **Database**: Constraints (final defense)

```typescript
// In component
const form = useForm({ resolver: zodResolver(otSchema) });

// In Server Action
export async function createOT(data: unknown) {
  const parsed = otSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parseError(parsed.error) };
  // DB constraints catch anything else
}
```

---

## Date Handling

| Context | Format |
|---------|--------|
| Database | `timestamp with time zone` |
| JSON/API | ISO 8601 string |
| UI Display | Uruguay locale `dd/MM/yyyy HH:mm` |

```typescript
// Formatting for display
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

format(new Date(timestamp), "dd/MM/yyyy HH:mm", { locale: es });
```

---

## Error Handling

### Server Actions

```typescript
type AppError = {
  code: string;      // 'OT_NOT_FOUND', 'VALIDATION_ERROR'
  message: string;   // User-facing message in Spanish
  details?: unknown; // Dev-only debug info
};
```

### UI Error Display

- Use `Toast` for action errors
- Use `ErrorBoundary` per major section
- Always provide retry option

---

## Offline Sync Pattern

```typescript
interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'ot' | 'tarea' | 'consumo';
  data: unknown;
  timestamp: number;
  retries: number;
}

// Status indicator
type SyncStatus = 'synced' | 'pending' | 'error';
```

When offline:
1. Store operation in `sync-store`
2. Show `SyncIndicator` with pending count
3. Retry when online

---

## Anti-Patterns to AVOID

| Wrong | Correct |
|-------|---------|
| `getUserData()` | `getUser()` |
| `users_table` | `usuarios` |
| Custom loading state | React Query `isLoading` |
| Direct Supabase in components | Through hooks/actions |
| Blocking user actions | Alert but allow |
| Manual auth checks | RLS policies |
| Types from scratch | `supabase gen types` |
| Throwing in Server Actions | Return `Result<T>` |

---

## Testing Rules

- **Location**: Co-located (`component.test.tsx` next to `component.tsx`)
- **Framework**: Vitest + Testing Library (Phase 2)
- **E2E**: Playwright in `tests/e2e/` (Phase 2)

---

## Component Guidelines

### shadcn/ui Components

- Install via `npx shadcn@latest add [component]`
- DO NOT modify files in `components/ui/`
- Customize via Tailwind classes and CSS variables

### Domain Components (edo/)

- Must be in appropriate subdirectory
- Include co-located test file
- Use semantic, descriptive names

---

## Quick Reference

### Creating a new Server Action

```typescript
// src/app/actions/[domain].ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { domainSchema } from '@/lib/validations/domain';
import type { Result, AppError } from '@/types/app';

export async function createEntity(data: unknown): Promise<Result<Entity>> {
  const parsed = domainSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: '...' } };
  }

  const supabase = createServerClient();
  const { data: result, error } = await supabase
    .from('entities')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return { success: false, error: { code: 'DB_ERROR', message: error.message } };
  }

  return { success: true, data: result };
}
```

### Creating a new React Query hook

```typescript
// src/lib/queries/entities.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { getEntities, createEntity } from '@/app/actions/entities';

export function useEntities(obraId: string) {
  return useQuery({
    queryKey: queryKeys.entities(obraId),
    queryFn: () => getEntities(obraId),
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities() });
    },
  });
}
```

---

**Document Status:** COMPLETE

**Last Updated:** 2025-12-17

**Reference:** This context is derived from `_bmad-output/architecture.md`
