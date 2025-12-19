import type { AppError } from './app';

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type { AppError } from './app';

// Re-export database types for convenience
export type {
  Database,
  UserRole,
  ObraEstado,
  OTStatus,
  OCStatus,
  Tables,
  InsertTables,
  UpdateTables,
  Obra,
  Usuario,
  Rubro,
  Insumo,
  OrdenTrabajo,
  Tarea,
  OrdenCompra,
  LineaOC,
} from './database';
