# Story 6.4: Visual Deviation Alerts

## Status: Done
## Completed: 2025-12-19

## Story

**As a** DO,
**I want to** see visual alerts for OTs with budget deviation,
**So that** I can quickly identify problematic orders.

## Acceptance Criteria

- [x] Given an OT has costo_real > costo_estimado, When displayed anywhere, Then a warning badge appears
- [x] Given desvio > 20%, When displayed, Then a critical alert badge appears
- [x] Given I am on the dashboard, When any OT has deviation, Then I see an aggregated alert count

## Tasks / Subtasks

- [x] **Task 1: Add deviation alerts to dashboard**
  - [x] 1.1 Count OTs with deviation (costo_real > costo_estimado)
  - [x] 1.2 Count OTs with critical deviation (>20%)
  - [x] 1.3 Display alert banner with counts
  - [x] 1.4 Style banner yellow for warnings, red for criticals

- [x] **Task 2: Add visual alerts to OT list**
  - [x] 2.1 Calculate deviation and percentage for each OT row
  - [x] 2.2 Add warning icon (yellow triangle) for positive deviation
  - [x] 2.3 Add critical icon (red triangle) for >20% deviation
  - [x] 2.4 Add row background colors (yellow-50 / red-50)
  - [x] 2.5 Show deviation amount and percentage in table

- [x] **Task 3: Verify build and types**
  - [x] 3.1 Run `npx tsc --noEmit` - Passed
  - [x] 3.2 Run `npm run build` - Passed

## Dev Notes

### Alert Thresholds

- **Warning** (yellow): 0 < deviation (any positive deviation)
- **Critical** (red): deviation > 20% of estimated cost

### Visual Indicators

| Location | Warning | Critical |
|----------|---------|----------|
| Dashboard | Yellow banner with count | Red banner, shows critical count |
| OT List | Yellow triangle icon, yellow row | Red triangle icon, red row |
| OT Detail | Already implemented in 6-2 | Already implemented in 6-2 |

### Dashboard Alert Examples

- "3 OTs con desvío de presupuesto"
- "5 OTs con desvío de presupuesto (2 críticos >20%)"

### References

- Covers: FR36
- Epic: 6 - Financial Control & Deviation Alerts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

1. Updated `src/app/(dashboard)/dashboard/page.tsx`:
   - Added counting logic for OTs with deviation
   - Added counting logic for OTs with critical deviation (>20%)
   - Added alert banner component with conditional styling
   - Yellow background for warnings, red for criticals

2. Updated `src/app/(dashboard)/obras/[id]/ordenes-trabajo/page.tsx`:
   - Added deviation calculation per OT row
   - Added warning/critical flag logic
   - Added warning triangle icons (yellow/red SVG)
   - Added row background coloring (bg-yellow-50 / bg-red-50)
   - Deviation column already shows amount and percentage

### File List

**Modified Files:**
- `src/app/(dashboard)/dashboard/page.tsx` - Added deviation alert banner
- `src/app/(dashboard)/obras/[id]/ordenes-trabajo/page.tsx` - Added visual row alerts
