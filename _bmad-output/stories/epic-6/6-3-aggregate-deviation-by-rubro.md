# Story 6.3: Aggregate Deviation by Rubro

## Status: Done
## Completed: 2025-12-19

## Story

**As a** DO,
**I want to** see aggregated deviations by rubro,
**So that** I can identify which budget categories are problematic.

## Acceptance Criteria

- [x] Given I am viewing an obra summary, When I navigate to "Desvios por Rubro", Then I see a table with: rubro, presupuesto_total, estimado, real, desvio, desvio_%
- [x] Given multiple OTs belong to the same rubro, When viewing the aggregate, Then values are summed across all OTs in that rubro
- [x] Given a rubro has significant deviation, When displayed, Then the row shows semaforo status based on deviation level

## Tasks / Subtasks

- [x] **Task 1: Create aggregation server action**
  - [x] 1.1 Create `getDeviationsByRubro(obraId)` function
  - [x] 1.2 Query all rubros for the obra
  - [x] 1.3 Aggregate OT costs by rubro_id
  - [x] 1.4 Calculate deviation and percentage per rubro
  - [x] 1.5 Determine status (ok/warning/alert) based on deviation

- [x] **Task 2: Create UI component**
  - [x] 2.1 Create `RubroDeviations` component
  - [x] 2.2 Display table with all required columns
  - [x] 2.3 Color code deviations (red positive, green negative)
  - [x] 2.4 Show status badges (OK, Alerta, Critico)
  - [x] 2.5 Show totals row

- [x] **Task 3: Integrate into obra page**
  - [x] 3.1 Add component to obra detail page
  - [x] 3.2 Call getDeviationsByRubro server action

- [x] **Task 4: Verify build and types**
  - [x] 4.1 Run `npx tsc --noEmit` - Passed
  - [x] 4.2 Run `npm run build` - Passed

## Dev Notes

### Status Thresholds

- **OK** (green): desvio <= 0 (on or under budget)
- **Alerta** (yellow): 0 < desvio <= 20%
- **Critico** (red): desvio > 20%

### Table Columns

| Column | Description |
|--------|-------------|
| Rubro | Name + OT count |
| Presupuesto | Total budget for rubro |
| Estimado | Sum of costo_estimado for all OTs |
| Real | Sum of costo_real for all OTs |
| Desvio | Real - Estimado (with %) |
| Estado | Semaforo badge |

### References

- Covers: FR35
- Epic: 6 - Financial Control & Deviation Alerts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Added `getDeviationsByRubro` function to `src/app/actions/costos.ts`:
   - Fetches all rubros for the obra
   - Gets all approved/in_execution/closed OTs
   - Aggregates costo_estimado and costo_real by rubro
   - Calculates deviation and percentage
   - Determines status based on thresholds

2. Created `src/components/edo/costos/rubro-deviations.tsx`:
   - Table showing rubro name, presupuesto, estimado, real, desvio, estado
   - Color coded deviations (red/green)
   - Status badges (OK/Alerta/Critico)
   - Totals footer row
   - Handles empty state

3. Updated `src/app/(dashboard)/obras/[id]/page.tsx`:
   - Added import for `getDeviationsByRubro`
   - Added import for `RubroDeviations` component
   - Call getDeviationsByRubro and pass to component
   - Added component after rubros/OTs grid

### File List

**New Files:**
- `src/components/edo/costos/rubro-deviations.tsx`

**Modified Files:**
- `src/app/actions/costos.ts` - Added `getDeviationsByRubro` function
- `src/app/(dashboard)/obras/[id]/page.tsx` - Added deviations section
