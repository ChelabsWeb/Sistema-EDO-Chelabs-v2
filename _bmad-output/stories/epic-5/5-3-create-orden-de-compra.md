# Story 5.3: Create Orden de Compra

## Status: Done
## Completed: 2025-12-19

## Story

**As a** Compras user,
**I want to** create an Orden de Compra grouping requisitions by proveedor,
**So that** I can consolidate purchases efficiently.

## Acceptance Criteria

1. **AC1:** Given I have pending requisiciones in `/compras/requisiciones`, When I select multiple requisiciones using checkboxes, Then I see a summary panel showing all items grouped by insumo with total quantities
2. **AC2:** Given I have selected requisiciones, When I click "Crear OC", Then I see a form to create the Orden de Compra with proveedor field, and can adjust quantities and enter precios for each item
3. **AC3:** Given I submit the OC form, When it saves successfully, Then:
   - The OC is created with estado = "pendiente" (not "Emitida" - see DB schema)
   - All linked requisiciones update their estado to "en_proceso"
   - I see a success message with the OC number
   - I'm redirected to the OC detail page or back to requisiciones list
4. **AC4:** Given I create an OC, When viewing the OC detail, Then I can see all line items with their associated requisiciones and OTs

## Tasks / Subtasks

- [x] **Task 1: Create migration for oc_requisiciones junction table** (AC: 3, 4)
  - [x] 1.1 Create `oc_requisiciones` table linking `ordenes_compra` to `requisiciones`
  - [x] 1.2 Add RLS policies for compras/admin access
  - [x] 1.3 Generate updated TypeScript types

- [x] **Task 2: Create server actions for OC management** (AC: 2, 3)
  - [x] 2.1 Create `src/app/actions/ordenes-compra.ts` with:
    - `createOrdenCompra(input)` - Create OC from selected requisiciones
    - `getOrdenesCompra(filters)` - List OCs with filters
    - `getOrdenCompra(id)` - Get single OC with details
  - [x] 2.2 Implement transaction-like pattern: create OC → create lineas_oc → link requisiciones → update requisicion estados
  - [x] 2.3 Calculate total from sum of (cantidad × precio_unitario)

- [x] **Task 3: Add selection capability to requisiciones page** (AC: 1)
  - [x] 3.1 Add checkbox column to requisiciones table in `/compras/requisiciones`
  - [x] 3.2 Add selection state management (which requisiciones are selected)
  - [x] 3.3 Add floating action bar when items selected showing: count, "Ver Resumen", "Crear OC"

- [x] **Task 4: Create OC creation form/modal** (AC: 2)
  - [x] 4.1 Modal integrated directly in requisiciones page
  - [x] 4.2 Show summary of items grouped by insumo with editable quantities and precio fields
  - [x] 4.3 Add proveedor input field
  - [x] 4.4 Show calculated total

- [x] **Task 5: Create OC list page** (AC: 4)
  - [x] 5.1 Create `/compras/ordenes-compra/page.tsx`
  - [x] 5.2 Sidebar navigation already exists for compras/admin
  - [x] 5.3 Show list with: numero, proveedor, fecha, total, estado, items count

- [x] **Task 6: Verify build and types**
  - [x] 6.1 Run `npx tsc --noEmit` - Passed
  - [x] 6.2 Run `npm run build` - Passed

## Dev Notes

### Existing Database Schema

The following tables ALREADY EXIST - DO NOT recreate:

```sql
-- ordenes_compra (EXISTS)
- id: uuid PK
- obra_id: uuid FK → obras
- numero: integer (auto-increment sequence)
- proveedor: text (nullable)
- estado: oc_status enum ('pendiente', 'enviada', 'recibida_parcial', 'recibida_completa', 'cancelada')
- total: numeric (nullable)
- fecha_emision: date (default CURRENT_DATE)
- fecha_recepcion: date (nullable)
- created_by: uuid FK → usuarios
- created_at, updated_at: timestamptz

-- lineas_oc (EXISTS)
- id: uuid PK
- orden_compra_id: uuid FK → ordenes_compra
- orden_trabajo_id: uuid FK → ordenes_trabajo (nullable - for linking costs to OTs)
- insumo_id: uuid FK → insumos
- cantidad_solicitada: numeric
- cantidad_recibida: numeric (nullable - for reception tracking)
- precio_unitario: numeric
- created_at, updated_at: timestamptz
```

### New Migration Needed

Create junction table to link OCs to requisiciones:

```sql
-- oc_requisiciones (NEW - needs migration)
CREATE TABLE oc_requisiciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_compra_id UUID NOT NULL REFERENCES ordenes_compra(id),
  requisicion_id UUID NOT NULL REFERENCES requisiciones(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(orden_compra_id, requisicion_id)
);

-- RLS policies
ALTER TABLE oc_requisiciones ENABLE ROW LEVEL SECURITY;
-- Similar policies to ordenes_compra (compras/admin can manage)
```

### Architecture Compliance

1. **Server Actions Pattern**: Use Result<T, E> pattern, never throw
2. **File Location**: `src/app/actions/ordenes-compra.ts`
3. **Component Location**: `src/components/edo/ordenes-compra/`
4. **Page Location**: `src/app/(dashboard)/compras/ordenes-compra/`
5. **Validation**: Zod schemas in server actions

### Key Implementation Details

1. **Item Grouping Logic**: When selecting requisiciones, group items by `insumo_id`, sum quantities:
   ```typescript
   const grouped = selectedRequisiciones.flatMap(r => r.items)
     .reduce((acc, item) => {
       const key = item.insumo_id;
       if (!acc[key]) acc[key] = { ...item.insumo, cantidad: 0 };
       acc[key].cantidad += item.cantidad;
       return acc;
     }, {});
   ```

2. **OC Creation Flow**:
   - Get obra_id from first requisicion's OT
   - Insert into ordenes_compra (estado = 'pendiente')
   - For each grouped item, insert into lineas_oc
   - Link each selected requisicion via oc_requisiciones
   - Update each requisicion estado to 'en_proceso'

3. **Estado Flow**:
   - Requisicion: pendiente → en_proceso (when linked to OC)
   - OC: pendiente → enviada → recibida_parcial/recibida_completa

### Previous Story Intelligence (5-2)

From story 5-2 implementation:
- `/compras/requisiciones/page.tsx` is a client component
- Uses `getAllRequisiciones(filters)` from `src/app/actions/requisiciones.ts`
- Has expandable rows showing item details
- Quick action buttons for estado updates
- Filter state managed via URL params

**Pattern to follow**: Add checkbox column similar to how we added expand/collapse functionality.

### File Structure to Create/Modify

```
src/
├── app/
│   ├── actions/
│   │   └── ordenes-compra.ts (NEW)
│   └── (dashboard)/
│       └── compras/
│           ├── requisiciones/
│           │   └── page.tsx (MODIFY - add selection)
│           └── ordenes-compra/
│               └── page.tsx (NEW)
├── components/
│   └── edo/
│       └── ordenes-compra/
│           ├── index.ts (NEW)
│           ├── crear-oc-form.tsx (NEW)
│           ├── oc-estado-badge.tsx (NEW)
│           └── oc-list.tsx (NEW)
└── types/
    └── database.ts (REGENERATE after migration)
```

### Project Structure Notes

- Follows existing pattern from `requisiciones` components
- Uses same error handling pattern with `createErrorResult`
- Sidebar link already exists for `/ordenes-compra` (roles: admin, director_obra, compras)

### References

- [Source: _bmad-output/epics.md#Epic-5-Story-5.3]
- [Source: _bmad-output/project-context.md#File-Organization]
- [Source: _bmad-output/stories/epic-5/5-2-view-all-requisitions-compras.md]
- [Source: Supabase list_tables - ordenes_compra, lineas_oc schema]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Created migration for `oc_requisiciones` junction table via Supabase MCP
2. Added RLS policies for compras/admin to manage the junction table
3. Created comprehensive server actions in `src/app/actions/ordenes-compra.ts`:
   - `getOrdenesCompra(filters)` - List with obra, estado, fecha filters
   - `getOrdenCompra(id)` - Single OC with lineas and linked requisiciones
   - `createOrdenCompra(input)` - Transaction-like pattern with rollback
   - `updateOCEstado(id, estado)` - State transitions
   - `getGroupedItemsFromRequisiciones(ids)` - Group items by insumo
4. Modified requisiciones page to add checkbox selection for pending requisiciones
5. Added floating action bar with selection count and "Crear OC" button
6. Implemented OC creation modal directly in requisiciones page:
   - Shows items grouped by insumo with editable cantidad and precio
   - Proveedor input field
   - Real-time total calculation
7. Created OC list page at `/compras/ordenes-compra` with:
   - Summary cards by estado and total value
   - Filters for obra, estado, fecha range
   - Table with expandable details showing line items
   - Quick actions to send or cancel OCs
8. Fixed TypeScript type issues with Supabase relation queries using `as unknown as` casting

### File List

**New Files:**
- `src/app/actions/ordenes-compra.ts` - Server actions for OC management
- `src/app/(dashboard)/compras/ordenes-compra/page.tsx` - OC list page

**Modified Files:**
- `src/app/(dashboard)/compras/requisiciones/page.tsx` - Added selection and OC creation modal
- `src/types/database.ts` - Added oc_requisiciones table and OC convenience types

**Migrations Applied:**
- `add_oc_requisiciones_junction` - Creates oc_requisiciones table with RLS policies
