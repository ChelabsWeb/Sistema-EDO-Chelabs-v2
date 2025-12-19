---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedDate: '2025-12-18'
totalEpics: 9
totalStories: 48
totalFRsCovered: 50
inputDocuments:
  - '_bmad-output/prd.md'
  - '_bmad-output/architecture.md'
  - '_bmad-output/ux-design-specification.md'
---

# Sistema-EDO-Chelabs-v2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sistema-EDO-Chelabs-v2, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Gestión de Obras y Configuración (FR1-FR6)**

- FR1: DO puede crear, editar y archivar obras con datos básicos (nombre, dirección, cooperativa)
- FR2: DO puede definir rubros para una obra con nombre, unidad y presupuesto asignado en UR
- FR3: DO puede crear un catálogo de insumos con nombre, unidad, tipo (material/mano de obra) y precio referencia
- FR4: DO puede definir fórmulas por rubro que especifican insumos y cantidades estándar
- FR5: DO puede asignar usuarios a obras con sus respectivos roles
- FR6: Sistema puede convertir automáticamente valores entre UR y pesos uruguayos usando cotización configurable

**Gestión de Usuarios y Permisos (FR7-FR11)**

- FR7: Sistema puede autenticar usuarios mediante email y contraseña
- FR8: DO puede crear usuarios con rol (DO, JO, Compras) y asignarlos a obras
- FR9: JO solo puede ver y operar sobre la obra que tiene asignada
- FR10: DO y Compras pueden ver y operar sobre todas las obras
- FR11: Sistema puede filtrar automáticamente datos según el scope del usuario logueado

**Ciclo de Vida de Órdenes de Trabajo (FR12-FR18)**

- FR12: DO/JO puede crear OT en estado Borrador con rubro, descripción y cantidad
- FR13: Sistema puede calcular automáticamente insumos necesarios y costo estimado desde la fórmula del rubro
- FR14: DO puede aprobar OT cambiando estado a "Aprobada"
- FR15: JO puede iniciar ejecución de OT aprobada cambiando estado a "En Ejecución"
- FR16: JO puede marcar OT como "Cerrada" cuando el trabajo está completo
- FR17: Sistema puede registrar timestamps y usuario para cada cambio de estado de OT
- FR18: DO puede ver historial completo de cambios de estado de una OT

**Ejecución y Avance de Tareas (FR19-FR25)**

- FR19: JO puede ver lista de OTs asignadas a su obra filtradas por estado
- FR20: JO puede crear tareas/checklist dentro de una OT
- FR21: JO puede marcar tareas como completadas
- FR22: Sistema puede calcular porcentaje de avance de OT basado en tareas completadas
- FR23: JO puede subir fotos asociadas a una OT con timestamp automático
- FR24: JO puede registrar consumo real de insumos en una OT (tipo, cantidad)
- FR25: Sistema puede comparar consumo real vs estimado por fórmula y calcular diferencia

**Gestión de Compras y Recepciones (FR26-FR32)**

- FR26: JO puede crear requisición de materiales vinculada a una OT
- FR27: Compras puede ver todas las requisiciones pendientes de todas las obras
- FR28: Compras puede crear Orden de Compra agrupando requisiciones por proveedor
- FR29: Compras puede especificar proveedor, precios y condiciones en la OC
- FR30: JO/Compras puede registrar recepción de materiales indicando cantidades recibidas
- FR31: Sistema puede comparar cantidad pedida vs recibida y alertar diferencias
- FR32: Sistema puede vincular costo de OC a las OTs que generaron las requisiciones

**Control Financiero y Desvíos (FR33-FR37)**

- FR33: Sistema puede calcular costo real de una OT sumando insumos consumidos × precio real
- FR34: Sistema puede comparar costo estimado vs costo real de una OT y calcular desvío en $ y %
- FR35: Sistema puede agregar desvíos por rubro mostrando acumulado
- FR36: Sistema puede alertar visualmente cuando una OT supera el costo estimado (principio "alertar, no bloquear")
- FR37: Sistema puede permitir cerrar OT aunque tenga desvío, registrando la decisión del DO

**Dashboard y Visibilidad (FR38-FR43)**

- FR38: DO puede ver dashboard con estado de todas sus obras en una sola vista
- FR39: Dashboard puede mostrar indicadores de avance físico (%) por obra
- FR40: Dashboard puede mostrar indicadores de consumo presupuestario (%) por obra
- FR41: Dashboard puede destacar obras/OTs con alertas de desvío usando indicadores visuales
- FR42: DO puede hacer drill-down desde dashboard a OT específica con desvío
- FR43: JO puede ver resumen de su obra con OTs activas y estado de cada una

**Exportación de Datos (FR44-FR46)**

- FR44: DO/Compras puede exportar listado de OTs a CSV con filtros por obra/estado/fecha
- FR45: Compras puede exportar listado de OCs y recepciones a CSV para contabilidad
- FR46: DO puede exportar resumen de desvíos por rubro a CSV

**Flexibilidad Operativa - "Alertar, No Bloquear" (FR47-FR50)**

- FR47: Sistema puede aceptar recepción de materiales sin OC previa, marcando como "pendiente de regularizar"
- FR48: Sistema puede permitir aprobar OT aunque exceda presupuesto disponible del rubro, con advertencia visible
- FR49: Sistema puede vincular OC a OT después de que la compra fue realizada
- FR50: Sistema puede registrar operaciones fuera de secuencia normal sin bloquear, generando alerta para revisión

### NonFunctional Requirements

**Performance**

- NFR1: Tiempo de respuesta < 2 segundos para operaciones CRUD
- NFR2: Dashboard load < 3 segundos con datos de 3+ obras
- NFR3: Carga de foto < 5 segundos incluyendo compresión (JO en campo con 3G)
- NFR4: Búsqueda/filtros < 1 segundo
- NFR5: Cálculos de desvío en tiempo real al guardar datos
- NFR6: FCP (First Contentful Paint) < 1.5s en conexión 3G
- NFR7: LCP (Largest Contentful Paint) < 2.5s incluyendo dashboard
- NFR8: TTI (Time to Interactive) < 3s
- NFR9: Bundle size inicial < 200KB gzip

**Security**

- NFR10: Autenticación con Email + contraseña via Supabase Auth
- NFR11: Row Level Security (RLS) en todas las tablas
- NFR12: HTTPS obligatorio (Vercel default)
- NFR13: Datos encriptados en reposo (Supabase default)
- NFR14: JWT con expiración configurable
- NFR15: JO solo accede a su obra, enforced en BD

**Reliability & Availability**

- NFR16: Uptime > 99% mensual
- NFR17: Backups diarios automáticos (Supabase)
- NFR18: Recovery < 4 horas (RTO)
- NFR19: Pérdida máxima de datos < 24 horas (RPO)
- NFR20: Degradación elegante con mensajes claros si servicios no disponibles

**Scalability**

- NFR21: MVP capacity: 1 obra, 5 usuarios, 100 OTs
- NFR22: Fase 2 capacity: 3 obras, 15 usuarios, 500 OTs
- NFR23: Fase 3 capacity: 10 obras, 50 usuarios, 2000 OTs
- NFR24: Paginación en listados (20 items default)
- NFR25: Todas las queries filtran por obra_id

**Data Management**

- NFR26: Retención indefinida de fotos (Supabase Storage)
- NFR27: Retención indefinida de datos (PostgreSQL)
- NFR28: Exportación CSV para cualquier listado
- NFR29: Timestamps created_at/updated_at en todas las tablas

**Usability**

- NFR30: Tiempo de onboarding < 1 hora hasta primera OT creada
- NFR31: Todas las acciones de JO operables con thumb (una mano)
- NFR32: UI autoexplicativa sin necesidad de manual
- NFR33: Toda operación destructiva requiere confirmación
- NFR34: UI 100% en español uruguayo

**PWA & Offline**

- NFR35: PWA instalable con manifest.json
- NFR36: Service Worker para assets estáticos
- NFR37: localStorage fallback para formularios con error de red
- NFR38: Queue de operaciones pendientes cuando hay error de red
- NFR39: Fotos comprimidas client-side < 500KB antes de upload

### Additional Requirements

**From Architecture - Starter Template**

- ARCH1: Initialize project using `create-next-app@latest` with TypeScript, Tailwind, ESLint, App Router, src directory
- ARCH2: Initialize shadcn/ui with `npx shadcn@latest init -y`
- ARCH3: Install Supabase packages: `@supabase/supabase-js @supabase/ssr`
- ARCH4: Configure path aliases (@/*)
- ARCH5: Set up environment variables (.env.local, .env.example)

**From Architecture - Database & Schema**

- ARCH6: Database-first modeling - design SQL schema first, then generate TypeScript types
- ARCH7: Use `supabase gen types typescript --local > src/types/database.ts` for type generation
- ARCH8: Create initial schema migration in `supabase/migrations/`
- ARCH9: Implement RLS policies for all tables based on roles (DO, JO, Compras)
- ARCH10: Set up Supabase local development with `supabase/config.toml`

**From Architecture - Authentication**

- ARCH11: Configure Supabase Auth with @supabase/ssr for cookie-based sessions
- ARCH12: Implement Next.js middleware.ts for session verification
- ARCH13: Create auth Server Actions in `src/app/actions/auth.ts`
- ARCH14: Set up route groups: (auth) for login, (dashboard) for authenticated routes

**From Architecture - State Management**

- ARCH15: Implement React Query (TanStack v5) for server state management
- ARCH16: Create query keys factory in `src/lib/queries/keys.ts`
- ARCH17: Implement Zustand stores for UI-only state (sidebar, modals)
- ARCH18: Use URL query params for filters, search, pagination

**From Architecture - API Patterns**

- ARCH19: Use Result<T, E> pattern for all Server Actions
- ARCH20: Implement Zod validation schemas in `src/lib/validations/`
- ARCH21: Create Server Actions per domain: obras, ots, tareas, consumos, compras, usuarios

**From Architecture - Component Organization**

- ARCH22: Place shadcn/ui components in `src/components/ui/` (do not modify)
- ARCH23: Create domain components in `src/components/edo/` with subdirectories: ot, obra, tareas, consumos, dashboard, shared
- ARCH24: Co-locate test files with components (component.test.tsx)
- ARCH25: Create layout components in `src/components/layouts/`

**From UX Design - Role-Based Layout**

- UX1: Implement role-based layout - JO always gets mobile layout regardless of viewport
- UX2: Desktop layout with sidebar (w-64) for DO and Compras
- UX3: Mobile layout with bottom navigation (h-16) for JO
- UX4: Create `useRoleBasedLayout()` hook for layout determination

**From UX Design - Semáforo System**

- UX5: Implement SemaforoStatus component with 3 states: ok (green), warning (yellow), alert (red)
- UX6: Define CSS variables: --status-ok, --status-warning, --status-alert
- UX7: Use icons + text with color (not color alone) for accessibility

**From UX Design - Touch Targets**

- UX8: Minimum touch target 44×44px for mobile standard
- UX9: Touch target 48×48px or larger for JO field use
- UX10: Minimum 8px spacing between touch targets

**From UX Design - Core Interactions**

- UX11: JO complete task with photo in maximum 5 taps
- UX12: DO understand obra status in < 30 seconds from dashboard
- UX13: Implement PhotoCapture component with timestamp and compression
- UX14: Implement TaskChecklist component with optimistic UI
- UX15: Implement SyncIndicator for offline status

**From UX Design - Feedback Patterns**

- UX16: Toast notifications for action feedback (success, error, pending)
- UX17: Skeleton loading for initial page loads
- UX18: Optimistic UI updates with rollback on failure
- UX19: Vibration feedback on mobile for completed actions

**From UX Design - Accessibility**

- UX20: WCAG 2.1 AA compliance for contrast ratios
- UX21: Focus visible on all interactive elements
- UX22: Keyboard navigation support
- UX23: Spanish language for all UI text and error messages
- UX24: Semantic HTML with proper landmarks (nav, main, aside)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | CRUD Obras |
| FR2 | Epic 2 | Definir rubros con presupuesto UR |
| FR3 | Epic 2 | Catálogo de insumos |
| FR4 | Epic 2 | Fórmulas por rubro |
| FR5 | Epic 2 | Asignar usuarios a obras |
| FR6 | Epic 2 | Conversión UR/Pesos |
| FR7 | Epic 1 | Autenticación email/password |
| FR8 | Epic 1 | Crear usuarios con roles |
| FR9 | Epic 1 | JO scope limitado |
| FR10 | Epic 1 | DO/Compras scope completo |
| FR11 | Epic 1 | Filtrado automático por scope |
| FR12 | Epic 3 | Crear OT Borrador |
| FR13 | Epic 3 | Cálculo automático insumos |
| FR14 | Epic 3 | DO aprueba OT |
| FR15 | Epic 3 | JO inicia ejecución |
| FR16 | Epic 3 | JO cierra OT |
| FR17 | Epic 3 | Timestamps de estados |
| FR18 | Epic 3 | Historial de cambios |
| FR19 | Epic 3 | JO ve lista OTs filtradas |
| FR20 | Epic 4 | Crear tareas/checklist |
| FR21 | Epic 4 | Marcar tareas completadas |
| FR22 | Epic 4 | Cálculo avance por tareas |
| FR23 | Epic 4 | Subir fotos con timestamp |
| FR24 | Epic 4 | Registrar consumo insumos |
| FR25 | Epic 4 | Comparar consumo vs estimado |
| FR26 | Epic 5 | Crear requisición |
| FR27 | Epic 5 | Ver requisiciones cross-obra |
| FR28 | Epic 5 | Crear OC agrupando |
| FR29 | Epic 5 | Especificar proveedor/precios |
| FR30 | Epic 5 | Registrar recepción |
| FR31 | Epic 5 | Alertar diferencias cantidad |
| FR32 | Epic 5 | Vincular costo OC a OT |
| FR33 | Epic 6 | Calcular costo real OT |
| FR34 | Epic 6 | Calcular desvío $ y % |
| FR35 | Epic 6 | Agregar desvíos por rubro |
| FR36 | Epic 6 | Alertar visualmente desvío |
| FR37 | Epic 6 | Cerrar OT con desvío |
| FR38 | Epic 7 | Dashboard multi-obra |
| FR39 | Epic 7 | Indicadores avance físico |
| FR40 | Epic 7 | Indicadores consumo presupuesto |
| FR41 | Epic 7 | Destacar alertas desvío |
| FR42 | Epic 7 | Drill-down a OT |
| FR43 | Epic 7 | JO resumen su obra |
| FR44 | Epic 8 | Export OTs CSV |
| FR45 | Epic 8 | Export OCs CSV |
| FR46 | Epic 8 | Export desvíos CSV |
| FR47 | Epic 9 | Recepción sin OC |
| FR48 | Epic 9 | Aprobar OT excediendo budget |
| FR49 | Epic 9 | Vincular OC retroactivamente |
| FR50 | Epic 9 | Operaciones fuera de secuencia |

## Epic List

### Epic 1: Project Foundation & Authentication
Users can securely access the system with role-based permissions, and the foundational infrastructure is in place. DO, JO, and Compras users can log in with their credentials and see a personalized, role-appropriate interface.

**FRs covered:** FR7, FR8, FR9, FR10, FR11
**Additional:** ARCH1-ARCH14, UX1-UX4, NFR10-NFR15

### Epic 2: Obras & Configuration Management
DO can fully configure an obra with rubros, insumos, fórmulas, and assign users to it. Creates a complete obra configuration ready for OT creation. JO assigned to obra can see it. Currency conversion works.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6
**Additional:** ARCH15-ARCH21, UX5-UX7

### Epic 3: OT Lifecycle Core
Users can create, approve, execute, and close Órdenes de Trabajo with full state management. DO/JO creates OTs with auto-calculated insumos, DO approves OTs, JO executes and closes OTs, full timeline and history visible.

**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19
**Additional:** UX11, UX14, UX16-UX19

### Epic 4: Task Execution & Evidence
JO can execute tasks within OTs with checklist completion, photo evidence, and material consumption tracking. JO completes tasks in 5 taps with photos, progress bar updates automatically, consumo tracking with deviation calculation, offline capability for field work.

**FRs covered:** FR20, FR21, FR22, FR23, FR24, FR25
**Additional:** UX8-UX15, NFR35-NFR39

### Epic 5: Procurement & Receiving
Complete procurement workflow from requisitions to receiving materials. JO creates material requisitions linked to OTs, Compras sees all requisitions cross-obra, Compras creates OCs grouping by proveedor, receiving with quantity validation, cost linkage to OTs.

**FRs covered:** FR26, FR27, FR28, FR29, FR30, FR31, FR32
**Additional:** UX20-UX24

### Epic 6: Financial Control & Deviation Alerts
Real-time financial visibility with automatic deviation detection and the "alertar, no bloquear" philosophy. Automatic cost calculation (estimated vs real), visual deviation alerts (semáforo system), DO can close OTs with deviations (acknowledged), aggregated deviation by rubro.

**FRs covered:** FR33, FR34, FR35, FR36, FR37
**Additional:** UX5-UX7 (semáforo integration)

### Epic 7: Dashboard & Visibility
Role-based dashboards providing instant visibility into obra status. DO sees multi-obra dashboard in < 30 seconds, semáforo indicators per obra, drill-down to specific OT with desvío, JO sees focused view of their obra, alert banner for pending actions.

**FRs covered:** FR38, FR39, FR40, FR41, FR42, FR43
**Additional:** NFR1-NFR9

### Epic 8: Data Export & Reporting
Users can export data for external use and compliance. CSV export of OTs with filters, CSV export of OCs and recepciones, deviation summary exports, data ready for contabilidad.

**FRs covered:** FR44, FR45, FR46
**Additional:** NFR26-NFR29

### Epic 9: Operational Flexibility ("Alertar, No Bloquear")
System accommodates real-world operational chaos without blocking workflows. Accept receptions without prior OC, approve OTs exceeding budget (with warning), link OC to OT retroactively, out-of-sequence operations generate alerts not blocks.

**FRs covered:** FR47, FR48, FR49, FR50

---

## Epic 1: Project Foundation & Authentication

Users can securely access the system with role-based permissions, and the foundational infrastructure is in place.

### Story 1.1: Project Initialization

As a developer,
I want to initialize the project with Next.js, shadcn/ui, and Supabase,
So that I have a solid foundation to build the application.

**Acceptance Criteria:**

**Given** I have Node.js installed
**When** I run the initialization commands
**Then** a Next.js 14 project is created with App Router and TypeScript
**And** shadcn/ui is configured with the default theme
**And** Supabase client packages are installed (@supabase/supabase-js, @supabase/ssr)
**And** path aliases (@/*) are configured in tsconfig.json
**And** environment variables template (.env.example) is created
**And** the project runs successfully on localhost:3000

**Technical Notes:**
- Uses `create-next-app@latest` with --typescript --tailwind --eslint --app --src-dir
- shadcn/ui initialized with `npx shadcn@latest init -y`
- Covers: ARCH1, ARCH2, ARCH3, ARCH4, ARCH5

---

### Story 1.2: Database Schema & Authentication Tables

As a developer,
I want to create the initial database schema with user authentication tables,
So that users can be stored with their roles and obra assignments.

**Acceptance Criteria:**

**Given** a Supabase project is configured
**When** I apply the initial migration
**Then** a `usuarios` table is created with columns: id, email, nombre, rol (enum: DO, JO, Compras), created_at, updated_at
**And** a `usuario_obras` junction table is created for user-obra assignments
**And** RLS policies are created to protect user data
**And** TypeScript types are generated using `supabase gen types`
**And** the database types are available at `src/types/database.ts`

**Technical Notes:**
- Database-first approach per ARCH6, ARCH7
- Migration file: `supabase/migrations/00001_initial_schema.sql`
- Covers: ARCH8, ARCH9, ARCH10, NFR11, NFR29

---

### Story 1.3: User Login Flow

As a user (DO, JO, or Compras),
I want to log in with my email and password,
So that I can access the system securely.

**Acceptance Criteria:**

**Given** I am on the login page (/login)
**When** I enter valid email and password
**Then** I am authenticated via Supabase Auth
**And** a secure session cookie is created
**And** I am redirected to the dashboard
**And** my user role is stored in the session

**Given** I enter invalid credentials
**When** I submit the login form
**Then** I see a clear error message in Spanish: "Email o contraseña incorrectos"
**And** I can retry the login

**Given** I am not authenticated
**When** I try to access any dashboard route
**Then** I am redirected to /login

**Technical Notes:**
- Uses @supabase/ssr for cookie-based sessions (ARCH11)
- Implements middleware.ts for route protection (ARCH12)
- Server Actions in src/app/actions/auth.ts (ARCH13)
- Route groups: (auth) and (dashboard) (ARCH14)
- Covers: FR7, NFR10, NFR14

---

### Story 1.4: Role-Based Layout System

As a user,
I want to see a layout appropriate to my role,
So that I have an optimized experience for my work context.

**Acceptance Criteria:**

**Given** I am logged in as JO
**When** I access any page
**Then** I always see the mobile layout with bottom navigation (h-16)
**And** the layout remains mobile even on desktop viewport

**Given** I am logged in as DO or Compras
**When** I access the system on desktop (≥768px)
**Then** I see the desktop layout with sidebar navigation (w-64)

**Given** I am logged in as DO or Compras
**When** I access the system on mobile (<768px)
**Then** I see a responsive mobile layout with collapsible navigation

**Technical Notes:**
- Create `useRoleBasedLayout()` hook (UX4)
- JO always mobile per UX1
- Desktop sidebar per UX2
- Mobile bottom nav per UX3
- Layout components in src/components/layouts/

---

### Story 1.5: User Management by DO

As a DO (Director de Obra),
I want to create and manage user accounts,
So that I can give my team access to the system with appropriate roles.

**Acceptance Criteria:**

**Given** I am logged in as DO
**When** I navigate to /admin/usuarios
**Then** I see a list of all users in the system

**Given** I am on the user management page
**When** I click "Nuevo Usuario"
**Then** I see a form with fields: email, nombre, rol (dropdown: DO, JO, Compras)
**And** I can submit to create the user

**Given** I create a new user
**When** the form is submitted successfully
**Then** the user receives an email to set their password
**And** I see a success toast: "Usuario creado correctamente"
**And** the user appears in the list

**Given** I am logged in as JO or Compras
**When** I try to access /admin/usuarios
**Then** I am redirected away or see "No autorizado"

**Technical Notes:**
- Server Action: createUser in src/app/actions/usuarios.ts
- Uses Supabase Auth admin functions
- Covers: FR8, NFR15

---

### Story 1.6: Automatic Role-Based Data Filtering

As a user,
I want data to be automatically filtered based on my role and assigned obras,
So that I only see information relevant to my work.

**Acceptance Criteria:**

**Given** I am logged in as JO assigned to "Obra Norte"
**When** I query any data (obras, OTs, etc.)
**Then** I only see data from "Obra Norte"
**And** RLS policies enforce this at database level

**Given** I am logged in as DO
**When** I query data
**Then** I see data from all obras I manage

**Given** I am logged in as Compras
**When** I query data
**Then** I see data from all obras (cross-obra visibility)

**Technical Notes:**
- RLS policies use auth.uid() to filter by usuario_obras
- Covers: FR9, FR10, FR11, NFR15
- Policies in supabase/migrations/00002_rls_policies.sql

## Epic 2: Obras & Configuration Management

DO can fully configure an obra with rubros, insumos, fórmulas, and assign users to it.

### Story 2.1: Create and Manage Obras

As a DO,
I want to create and manage obras with basic information,
So that I can organize my construction projects in the system.

**Acceptance Criteria:**

**Given** I am logged in as DO
**When** I navigate to /obras
**Then** I see a list of all my obras with their status

**Given** I am on the obras list
**When** I click "Nueva Obra"
**Then** I see a form with fields: nombre, dirección, cooperativa
**And** I can submit to create the obra

**Given** I create a new obra
**When** the form is submitted successfully
**Then** the obra is saved to the database
**And** I see a success toast: "Obra creada correctamente"
**And** the obra appears in my list

**Given** I have an existing obra
**When** I click on it
**Then** I can edit its details or archive it

**Technical Notes:**

- Creates `obras` table with: id, nombre, direccion, cooperativa, estado, created_at, updated_at
- Server Actions in src/app/actions/obras.ts
- Covers: FR1

---

### Story 2.2: Define Rubros for an Obra

As a DO,
I want to define rubros (budget categories) for an obra,
So that I can structure the budget by construction phases.

**Acceptance Criteria:**

**Given** I am viewing an obra's configuration
**When** I navigate to the "Rubros" section
**Then** I see a list of rubros defined for this obra

**Given** I am in the rubros section
**When** I click "Nuevo Rubro"
**Then** I see a form with fields: nombre, unidad, presupuesto_ur (in Unidad Reajustable)

**Given** I create a rubro
**When** the form is submitted
**Then** the rubro is saved linked to the obra
**And** the presupuesto is stored in UR

**Given** I have existing rubros
**When** I view the list
**Then** I see the budget in both UR and pesos (converted)

**Technical Notes:**

- Creates `rubros` table with: id, obra_id, nombre, unidad, presupuesto_ur, created_at, updated_at
- Covers: FR2

---

### Story 2.3: Manage Insumos Catalog

As a DO,
I want to create a catalog of insumos (materials and labor),
So that I can standardize pricing and materials across obras.

**Acceptance Criteria:**

**Given** I am logged in as DO
**When** I navigate to /admin/insumos
**Then** I see a catalog of all insumos

**Given** I am in the insumos catalog
**When** I click "Nuevo Insumo"
**Then** I see a form with fields: nombre, unidad, tipo (material/mano_de_obra), precio_referencia

**Given** I create an insumo
**When** the form is submitted
**Then** the insumo is added to the global catalog
**And** it can be used in any obra's fórmulas

**Given** I have existing insumos
**When** I view the list
**Then** I can filter by tipo (material/mano_de_obra)
**And** I can search by nombre

**Technical Notes:**

- Creates `insumos` table with: id, nombre, unidad, tipo (enum), precio_referencia, created_at, updated_at
- Covers: FR3

---

### Story 2.4: Define Fórmulas for Rubros

As a DO,
I want to define fórmulas that specify standard insumos for each rubro,
So that OTs can auto-calculate required materials.

**Acceptance Criteria:**

**Given** I am viewing a rubro's configuration
**When** I navigate to "Fórmula"
**Then** I see the list of insumos configured for this rubro

**Given** I am configuring a fórmula
**When** I click "Agregar Insumo"
**Then** I can select an insumo from the catalog
**And** specify the cantidad per unit of the rubro

**Given** I have configured a fórmula with multiple insumos
**When** I save the fórmula
**Then** each insumo-cantidad pair is stored
**And** when an OT uses this rubro, insumos are auto-calculated

**Technical Notes:**

- Creates `formulas` table with: id, rubro_id, insumo_id, cantidad_por_unidad
- Covers: FR4

---

### Story 2.5: Assign Users to Obras

As a DO,
I want to assign users to specific obras,
So that team members have access to their assigned projects.

**Acceptance Criteria:**

**Given** I am viewing an obra's configuration
**When** I navigate to "Usuarios"
**Then** I see users currently assigned to this obra

**Given** I am in the usuarios section of an obra
**When** I click "Asignar Usuario"
**Then** I see a list of available users
**And** I can select users to assign

**Given** I assign a JO to an obra
**When** the assignment is saved
**Then** the JO can see this obra when they log in
**And** they can only see this obra (not others)

**Given** I want to remove a user from an obra
**When** I click "Quitar" on their assignment
**Then** they lose access to this obra

**Technical Notes:**

- Uses `usuario_obras` junction table created in Epic 1
- Covers: FR5

---

### Story 2.6: Currency Conversion (UR/Pesos)

As a user,
I want the system to automatically convert between UR and pesos,
So that I can work in either currency seamlessly.

**Acceptance Criteria:**

**Given** I am viewing any budget or cost data
**When** the data is displayed
**Then** I see values in both UR and pesos uruguayos

**Given** I am a DO in configuration
**When** I navigate to settings
**Then** I can configure the current UR cotización

**Given** the cotización is set to 1 UR = $1,500
**When** I view a presupuesto of 100 UR
**Then** I see "100 UR ($150,000)"

**Given** a new cotización is set
**When** I view any monetary data
**Then** all peso values are recalculated with the new rate

**Technical Notes:**

- Creates `configuracion` table with: id, clave, valor (for cotizacion_ur)
- Utility function in src/lib/utils.ts: convertURtoPesos(), convertPesosToUR()
- Covers: FR6

## Epic 3: OT Lifecycle Core

Users can create, approve, execute, and close Órdenes de Trabajo with full state management.

### Story 3.1: Create OT in Draft State

As a DO or JO,
I want to create a new Orden de Trabajo in draft state,
So that I can plan work before requesting approval.

**Acceptance Criteria:**

**Given** I am logged in and viewing an obra
**When** I click "Nueva OT"
**Then** I see a form with fields: rubro (dropdown), descripción, cantidad (units of the rubro)

**Given** I select a rubro with a configured fórmula
**When** I enter the cantidad
**Then** the system auto-calculates the required insumos based on the fórmula
**And** displays the costo_estimado (cantidad × standard prices)

**Given** I complete the OT form
**When** I click "Guardar como Borrador"
**Then** the OT is saved with estado = "Borrador"
**And** I see a success toast
**And** the OT appears in my list

**Technical Notes:**

- Creates `orden_trabajos` table with: id, obra_id, rubro_id, codigo (auto-generated), descripcion, cantidad, costo_estimado, estado (enum), created_by, created_at, updated_at
- Creates `ot_insumos_estimados` table for auto-calculated insumos
- Covers: FR12, FR13

---

### Story 3.2: DO Approves OT

As a DO,
I want to approve OTs created by my team,
So that work can officially begin with budget commitment.

**Acceptance Criteria:**

**Given** I am logged in as DO
**When** I view the list of OTs
**Then** I can filter by estado = "Borrador" to see pending approvals

**Given** I view a Borrador OT
**When** I review the details (rubro, cantidad, costo_estimado, insumos)
**Then** I see a clear summary of what will be committed

**Given** I decide to approve
**When** I click "Aprobar"
**Then** the OT estado changes to "Aprobada"
**And** the timestamp and approving user are recorded
**And** a success toast shows: "OT aprobada"

**Given** the rubro presupuesto would be exceeded
**When** I try to approve
**Then** I see a warning: "Esta OT excede el presupuesto disponible del rubro"
**And** I can still approve (alertar, no bloquear)

**Technical Notes:**

- Creates `ot_historial` table to track all state changes
- Covers: FR14, FR17, FR48 (partial - warning without blocking)

---

### Story 3.3: JO Starts OT Execution

As a JO,
I want to start executing an approved OT,
So that I can begin tracking actual work progress.

**Acceptance Criteria:**

**Given** I am logged in as JO
**When** I view OTs for my obra
**Then** I see only OTs from my assigned obra
**And** I can filter by estado

**Given** I view an OT with estado = "Aprobada"
**When** I click "Iniciar Ejecución"
**Then** the OT estado changes to "En Ejecución"
**And** the timestamp is recorded
**And** I can now add tareas, consumos, and fotos

**Given** an OT is "En Ejecución"
**When** I view it
**Then** I see tabs/sections for: Tareas, Consumos, Fotos, Historial

**Technical Notes:**

- Updates estado with historial entry
- Covers: FR15, FR17, FR19

---

### Story 3.4: JO Closes OT

As a JO,
I want to mark an OT as closed when work is complete,
So that final costs can be calculated and compared.

**Acceptance Criteria:**

**Given** I am viewing an OT "En Ejecución"
**When** I click "Cerrar OT"
**Then** I see a confirmation with summary: tareas completadas, consumos registrados, costo real vs estimado

**Given** I confirm closing
**When** the action completes
**Then** the OT estado changes to "Cerrada"
**And** the final costo_real is calculated and locked
**And** desvío is calculated (costo_real - costo_estimado)

**Given** there is a desvío > 0
**When** I close the OT
**Then** the system shows the desvío but allows closing
**And** the desvío is recorded for reporting

**Technical Notes:**

- Calculates costo_real from consumos
- Covers: FR16, FR17, FR37

---

### Story 3.5: View OT State History

As a DO,
I want to see the complete history of an OT's state changes,
So that I have full traceability of who did what and when.

**Acceptance Criteria:**

**Given** I am viewing any OT
**When** I navigate to the "Historial" tab
**Then** I see a timeline of all state changes

**Given** the timeline shows entries
**When** I look at each entry
**Then** I see: fecha/hora, usuario, estado_anterior, estado_nuevo, notas (if any)

**Given** there are multiple state changes
**When** I view the timeline
**Then** entries are ordered newest first
**And** I can see the full journey from Borrador to Cerrada

**Technical Notes:**

- Uses `ot_historial` table
- Covers: FR18

## Epic 4: Task Execution & Evidence

JO can execute tasks within OTs with checklist completion, photo evidence, and material consumption tracking.

### Story 4.1: Create Task Checklist

As a JO,
I want to create a checklist of tasks for an OT,
So that I can track granular progress on the work.

**Acceptance Criteria:**

**Given** I am viewing an OT "En Ejecución"
**When** I navigate to the "Tareas" section
**Then** I see the current task list (empty if new)

**Given** I am in the tareas section
**When** I click "Nueva Tarea"
**Then** I can enter a task description
**And** save it to the OT

**Given** I have created multiple tasks
**When** I view the list
**Then** tasks are ordered by creation date
**And** each shows a checkbox and description

**Technical Notes:**

- Creates `tareas` table with: id, ot_id, descripcion, completada (boolean), completed_at, created_at
- Covers: FR20

---

### Story 4.2: Complete Tasks with Optimistic UI

As a JO,
I want to mark tasks as completed with immediate feedback,
So that I can work quickly in the field.

**Acceptance Criteria:**

**Given** I am viewing the task list on mobile
**When** I tap a task checkbox
**Then** the task is immediately marked as complete (optimistic UI)
**And** a subtle vibration confirms the action
**And** the checkbox shows checked state

**Given** I mark a task complete
**When** the server confirms
**Then** the completed_at timestamp is recorded
**And** a sync indicator shows success

**Given** network is unavailable
**When** I mark a task complete
**Then** the change is queued locally
**And** I see a pending sync indicator
**And** sync occurs when network returns

**Technical Notes:**

- Uses React Query mutation with optimistic update
- Implements UX14 (TaskChecklist with optimistic UI)
- Covers: FR21, NFR37, NFR38

---

### Story 4.3: Calculate OT Progress from Tasks

As a user,
I want to see OT progress calculated from completed tasks,
So that I can understand work completion at a glance.

**Acceptance Criteria:**

**Given** an OT has 5 tasks with 2 completed
**When** I view the OT
**Then** I see a progress bar showing 40%
**And** text shows "2/5 tareas completadas"

**Given** I complete another task
**When** the UI updates
**Then** the progress bar animates to new value
**And** the OT card reflects updated progress

**Given** all tasks are completed
**When** I view the OT
**Then** progress shows 100%
**And** the semáforo status may update based on other factors

**Technical Notes:**

- Progress calculation: (completadas / total) × 100
- Covers: FR22

---

### Story 4.4: Upload Photos with Timestamp

As a JO,
I want to upload photos linked to an OT with automatic timestamps,
So that I can document work progress visually.

**Acceptance Criteria:**

**Given** I am viewing an OT on mobile
**When** I tap the camera button
**Then** my device camera opens

**Given** I take a photo
**When** I confirm the capture
**Then** the photo is compressed client-side (< 500KB)
**And** timestamp is automatically recorded
**And** photo begins uploading to storage

**Given** upload completes
**When** I view the OT fotos section
**Then** I see the photo with fecha/hora overlay
**And** I can add an optional caption

**Given** I am offline
**When** I take a photo
**Then** photo is saved locally with pending status
**And** uploads automatically when online

**Technical Notes:**

- Uses Supabase Storage for photos
- Implements UX13 (PhotoCapture component)
- Client-side compression per NFR39
- Covers: FR23, NFR26, NFR35-NFR38

---

### Story 4.5: Register Material Consumption

As a JO,
I want to register the actual materials consumed on an OT,
So that real costs can be tracked against estimates.

**Acceptance Criteria:**

**Given** I am viewing an OT "En Ejecución"
**When** I navigate to "Consumos"
**Then** I see the list of estimated insumos from the fórmula
**And** columns for: insumo, estimado, consumido, diferencia

**Given** I want to register consumption
**When** I tap on an insumo row
**Then** I can enter the cantidad consumed
**And** optionally attach a photo of remito

**Given** I save a consumo
**When** the form submits
**Then** the consumido column updates
**And** diferencia is calculated (consumido - estimado)
**And** the row shows visual indicator if over estimate

**Technical Notes:**

- Creates `consumos` table with: id, ot_id, insumo_id, cantidad, precio_real, foto_url, created_at
- Covers: FR24

---

### Story 4.6: Compare Consumption vs Estimate

As a user,
I want to see how actual consumption compares to estimates,
So that I can identify deviations early.

**Acceptance Criteria:**

**Given** I am viewing OT consumos
**When** consumido > estimado for an insumo
**Then** I see a warning badge on that row
**And** the diferencia shows in red

**Given** consumido > 120% of estimado
**When** I view the row
**Then** I see a critical alert badge
**And** the OT overall status reflects the deviation

**Given** all consumos are within estimate
**When** I view the summary
**Then** status shows green/ok

**Technical Notes:**

- Uses SemaforoStatus component (UX5-UX7)
- Thresholds: ok (≤100%), warning (100-120%), alert (>120%)
- Covers: FR25

## Epic 5: Procurement & Receiving

Complete procurement workflow from requisitions to receiving materials.

### Story 5.1: Create Material Requisition

As a JO,
I want to create a requisition for materials linked to an OT,
So that Compras knows what I need and why.

**Acceptance Criteria:**

**Given** I am viewing an OT "En Ejecución"
**When** I click "Nueva Requisición"
**Then** I see a form to request materials

**Given** I am creating a requisition
**When** I select insumos and quantities
**Then** I can add multiple items to the requisition
**And** each item shows the insumo name and cantidad

**Given** I submit the requisition
**When** it saves successfully
**Then** the requisition is linked to this OT
**And** estado is "Pendiente"
**And** Compras can see it in their queue

**Technical Notes:**

- Creates `requisiciones` table with: id, ot_id, estado, created_by, created_at
- Creates `requisicion_items` table with: id, requisicion_id, insumo_id, cantidad
- Covers: FR26

---

### Story 5.2: View All Requisitions (Compras)

As a Compras user,
I want to see all pending requisitions from all obras,
So that I can plan purchases efficiently.

**Acceptance Criteria:**

**Given** I am logged in as Compras
**When** I navigate to /compras/requisiciones
**Then** I see all requisiciones from all obras

**Given** the list shows requisiciones
**When** I view each row
**Then** I see: fecha, obra, OT, items count, estado

**Given** I want to filter
**When** I use the filter controls
**Then** I can filter by: obra, estado, fecha range

**Given** I click on a requisición
**When** the detail opens
**Then** I see all items with insumo, cantidad, and OT context

**Technical Notes:**

- Cross-obra visibility for Compras role
- Covers: FR27

---

### Story 5.3: Create Orden de Compra

As a Compras user,
I want to create an Orden de Compra grouping requisitions by proveedor,
So that I can consolidate purchases efficiently.

**Acceptance Criteria:**

**Given** I have pending requisiciones
**When** I select multiple requisiciones
**Then** I see a summary of all items grouped by insumo

**Given** I click "Crear OC"
**When** the OC form opens
**Then** I can select a proveedor
**And** adjust quantities if needed
**And** enter precios for each item

**Given** I submit the OC
**When** it saves successfully
**Then** the OC is created with estado = "Emitida"
**And** linked requisiciones update to "En Proceso"
**And** I see a success message

**Technical Notes:**

- Creates `ordenes_compra` table with: id, proveedor, estado, total, created_by, created_at
- Creates `oc_items` table linking to insumos and quantities
- Creates `oc_requisiciones` junction table
- Covers: FR28

---

### Story 5.4: Specify OC Details

As a Compras user,
I want to specify proveedor, precios, and conditions on an OC,
So that I have complete purchase documentation.

**Acceptance Criteria:**

**Given** I am creating or editing an OC
**When** I fill in the form
**Then** I can enter: proveedor (name/RUT), condiciones de pago, fecha_entrega_esperada

**Given** I am entering items
**When** I set precio for each item
**Then** the total is calculated automatically
**And** I can see subtotals per item

**Given** I save the OC
**When** viewing it later
**Then** I see all details including calculated totals

**Technical Notes:**

- Additional columns on `ordenes_compra`: condiciones, fecha_entrega
- Covers: FR29

---

### Story 5.5: Register Material Reception

As a JO or Compras user,
I want to register when materials are received,
So that inventory and costs are accurately tracked.

**Acceptance Criteria:**

**Given** I have an OC with estado = "Emitida"
**When** I click "Registrar Recepción"
**Then** I see the list of items pending reception

**Given** I am registering reception
**When** I enter cantidad_recibida for each item
**Then** I can mark partial or complete reception
**And** optionally add a photo of the remito

**Given** I submit the reception
**When** it saves
**Then** the reception is recorded with timestamp
**And** the OC updates (completa if all received)

**Technical Notes:**

- Creates `recepciones` table with: id, oc_id, fecha, foto_remito_url, created_by
- Creates `recepcion_items` table with: id, recepcion_id, oc_item_id, cantidad_recibida
- Covers: FR30

---

### Story 5.6: Alert Quantity Differences

As a user,
I want to see alerts when received quantities differ from ordered,
So that I can address discrepancies.

**Acceptance Criteria:**

**Given** I register reception with cantidad_recibida < cantidad_pedida
**When** I save the reception
**Then** I see a warning: "Recepción parcial: faltan X unidades"

**Given** cantidad_recibida > cantidad_pedida
**When** I save
**Then** I see an alert: "Se recibió más de lo pedido"
**And** the difference is highlighted

**Given** there are discrepancies
**When** I view the OC or reception history
**Then** discrepancies are visually marked

**Technical Notes:**

- Uses SemaforoStatus for visual alerts
- Covers: FR31

---

### Story 5.7: Link OC Costs to OTs

As a user,
I want OC costs linked back to the OTs that requested materials,
So that real costs are accurately tracked per OT.

**Acceptance Criteria:**

**Given** an OC is created from requisiciones
**When** the OC has precios entered
**Then** costs are allocated proportionally to source OTs

**Given** I view an OT's costo_real
**When** linked OC items are received
**Then** the OT's costo_real includes the proportional cost

**Given** multiple OTs share an OC
**When** I view costs
**Then** each OT shows only its portion of the cost

**Technical Notes:**

- Cost allocation based on requisicion_items quantities
- Updates OT costo_real on reception
- Covers: FR32

## Epic 6: Financial Control & Deviation Alerts

Real-time financial visibility with automatic deviation detection and the "alertar, no bloquear" philosophy.

### Story 6.1: Calculate Real OT Cost

As a user,
I want the system to calculate the real cost of an OT automatically,
So that I can see actual spending in real-time.

**Acceptance Criteria:**

**Given** an OT has consumos registered
**When** I view the OT detail
**Then** I see costo_real calculated as sum of (cantidad × precio_real) for all consumos

**Given** OC costs are linked to the OT
**When** materials are received
**Then** costo_real updates to include the proportional OC cost

**Given** costo_real changes
**When** I view any OT list or dashboard
**Then** the displayed cost reflects the current calculation

**Technical Notes:**

- costo_real = sum(consumos.cantidad × consumos.precio_real) + allocated OC costs
- Covers: FR33

---

### Story 6.2: Calculate and Display Deviation

As a user,
I want to see the deviation between estimated and real costs,
So that I can identify budget overruns.

**Acceptance Criteria:**

**Given** an OT has costo_estimado and costo_real
**When** I view the OT
**Then** I see desvío calculated as (costo_real - costo_estimado)
**And** I see desvío_porcentaje as ((costo_real - costo_estimado) / costo_estimado) × 100

**Given** desvío > 0
**When** displayed
**Then** the amount shows in red with a negative indicator

**Given** desvío ≤ 0
**When** displayed
**Then** the amount shows in green (under budget)

**Technical Notes:**

- Real-time calculation on every view
- Covers: FR34

---

### Story 6.3: Aggregate Deviation by Rubro

As a DO,
I want to see aggregated deviations by rubro,
So that I can identify which budget categories are problematic.

**Acceptance Criteria:**

**Given** I am viewing an obra summary
**When** I navigate to "Desvíos por Rubro"
**Then** I see a table with: rubro, presupuesto_total, gastado, desvío, desvío_%

**Given** multiple OTs belong to the same rubro
**When** viewing the aggregate
**Then** values are summed across all OTs in that rubro

**Given** a rubro has significant deviation
**When** displayed
**Then** the row shows semáforo status based on deviation level

**Technical Notes:**

- Aggregation query grouping by rubro_id
- Covers: FR35

---

### Story 6.4: Visual Deviation Alerts

As a user,
I want visual alerts when OTs exceed their estimated cost,
So that I'm immediately aware of budget issues.

**Acceptance Criteria:**

**Given** an OT has costo_real > costo_estimado
**When** displayed anywhere (list, card, detail)
**Then** a warning badge appears with the desvío amount

**Given** desvío > 20% of costo_estimado
**When** displayed
**Then** a critical alert badge appears (red semáforo)

**Given** I am on the dashboard
**When** any OT has deviation
**Then** I see an aggregated alert count: "3 OTs con desvío"

**Technical Notes:**

- Uses SemaforoStatus component
- Thresholds: ok (≤0%), warning (0-20%), alert (>20%)
- Covers: FR36

---

### Story 6.5: Close OT with Deviation Acknowledgment

As a DO,
I want to close an OT that has deviation while acknowledging the situation,
So that work can be finalized without being blocked.

**Acceptance Criteria:**

**Given** an OT has desvío > 0 and I want to close it
**When** I click "Cerrar OT"
**Then** I see a confirmation showing the desvío amount and percentage

**Given** I confirm closing
**When** the action completes
**Then** the OT closes successfully
**And** the system records that DO acknowledged the desvío
**And** historial shows: "Cerrada con desvío de $X (Y%) - Aprobado por [DO]"

**Given** future reports
**When** I view closed OTs with desvío
**Then** I can see which were acknowledged and by whom

**Technical Notes:**

- Implements "alertar, no bloquear" principle
- Adds acknowledged_by, acknowledged_at to ot_historial
- Covers: FR37

## Epic 7: Dashboard & Visibility

Role-based dashboards providing instant visibility into obra status.

### Story 7.1: DO Multi-Obra Dashboard

As a DO,
I want to see the status of all my obras at a glance,
So that I can identify issues without drilling into each obra.

**Acceptance Criteria:**

**Given** I am logged in as DO
**When** I navigate to the dashboard (home)
**Then** I see cards for each obra I manage
**And** each card shows: nombre, semáforo status, avance_fisico %, consumo_presupuesto %

**Given** the dashboard loads
**When** data is fetched
**Then** the page is interactive within 3 seconds (NFR2)

**Given** I have 4 obras
**When** viewing on desktop
**Then** I see a 2x2 or 4x1 grid of obra cards

**Technical Notes:**

- ObraCard component in src/components/edo/obra/
- Covers: FR38, NFR2, NFR7

---

### Story 7.2: Physical Progress Indicators

As a DO,
I want to see physical progress percentage per obra,
So that I can understand how much work is complete.

**Acceptance Criteria:**

**Given** I view an obra card on dashboard
**When** looking at avance_fisico
**Then** I see a percentage based on completed tareas across all OTs

**Given** the calculation
**When** computed
**Then** avance = (total_tareas_completadas / total_tareas) × 100

**Given** avance changes
**When** tareas are completed
**Then** the dashboard reflects the new value on next load/refresh

**Technical Notes:**

- Aggregates across all OTs in the obra
- Covers: FR39

---

### Story 7.3: Budget Consumption Indicators

As a DO,
I want to see budget consumption percentage per obra,
So that I can track financial health at a glance.

**Acceptance Criteria:**

**Given** I view an obra card
**When** looking at consumo_presupuesto
**Then** I see percentage = (total_costo_real / total_presupuesto) × 100

**Given** consumo > 100%
**When** displayed
**Then** the indicator shows red with "X% sobre presupuesto"

**Given** consumo is healthy (< 90%)
**When** displayed
**Then** indicator shows green

**Technical Notes:**

- total_presupuesto = sum of all rubros.presupuesto_ur
- total_costo_real = sum of all OTs.costo_real
- Covers: FR40

---

### Story 7.4: Highlight Obras with Alerts

As a DO,
I want obras with deviation alerts to be visually prominent,
So that I focus my attention on problems first.

**Acceptance Criteria:**

**Given** an obra has OTs with desvío > 20%
**When** viewing the dashboard
**Then** the obra card shows a red semáforo
**And** shows count: "2 OTs con desvío crítico"

**Given** an obra has minor deviations (0-20%)
**When** viewing the dashboard
**Then** the obra card shows yellow semáforo

**Given** all OTs in an obra are on budget
**When** viewing
**Then** the obra card shows green semáforo

**Technical Notes:**

- Uses SemaforoStatus component
- Alert count shown prominently
- Covers: FR41

---

### Story 7.5: Drill-Down from Dashboard to OT

As a DO,
I want to click on an alert to go directly to the problematic OT,
So that I can investigate and take action quickly.

**Acceptance Criteria:**

**Given** I see an obra with alerts
**When** I click "Ver alertas"
**Then** I navigate to a filtered view of that obra's OTs with desvío

**Given** I am on the filtered OT list
**When** I click on a specific OT
**Then** I see the full OT detail with desvío information

**Given** I want to return
**When** I click back
**Then** I return to the dashboard maintaining my context

**Technical Notes:**

- URL routing: /obras/[id]/ots?estado=desvio
- Covers: FR42

---

### Story 7.6: JO Obra Summary View

As a JO,
I want to see a summary of my assigned obra,
So that I know my active OTs and their status.

**Acceptance Criteria:**

**Given** I am logged in as JO
**When** I access the home/dashboard
**Then** I see my assigned obra summary (not multi-obra grid)

**Given** the summary displays
**When** I view it
**Then** I see: obra name, my active OTs list, count by estado

**Given** I have OTs in various states
**When** viewing
**Then** I see cards for "En Ejecución" OTs prominently
**And** can quickly access each to continue work

**Technical Notes:**

- Different dashboard component for JO role
- Mobile-optimized layout per UX1
- Covers: FR43

## Epic 8: Data Export & Reporting

Users can export data for external use and compliance.

### Story 8.1: Export OT List to CSV

As a DO or Compras user,
I want to export the OT list to CSV with filters,
So that I can analyze data in Excel or share with others.

**Acceptance Criteria:**

**Given** I am viewing an OT list
**When** I apply filters (obra, estado, fecha range)
**Then** the list reflects my filter criteria

**Given** I have a filtered list
**When** I click "Exportar CSV"
**Then** a CSV file downloads with all visible columns
**And** the file includes: codigo, descripcion, rubro, estado, costo_estimado, costo_real, desvío, fechas

**Given** I export without filters
**When** the file downloads
**Then** it includes all OTs I have access to

**Technical Notes:**

- Server-side CSV generation
- Respects RLS (user only exports what they can see)
- Covers: FR44, NFR28

---

### Story 8.2: Export OCs and Recepciones to CSV

As a Compras user,
I want to export OCs and recepciones to CSV,
So that I can share data with contabilidad.

**Acceptance Criteria:**

**Given** I am viewing the OC list
**When** I click "Exportar CSV"
**Then** a CSV downloads with: oc_numero, proveedor, fecha, total, estado, items_count

**Given** I want to export recepciones
**When** I select date range and click export
**Then** CSV includes: recepcion_id, oc_numero, fecha, items_recibidos, valor_total

**Given** I need detailed item export
**When** I select "Incluir detalle de items"
**Then** the CSV includes line items with insumo, cantidad, precio

**Technical Notes:**

- Separate export for OCs and Recepciones
- Covers: FR45

---

### Story 8.3: Export Deviation Summary by Rubro

As a DO,
I want to export a deviation summary by rubro,
So that I can report to the cooperativa board.

**Acceptance Criteria:**

**Given** I am viewing desvíos por rubro
**When** I click "Exportar Resumen"
**Then** CSV downloads with: rubro, presupuesto_ur, presupuesto_pesos, gastado, desvío, desvío_%

**Given** I select a specific obra
**When** I export
**Then** the summary is scoped to that obra only

**Given** I export all obras
**When** the file generates
**Then** it includes a row per rubro per obra
**And** subtotals per obra

**Technical Notes:**

- Aggregated data with optional obra breakdown
- Covers: FR46

## Epic 9: Operational Flexibility ("Alertar, No Bloquear")

System accommodates real-world operational chaos without blocking workflows.

### Story 9.1: Accept Reception Without Prior OC

As a JO or Compras user,
I want to register material reception even without a prior OC,
So that real-world purchases are tracked even when process wasn't followed.

**Acceptance Criteria:**

**Given** materials arrive at the obra
**When** there is no OC in the system for them
**Then** I can create a "Recepción sin OC" record

**Given** I create reception without OC
**When** I enter the details
**Then** I specify: insumos, cantidades, proveedor (optional), remito (photo)
**And** the reception is marked as "Pendiente de regularizar"

**Given** the reception is saved
**When** viewing lists or reports
**Then** a warning badge shows "Sin OC"
**And** the item appears in a "Pendientes de regularizar" list

**Technical Notes:**

- Reception can be created with oc_id = null
- Adds flag: pendiente_regularizar
- Covers: FR47

---

### Story 9.2: Approve OT Exceeding Budget

As a DO,
I want to approve an OT even when it exceeds the rubro budget,
So that critical work isn't blocked by administrative constraints.

**Acceptance Criteria:**

**Given** I am approving an OT
**When** the OT would cause the rubro to exceed budget
**Then** I see a clear warning: "Esta OT excede el presupuesto del rubro por $X (Y%)"

**Given** I see the warning
**When** I choose to continue
**Then** I can approve the OT anyway
**And** the system records my acknowledgment

**Given** the OT is approved over budget
**When** viewing the OT or rubro
**Then** the over-budget status is clearly visible
**And** the approval includes a note of who approved despite warning

**Technical Notes:**

- Never blocks, only warns
- Logs acknowledgment in ot_historial
- Covers: FR48

---

### Story 9.3: Link OC to OT Retroactively

As a Compras user,
I want to link an OC to an OT after the purchase was made,
So that costs are properly allocated even when process was out of order.

**Acceptance Criteria:**

**Given** I have an OC that wasn't created from requisiciones
**When** I view the OC
**Then** I see an option "Vincular a OT"

**Given** I click "Vincular a OT"
**When** the dialog opens
**Then** I can search and select an OT
**And** specify which OC items should be linked

**Given** I save the link
**When** the allocation is processed
**Then** the OT's costo_real updates to include the OC cost
**And** a note is added: "OC vinculada retroactivamente"

**Technical Notes:**

- Creates oc_ot_link with retroactive flag
- Updates cost calculations
- Covers: FR49

---

### Story 9.4: Record Out-of-Sequence Operations

As a user,
I want the system to accept operations that happen out of normal sequence,
So that real-world flexibility is supported without data loss.

**Acceptance Criteria:**

**Given** I try to register a consumo on an OT that's still "Aprobada" (not "En Ejecución")
**When** I submit
**Then** the system allows it with a warning: "OT no está en ejecución"
**And** the operation is recorded
**And** an alert is generated for review

**Given** I try to close an OT with incomplete tareas
**When** I confirm
**Then** the system allows closing
**And** records: "Cerrada con X tareas pendientes"

**Given** any out-of-sequence operation occurs
**When** saved
**Then** it appears in a "Pendientes de revisión" list
**And** DO can review and acknowledge

**Technical Notes:**

- Never blocks operations, only warns and logs
- Creates `operaciones_irregulares` log table
- Covers: FR50

---

## Document Summary

| Epic | Stories | FRs Covered |
|------|---------|-------------|
| Epic 1: Project Foundation & Authentication | 6 | FR7-FR11 |
| Epic 2: Obras & Configuration Management | 6 | FR1-FR6 |
| Epic 3: OT Lifecycle Core | 5 | FR12-FR19 |
| Epic 4: Task Execution & Evidence | 6 | FR20-FR25 |
| Epic 5: Procurement & Receiving | 7 | FR26-FR32 |
| Epic 6: Financial Control & Deviation Alerts | 5 | FR33-FR37 |
| Epic 7: Dashboard & Visibility | 6 | FR38-FR43 |
| Epic 8: Data Export & Reporting | 3 | FR44-FR46 |
| Epic 9: Operational Flexibility | 4 | FR47-FR50 |
| **Total** | **48 Stories** | **50 FRs** |

All 50 Functional Requirements are covered across 48 stories in 9 epics.
