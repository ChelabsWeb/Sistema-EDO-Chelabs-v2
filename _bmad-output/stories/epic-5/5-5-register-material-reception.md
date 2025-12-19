# Story 5.5: Register Material Reception

## Status: Done
## Completed: 2025-12-19

## Story

**As a** JO or Compras user,
**I want to** register when materials are received,
**So that** inventory and costs are accurately tracked.

## Acceptance Criteria

1. **AC1:** Given I have an OC with estado = "enviada", When I click "Registrar Recepcion", Then I see the list of items pending reception with cantidad_solicitada and cantidad_recibida columns
2. **AC2:** Given I am registering reception, When I enter cantidad_recibida for each item, Then I can mark partial or complete reception
3. **AC3:** Given I submit the reception, When it saves successfully, Then:
   - Each linea_oc updates its cantidad_recibida
   - The OC estado changes to recibida_parcial or recibida_completa based on quantities
   - A recepcion record is created with timestamp and user
   - The OC fecha_recepcion is set (if complete)

## Tasks / Subtasks

- [x] **Task 1: Create recepciones table** (AC: 3)
  - [x] 1.1 Create `recepciones` table for tracking reception events
  - [x] 1.2 Add RLS policies
  - [x] 1.3 Update TypeScript types

- [x] **Task 2: Create server actions for reception** (AC: 1, 2, 3)
  - [x] 2.1 Create `getOCForReception(id)` - Get OC with lineas for reception
  - [x] 2.2 Create `registerRecepcion(ocId, items)` - Register reception and update lineas

- [x] **Task 3: Add reception UI to OC list** (AC: 1, 2)
  - [x] 3.1 Add "Registrar Recepcion" button for enviada OCs
  - [x] 3.2 Create reception modal with editable cantidad_recibida per item
  - [x] 3.3 Show comparison: solicitada vs recibida

- [x] **Task 4: Verify build and types**
  - [x] 4.1 Run `npx tsc --noEmit` - Passed
  - [x] 4.2 Run `npm run build` - Passed

## Dev Notes

### Existing Schema

```sql
-- lineas_oc already has cantidad_recibida column
- cantidad_solicitada: numeric
- cantidad_recibida: numeric (nullable) -- we'll use this

-- ordenes_compra has estados
- estado: 'pendiente' | 'enviada' | 'recibida_parcial' | 'recibida_completa' | 'cancelada'
- fecha_recepcion: date (nullable) -- set when complete
```

### New Table Needed

```sql
-- recepciones (NEW - for tracking reception events)
CREATE TABLE recepciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_compra_id UUID NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  notas TEXT,
  created_by UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies similar to ordenes_compra
```

### Reception Logic

1. User clicks "Registrar Recepcion" on an OC with estado = 'enviada' (or 'recibida_parcial')
2. Modal shows all lineas_oc with:
   - Insumo name
   - cantidad_solicitada
   - cantidad_recibida (current, starts at 0)
   - Input for cantidad_a_recibir (this reception)
3. On submit:
   - Update each linea_oc.cantidad_recibida += cantidad_a_recibir
   - Create recepcion record
   - Calculate if complete: all lineas have cantidad_recibida >= cantidad_solicitada
   - Update OC estado: recibida_completa or recibida_parcial
   - If complete, set OC fecha_recepcion

### State Transitions

- enviada → recibida_parcial (some items received)
- enviada → recibida_completa (all items received in one go)
- recibida_parcial → recibida_parcial (more items received)
- recibida_parcial → recibida_completa (all items now received)

### Files to Create/Modify

- `src/app/actions/recepciones.ts` (NEW)
- `src/app/(dashboard)/compras/ordenes-compra/page.tsx` (MODIFY - add reception modal)
- `src/types/database.ts` (UPDATE - add recepciones table)

### References

- [Source: _bmad-output/epics.md#Epic-5-Story-5.5]
- [Source: Story 5-3, 5-4 implementation]
- Covers: FR30

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Created migration `add_recepciones_table` creating:
   - `recepciones` table with id, orden_compra_id, notas, created_by, created_at
   - RLS policies for admin/compras/jefe_obra/director_obra roles
2. Updated TypeScript types in `database.ts`:
   - Added recepciones table type definition
   - Added `export type Recepcion = Tables<'recepciones'>` convenience type
3. Created `src/app/actions/recepciones.ts` with:
   - `getOCForReception(id)` - Fetches OC with lineas for reception modal
   - `registerRecepcion(ocId, items)` - Registers reception, updates lineas, calculates estado
   - Zod validation schemas
   - Role-based access control (admin, jefe_obra, compras)
4. Updated OC list page with reception UI:
   - Added "Registrar Recepcion" button for OCs with estado 'enviada' or 'recibida_parcial'
   - Created reception modal showing:
     - OC info (proveedor, estado)
     - Items table with: Insumo, Unidad, Solicitada, Recibida, Pendiente, A Recibir
     - Input fields for cantidad_a_recibir per item
     - Optional notas field
   - Items already complete (pendiente <= 0) show green background and no input
   - State handlers for loading, submitting, and error display
5. Reception logic correctly:
   - Updates linea_oc.cantidad_recibida incrementally
   - Creates recepcion record for audit trail
   - Calculates new OC estado (recibida_parcial or recibida_completa)
   - Sets fecha_recepcion when complete

### File List

**New Files:**
- `src/app/actions/recepciones.ts` - Server actions for reception

**Modified Files:**
- `src/types/database.ts` - Added recepciones table and Recepcion type
- `src/app/(dashboard)/compras/ordenes-compra/page.tsx` - Added reception modal and button

**Migrations Applied:**
- `add_recepciones_table` - Creates recepciones table with RLS policies
