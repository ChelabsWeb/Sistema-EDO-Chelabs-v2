# Roadmap y Plan de Ejecución Detallado: Sistema EDO Chelabs v2 (8 Semanas)

Este roadmap profesional organiza el trabajo semanalmente para asegurar la entrega total del sistema en 2 meses. Se enfoca en la robustez técnica, la experiencia de usuario de alto nivel y la integridad de los datos de construcción.

---

## 🏗️ Configuración de Roles y Fases de Trabajo
Para maximizar la eficiencia, dividiremos las tareas en cuatro flujos concurrentes:
1. **Frontend / UX**: Interfaz premium, animaciones y flujos de usuario.
2. **Backend / Data**: Seguridad (RBAC), Bases de Datos y Real-time.
3. **Mobile / DevOps**: PWA, Capacitor y Despliegue.
4. **QA / Business**: Testing, Lógica de Negocio y Validación de Precedentes.

---

## 🏗️ Diagramas de Flujo de Interacción

### 1. Sistema de Casas Predefinidas (OT)
*   **Concepto Central**: Cada Orden de Trabajo (OT) se genera a partir de una plantilla de casa (Casa 1, 2, 3).
*   **Automatización**: Instanciación automática de tareas, insumos y rubros.

### 2. Gestión Geotemporal (Calendario)
*   **Calendario Maestro**: Vista central de planificación y organización temporal.
*   **Sincronización**: Ajuste dinámico de plazos mediante el calendario.

### 3. Sistema de Diseño y Consistencia (Radix UI + Shadcn)
*   **Fundación Cero (Radix Primitives)**: Todo componente interactivo DEBE nacer de Radix UI Primitives (y consumido vía Shadcn) para garantizar accesibilidad nativa y control total de estilos.
*   **Reusabilidad Estricta**: Se prohíben elementos UI ad-hoc (botones o modales "hardcodeados"). Todo debe ser un componente estandarizado y reutilizable en `src/components/ui/` sirviendo a todas las secciones del sistema.
*   **Identidad Visual**: Adaptación de los componentes integrados a la estética premium (Apple-Style) del Sistema EDO.

---

## 📅 Calendario Semanal de Implementación

### MES 1: Reusabilidad, Radix y Operación Core

#### Semana 1 & 2: Cimientos Radix, Motor Core y Flujos (✅ FASE DE ESTABILIZACIÓN)
*   **Estatus**: Stack base establecido. Motor de Casas y OTs modelados de forma preliminar.
*   **Objetivo Inmediato (Limpieza Radical)**: 
    *   Convertir todas las interfaces existentes a componentes 100% de Radix UI reutilizables (Modales, Tablas, Forms).
    *   Resolver deuda técnica en tests (arreglar *mock leakages* en Vitest).
    *   Reubicar la gestión de Renders y Planos dentro del ecosistema propio de cada Obra.

#### Semana 3: Calendario Maestro Reactivo (Gantt)
*   **Objetivo**: Visión temporal visual (Línea de Tiempo) vinculada en tiempo real a las OTs.
*   **Frontend**: Empleo de un framework/librería de Diagrama de Gantt donde el Jefe de Obra pueda extender plazos con Drag & Drop.
*   **Backend**: Impacto directo sobre las fechas de tareas e insumos en la Base de Datos.

#### Semana 4: Optimistic UI y Setup Móvil Temprano (PWA)
*   **Objetivo**: Rendimiento instantáneo de campo para contrarrestar la baja señal de internet en obras.
*   **Data Fetching**: Aplicar `Optimistic Updates` avanzados usando TanStack Query. Las subidas de fotos y checklists deben renderizarse al instante en el celular.
*   **Despliegue Early-Stage**: Activar los Service Workers iniciales y el empaquetado inicial PWA/Capacitor para trabajar los features bajo un entorno híbrido desde el día uno.

---

### MES 2: Comunicación y Despliegue Final

#### Semana 5: Ecosistema de Comunicación (Social)
*   **Objetivo**: Implementar chat entre empleados y estados de disponibilidad.
*   **Backend**: 
    *   Canales de `Realtime` en Supabase para el Chat.
    *   Sistema de "Presencia" (Active/Idle/Offline).
*   **Frontend**: 
    *   Burbuja de chat global en el dashboard.
    *   Indicadores visuales de estado en la lista de personal.
*   **UX**: Diseño de notificaciones push discretas pero efectivas.

#### Semana 6: Módulo de Arquitectura y Renders
*   **Objetivo**: Permitir a arquitectos gestionar la documentación visual del proyecto.
*   **Backend**: Almacenamiento seguro en Supabase Storage para Renders (PDF/JPG/PNG).
*   **Frontend**: 
    *   Vista "Showroom" de renders para clientes y directores.
    *   Gestor de archivos técnicos con versionado simple.
*   **Roles**: Activar el rol `arquitecto` con permisos específicos sobre esta sección.

#### Semana 7: Pulido de Mobile App y Optimización de Bundles
*   **Objetivo**: Refinar la experiencia táctil en las obras y cerrar la aplicación final PWA/Natividad.
*   **DevOps**: Testing en dispositivos físicos mediante Capacitor final build.
*   **Frontend**: 
    *   Gestos táctiles avanzados (Swipe to Complete, Pinch to Zoom en fotos/planos).
    *   Validación final de la caché de modo "Sin Conexión" implementada en la Semana 4.
*   **Performance**: Auditoría completa y optimización de Web Core Vitals.

#### Semana 8: QA Final, Deploy y Cierre
*   **Objetivo**: Garantizar el funcionamiento perfecto y capacitar a los usuarios.
*   **QA**: 
    *   Regression Testing completo.
    *   UAT (User Acceptance Testing) con el cliente.
*   **DevOps**: Configuración de CI/CD para despliegue automático.
*   **Entrega**: Documentación técnica final y manual de usuario por rol.

---

## 📊 Matriz de Responsabilidades por Rol de App

| Funcionalidad         | Admin | Dir. Obra | Jefe Obra | Arquitecto | Compras | Empleado |
| :-------------------- | :---: | :-------: | :-------: | :--------: | :-----: | :------: |
| Configuración Maestra |   ✅   |     ❌     |     ❌     |     ❌      |    ❌    |    ❌     |
| Edición de Costos     |   ✅   |     ✅     |     ❌     |     ❌      |    ✅    |    ❌     |
| Carga de Fotos/Tareas |   ✅   |     ✅     |     ✅     |     ❌      |    ❌    |    ✅     |
| Gestión de Renders    |   ✅   |     ✅     |     ❌     |     ✅      |    ❌    |    ❌     |
| Chat Interno          |   ✅   |     ✅     |     ✅     |     ✅      |    ✅    |    ✅     |

---

## 🛠️ Stack de Calidad
- **Framework**: Next.js 15 (App Router).
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime).
- **Testing**: Vitest (Unit) + Playwright (E2E).
- **Mobile**: Capacitor / PWA.
- **UI**: Tailwind CSS + GSAP + Lucide.

> [!TIP]
> **Estrategia de Éxito**: Se recomienda realizar "Sprints de Validación" cada viernes para ajustar el UX basado en el feedback del equipo de campo (Jefes de Obra).
