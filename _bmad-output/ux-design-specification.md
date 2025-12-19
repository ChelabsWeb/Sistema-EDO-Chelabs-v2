---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - '_bmad-output/prd.md'
  - '_bmad-output/analysis/product-brief-Sistema-EDO-Chelabs-v2-2025-12-16.md'
  - '_bmad-output/analysis/brainstorming-session-2025-12-16.md'
workflowType: 'ux-design'
lastStep: 14
status: 'complete'
project_name: 'Sistema-EDO-Chelabs-v2'
user_name: 'Estudiante UCU'
date: '2025-12-16'
completedDate: '2025-12-16'
---

# UX Design Specification - Sistema-EDO-Chelabs-v2

**Author:** Estudiante UCU
**Date:** 2025-12-16

---

## Executive Summary

### Project Vision

Sistema EDO Chelabs es una plataforma de gestión de obras de construcción que centraliza el control en la **Orden de Trabajo (OT)** como eje. Reemplaza la dispersión de Excel/WhatsApp con visibilidad en tiempo real de avance físico y financiero, permitiendo detectar desvíos antes de que impacten.

**Core UX Promise:** "Abro el sistema y en 30 segundos sé cómo van mis obras sin llamar a nadie."

### Target Users

| Usuario | Contexto de Uso | Dispositivo Primario | Necesidad Core |
|---------|-----------------|---------------------|----------------|
| **DO (Director de Obra)** | Oficina + móvil ocasional, gestiona 2-4 obras simultáneas | Desktop (móvil secundario) | Vista panorámica, decisiones rápidas |
| **JO (Jefe de Obra)** | 100% campo, sol, polvo, guantes, interrupciones constantes | Mobile Android/iPhone | Registro rápido sin fricción |
| **Compras** | 100% oficina, flujo continuo de requisiciones | Desktop | Visibilidad de todas las obras, agrupar pedidos |

**Insight War Room:** Los usuarios tienen contextos tan diferentes que requieren **layouts adaptativos por rol**, no solo responsive por viewport.

### Key Design Challenges

1. **Dualidad Mobile/Desktop por Rol**
   - JO necesita UI mobile-first siempre (incluso en tablet)
   - DO necesita dashboard denso con datos de múltiples obras
   - **Decisión:** Una app con layouts adaptativos por rol + viewport

2. **"Alertar, No Bloquear" - Sistema de Feedback Visual**
   - Operaciones nunca se bloquean, pero inconsistencias son visibles
   - **Decisión:** Badges persistentes con 3 niveles de severidad (🔴🟡🔴)
   - Confirmación contextual solo al cerrar OT con irregularidades

3. **Velocidad en Campo - Regla de 90 Segundos**
   - JO tiene guantes, sol, prisa - umbral de paciencia mínimo
   - **Decisión:** Máximo 5 taps para completar tarea con foto
   - Fotos como input principal, formularios mínimos

4. **Dashboard Denso Sin Abrumar**
   - DO quiere todo visible pero sin cognitive overload
   - **Decisión:** Progressive disclosure con cards semáforo
   - Banner de acciones pendientes como call-to-action principal

### Design Opportunities

1. **Mobile-First para JO = Ventaja Competitiva**
   - ERPs grandes son desktop-first y fallan en campo
   - Si JO puede cargar avance en 90 segundos, ganamos adopción

2. **Sistema de Alertas Visual como Diferenciador**
   - Semáforos por obra que responden preguntas antes de hacerlas
   - Agregado de alertas: "3 OTs pendientes de regularizar"

3. **Offline-First con Sync Transparente**
   - Fotos guardadas localmente primero
   - Indicador claro "📤 Pendiente de sincronizar"
   - Usuario nunca pierde trabajo por conectividad

4. **Role-Based Progressive Disclosure**
   - JO ve solo lo que necesita para ejecutar
   - DO ve panorama con drill-down disponible
   - Compras ve agregado cross-obra

### Design Principles

| Principio | Aplicación |
|-----------|------------|
| **Rol determina UI** | Layout adapta a rol del usuario, no solo a viewport |
| **Alertar sin bloquear** | Badges visibles, acciones siempre permitidas, confirmación contextual |
| **5 taps máximo** | Flujos de campo optimizados para velocidad |
| **Semáforo como lenguaje** | 🟢🟡🔴 comunican estado instantáneamente |
| **Local-first** | Guardar primero, sincronizar después |

## Core User Experience

### Defining Experience

**Core Loop por Rol:**

| Rol | Acción Core | Frecuencia | Métrica de Éxito |
|-----|-------------|------------|------------------|
| **JO** | Completar tarea + foto | 5-10x/día | < 90 segundos por registro |
| **DO** | Ver estado de obras + actuar en desvíos | 2-3x/día | < 30 segundos hasta insight |
| **Compras** | Procesar requisiciones → OC | Continuo | Vista unificada de todas las obras |

**THE Core Action (si solo pudiéramos hacer una cosa bien):**

> "JO completa tarea con foto en 5 taps desde cualquier lugar de la obra"

Si esta interacción es perfecta, el resto del sistema se alimenta de datos reales y el valor fluye hacia arriba (DO ve dashboard útil, Compras tiene contexto).

### Platform Strategy

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| **Plataforma** | PWA (Progressive Web App) | Una codebase, instalable en cualquier dispositivo |
| **Input primario** | Touch (JO), Mouse/keyboard (DO, Compras) | Rol determina contexto |
| **Offline** | Local-first para escrituras críticas | Fotos y avances no se pierden por conectividad |
| **Notificaciones** | MVP: Pull (usuario consulta). Fase 2: Push | Evitar complejidad inicial |

**Layout Strategy:**

- Si `usuario.rol === 'JO'`: Mobile-optimized layout siempre, lista de OTs + acciones rápidas, bottom navigation
- Si viewport < 768px: Versión compacta del dashboard
- Else: Full dashboard con sidebar

### Effortless Interactions

**Lo que debe sentirse automático:**

| Interacción | Expectativa | Implementación |
|-------------|-------------|----------------|
| **Foto → Timestamp** | Usuario saca foto, sistema guarda fecha/hora | Metadata EXIF + server timestamp |
| **OT → Insumos estimados** | Crear OT con rubro, sistema calcula materiales | Fórmulas pre-configuradas por rubro |
| **Consumo → Costo** | Registrar cantidad, sistema calcula $ | Precio referencia × cantidad |
| **Desvío → Alerta** | Sistema detecta y muestra sin que nadie pregunte | Cálculo automático al guardar |
| **Login → Mi contexto** | JO entra y ve SU obra, no selector | Filtro por rol en query |

**Pasos eliminados vs competencia (Excel/WhatsApp):**

| Flujo | Excel/WhatsApp | Sistema EDO |
|-------|----------------|-------------|
| Reportar avance | Abrir Excel → Buscar fila → Escribir → Guardar → Enviar por WhatsApp | Tap OT → Tap tarea → ✓ |
| Ver estado de obra | Llamar al JO | Abrir app |
| Saber si hay desvío | Calcular manual a fin de mes | Badge visible siempre |

### Critical Success Moments

**Momento "Aha!" por rol:**

| Rol | Momento | Qué debe pasar |
|-----|---------|----------------|
| **JO** | Primera tarea completada | < 2 minutos desde login hasta foto guardada |
| **DO** | Primera vez que ve dashboard | Entiende estado de obras sin explicación |
| **DO** | Primer desvío detectado | Alerta es clara, puede drill-down con 1 click |
| **Compras** | Primera OC creada | Requisiciones agrupadas por proveedor automáticamente |

**Interacciones make-or-break:**

1. **Onboarding JO** - Si no puede completar primera tarea en < 5 minutos, abandona
2. **Dashboard DO** - Si requiere más de 2 clicks para entender una alerta, pierde valor
3. **Sync offline** - Si pierde datos por conectividad, confianza destruida

### Experience Principles (Síntesis)

| # | Principio | Aplicación Concreta |
|---|-----------|---------------------|
| 1 | **Contexto automático** | Usuario logueado ve solo lo relevante a su rol/obra |
| 2 | **Fotos > Formularios** | Evidencia visual es el input principal en campo |
| 3 | **Cálculos invisibles** | Sistema hace matemática, usuario ve resultados |
| 4 | **Alertas sin fricción** | Problemas visibles, pero operaciones nunca bloqueadas |
| 5 | **Datos vivos** | Dashboard refleja realidad, no requiere "actualizar" |

## Desired Emotional Response

### Primary Emotional Goals

**Por Rol:**

| Rol | Emoción Primaria | Frase que queremos escuchar |
|-----|------------------|----------------------------|
| **JO** | **Liberación** - "Por fin me dejan trabajar" | "Cargo el avance y listo, nadie me llama para preguntar" |
| **DO** | **Control + Tranquilidad** - "Sé cómo van mis obras" | "Puedo dormir tranquilo porque el sistema me alerta si algo se desvía" |
| **Compras** | **Claridad** - "Tengo contexto antes de comprar" | "Sé que hay presupuesto porque viene de una OT aprobada" |

**Emoción Unificadora:**

> **Confianza en la información** - "Los datos que veo son reales y actuales"

### Emotional Journey Mapping

**JO - Journey Emocional:**

| Momento | Emoción Actual (Excel/WhatsApp) | Emoción Deseada (EDO) |
|---------|--------------------------------|----------------------|
| Inicio de día | Ansiedad: "¿Qué me van a pedir hoy?" | Calma: "Veo mis OTs y sé qué hacer" |
| Reportar avance | Frustración: "Otro Excel que llenar" | Satisfacción: "5 taps y listo" |
| Llamada del DO | Interrupción: "De nuevo preguntando datos" | Orgullo: "Ya lo cargué, puede verlo solo" |
| Fin de semana | Culpa: "Debería haber cargado eso" | Tranquilidad: "Todo sincronizado" |

**DO - Journey Emocional:**

| Momento | Emoción Actual | Emoción Deseada |
|---------|----------------|-----------------|
| Lunes temprano | Incertidumbre: "¿Cómo habrán ido las obras?" | Control: "Dashboard verde, todo bien" |
| Reunión con cooperativa | Improvisación: "Déjame armar un reporte" | Confianza: "Comparto pantalla con datos en vivo" |
| Detectar desvío | Sorpresa: "¿Cuándo pasó esto?" | Alerta temprana: "Vi la alerta hace 2 días" |
| Fin de obra | Duda: "¿Ganamos o perdimos plata?" | Claridad: "Sé exactamente dónde nos desviamos" |

### Micro-Emotions

**Emociones a cultivar:**

| Micro-emoción | Cómo la logramos |
|---------------|------------------|
| **Competencia** | UI que no requiere manual, feedback inmediato |
| **Progreso** | Barras de avance, checkmarks satisfactorios |
| **Seguridad** | "Guardado" explícito, sync visible, nunca perder datos |
| **Reconocimiento** | Sistema muestra quién cargó qué, trazabilidad |

**Emociones a evitar:**

| Anti-emoción | Qué la causa | Cómo la prevenimos |
|--------------|--------------|-------------------|
| **Confusión** | UI ambigua, terminología inconsistente | Lenguaje de obra, no de software |
| **Frustración** | Bloqueos, formularios largos, errores sin explicación | "Alertar no bloquear", errores amigables |
| **Desconfianza** | Datos desactualizados, cálculos incorrectos | Timestamps visibles, cálculos transparentes |
| **Abandono** | Demasiados pasos, curva de aprendizaje alta | 5 taps máximo, onboarding guiado |

### Design Implications

**Emoción → Decisión de Diseño:**

| Emoción Deseada | Implicación UX |
|-----------------|----------------|
| **Liberación (JO)** | Bottom bar con acciones frecuentes, un tap para completar tarea |
| **Control (DO)** | Dashboard con semáforos, drill-down disponible pero no obligatorio |
| **Claridad (Compras)** | Requisiciones muestran OT origen y presupuesto disponible |
| **Confianza** | Timestamps en todo, indicador de última sincronización |
| **Progreso** | Animaciones sutiles en checkmarks, barras de avance que se llenan |
| **Seguridad** | Toast de "Guardado ✓", indicador de sync pendiente |

**Momentos de Micro-Delight:**

| Momento | Delight |
|---------|---------|
| Completar tarea | ✓ con animación satisfactoria + vibración sutil (móvil) |
| OT cerrada sin desvío | Confeti sutil o mensaje positivo |
| Dashboard todo verde | Mensaje: "Todas las obras en orden" |
| Primera foto subida | Feedback: "Foto guardada con ubicación y hora" |

### Emotional Design Principles

| # | Principio | Implementación |
|---|-----------|----------------|
| 1 | **Cero sorpresas negativas** | Si algo puede fallar, advertir ANTES no después |
| 2 | **Feedback inmediato siempre** | Cada acción tiene respuesta visual < 200ms |
| 3 | **Celebrar logros pequeños** | Microinteracciones positivas en completar tareas |
| 4 | **Lenguaje humano** | Errores en español coloquial, no códigos técnicos |
| 5 | **Transparencia total** | Mostrar quién, cuándo, qué - trazabilidad visible |

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**1. WhatsApp - El estándar de velocidad en campo**

| Aspecto | Qué hace bien | Aplicación en EDO |
|---------|---------------|-------------------|
| **Velocidad** | Abre instantáneo, enviar mensaje en 5 segundos | Cargar avance debe sentirse como "mandar un mensaje" |
| **Conectividad** | Funciona con mala conexión, cola de mensajes | Offline queue para fotos y avances |
| **Simplicidad** | No hay que pensar cómo usarlo | Zero learning curve para JO |
| **Feedback** | Ticks de entregado/leído | Indicador claro de sync pendiente/completado |

**Insight clave:** Si el JO ya vive en WhatsApp, competimos contra esa experiencia. Cargar avance ≠ "usar un sistema", debe ser tan natural como enviar una foto al grupo.

**2. Mercado Libre / PedidosYa - Flujos transaccionales claros**

| Aspecto | Qué hace bien | Aplicación en EDO |
|---------|---------------|-------------------|
| **Estados visuales** | Pipeline claro: confirmado → en camino → entregado | OT: Borrador → Aprobada → En ejecución → Cerrada |
| **Timeline** | Eventos con timestamps visibles | Historial de OT con quién hizo qué y cuándo |
| **Colores semáforo** | Verde/amarillo/rojo inmediato | Sistema de alertas con 3 niveles de severidad |
| **CTAs claros** | Botón principal siempre obvio | "Cargar avance", "Aprobar OT" prominentes |

**Insight clave:** Los usuarios uruguayos ya entienden el patrón de "pipeline visual". No hay que educarlos, hay que replicar lo familiar.

**3. Google Sheets - Lo que el DO ya conoce**

| Aspecto | Qué hace bien | Aplicación en EDO |
|---------|---------------|-------------------|
| **Grilla escaneable** | Datos en filas/columnas, visualmente ordenados | Listados tipo tabla, no cards artísticos |
| **Filtros intuitivos** | Click en columna → ordenar/filtrar | Filtros rápidos en listados de OTs |
| **Export familiar** | Descargar a Excel en un click | Cualquier vista exportable a Excel |
| **No intimidante** | Familiar, no asusta a usuarios no técnicos | UI que se sienta "mejorada", no alienígena |

**Insight clave:** El DO viene de Excel. El sistema debe sentirse como "Excel pero mejor", no como "software nuevo que hay que aprender".

**4. Apps de Banca Móvil (BROU, Itaú) - Dashboard financiero**

| Aspecto | Qué hace bien | Aplicación en EDO |
|---------|---------------|-------------------|
| **Número grande** | Saldo visible inmediato (lo más importante) | Métricas clave arriba: % avance, % presupuesto |
| **Últimos movimientos** | Actividad reciente sin buscar | Últimas OTs cerradas, recepciones, alertas |
| **Gráfico simple** | Tendencia de un vistazo | Curva S: planificado vs real |
| **Accesos rápidos** | Acciones frecuentes a un tap | Shortcuts: "Nueva OT", "Ver alertas" |

**Insight clave:** Los usuarios ya tienen modelo mental de "dashboard financiero" por su banco. Aprovechamos esa familiaridad.

### Transferable UX Patterns

**Patrones a Adoptar:**

| Patrón | Inspiración | Aplicación en EDO | Rol Beneficiado |
|--------|-------------|-------------------|-----------------|
| **Carga tipo chat** | WhatsApp | Avance en <30 segundos, mínima fricción | JO |
| **Pipeline visual** | Mercado Libre | Estados de OT con colores y progresión | DO, JO |
| **Grilla escaneable** | Google Sheets | Listados tabulares, exportables | DO, Compras |
| **Número grande + trend** | Apps bancarias | Dashboard con KPIs prominentes | DO |
| **Offline queue** | WhatsApp/Google Docs | Guardar local, sync después | JO |
| **Bottom navigation** | Apps mobile modernas | Navegación con pulgar en celular | JO |
| **Timeline de eventos** | PedidosYa | Historial de OT con timestamps | DO |
| **Filtros inline** | Google Sheets | Ordenar/filtrar sin salir del listado | DO, Compras |

**Patrones de Interacción Específicos:**

| Contexto | Patrón | Implementación |
|----------|--------|----------------|
| **Campo (JO)** | Thumb-zone design | Acciones principales alcanzables con pulgar |
| **Campo (JO)** | Camera-first | Botón de cámara prominente, formulario secundario |
| **Oficina (DO)** | Scannable tables | Información densa pero organizada en grillas |
| **Oficina (DO)** | Drill-down on demand | Cards resumen → click → detalle completo |
| **Cross-rol** | Progressive disclosure | Mostrar lo esencial, revelar complejidad si se busca |

### Anti-Patterns to Avoid

**1. ERPs Tradicionales (SAP, sistemas legacy)**

| Anti-Patrón | Por qué es malo | Cómo lo evitamos |
|-------------|-----------------|------------------|
| **Mil campos obligatorios** | Fricción mata adopción | Campos mínimos, el resto calculado u opcional |
| **Menús con 47 opciones** | Cognitive overload | 4 secciones: Obras, OTs, Compras, Reportes |
| **Errores crípticos** | "Error 5043" no ayuda a nadie | Español claro: "Esta OT no tiene rubros asignados" |
| **Requiere capacitación** | JO no tiene tiempo para cursos | Usable en 5 minutos sin manual |
| **Bloquea si no seguís proceso** | Paraliza operaciones reales | "Alertar, no bloquear" - siempre deja continuar |

**2. Software de Construcción Caro (Procore, etc.)**

| Anti-Patrón | Por qué no aplica | Nuestro enfoque |
|-------------|-------------------|-----------------|
| **Feature bloat** | Cooperativas no necesitan BIM ni Gantt avanzado | Solo features que usan, nada más |
| **Precio enterprise** | Presupuesto de cooperativa es limitado | Gratis o muy económico |
| **En inglés** | Usuarios son españolhablantes | Español rioplatense |
| **Onboarding complejo** | Setup de semanas | "Creá tu primera obra en 2 minutos" |
| **Pensado para grandes** | Procesos formales que cooperativas no tienen | Adaptado a escala y realidad local |

**3. Anti-Patrones Específicos a Evitar:**

| NO hacer | Por qué | Hacer en cambio |
|----------|---------|-----------------|
| **Modales que bloquean** | Interrumpen flujo | Toasts informativos, inline feedback |
| **Confirmaciones innecesarias** | "¿Está seguro?" fatigue | Solo confirmar acciones destructivas |
| **Loading screens largos** | JO en campo pierde paciencia | Optimistic UI, feedback instantáneo |
| **Navegación profunda** | Perderse en submenús | Máximo 2 niveles de profundidad |
| **Iconos sin texto** | Ambiguos, requieren aprendizaje | Icono + label siempre en navegación |
| **Fechas en formato técnico** | "2024-12-16T14:30:00Z" no es humano | "Hoy 14:30" o "Hace 2 horas" |

### Design Inspiration Strategy

**Qué Adoptar Directamente:**

| Patrón | Fuente | Razón |
|--------|--------|-------|
| Bottom navigation (móvil) | Apps modernas | JO navega con pulgar, es el estándar |
| Semáforo 🟢🟡🔴 | Universal | Comunica estado sin palabras |
| Pull-to-refresh | WhatsApp/apps | Gesto natural para actualizar |
| Timestamps relativos | "Hace 2 horas" | Más humano que fechas absolutas |
| Skeleton loading | Apps modernas | Mejor que spinner genérico |

**Qué Adaptar a Nuestro Contexto:**

| Patrón Original | Adaptación | Razón |
|-----------------|------------|-------|
| Dashboard financiero (banco) | Dashboard de obra con métricas de construcción | Mismo modelo mental, diferente dominio |
| Chat threads (WhatsApp) | Historial de OT como timeline | Familiar pero aplicado a workflow |
| Shopping cart (e-commerce) | Requisiciones pendientes | Agregar items → confirmar pedido |
| Order tracking (delivery) | Estado de OT | Pipeline visual de progreso |

**Qué Evitar Completamente:**

| Patrón | Por qué no |
|--------|-----------|
| Wizards de múltiples pasos | Demasiado largo para campo |
| Menús hamburger en desktop | Esconde navegación innecesariamente |
| Infinite scroll en listados críticos | Dificulta encontrar item específico |
| Auto-save sin feedback | Usuario no sabe si se guardó |
| Notificaciones push agresivas | Molestaría más que ayudaría |

**Principios de Diseño Derivados:**

| # | Principio | Origen |
|---|-----------|--------|
| 1 | **30 segundos o menos** | WhatsApp: cualquier acción frecuente < 30s |
| 2 | **Mobile-first para JO** | Realidad de campo: celular es la herramienta |
| 3 | **Familiar > Innovador** | Sheets/Banking: mejor parecido a lo conocido |
| 4 | **Mostrar, no esconder** | PedidosYa: estados siempre visibles |
| 5 | **Perdonar errores** | Anti-ERP: fácil corregir, difícil romper |

## Design System Foundation

### Design System Choice

**Decisión: shadcn/ui + Tailwind CSS**

| Aspecto | Decisión |
|---------|----------|
| **Framework UI** | shadcn/ui (componentes copy-paste basados en Radix UI) |
| **Estilos** | Tailwind CSS (utility-first) |
| **Iconos** | Lucide Icons (ya incluido en shadcn/ui) |
| **Animaciones** | Tailwind + Framer Motion para micro-interacciones |
| **Tema** | CSS variables para light/dark y customización |

### Rationale for Selection

| Factor | Por qué shadcn/ui + Tailwind |
|--------|------------------------------|
| **Alineación con PRD** | Stack ya definido: Next.js 14 + Tailwind + shadcn/ui |
| **Ownership** | Código es nuestro, no dependencia externa - modificamos libremente |
| **Accesibilidad** | Basado en Radix UI primitives con ARIA completo |
| **Customización** | Total control para adaptar touch targets para JO |
| **Server Components** | Compatible con React Server Components de Next.js 14 |
| **Sin vendor lock-in** | Si algo no funciona, lo cambiamos sin migrar |
| **Comunidad** | Documentación excelente, adopción creciente |

### Implementation Approach

**Estructura de Componentes:**

```
src/
├── components/
│   ├── ui/              # shadcn/ui base (Button, Card, Input, etc.)
│   ├── edo/             # Componentes específicos del dominio
│   │   ├── OTCard.tsx
│   │   ├── SemaforoStatus.tsx
│   │   ├── PhotoCapture.tsx
│   │   └── AlertBadge.tsx
│   └── layouts/
│       ├── MobileLayout.tsx   # Para JO
│       ├── DesktopLayout.tsx  # Para DO/Compras
│       └── RoleBasedLayout.tsx
```

**Instalación Progresiva:**

| Fase | Componentes shadcn/ui |
|------|----------------------|
| **MVP** | Button, Card, Input, Badge, Toast, Dialog, Table |
| **Fase 2** | Select, Tabs, Progress, Calendar, Chart |
| **Fase 3** | Command, Popover, Sheet (mobile drawer) |

### Customization Strategy

**1. Design Tokens (CSS Variables):**

```css
:root {
  /* Semáforo - Core visual language */
  --status-ok: 142 76% 36%;      /* Verde */
  --status-warning: 38 92% 50%;  /* Amarillo */
  --status-alert: 0 84% 60%;     /* Rojo */

  /* Touch targets para campo */
  --touch-target-min: 44px;      /* Mínimo iOS/Android */
  --touch-target-field: 56px;    /* Para JO con guantes */

  /* Spacing adaptativo */
  --spacing-compact: 0.5rem;     /* Desktop denso */
  --spacing-field: 1rem;         /* Mobile campo */
}
```

**2. Variantes por Rol:**

| Componente | Variante Desktop (DO) | Variante Mobile (JO) |
|------------|----------------------|---------------------|
| **Button** | `size="default"` | `size="lg"` + `h-14` |
| **Card** | `p-4` compacto | `p-6` con touch areas |
| **Table** | Grilla densa | Lista con swipe actions |
| **Navigation** | Sidebar lateral | Bottom bar fija |

**3. Componentes Específicos EDO:**

| Componente | Propósito | Base shadcn/ui |
|------------|-----------|----------------|
| `<SemaforoStatus>` | Indicador 🟢🟡🔴 | Badge customizado |
| `<OTCard>` | Card de OT con estado | Card + Badge |
| `<PhotoCapture>` | Captura con timestamp | Button + Dialog |
| `<SyncIndicator>` | Estado de sincronización | Badge + animación |
| `<AlertBanner>` | Banner de acciones pendientes | Alert customizado |
| `<QuickAction>` | Botón FAB para JO | Button floating |

**4. Responsive por Rol (no solo viewport):**

```tsx
// Hook personalizado
const { isMobileLayout } = useRoleBasedLayout();

// Lógica
if (user.role === 'JO') return 'mobile'; // Siempre mobile para JO
if (viewport < 768) return 'mobile';
return 'desktop';
```

**5. Tema Visual:**

| Elemento | Valor | Razón |
|----------|-------|-------|
| **Border radius** | `0.5rem` (8px) | Moderno pero no excesivo |
| **Font** | Inter (sistema) | Legible, ya instalada en dispositivos |
| **Shadows** | Mínimas | Rendimiento + claridad |
| **Colores primarios** | Azul profesional | Confianza, no infantil |
| **Contraste** | WCAG AA mínimo | Legibilidad en sol/campo |

## Defining Experience

### The Core Interaction

**La experiencia definitoria de Sistema-EDO-Chelabs-v2:**

> **"JO saca foto de avance → tap → listo. DO abre app → ve semáforo → sabe cómo van sus obras."**

Esta es la interacción que, si la clavamos, todo lo demás funciona. Si el JO carga datos reales, el DO tiene dashboard útil, Compras tiene contexto.

### User Mental Model

**JO piensa:**

| Creencia | Implicación UX |
|----------|----------------|
| "Tengo que dejar registro de lo que hice" | Flujo de registro, no de "gestión" |
| "Mientras más rápido, antes vuelvo al trabajo real" | Cada segundo cuenta, eliminar pasos |
| "Si es complicado, mando foto por WhatsApp y fue" | Competimos contra WhatsApp en simplicidad |
| "El sistema es para que me controlen" | Mostrar beneficio: "nadie te llama a preguntar" |

**DO piensa:**

| Creencia | Implicación UX |
|----------|----------------|
| "¿Cómo van mis obras?" | Respuesta inmediata al abrir app |
| "¿Hay algo que requiera mi atención?" | Alertas prominentes, no escondidas |
| "¿Puedo confiar en estos números?" | Timestamps, trazabilidad, transparencia |
| "Necesito datos para la reunión con la cooperativa" | Export fácil, datos presentables |

### Success Criteria

**Para JO - Completar tarea con foto:**

| Paso | Acción | Tiempo | Taps |
|------|--------|--------|------|
| 1 | Abrir app (ya logueado) | 2s | 1 |
| 2 | Ver lista de OTs asignadas | instantáneo | 0 |
| 3 | Tap en OT activa | 1s | 1 |
| 4 | Tap en tarea a completar | 1s | 1 |
| 5 | Tap cámara → sacar foto | 10s | 1 |
| 6 | (Opcional) agregar nota | 5s | - |
| 7 | Tap "Completar" | 1s | 1 |
| **Total** | | **< 30 seg** | **5 taps** |

**Criterio de éxito:** Si JO no puede completar esto en 30 segundos, fallamos.

**Para DO - Entender estado de obras:**

| Momento | Qué ve | Tiempo hasta insight |
|---------|--------|---------------------|
| Abrir dashboard | Semáforos de todas las obras | < 5 segundos |
| Todo verde | Mensaje "Todas las obras en orden" | Inmediato |
| Hay alertas | Badge con número + lista priorizada | 1 click |
| Drill-down | Detalle de la alerta + acciones | 1 click más |

**Criterio de éxito:** DO entiende estado general en < 30 segundos sin scroll.

### UX Patterns Analysis

**Patrones Establecidos (no inventamos nada):**

| Interacción | Patrón | Referencia | Familiaridad |
|-------------|--------|------------|--------------|
| Completar tarea | Checklist con tap | Todoist, Reminders | Alta |
| Captura de foto | Camera-first | WhatsApp, Instagram | Muy alta |
| Dashboard semáforo | Status cards | Banking apps, Monitoring | Alta |
| Timeline de OT | Order tracking | PedidosYa, MercadoLibre | Alta |
| Offline sync | Queue con indicador | WhatsApp ticks | Muy alta |
| Navegación móvil | Bottom tabs | Toda app mobile | Universal |

**Innovación = 0, Familiaridad = 100%**

No hay UX novel. Todo usa patrones que los usuarios ya conocen. La innovación está en la **combinación** y **simplificación** para el contexto de obra, no en inventar interacciones nuevas.

### Experience Mechanics

**Flujo JO: Completar Tarea**

```
┌─────────────────────────────────────────────────────────┐
│  1. INICIO                                               │
│  ┌─────────────────┐                                    │
│  │ App abre en     │  → JO ve SU obra automáticamente   │
│  │ "Mis OTs"       │    (filtro por rol)                │
│  └─────────────────┘                                    │
│           │                                              │
│           ▼                                              │
│  2. SELECCIÓN                                            │
│  ┌─────────────────┐                                    │
│  │ Lista de OTs    │  → Cards con semáforo              │
│  │ activas         │  → Más urgente arriba              │
│  └─────────────────┘                                    │
│           │ tap                                          │
│           ▼                                              │
│  3. DETALLE OT                                           │
│  ┌─────────────────┐                                    │
│  │ Tareas de la OT │  → Checklist visual                │
│  │ □ Tarea 1       │  → Completadas tachadas            │
│  │ □ Tarea 2  ←────┼── tap                              │
│  │ ✓ Tarea 3       │                                    │
│  └─────────────────┘                                    │
│           │                                              │
│           ▼                                              │
│  4. COMPLETAR                                            │
│  ┌─────────────────┐                                    │
│  │ [📷 Foto]       │  → Botón grande, prominente        │
│  │ [Nota opcional] │  → Solo si quiere                  │
│  │ [✓ Completar]   │  → Acción principal                │
│  └─────────────────┘                                    │
│           │                                              │
│           ▼                                              │
│  5. FEEDBACK                                             │
│  ┌─────────────────┐                                    │
│  │ ✓ Guardado      │  → Toast + vibración               │
│  │ 📤 Sincronizando│  → Si hay conexión                 │
│  │ ✓ Sincronizado  │  → Tick como WhatsApp              │
│  └─────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

**Flujo DO: Dashboard**

```
┌─────────────────────────────────────────────────────────┐
│  DASHBOARD DO                                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🔔 3 alertas pendientes          [Ver todas →] │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Obra A   │ │ Obra B   │ │ Obra C   │ │ Obra D   │   │
│  │ 🟢 85%   │ │ 🟡 62%   │ │ 🟢 91%   │ │ 🔴 45%   │   │
│  │ En orden │ │ 1 alerta │ │ En orden │ │ 2 alertas│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│       │            │                          │         │
│       │            ▼                          ▼         │
│       │     ┌─────────────┐           ┌─────────────┐  │
│       │     │ Alerta:     │           │ Alertas:    │  │
│       │     │ OT-023 con  │           │ • Desvío 15%│  │
│       │     │ desvío 8%   │           │ • 3 OTs sin │  │
│       │     │ [Ver OT →]  │           │   cerrar    │  │
│       │     └─────────────┘           └─────────────┘  │
│       │                                                 │
│       ▼                                                 │
│  Click en card → Detalle de obra con lista de OTs      │
└─────────────────────────────────────────────────────────┘
```

### Edge Cases & Error Handling

| Situación | Comportamiento | Mensaje |
|-----------|----------------|---------|
| Sin conexión al guardar | Guarda local, muestra 📤 | "Guardado. Se sincronizará cuando haya conexión" |
| Foto no se sube | Reintenta automático | "Foto pendiente de sincronizar" |
| OT sin rubros | Permite crear, muestra alerta | "⚠️ Esta OT no tiene rubros asignados" |
| Sesión expirada | Redirect a login | "Tu sesión expiró. Ingresá de nuevo" |
| Error de servidor | Toast con retry | "No pudimos guardar. ¿Reintentar?" |

## Visual Design Foundation

### Color System

**Paleta Principal:**

| Rol | Color | Código HSL | Uso |
|-----|-------|------------|-----|
| **Primary** | Azul profesional | `220 70% 50%` | Acciones principales, links, brand |
| **Secondary** | Gris neutro | `220 10% 40%` | Texto secundario, bordes |
| **Background** | Blanco/Gris claro | `0 0% 98%` | Fondos principales |
| **Foreground** | Gris oscuro | `220 10% 10%` | Texto principal |

**Sistema Semáforo (Core Visual Language):**

| Estado | Color | HSL | Uso | Contraste |
|--------|-------|-----|-----|-----------|
| 🟢 **OK** | Verde | `142 76% 36%` | Sin desvío, en tiempo, aprobado | AAA |
| 🟡 **Warning** | Amarillo/Ámbar | `38 92% 50%` | Desvío menor, atención requerida | AA+ |
| 🔴 **Alert** | Rojo | `0 84% 60%` | Desvío grave, acción urgente | AAA |

**Colores Funcionales:**

| Función | Color | HSL | Uso |
|---------|-------|-----|-----|
| **Success** | Verde | `142 76% 36%` | Guardado, completado, sync ok |
| **Error** | Rojo | `0 84% 60%` | Errores, fallos |
| **Info** | Azul claro | `210 100% 50%` | Información, tips |
| **Pending** | Gris | `220 10% 60%` | Pendiente de sync, borrador |
| **Muted** | Gris claro | `220 10% 80%` | Elementos deshabilitados |

**Modo Claro (Default):**

```css
:root {
  --background: 0 0% 100%;
  --foreground: 220 10% 10%;
  --card: 0 0% 100%;
  --card-foreground: 220 10% 10%;
  --primary: 220 70% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 10% 96%;
  --secondary-foreground: 220 10% 40%;
  --muted: 220 10% 96%;
  --muted-foreground: 220 10% 40%;
  --accent: 220 70% 95%;
  --accent-foreground: 220 70% 50%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 10% 90%;
  --input: 220 10% 90%;
  --ring: 220 70% 50%;

  /* Semáforo */
  --status-ok: 142 76% 36%;
  --status-warning: 38 92% 50%;
  --status-alert: 0 84% 60%;
}
```

### Typography System

**Fuente Principal: Inter**

| Característica | Valor | Razón |
|----------------|-------|-------|
| **Familia** | Inter, system-ui, sans-serif | Variable font, legible, moderna |
| **Fallback** | system-ui | Rendimiento si Inter no carga |
| **Features** | `font-feature-settings: 'tnum'` | Números tabulares para datos |

**Escala Tipográfica:**

| Token | Tamaño | Line Height | Weight | Uso |
|-------|--------|-------------|--------|-----|
| `text-xs` | 0.75rem (12px) | 1rem | 400 | Timestamps, badges, metadata |
| `text-sm` | 0.875rem (14px) | 1.25rem | 400 | Labels, captions, tabla densa |
| `text-base` | 1rem (16px) | 1.5rem | 400 | Body text, inputs |
| `text-lg` | 1.125rem (18px) | 1.75rem | 500 | Subtítulos, énfasis |
| `text-xl` | 1.25rem (20px) | 1.75rem | 600 | Títulos de card, h3 |
| `text-2xl` | 1.5rem (24px) | 2rem | 600 | Títulos de sección, h2 |
| `text-3xl` | 1.875rem (30px) | 2.25rem | 700 | Títulos de página, h1 |
| `text-4xl` | 2.25rem (36px) | 2.5rem | 700 | Números grandes (KPIs) |

**Ajustes por Contexto:**

| Contexto | Ajuste | Razón |
|----------|--------|-------|
| Mobile JO | Body 18px (en vez de 16px) | Legibilidad en sol |
| Tablas desktop | Body 14px | Mayor densidad |
| Touch labels | Mínimo 16px | Legibilidad en campo |
| Números financieros | `font-variant-numeric: tabular-nums` | Alineación en columnas |

### Spacing & Layout Foundation

**Sistema de Spacing (base 4px):**

| Token | Valor | Tailwind | Uso |
|-------|-------|----------|-----|
| `space-0.5` | 2px | `p-0.5` | Micro-ajustes |
| `space-1` | 4px | `p-1` | Gaps mínimos entre iconos |
| `space-2` | 8px | `p-2` | Entre elementos muy relacionados |
| `space-3` | 12px | `p-3` | Padding interno compacto |
| `space-4` | 16px | `p-4` | Separación estándar |
| `space-5` | 20px | `p-5` | Padding cards desktop |
| `space-6` | 24px | `p-6` | Padding cards mobile, entre secciones |
| `space-8` | 32px | `p-8` | Entre grupos mayores |
| `space-10` | 40px | `p-10` | Separación de secciones principales |
| `space-12` | 48px | `p-12` | Márgenes de página |

**Touch Targets:**

| Contexto | Mínimo | Recomendado | Tailwind |
|----------|--------|-------------|----------|
| Desktop | 32px | 40px | `h-10` |
| Mobile estándar | 44px | 48px | `h-12` |
| Campo (JO) | 48px | 56px | `h-14` |

**Breakpoints:**

| Nombre | Valor | Uso |
|--------|-------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait, cambio layout |
| `lg` | 1024px | Desktop pequeño |
| `xl` | 1280px | Desktop estándar |
| `2xl` | 1536px | Desktop grande |

**Layout por Rol:**

| Rol | Mobile (<768px) | Desktop (≥768px) |
|-----|-----------------|------------------|
| **JO** | Full mobile siempre | Full mobile siempre |
| **DO** | Cards stackeados | Sidebar + Grid de cards |
| **Compras** | Lista vertical | Sidebar + Tabla principal |

**Grid System:**

| Contexto | Columnas | Gap |
|----------|----------|-----|
| Cards obras (desktop) | 2-4 cols auto-fit | 16px |
| Formularios | 1-2 cols | 16px |
| Tablas | Full width | - |
| Dashboard widgets | 12 cols grid | 24px |

### Accessibility Considerations

**Contraste:**

| Elemento | Ratio Mínimo | Implementación |
|----------|--------------|----------------|
| Texto normal | 4.5:1 (AA) | `foreground` sobre `background` |
| Texto grande (≥18px) | 3:1 (AA) | Títulos |
| Semáforos | 7:1 (AAA) | Información crítica |
| Iconos informativos | 3:1 (AA) | Con label de texto |

**Touch & Motor:**

| Requisito | Valor | Implementación |
|-----------|-------|----------------|
| Touch target mínimo | 44×44px | `min-h-11 min-w-11` |
| Touch target campo | 48×48px | `min-h-12 min-w-12` |
| Espacio entre targets | 8px mínimo | `gap-2` |
| Click area extendida | Padding clickeable | `p-2` en contenedor |

**Visual:**

| Requisito | Implementación |
|-----------|----------------|
| Focus visible | `ring-2 ring-primary ring-offset-2` |
| No solo color | Iconos + texto acompañan colores |
| Reduced motion | `motion-reduce:transition-none` |
| Font scaling | Unidades `rem`, soporta 200% zoom |

**Screen Readers:**

| Elemento | Implementación |
|----------|----------------|
| Imágenes | `alt` descriptivo |
| Iconos decorativos | `aria-hidden="true"` |
| Iconos informativos | `aria-label` o texto visible |
| Estados | `aria-live` para cambios dinámicos |
| Navegación | Landmarks semánticos (`nav`, `main`, `aside`) |

**Keyboard:**

| Requisito | Implementación |
|-----------|----------------|
| Tab order lógico | Orden DOM correcto |
| Skip links | Link "Ir al contenido" |
| Escape cierra modales | `onKeyDown` handler |
| Enter/Space activa | Botones nativos |

## Design Direction

### Design Direction Chosen: "Profesional Funcional"

**Concepto:** Interfaz limpia, profesional, que prioriza la información sobre la estética. Similar a apps de productividad (Notion, Linear) pero adaptada para el contexto de construcción.

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Estilo general** | Clean, minimal, funcional | No distrae, foco en datos |
| **Densidad** | Media (desktop denso, mobile espacioso) | Balance información/usabilidad |
| **Colores** | Neutros + semáforo prominente | Colores solo donde importan |
| **Iconografía** | Lucide Icons, outline style | Moderno, consistente, incluido en shadcn |
| **Cards** | Bordes sutiles, sombras mínimas | No compite con contenido |
| **Tipografía** | Inter, jerarquía clara | Legible, profesional |
| **Interacciones** | Feedback inmediato, transiciones sutiles | Responsive sin ser llamativo |

### Design Rationale

**Por qué "Profesional Funcional":**

1. **No es producto consumer** - Es herramienta de trabajo, la estética sirve a la función
2. **Usuarios no buscan novedad** - Quieren eficiencia y familiaridad
3. **Semáforo ES la identidad** - El sistema de colores de estado es el diferenciador visual
4. **Consistencia con shadcn/ui** - Aprovechamos defaults probados y accesibles
5. **Mantenimiento simple** - Sin componentes custom complejos

### Layout Specifications

**JO Mobile Layout:**

```
┌─────────────────────────┐
│  EDO          🔔  👤    │  Header: h-14, sticky
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │  Card: p-4, rounded-lg
│  │ 🟢 OT-045        │  │  touch target: h-20 min
│  │ Cimientos Bloque A│  │
│  │ 3/5 tareas ████░░ │  │  Progress bar inline
│  └───────────────────┘  │
│                         │  gap-3 entre cards
│  ┌───────────────────┐  │
│  │ 🟡 OT-046        │  │
│  │ Estructura B      │  │
│  │ 1/4 tareas █░░░░░ │  │
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│ 🏠  📋  📷  ⚙️         │  Bottom nav: h-16, fixed
└─────────────────────────┘  4 items max
```

**DO Desktop Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  EDO Chelabs                    🔔 3   👤 Director            │
├──────────┬─────────────────────────────────────────────────────┤
│ w-64     │  max-w-7xl mx-auto                                  │
│          │                                                     │
│ 🏠 Inicio│  ┌─────────────────────────────────────────────┐   │
│          │  │ ⚠️ 3 alertas requieren atención  [Ver →]    │   │
│ 📋 OTs   │  └─────────────────────────────────────────────┘   │
│          │                                                     │
│ 🏗️ Obras │  grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4   │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ 🛒 Compras│  │ Obra A   │ │ Obra B   │ │ Obra C   │           │
│          │  │ 🟢 85%   │ │ 🟡 62%   │ │ 🔴 45%   │           │
│ 📊 Report│  │ En orden │ │ 1 alerta │ │ 3 alertas│           │
│          │  └──────────┘ └──────────┘ └──────────┘           │
│ ⚙️ Config │                                                    │
│          │  ┌─────────────────────────────────────────────┐   │
│ Sidebar  │  │ Actividad Reciente                          │   │
│ sticky   │  │ • OT-045 cerrada hace 2 horas               │   │
│ top-16   │  │ • Nueva requisición de Obra B               │   │
│          │  └─────────────────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────────────────┘
```

### Component Visual Specs

**Cards:**

| Propiedad | Valor | Tailwind |
|-----------|-------|----------|
| Background | Blanco | `bg-card` |
| Border | Gris sutil | `border border-border` |
| Radius | 8px | `rounded-lg` |
| Shadow | Ninguna/mínima | `shadow-sm` o ninguno |
| Padding | 16px desktop, 24px mobile | `p-4` / `p-6` |

**Botones:**

| Variante | Estilo | Tailwind |
|----------|--------|----------|
| Primary | Azul sólido | `bg-primary text-primary-foreground` |
| Secondary | Gris outline | `bg-secondary text-secondary-foreground` |
| Destructive | Rojo sólido | `bg-destructive text-destructive-foreground` |
| Ghost | Transparente | `hover:bg-accent` |
| Size default | h-10 | `h-10 px-4` |
| Size lg (mobile) | h-14 | `h-14 px-6` |

**Semáforo Badges:**

| Estado | Estilo | Tailwind |
|--------|--------|----------|
| OK | Verde con fondo claro | `bg-green-100 text-green-800 border-green-200` |
| Warning | Amarillo con fondo claro | `bg-yellow-100 text-yellow-800 border-yellow-200` |
| Alert | Rojo con fondo claro | `bg-red-100 text-red-800 border-red-200` |
| Tamaño | Pill con icono | `px-2.5 py-0.5 rounded-full text-xs font-medium` |

**Navigation:**

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Tipo | Sidebar fijo | Bottom bar fijo |
| Width/Height | w-64 | h-16 |
| Items | Icon + label | Icon + label pequeño |
| Active state | `bg-accent` | `text-primary` |

### Micro-interactions

| Interacción | Animación | Duración |
|-------------|-----------|----------|
| Hover en cards | Scale sutil 1.02 | 150ms |
| Click en botón | Feedback visual inmediato | 100ms |
| Toast aparece | Slide desde abajo | 200ms |
| Toast desaparece | Fade out | 150ms |
| Checkbox marca | Scale bounce sutil | 200ms |
| Progress bar | Width transition | 300ms |
| Skeleton loading | Pulse animation | Continuo |

## User Journeys

### Journey 1: JO - Completar Avance Diario

**Contexto:** JO llega a la obra 7am, necesita registrar avance de tarea antes de comenzar otra.

| Paso | Acción | UI | Tiempo |
|------|--------|-----|--------|
| 1 | Abre app (ya logueado) | Splash → Mis OTs | 2s |
| 2 | Ve lista de OTs asignadas | Cards con semáforo, más urgente arriba | Instantáneo |
| 3 | Tap en OT activa | Card expande o navega a detalle | 1s |
| 4 | Ve checklist de tareas | □ Pendientes arriba, ✓ completadas abajo | Instantáneo |
| 5 | Tap en tarea a completar | Modal o inline expand | 1s |
| 6 | Tap botón cámara 📷 | Abre cámara nativa | 1s |
| 7 | Saca foto | Captura con timestamp automático | 5-10s |
| 8 | (Opcional) Agrega nota | Input de texto, max 200 chars | 0-10s |
| 9 | Tap "Completar ✓" | Botón grande, prominente | 1s |
| 10 | Ve confirmación | Toast "✓ Guardado" + vibración | 0.5s |

**Total: < 30 segundos** (sin contar tiempo de foto)

**Estados de Error:**
- Sin conexión → Guarda local, muestra "📤 Pendiente de sincronizar"
- Foto muy grande → Comprime automáticamente
- Sesión expirada → "Ingresá de nuevo" con redirect a login

### Journey 2: JO - Registrar Consumo de Material

**Contexto:** JO recibe bolsa de cemento, necesita registrar consumo contra OT.

| Paso | Acción | UI |
|------|--------|-----|
| 1 | Desde OT activa, tap "Insumos" | Tab o sección dentro de OT |
| 2 | Ve lista de insumos estimados | Tabla: Insumo / Estimado / Consumido |
| 3 | Tap en insumo (ej: Cemento) | Expande inline |
| 4 | Ingresa cantidad consumida | Input numérico con + / - steppers |
| 5 | (Opcional) Foto de remito | Botón cámara |
| 6 | Tap "Guardar" | Actualiza fila, muestra nuevo % |

**Alertas Automáticas:**
- Si consumido > estimado → Badge 🟡 "Desvío X%"
- Si consumido > 120% estimado → Badge 🔴 "Desvío crítico"

### Journey 3: DO - Revisión Matutina de Obras

**Contexto:** DO llega a oficina 8am, necesita saber estado de sus 4 obras.

| Paso | Acción | UI |
|------|--------|-----|
| 1 | Abre app en browser | Dashboard carga |
| 2 | Ve banner de alertas | "⚠️ 3 alertas requieren atención [Ver →]" |
| 3 | Ve grid de obras | Cards con semáforo: 🟢 Obra A, 🟡 Obra B, 🔴 Obra C |
| 4 | Identifica problema | Obra C tiene 🔴, click en card |
| 5 | Ve detalle de obra | Lista de OTs con estados, métricas de avance |
| 6 | Click en alerta específica | Drill-down a OT con desvío |
| 7 | Ve detalle del desvío | Qué está mal, cuánto, desde cuándo |
| 8 | Toma acción o delega | "Contactar JO", "Aprobar sobrecosto", etc. |

**Insight en < 30 segundos:** DO sabe qué obras tienen problemas sin scroll ni clicks.

### Journey 4: DO - Aprobar OT Nueva

**Contexto:** JO creó OT, DO necesita revisar y aprobar para que inicie.

| Paso | Acción | UI |
|------|--------|-----|
| 1 | Notificación o badge | "🔔 1 OT pendiente de aprobación" |
| 2 | Click en notificación | Navega a OT en estado "Borrador" |
| 3 | Revisa datos de OT | Resumen: Rubro, tareas, insumos estimados, presupuesto |
| 4 | Ve análisis automático | "Presupuesto estimado: $X. Disponible en obra: $Y" |
| 5 | Aprueba o rechaza | [Aprobar ✓] [Solicitar cambios] [Rechazar ✗] |
| 6 | Si aprueba, OT cambia estado | "Aprobada" → JO puede ejecutar |

**Validaciones Mostradas:**
- ¿Hay presupuesto suficiente?
- ¿Rubros asignados correctamente?
- ¿Tareas claras y alcanzables?

### Journey 5: Compras - Procesar Requisiciones

**Contexto:** Hay 5 requisiciones pendientes de diferentes obras, Compras necesita agrupar y generar OC.

| Paso | Acción | UI |
|------|--------|-----|
| 1 | Abre sección Compras | Lista de requisiciones pendientes |
| 2 | Ve requisiciones agrupadas | Por proveedor sugerido o por insumo |
| 3 | Filtra por estado | "Pendientes", "En proceso", "Completadas" |
| 4 | Selecciona requisiciones a procesar | Checkboxes, selección múltiple |
| 5 | Click "Crear OC" | Modal con resumen |
| 6 | Revisa y ajusta | Proveedor, cantidades, precios |
| 7 | Confirma OC | Genera documento, actualiza estados |

**Vista Agregada:** Compras ve TODAS las obras, no filtrado por una sola.

## Component Strategy

### Base shadcn/ui Components (Instalar)

| Componente | Uso en EDO | Prioridad |
|------------|-----------|-----------|
| `Button` | CTAs, acciones principales | MVP |
| `Card` | OT cards, obra cards, widgets | MVP |
| `Input` | Formularios, búsqueda | MVP |
| `Badge` | Semáforo, estados, contadores | MVP |
| `Toast` | Feedback de acciones | MVP |
| `Dialog` | Confirmaciones, formularios modales | MVP |
| `Table` | Listados desktop (DO, Compras) | MVP |
| `Tabs` | Navegación dentro de OT | MVP |
| `Progress` | Barras de avance | MVP |
| `Select` | Dropdowns de selección | MVP |
| `Checkbox` | Selección múltiple, tareas | MVP |
| `Sheet` | Drawer mobile para detalles | Fase 2 |
| `Command` | Búsqueda rápida (Cmd+K) | Fase 2 |
| `Calendar` | Selección de fechas | Fase 2 |
| `Chart` | Curva S, gráficos de avance | Fase 2 |

### Custom EDO Components (Crear)

| Componente | Propósito | Base shadcn |
|------------|-----------|-------------|
| `<SemaforoStatus>` | Badge 🟢🟡🔴 con lógica de umbrales | Badge |
| `<OTCard>` | Card de OT con estado, progreso, acciones | Card |
| `<ObraCard>` | Card de obra para dashboard DO | Card |
| `<PhotoCapture>` | Captura foto con timestamp y ubicación | Button + Dialog |
| `<SyncIndicator>` | Estado de sincronización (📤 ✓) | Badge |
| `<AlertBanner>` | Banner de alertas pendientes | Alert |
| `<QuickAction>` | FAB para JO (Nueva foto, etc.) | Button |
| `<TaskChecklist>` | Lista de tareas con checkbox | Checkbox + lista |
| `<ConsumoInput>` | Input de cantidad con +/- steppers | Input |
| `<TimelineEvent>` | Evento en historial de OT | Custom |
| `<ProgressBar>` | Barra de avance con % y colores | Progress |
| `<RoleBasedNav>` | Navegación adaptativa por rol | Custom |

### Component Composition Examples

**OTCard:**
```tsx
<Card className="p-4 hover:shadow-md transition-shadow">
  <div className="flex justify-between items-start">
    <div>
      <Badge variant="semaforo" status={ot.status} />
      <h3 className="font-semibold mt-1">{ot.codigo}</h3>
      <p className="text-sm text-muted-foreground">{ot.descripcion}</p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
  </div>
  <Progress value={ot.avance} className="mt-3" />
  <p className="text-xs text-muted-foreground mt-1">
    {ot.tareasCompletadas}/{ot.tareasTotal} tareas
  </p>
</Card>
```

**SemaforoStatus:**
```tsx
const statusConfig = {
  ok: { color: 'green', icon: CheckCircle, label: 'En orden' },
  warning: { color: 'yellow', icon: AlertTriangle, label: 'Atención' },
  alert: { color: 'red', icon: XCircle, label: 'Crítico' },
};

<Badge className={cn(
  'flex items-center gap-1',
  `bg-${status.color}-100 text-${status.color}-800`
)}>
  <status.icon className="h-3 w-3" />
  {status.label}
</Badge>
```

## Interaction Patterns

### Navigation Patterns

**Desktop (DO, Compras):**
- Sidebar fijo con 5-6 secciones
- Breadcrumbs para contexto en drill-down
- Tabs dentro de páginas de detalle
- Cmd+K para búsqueda rápida (Fase 2)

**Mobile (JO):**
- Bottom navigation con 4 items máximo
- Swipe gestures para acciones rápidas en cards
- Pull-to-refresh en listados
- FAB para acción principal (📷 Nueva foto)

### Form Patterns

**Principios:**
- Campos mínimos, calcular el resto
- Validación inline, no al submit
- Autosave para borradores
- Placeholders descriptivos

**Input Específicos:**
| Tipo de dato | Componente | Comportamiento |
|--------------|------------|----------------|
| Cantidad | Input numérico + steppers | +/- buttons para campo |
| Fecha | Calendar picker | Default: hoy |
| Foto | Camera native | Compresión automática |
| Texto largo | Textarea autosize | Max 500 chars |
| Selección única | Select/Radio | Opciones claras |
| Selección múltiple | Checkboxes | Visual de seleccionados |

### Feedback Patterns

**Feedback Inmediato (< 200ms):**
| Acción | Feedback |
|--------|----------|
| Tap/Click | Ripple o highlight |
| Hover | Cursor pointer + sombra sutil |
| Focus | Ring visible |
| Loading | Skeleton o spinner inline |

**Feedback de Acción (< 2s):**
| Resultado | Feedback |
|-----------|----------|
| Éxito | Toast verde "✓ Guardado" + vibración (móvil) |
| Error | Toast rojo con mensaje claro + acción retry |
| Pendiente | Toast info "📤 Se sincronizará" |
| Advertencia | Toast amarillo con contexto |

**Feedback de Estado:**
| Estado | Indicador |
|--------|-----------|
| Offline | Banner superior "Sin conexión" |
| Sincronizando | Spinner en header + contador |
| Sync completo | "✓ Actualizado hace X min" |
| Error de sync | Badge rojo + acción manual |

### State Management Patterns

**Optimistic UI:**
- Acciones se reflejan inmediatamente en UI
- Rollback si falla el servidor
- Indicador de "pendiente de confirmación"

**Offline Queue:**
```
1. Usuario completa acción
2. Guardar en localStorage/IndexedDB
3. Mostrar "📤 Pendiente"
4. Cuando hay conexión, sync
5. Actualizar indicador a "✓"
6. Si falla, mantener en queue + notificar
```

**Estado de OT:**
```
Borrador → [DO Aprueba] → Aprobada → [JO Inicia] → En Ejecución → [JO Completa] → Cerrada
                ↓
           [DO Rechaza] → Rechazada
```

## Responsive & Accessibility Summary

### Responsive Strategy

| Breakpoint | Layout | Target |
|------------|--------|--------|
| < 640px | Mobile stack, bottom nav | JO siempre, otros en móvil |
| 640-768px | Mobile con más espacio | Tablet portrait |
| 768-1024px | Sidebar colapsable + contenido | Tablet landscape, laptop |
| > 1024px | Sidebar fijo + grid de cards | Desktop |

**Role Override:**
- `user.role === 'JO'` → Siempre layout mobile
- Otros roles → Responsive por viewport

### Accessibility Checklist

**Visual:**
- [x] Contraste mínimo 4.5:1 (texto normal)
- [x] Contraste mínimo 3:1 (texto grande, iconos)
- [x] Semáforo usa color + icono + texto (no solo color)
- [x] Focus visible en todos los interactivos
- [x] Reduced motion respetado

**Motor:**
- [x] Touch targets mínimo 44×44px
- [x] Touch targets campo 48×48px
- [x] Espacio entre targets 8px mínimo
- [x] Gestos tienen alternativa de tap

**Cognitivo:**
- [x] Lenguaje claro, español coloquial
- [x] Errores explicados, no códigos
- [x] Confirmación solo para destructivos
- [x] Máximo 5 pasos para tareas frecuentes

**Técnico:**
- [x] HTML semántico (nav, main, aside, article)
- [x] ARIA labels donde necesario
- [x] Skip links para keyboard
- [x] Tab order lógico

## Implementation Notes

### Development Priorities

**MVP (Semana 1-4):**
1. Layout base (mobile JO + desktop DO)
2. Componentes core: Button, Card, Badge, Input, Toast
3. SemaforoStatus component
4. OTCard y ObraCard
5. Navegación por rol
6. Flujo JO: Ver OTs → Completar tarea
7. Flujo DO: Dashboard → Ver alertas

**Fase 2 (Semana 5-8):**
1. PhotoCapture con offline queue
2. SyncIndicator completo
3. Flujo Compras
4. Tablas con filtros y export
5. Gráficos de avance (Curva S)

**Fase 3 (Semana 9-12):**
1. Búsqueda rápida (Cmd+K)
2. Notificaciones push (opcional)
3. PWA completo con install prompt
4. Reportes exportables

### Design-Dev Handoff Notes

**Para Desarrollo:**
- Usar shadcn/ui CLI: `npx shadcn-ui@latest add [component]`
- Customizar en `tailwind.config.js` y `globals.css`
- Componentes EDO custom van en `src/components/edo/`
- Hook `useRoleBasedLayout()` determina mobile vs desktop
- Siempre mobile-first en CSS, luego breakpoints

**Tokens Críticos:**
```css
/* globals.css */
:root {
  --status-ok: 142 76% 36%;
  --status-warning: 38 92% 50%;
  --status-alert: 0 84% 60%;
  --touch-target-min: 44px;
  --touch-target-field: 56px;
}
```

**Testing UX:**
- Probar con usuarios reales de obra (JO) en campo
- Medir tiempo de tareas frecuentes (< 30s meta)
- Validar semáforo es entendido sin explicación
- Confirmar offline funciona en zonas sin señal

---

## Document Status

| Sección | Estado |
|---------|--------|
| Executive Summary | ✅ Completo |
| Core User Experience | ✅ Completo |
| Desired Emotional Response | ✅ Completo |
| UX Pattern Analysis | ✅ Completo |
| Design System Foundation | ✅ Completo |
| Defining Experience | ✅ Completo |
| Visual Design Foundation | ✅ Completo |
| Design Direction | ✅ Completo |
| User Journeys | ✅ Completo |
| Component Strategy | ✅ Completo |
| Interaction Patterns | ✅ Completo |
| Responsive & Accessibility | ✅ Completo |
| Implementation Notes | ✅ Completo |

**Documento UX completo y listo para implementación.**
