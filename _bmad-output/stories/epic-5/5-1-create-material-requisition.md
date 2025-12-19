# Story 5.1: Create Material Requisition

## Status: Done
## Completed: 2025-12-19

## Story

**As a** JO (Jefe de Obra),
**I want to** create a requisition for materials linked to an OT,
**So that** Compras knows what I need and why.

## Acceptance Criteria

- [x] Given I am viewing an OT "En Ejecución", When I click "Nueva Requisición", Then I see a form to request materials
- [x] Given I am creating a requisition, When I select insumos and quantities, Then I can add multiple items to the requisition
- [x] Given I submit the requisition, When it saves successfully, Then the requisition is linked to this OT with estado = "Pendiente"
- [x] Compras can see requisitions in their queue

## Technical Implementation

### Database Migration
- Created `requisiciones` table with: id, ot_id, estado (enum: pendiente, en_proceso, completada, cancelada), notas, created_by, created_at
- Created `requisicion_items` table with: id, requisicion_id, insumo_id, cantidad, notas
- RLS policies for JO (create/view own obra), Admin (full access), Compras (view all, update estado)

### Server Actions (`src/app/actions/requisiciones.ts`)
- `createRequisicion(input)` - Create new requisicion with items
- `cancelRequisicion(id)` - Cancel pending requisicion
- `getRequisicionesByOT(otId)` - Get requisiciones for an OT
- `updateRequisicionEstado(id, estado)` - Update estado (for Compras)
- `getAllPendingRequisiciones()` - Get all pending requisiciones

### UI Components (`src/components/edo/requisiciones/`)
- `RequisicionForm` - Form with dynamic item add/remove
- `RequisicionesList` - Expandable list with cancel functionality
- `RequisicionEstadoBadge` - Color-coded status badge
- `OTRequisiciones` - Container component for OT detail page

### Integration
- Added to OT detail page (`src/app/(dashboard)/obras/[id]/ordenes-trabajo/[otId]/page.tsx`)
- Only visible for OTs with estado `en_ejecucion` or `cerrada`
- JO can create/cancel requisiciones only when OT is in execution

## Dev Notes
- RLS policies use `usuarios.obra_id` directly (not junction table)
- Estado state machine: pendiente → en_proceso → completada | cancelada
- Haptic feedback on mobile for successful creation
