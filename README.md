# Sistema EDO Chelabs

Sistema de gestión y control de ejecución de obras para cooperativas de vivienda.

## Stack

- **Frontend:** Next.js 14 + React 19 + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel (recomendado)

## Setup Rápido

### 1. Crear proyecto en Supabase (GRATIS)

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Crear nuevo proyecto (elegir región South America si está disponible)
3. Esperar ~2 minutos a que se configure

### 2. Configurar base de datos

1. En Supabase Dashboard, ir a **SQL Editor**
2. Copiar y pegar el contenido de `supabase/schema.sql`
3. Click en **Run** para crear todas las tablas

### 3. Obtener credenciales

1. En Supabase Dashboard, ir a **Settings > API**
2. Copiar:
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY

### 4. Configurar variables de entorno

Editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-anon-key
```

### 5. Crear primer usuario Admin

1. En Supabase Dashboard, ir a **Authentication > Users**
2. Click en **Add user > Create new user**
3. Ingresar email y password
4. En **SQL Editor**, ejecutar:

```sql
UPDATE usuarios
SET rol = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

### 6. Iniciar desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas (App Router)
│   ├── auth/              # Login, callback
│   ├── dashboard/         # Panel principal
│   ├── obras/             # CRUD de obras
│   └── api/               # API routes
├── lib/
│   └── supabase/          # Clientes Supabase (browser/server)
├── types/
│   └── database.ts        # Tipos TypeScript para BD
└── middleware.ts          # Auth middleware

supabase/
└── schema.sql             # Schema completo de la BD
```

## Modelo de Datos

```
OBRA (1) ──────┬────── (*) RUBRO
               │
               ├────── (*) ORDEN_TRABAJO ──── (*) TAREA
               │              │
               │              └────── (*) LINEA_OC
               │                           │
               ├────── (*) INSUMO ─────────┘
               │
               └────── (*) USUARIO

ORDEN_COMPRA (1) ────── (*) LINEA_OC
```

## Roles de Usuario

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador | Todo |
| `director_obra` | Director de Obra | Ver todas las obras, crear OT, aprobar |
| `jefe_obra` | Jefe de Obra | Ejecutar OT, cargar avance |
| `compras` | Compras | Gestionar OC, recepciones |

## Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Iniciar producción
npm run lint     # Linter
```

## Deploy a Vercel

1. Push a GitHub
2. Conectar repo en [vercel.com](https://vercel.com)
3. Agregar variables de entorno en Vercel Dashboard
4. Deploy automático

## Próximos Pasos (Sprint 1)

- [ ] Flujo completo de estados OT
- [ ] Carga de fotos con evidencia
- [ ] Tareas/checklist por OT
- [ ] Dashboard con métricas

---

Sistema EDO Chelabs v2 - Control de Ejecución de Obras
