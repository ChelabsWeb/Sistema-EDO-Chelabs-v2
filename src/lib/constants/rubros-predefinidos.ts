/**
 * Rubros predefinidos comunes en proyectos de construccion
 * Estos rubros se crean automaticamente al crear una nueva obra
 */

export interface RubroPredefinido {
  nombre: string
  unidad: string
  descripcion?: string
}

export const RUBROS_PREDEFINIDOS: RubroPredefinido[] = [
  { nombre: 'Movimiento de Tierra', unidad: 'm3', descripcion: 'Excavaciones, rellenos, nivelacion' },
  { nombre: 'Estructura', unidad: 'm3', descripcion: 'Hormigon armado, columnas, vigas, losas' },
  { nombre: 'Albanileria', unidad: 'm2', descripcion: 'Muros de ladrillo, tabiques' },
  { nombre: 'Techos', unidad: 'm2', descripcion: 'Cubiertas, tejas, chapas' },
  { nombre: 'Revestimientos', unidad: 'm2', descripcion: 'Revoques, azulejos, ceramicas' },
  { nombre: 'Pisos', unidad: 'm2', descripcion: 'Contrapisos, pisos terminados' },
  { nombre: 'Aberturas', unidad: 'unidad', descripcion: 'Puertas, ventanas, portones' },
  { nombre: 'Instalacion Sanitaria', unidad: 'global', descripcion: 'Canerias, artefactos sanitarios' },
  { nombre: 'Instalacion Electrica', unidad: 'global', descripcion: 'Cableado, tableros, luminarias' },
  { nombre: 'Carpinteria', unidad: 'unidad', descripcion: 'Muebles fijos, placares' },
  { nombre: 'Herreria', unidad: 'kg', descripcion: 'Rejas, barandas, estructuras metalicas' },
  { nombre: 'Pintura', unidad: 'm2', descripcion: 'Pintura interior y exterior' },
  { nombre: 'Impermeabilizacion', unidad: 'm2', descripcion: 'Membranas, tratamientos hidrofugos' },
  { nombre: 'Vidrios', unidad: 'm2', descripcion: 'Vidrios, espejos' },
]

/**
 * Unidades de medida disponibles para rubros
 */
export const UNIDADES_RUBRO = [
  { value: 'm2', label: 'Metro cuadrado (m2)' },
  { value: 'm3', label: 'Metro cubico (m3)' },
  { value: 'ml', label: 'Metro lineal (ml)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'global', label: 'Global' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'lt', label: 'Litro (lt)' },
  { value: 'hr', label: 'Hora (hr)' },
]
