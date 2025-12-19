# Story 5.4: Specify OC Details

## Status: Done
## Completed: 2025-12-19

## Story

**As a** Compras user,
**I want to** specify proveedor, precios, and conditions on an OC,
**So that** I have complete purchase documentation.

## Acceptance Criteria

1. **AC1:** Given I am creating or editing an OC, When I fill in the form, Then I can enter: proveedor (name/RUT), condiciones de pago, fecha_entrega_esperada
2. **AC2:** Given I am entering items, When I set precio for each item, Then the total is calculated automatically, And I can see subtotals per item
3. **AC3:** Given I save the OC, When viewing it later, Then I see all details including calculated totals

## Tasks / Subtasks

- [x] **Task 1: Add columns to ordenes_compra table** (AC: 1)
  - [x] 1.1 Add `rut_proveedor` TEXT column
  - [x] 1.2 Add `condiciones_pago` TEXT column
  - [x] 1.3 Add `fecha_entrega_esperada` DATE column
  - [x] 1.4 Regenerate TypeScript types

- [x] **Task 2: Update OC creation form** (AC: 1, 2)
  - [x] 2.1 Add RUT proveedor field to OC creation modal
  - [x] 2.2 Add condiciones de pago input
  - [x] 2.3 Add fecha entrega esperada date picker
  - [x] 2.4 Subtotals already displayed per item

- [x] **Task 3: Update server actions** (AC: 1, 3)
  - [x] 3.1 Update `createOrdenCompra` to accept new fields
  - [x] 3.2 Fields returned via existing select query

- [x] **Task 4: Update OC detail view** (AC: 3)
  - [x] 4.1 Display proveedor with RUT
  - [x] 4.2 Display condiciones de pago
  - [x] 4.3 Display fecha entrega esperada
  - [x] 4.4 Subtotals and total already displayed

- [x] **Task 5: Verify build and types**
  - [x] 5.1 Run `npx tsc --noEmit` - Passed
  - [x] 5.2 Run `npm run build` - Passed

## Dev Notes

### Current Database Schema

```sql
-- ordenes_compra (EXISTS)
- id: uuid PK
- obra_id: uuid FK → obras
- numero: integer (auto-increment)
- proveedor: text (nullable) -- already exists
- estado: oc_status enum
- total: numeric (nullable)
- fecha_emision: date
- fecha_recepcion: date (nullable)
- created_by: uuid FK → usuarios
- created_at, updated_at: timestamptz
```

### New Columns Needed

```sql
ALTER TABLE ordenes_compra
ADD COLUMN rut_proveedor TEXT,
ADD COLUMN condiciones_pago TEXT,
ADD COLUMN fecha_entrega_esperada DATE;
```

### Implementation Notes

1. Story 5-3 already implemented:
   - OC creation from requisiciones
   - Proveedor name field
   - Price per item
   - Total calculation

2. This story adds:
   - Additional proveedor info (RUT)
   - Payment conditions
   - Expected delivery date
   - Better display of subtotals

### Files to Modify

- `src/app/actions/ordenes-compra.ts` - Update schemas and actions
- `src/app/(dashboard)/compras/requisiciones/page.tsx` - Update OC modal form
- `src/app/(dashboard)/compras/ordenes-compra/page.tsx` - Update detail display
- `src/types/database.ts` - Add new columns (regenerate)

### References

- [Source: _bmad-output/epics.md#Epic-5-Story-5.4]
- [Source: Story 5-3 implementation]
- Covers: FR29

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Created migration `add_oc_details_columns` adding:
   - `rut_proveedor` TEXT for supplier tax ID
   - `condiciones_pago` TEXT for payment terms
   - `fecha_entrega_esperada` DATE for expected delivery
2. Updated TypeScript types in `database.ts` with new columns
3. Updated Zod schema in `ordenes-compra.ts` to accept new fields
4. Updated `createOrdenCompra` action to insert new fields
5. Updated OC creation modal in requisiciones page with:
   - RUT proveedor input field
   - Condiciones de pago input
   - Fecha entrega esperada date picker
   - Two-column responsive layout for form fields
6. Updated OC list page detail view to display all new fields
7. Added reset for new fields in modal open/close handlers

### File List

**Modified Files:**
- `src/types/database.ts` - Added new columns to ordenes_compra
- `src/app/actions/ordenes-compra.ts` - Updated schema and insert
- `src/app/(dashboard)/compras/requisiciones/page.tsx` - Added form fields
- `src/app/(dashboard)/compras/ordenes-compra/page.tsx` - Display new fields

**Migrations Applied:**
- `add_oc_details_columns` - Adds rut_proveedor, condiciones_pago, fecha_entrega_esperada
