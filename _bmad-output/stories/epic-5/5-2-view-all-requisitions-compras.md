# Story 5.2: View All Requisitions (Compras)

## Status: Done
## Completed: 2025-12-19

## Story

**As a** Compras user,
**I want to** see all pending requisitions from all obras,
**So that** I can plan purchases efficiently.

## Acceptance Criteria

- [x] Given I am logged in as Compras, When I navigate to /compras/requisiciones, Then I see all requisiciones from all obras
- [x] Given the list shows requisiciones, When I view each row, Then I see: fecha, obra, OT, items count, estado
- [x] Given I want to filter, When I use the filter controls, Then I can filter by: obra, estado, fecha range
- [x] Given I click on a requisición, When the detail opens, Then I see all items with insumo, cantidad, and OT context

## Technical Implementation

### Server Actions (`src/app/actions/requisiciones.ts`)
- `getAllRequisiciones(filters)` - Query with filters for obra_id, estado, fecha_desde, fecha_hasta
- `getObrasForFilter()` - Get obras list for filter dropdown
- `RequisicionWithObraInfo` - Extended type including OT and Obra info

### Page (`src/app/(dashboard)/compras/requisiciones/page.tsx`)
- Client component with filter state management
- Filter controls: Obra dropdown, Estado dropdown, Fecha desde/hasta
- Summary cards showing count by estado (Pendientes, En Proceso, Completadas, Canceladas)
- Table with columns: Fecha, Obra, OT, Items, Estado, Acciones
- Expandable row detail showing:
  - Creator info and notes
  - Items table with insumo, tipo, cantidad, unidad
  - Link to full OT
- Quick actions: "Iniciar" (pendiente → en_proceso), "Completar" (en_proceso → completada)

### Sidebar Update (`src/components/layouts/DesktopSidebar.tsx`)
- Added "Requisiciones" link visible only for `admin` and `compras` roles
- Icon: document with lines

## Dev Notes
- Cross-obra visibility enforced by RLS + role check in server action
- URL params preserve filter state for sharing/bookmarking
- Real-time estado updates with immediate UI refresh
