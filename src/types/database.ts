// Tipos de la base de datos generados para Supabase
// Regenerar con: npx supabase gen types typescript --project-id okywobvelfvyhnzvjycm > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// ENUM TYPES
// ============================================

/** User roles: admin (super), director_obra (DO), jefe_obra (JO), compras */
export type UserRole = 'admin' | 'director_obra' | 'jefe_obra' | 'compras';

/** Obra status */
export type ObraEstado = 'activa' | 'pausada' | 'finalizada';

/** OT status (state machine): borrador -> aprobada -> en_ejecucion -> cerrada */
export type OTStatus = 'borrador' | 'aprobada' | 'en_ejecucion' | 'cerrada';

/** OC status */
export type OCStatus = 'pendiente' | 'enviada' | 'recibida_parcial' | 'recibida_completa' | 'cancelada';

/** Requisicion status */
export type RequisicionEstado = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';

/** Insumo type: material or labor */
export type InsumoTipo = 'material' | 'mano_de_obra';

export interface Database {
  public: {
    Tables: {
      configuracion: {
        Row: {
          clave: string
          created_at: string | null
          descripcion: string | null
          id: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          clave: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          clave?: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      formulas: {
        Row: {
          cantidad_por_unidad: number
          created_at: string | null
          id: string
          insumo_id: string
          rubro_id: string
          updated_at: string | null
        }
        Insert: {
          cantidad_por_unidad?: number
          created_at?: string | null
          id?: string
          insumo_id: string
          rubro_id: string
          updated_at?: string | null
        }
        Update: {
          cantidad_por_unidad?: number
          created_at?: string | null
          id?: string
          insumo_id?: string
          rubro_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formulas_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formulas_rubro_id_fkey"
            columns: ["rubro_id"]
            isOneToOne: false
            referencedRelation: "rubros"
            referencedColumns: ["id"]
          }
        ]
      }
      insumos: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          nombre: string
          obra_id: string
          precio_referencia: number | null
          precio_unitario: number | null
          tipo: InsumoTipo | null
          unidad: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          nombre: string
          obra_id: string
          precio_referencia?: number | null
          precio_unitario?: number | null
          tipo?: InsumoTipo | null
          unidad: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          nombre?: string
          obra_id?: string
          precio_referencia?: number | null
          precio_unitario?: number | null
          tipo?: InsumoTipo | null
          unidad?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insumos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          }
        ]
      }
      lineas_oc: {
        Row: {
          cantidad_recibida: number | null
          cantidad_solicitada: number
          created_at: string | null
          id: string
          insumo_id: string
          orden_compra_id: string
          orden_trabajo_id: string | null
          precio_unitario: number
          updated_at: string | null
        }
        Insert: {
          cantidad_recibida?: number | null
          cantidad_solicitada: number
          created_at?: string | null
          id?: string
          insumo_id: string
          orden_compra_id: string
          orden_trabajo_id?: string | null
          precio_unitario: number
          updated_at?: string | null
        }
        Update: {
          cantidad_recibida?: number | null
          cantidad_solicitada?: number
          created_at?: string | null
          id?: string
          insumo_id?: string
          orden_compra_id?: string
          orden_trabajo_id?: string | null
          precio_unitario?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ot_historial: {
        Row: {
          id: string
          orden_trabajo_id: string
          estado_anterior: OTStatus | null
          estado_nuevo: OTStatus
          usuario_id: string
          notas: string | null
          acknowledged_by: string | null
          acknowledged_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          orden_trabajo_id: string
          estado_anterior?: OTStatus | null
          estado_nuevo: OTStatus
          usuario_id: string
          notas?: string | null
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          orden_trabajo_id?: string
          estado_anterior?: OTStatus | null
          estado_nuevo?: OTStatus
          usuario_id?: string
          notas?: string | null
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ot_historial_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_historial_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      ot_insumos_estimados: {
        Row: {
          id: string
          orden_trabajo_id: string
          insumo_id: string
          cantidad_estimada: number
          precio_estimado: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          orden_trabajo_id: string
          insumo_id: string
          cantidad_estimada?: number
          precio_estimado?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          orden_trabajo_id?: string
          insumo_id?: string
          cantidad_estimada?: number
          precio_estimado?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_insumos_estimados_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_insumos_estimados_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          }
        ]
      }
      ot_fotos: {
        Row: {
          id: string
          orden_trabajo_id: string
          storage_path: string
          nombre_archivo: string
          descripcion: string | null
          tomada_en: string
          latitud: number | null
          longitud: number | null
          subida_por: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          orden_trabajo_id: string
          storage_path: string
          nombre_archivo: string
          descripcion?: string | null
          tomada_en?: string
          latitud?: number | null
          longitud?: number | null
          subida_por?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          orden_trabajo_id?: string
          storage_path?: string
          nombre_archivo?: string
          descripcion?: string | null
          tomada_en?: string
          latitud?: number | null
          longitud?: number | null
          subida_por?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_fotos_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_fotos_subida_por_fkey"
            columns: ["subida_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      consumo_materiales: {
        Row: {
          id: string
          orden_trabajo_id: string
          insumo_id: string
          cantidad_consumida: number
          cantidad_estimada: number | null
          notas: string | null
          registrado_por: string | null
          registrado_en: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          orden_trabajo_id: string
          insumo_id: string
          cantidad_consumida: number
          cantidad_estimada?: number | null
          notas?: string | null
          registrado_por?: string | null
          registrado_en?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          orden_trabajo_id?: string
          insumo_id?: string
          cantidad_consumida?: number
          cantidad_estimada?: number | null
          notas?: string | null
          registrado_por?: string | null
          registrado_en?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumo_materiales_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumo_materiales_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumo_materiales_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      obras: {
        Row: {
          cooperativa: string | null
          created_at: string | null
          deleted_at: string | null
          direccion: string | null
          estado: ObraEstado | null
          fecha_fin_estimada: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          presupuesto_total: number | null
          updated_at: string | null
        }
        Insert: {
          cooperativa?: string | null
          created_at?: string | null
          deleted_at?: string | null
          direccion?: string | null
          estado?: ObraEstado | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          presupuesto_total?: number | null
          updated_at?: string | null
        }
        Update: {
          cooperativa?: string | null
          created_at?: string | null
          deleted_at?: string | null
          direccion?: string | null
          estado?: ObraEstado | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          presupuesto_total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ordenes_compra: {
        Row: {
          condiciones_pago: string | null
          created_at: string | null
          created_by: string
          estado: OCStatus | null
          fecha_emision: string | null
          fecha_entrega_esperada: string | null
          fecha_recepcion: string | null
          id: string
          numero: number
          obra_id: string
          proveedor: string | null
          rut_proveedor: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          condiciones_pago?: string | null
          created_at?: string | null
          created_by: string
          estado?: OCStatus | null
          fecha_emision?: string | null
          fecha_entrega_esperada?: string | null
          fecha_recepcion?: string | null
          id?: string
          numero?: number
          obra_id: string
          proveedor?: string | null
          rut_proveedor?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          condiciones_pago?: string | null
          created_at?: string | null
          created_by?: string
          estado?: OCStatus | null
          fecha_emision?: string | null
          fecha_entrega_esperada?: string | null
          fecha_recepcion?: string | null
          id?: string
          numero?: number
          obra_id?: string
          proveedor?: string | null
          rut_proveedor?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_compra_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_compra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          }
        ]
      }
      recepciones: {
        Row: {
          id: string
          orden_compra_id: string
          notas: string | null
          created_by: string
          created_at: string | null
        }
        Insert: {
          id?: string
          orden_compra_id: string
          notas?: string | null
          created_by: string
          created_at?: string | null
        }
        Update: {
          id?: string
          orden_compra_id?: string
          notas?: string | null
          created_by?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recepciones_orden_compra_id_fkey"
            columns: ["orden_compra_id"]
            isOneToOne: false
            referencedRelation: "ordenes_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recepciones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      ordenes_trabajo: {
        Row: {
          cantidad: number
          costo_estimado: number
          costo_real: number | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          descripcion: string
          estado: OTStatus | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          numero: number
          obra_id: string
          rubro_id: string
          updated_at: string | null
        }
        Insert: {
          cantidad?: number
          costo_estimado?: number
          costo_real?: number | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          descripcion: string
          estado?: OTStatus | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          numero?: number
          obra_id: string
          rubro_id: string
          updated_at?: string | null
        }
        Update: {
          cantidad?: number
          costo_estimado?: number
          costo_real?: number | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          descripcion?: string
          estado?: OTStatus | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          numero?: number
          obra_id?: string
          rubro_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_trabajo_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_rubro_id_fkey"
            columns: ["rubro_id"]
            isOneToOne: false
            referencedRelation: "rubros"
            referencedColumns: ["id"]
          }
        ]
      }
      rubros: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          es_predefinido: boolean | null
          id: string
          nombre: string
          obra_id: string
          presupuesto: number
          presupuesto_ur: number | null
          unidad: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          es_predefinido?: boolean | null
          id?: string
          nombre: string
          obra_id: string
          presupuesto?: number
          presupuesto_ur?: number | null
          unidad?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          es_predefinido?: boolean | null
          id?: string
          nombre?: string
          obra_id?: string
          presupuesto?: number
          presupuesto_ur?: number | null
          unidad?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rubros_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          }
        ]
      }
      tareas: {
        Row: {
          completada: boolean | null
          created_at: string | null
          descripcion: string
          id: string
          orden: number | null
          orden_trabajo_id: string
          updated_at: string | null
          cantidad: number | null
          unidad: string | null
        }
        Insert: {
          completada?: boolean | null
          created_at?: string | null
          descripcion: string
          id?: string
          orden?: number | null
          orden_trabajo_id: string
          updated_at?: string | null
          cantidad?: number | null
          unidad?: string | null
        }
        Update: {
          completada?: boolean | null
          created_at?: string | null
          descripcion?: string
          id?: string
          orden?: number | null
          orden_trabajo_id?: string
          updated_at?: string | null
          cantidad?: number | null
          unidad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          }
        ]
      }
      usuarios: {
        Row: {
          activo: boolean | null
          auth_user_id: string
          created_at: string | null
          email: string
          id: string
          nombre: string
          obra_id: string | null
          rol: UserRole
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          auth_user_id: string
          created_at?: string | null
          email: string
          id?: string
          nombre: string
          obra_id?: string | null
          rol: UserRole
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          auth_user_id?: string
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          obra_id?: string | null
          rol?: UserRole
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          }
        ]
      }
      requisiciones: {
        Row: {
          id: string
          ot_id: string
          estado: RequisicionEstado
          notas: string | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          ot_id: string
          estado?: RequisicionEstado
          notas?: string | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          ot_id?: string
          estado?: RequisicionEstado
          notas?: string | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requisiciones_ot_id_fkey"
            columns: ["ot_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisiciones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      requisicion_items: {
        Row: {
          id: string
          requisicion_id: string
          insumo_id: string
          cantidad: number
          notas: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          requisicion_id: string
          insumo_id: string
          cantidad: number
          notas?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          requisicion_id?: string
          insumo_id?: string
          cantidad?: number
          notas?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requisicion_items_requisicion_id_fkey"
            columns: ["requisicion_id"]
            isOneToOne: false
            referencedRelation: "requisiciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisicion_items_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          }
        ]
      }
      oc_requisiciones: {
        Row: {
          id: string
          orden_compra_id: string
          requisicion_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          orden_compra_id: string
          requisicion_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          orden_compra_id?: string
          requisicion_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oc_requisiciones_orden_compra_id_fkey"
            columns: ["orden_compra_id"]
            isOneToOne: false
            referencedRelation: "ordenes_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oc_requisiciones_requisicion_id_fkey"
            columns: ["requisicion_id"]
            isOneToOne: false
            referencedRelation: "requisiciones"
            referencedColumns: ["id"]
          }
        ]
      }
      plantilla_rubros: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          unidad: string
          es_sistema: boolean
          created_by: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          unidad?: string
          es_sistema?: boolean
          created_by?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          unidad?: string
          es_sistema?: boolean
          created_by?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantilla_rubros_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      plantilla_insumos: {
        Row: {
          id: string
          plantilla_rubro_id: string
          nombre: string
          unidad: string
          tipo: string
          precio_referencia: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plantilla_rubro_id: string
          nombre: string
          unidad: string
          tipo?: string
          precio_referencia?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plantilla_rubro_id?: string
          nombre?: string
          unidad?: string
          tipo?: string
          precio_referencia?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantilla_insumos_plantilla_rubro_id_fkey"
            columns: ["plantilla_rubro_id"]
            isOneToOne: false
            referencedRelation: "plantilla_rubros"
            referencedColumns: ["id"]
          }
        ]
      }
      plantilla_formulas: {
        Row: {
          id: string
          plantilla_rubro_id: string
          plantilla_insumo_id: string
          cantidad_por_unidad: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plantilla_rubro_id: string
          plantilla_insumo_id: string
          cantidad_por_unidad?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plantilla_rubro_id?: string
          plantilla_insumo_id?: string
          cantidad_por_unidad?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantilla_formulas_plantilla_rubro_id_fkey"
            columns: ["plantilla_rubro_id"]
            isOneToOne: false
            referencedRelation: "plantilla_rubros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantilla_formulas_plantilla_insumo_id_fkey"
            columns: ["plantilla_insumo_id"]
            isOneToOne: false
            referencedRelation: "plantilla_insumos"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_obra_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: UserRole
      }
    }
    Enums: {
      insumo_tipo: InsumoTipo
      obra_estado: ObraEstado
      oc_status: OCStatus
      ot_status: OTStatus
      user_role: UserRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Obra = Tables<'obras'>
export type Usuario = Tables<'usuarios'>
export type Rubro = Tables<'rubros'>
export type Insumo = Tables<'insumos'>
export type Formula = Tables<'formulas'>
export type Configuracion = Tables<'configuracion'>
export type OrdenTrabajo = Tables<'ordenes_trabajo'>
export type Tarea = Tables<'tareas'>
export type OrdenCompra = Tables<'ordenes_compra'>
export type LineaOC = Tables<'lineas_oc'>
export type OTFoto = Tables<'ot_fotos'>
export type ConsumoMaterial = Tables<'consumo_materiales'>
export type Requisicion = Tables<'requisiciones'>
export type RequisicionItem = Tables<'requisicion_items'>
export type OCRequisicion = Tables<'oc_requisiciones'>
export type Recepcion = Tables<'recepciones'>

// Plantillas de Rubros (templates for rubros with insumos and formulas)
export type PlantillaRubro = Tables<'plantilla_rubros'>
export type PlantillaInsumo = Tables<'plantilla_insumos'>
export type PlantillaFormula = Tables<'plantilla_formulas'>

// OT History for state tracking
export interface OTHistorial {
  id: string
  orden_trabajo_id: string
  estado_anterior: OTStatus | null
  estado_nuevo: OTStatus
  usuario_id: string
  notas: string | null
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
  usuario?: Pick<Usuario, 'id' | 'nombre'> | null
  usuarios?: Pick<Usuario, 'id' | 'nombre'> | null
}

// Estimated insumos from formula
export interface OTInsumoEstimado {
  id: string
  orden_trabajo_id: string
  insumo_id: string
  cantidad_estimada: number
  precio_estimado: number
  created_at: string | null
  updated_at: string | null
  insumo?: Pick<Insumo, 'id' | 'nombre' | 'unidad' | 'tipo'> | null
  insumos?: Pick<Insumo, 'id' | 'nombre' | 'unidad' | 'tipo'> | null
}

// Extended OT type with relations
export interface OrdenTrabajoWithRelations extends OrdenTrabajo {
  obra?: Obra
  rubro?: Rubro
  created_by_usuario?: Usuario
  tareas?: Tarea[]
  insumos_estimados?: OTInsumoEstimado[]
  historial?: OTHistorial[]
}

// Requisicion item with insumo details
export interface RequisicionItemWithInsumo extends RequisicionItem {
  insumo?: Pick<Insumo, 'id' | 'nombre' | 'unidad' | 'tipo'> | null
}

// Requisicion with relations
export interface RequisicionWithRelations extends Requisicion {
  ot?: Pick<OrdenTrabajo, 'id' | 'numero' | 'descripcion' | 'obra_id'> | null
  items?: RequisicionItemWithInsumo[]
  creador?: Pick<Usuario, 'id' | 'nombre'> | null
}

// Linea OC with insumo details
export interface LineaOCWithInsumo extends LineaOC {
  insumo?: Pick<Insumo, 'id' | 'nombre' | 'unidad' | 'tipo'> | null
  orden_trabajo?: Pick<OrdenTrabajo, 'id' | 'numero' | 'descripcion'> | null
}

// Orden de Compra with relations
export interface OrdenCompraWithRelations extends OrdenCompra {
  obra?: Pick<Obra, 'id' | 'nombre'> | null
  creador?: Pick<Usuario, 'id' | 'nombre'> | null
  lineas?: LineaOCWithInsumo[]
  requisiciones?: RequisicionWithRelations[]
}

// Plantilla insumo with formula
export interface PlantillaInsumoWithFormula extends PlantillaInsumo {
  formula?: PlantillaFormula | null
}

// Plantilla rubro with all details
export interface PlantillaRubroWithDetails extends PlantillaRubro {
  insumos?: PlantillaInsumoWithFormula[]
  creador?: Pick<Usuario, 'id' | 'nombre'> | null
}
