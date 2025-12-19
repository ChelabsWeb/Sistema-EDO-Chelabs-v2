# Story 7.1: Insumos Predefinidos del Sistema

Status: done

## Story

As a **Director de Obra (DO)**,
I want **insumos predefinidos por el sistema que pueda agregar a los rubros de mi obra**,
so that **no tenga que crear manualmente los insumos comunes de construccion y pueda empezar a trabajar mas rapido**.

## Acceptance Criteria

1. **AC1: Catalogo de Insumos del Sistema**
   - GIVEN el sistema tiene insumos predefinidos organizados por rubro
   - WHEN un DO accede a la seccion de insumos de una obra
   - THEN puede ver una opcion para "Agregar insumos predefinidos"

2. **AC2: Seleccion de Insumos Predefinidos**
   - GIVEN el DO esta en la pantalla de agregar insumos predefinidos
   - WHEN selecciona un rubro (ej: "Albanileria")
   - THEN ve la lista de insumos predefinidos para ese rubro con checkbox para seleccionar

3. **AC3: Agregar Insumos Seleccionados a la Obra**
   - GIVEN el DO ha seleccionado uno o mas insumos predefinidos
   - WHEN confirma la accion
   - THEN los insumos se crean en la obra con sus datos predefinidos (nombre, unidad, tipo, precio_referencia opcional)

4. **AC4: Evitar Duplicados**
   - GIVEN ya existe un insumo con el mismo nombre en la obra
   - WHEN el DO intenta agregar un insumo predefinido con ese nombre
   - THEN el sistema muestra advertencia y permite omitir o renombrar

5. **AC5: Insumos Categorizados por Tipo**
   - GIVEN el listado de insumos predefinidos
   - WHEN se muestran al usuario
   - THEN estan separados en "Materiales" y "Mano de Obra"

6. **AC6: Busqueda y Filtrado**
   - GIVEN la lista de insumos predefinidos es extensa
   - WHEN el DO escribe en el campo de busqueda
   - THEN la lista se filtra por nombre de insumo

## Tasks / Subtasks

### Task 1: Crear constantes de insumos predefinidos (AC: #1, #5) - COMPLETADA
- [x] 1.1 Crear archivo `src/lib/constants/insumos-predefinidos.ts`
- [x] 1.2 Definir interface `InsumoPredefinido` con campos: nombre, unidad, tipo, rubro, precio_referencia?
- [x] 1.3 Crear array `INSUMOS_PREDEFINIDOS` organizado por rubro
- [x] 1.4 Incluir insumos tipicos de construccion uruguaya para cada rubro existente
- [x] 1.5 Crear funciones helper: `getInsumosPredefinidosPorRubro()`, `getRubrosConInsumosPredefinidos()`, `getInsumosPredefinidosAgrupados()`

### Task 2: Crear Server Action para obtener y aplicar insumos predefinidos (AC: #3, #4) - COMPLETADA
- [x] 2.1 Agregar funcion `getRubrosDisponibles()` en `src/app/actions/insumos.ts`
- [x] 2.2 Agregar funcion `getInsumosPredefinidos(rubroNombre)`
- [x] 2.3 Agregar funcion `getInsumosPredefinidosConDuplicados(rubroNombre, obraId)`
- [x] 2.4 Agregar funcion `addInsumosPredefinidosToObra(obraId, insumos, skipDuplicates)`
- [x] 2.5 Agregar funcion `addAllInsumosPredefinidosByRubro(obraId, rubroNombre)`
- [x] 2.6 Implementar logica de deteccion de duplicados por nombre (case-insensitive)
- [x] 2.7 Retornar resultado con insumos creados, omitidos y errores

### Task 3: Crear UI para seleccionar insumos predefinidos (AC: #1, #2, #5, #6) - COMPLETADA
- [x] 3.1 Crear componente `src/components/edo/insumo/insumos-predefinidos-dialog.tsx`
- [x] 3.2 Implementar selector de rubro con dropdown
- [x] 3.3 Mostrar lista de insumos con checkbox, separados por tipo con Tabs (material/mano_de_obra)
- [x] 3.4 Agregar campo de busqueda con filtrado en tiempo real
- [x] 3.5 Boton "Agregar seleccionados" con loading state
- [x] 3.6 Botones "Seleccionar todos" / "Deseleccionar todos"
- [x] 3.7 Contador de insumos seleccionados

### Task 4: Integrar en pagina de insumos de obra (AC: #1) - COMPLETADA
- [x] 4.1 Crear componente `src/components/edo/insumo/add-predefinidos-button.tsx`
- [x] 4.2 Agregar boton "Agregar Predefinidos" en header de `src/app/(dashboard)/obras/[id]/insumos/page.tsx`
- [x] 4.3 Conectar con el dialog de seleccion
- [x] 4.4 Refrescar lista de insumos despues de agregar con router.refresh()
- [x] 4.5 Mostrar toast con resultado usando sonner

### Task 5: Manejo de duplicados con UI (AC: #4) - COMPLETADA
- [x] 5.1 Mostrar Badge "Ya existe" en insumos que ya existen en la obra
- [x] 5.2 Deshabilitar checkbox de duplicados automaticamente
- [x] 5.3 Pre-seleccionar solo insumos no duplicados al cargar
- [x] 5.4 Mostrar warning banner con cantidad de duplicados
- [x] 5.5 Opcion de renombrar: NO implementada (se decidio omitir por simplicidad MVP)

## Dev Notes

### Arquitectura Existente a Reutilizar

**Tablas de BD ya creadas:**
- `insumos`: tabla principal donde se crearan los insumos (obra_id, nombre, unidad, tipo, precio_referencia)
- `plantilla_insumos`: existe pero es para plantillas de rubros, NO usar para insumos predefinidos globales

**Server Actions existentes:**
- `createInsumo()` en [src/app/actions/insumos.ts](src/app/actions/insumos.ts) - usar como base
- `getInsumosByObra()` - para verificar duplicados

**Constantes existentes:**
- `RUBROS_PREDEFINIDOS` en [src/lib/constants/rubros-predefinidos.ts](src/lib/constants/rubros-predefinidos.ts) - seguir el mismo patron
- `UNIDADES_RUBRO` - reutilizar para unidades de insumos

**Tipos existentes:**
- `InsumoTipo = 'material' | 'mano_de_obra'` en [src/types/database.ts](src/types/database.ts)
- `Insumo` type para el row de la tabla

### Patrones de Codigo a Seguir

**Naming conventions:**
- Archivo: kebab-case (`insumos-predefinidos.ts`)
- Componentes: PascalCase (`InsumosPredefinidosDialog`)
- Variables: camelCase (`insumosPorRubro`)

**Result Pattern para Server Actions:**
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

**Componentes UI:**
- Usar shadcn/ui: Dialog, Checkbox, Input, Button, Tabs, Badge
- Co-located en `src/components/edo/insumo/`

### Insumos Predefinidos Sugeridos

Basado en rubros existentes y practica de construccion en Uruguay:

**Albanileria (m2):**
- Ladrillos comunes (unidad) - material
- Arena fina (m3) - material
- Portland (kg) - material
- Mezcla preparada (m3) - material
- Oficial albanil (hr) - mano_de_obra
- Peon (hr) - mano_de_obra

**Estructura (m3):**
- Hormigon elaborado H21 (m3) - material
- Acero ADN420 (kg) - material
- Encofrado (m2) - material
- Oficial armador (hr) - mano_de_obra
- Oficial carpintero encofrador (hr) - mano_de_obra

**Instalacion Sanitaria (global):**
- Cano PVC 110mm (ml) - material
- Cano PVC 50mm (ml) - material
- Codos, tees, uniones (unidad) - material
- Sanitario (unidad) - material
- Oficial sanitarista (hr) - mano_de_obra

**Instalacion Electrica (global):**
- Cable 2.5mm (ml) - material
- Cable 4mm (ml) - material
- Tablero (unidad) - material
- Tomas e interruptores (unidad) - material
- Oficial electricista (hr) - mano_de_obra

**Pintura (m2):**
- Latex interior (lt) - material
- Latex exterior (lt) - material
- Enduido (kg) - material
- Lija (unidad) - material
- Oficial pintor (hr) - mano_de_obra

### Project Structure Notes

**Archivos a crear:**
```
src/lib/constants/insumos-predefinidos.ts     # Constantes
src/components/edo/insumo/insumos-predefinidos-dialog.tsx  # Dialog UI
```

**Archivos a modificar:**
```
src/app/actions/insumos.ts                    # Agregar funciones
src/app/(dashboard)/obras/[id]/insumos/page.tsx  # Agregar boton
```

### Testing Considerations

- Verificar que no se crean duplicados
- Verificar que insumos se crean con tipo correcto
- Verificar que precio_referencia es opcional
- Verificar permisos (solo DO y admin pueden agregar)

### References

- [Source: src/lib/constants/rubros-predefinidos.ts] - Patron para constantes predefinidas
- [Source: src/app/actions/insumos.ts] - Server actions existentes
- [Source: src/types/database.ts#InsumoTipo] - Tipos de insumo
- [Source: _bmad-output/architecture.md#Implementation-Patterns] - Patrones de implementacion

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Story creada usando metodo BMAD create-story workflow
- Analisis exhaustivo del codebase existente realizado
- Infraestructura de plantillas ya existe pero esta orientada a rubros, no a catalogo global de insumos
- Se decidio usar constantes en codigo (como rubros-predefinidos.ts) en lugar de tabla de BD para simplicidad MVP

### File List

**Archivos a crear:**
- `src/lib/constants/insumos-predefinidos.ts`
- `src/components/edo/insumo/insumos-predefinidos-dialog.tsx`

**Archivos a modificar:**
- `src/app/actions/insumos.ts`
- `src/app/(dashboard)/obras/[id]/insumos/page.tsx`
