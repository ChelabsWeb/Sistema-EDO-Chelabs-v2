/**
 * Insumos predefinidos comunes en proyectos de construccion
 * Organizados por rubro para facilitar la seleccion
 */

import type { InsumoTipo } from '@/types/database'

export interface InsumoPredefinido {
  nombre: string
  unidad: string
  tipo: InsumoTipo
  rubro: string
  precio_referencia?: number
}

/**
 * Catalogo de insumos predefinidos del sistema
 * Basado en practica comun de construccion en Uruguay
 */
export const INSUMOS_PREDEFINIDOS: InsumoPredefinido[] = [
  // ============================================
  // MOVIMIENTO DE TIERRA
  // ============================================
  { nombre: 'Retroexcavadora', unidad: 'hr', tipo: 'material', rubro: 'Movimiento de Tierra' },
  { nombre: 'Camion volcador', unidad: 'hr', tipo: 'material', rubro: 'Movimiento de Tierra' },
  { nombre: 'Tosca compactada', unidad: 'm3', tipo: 'material', rubro: 'Movimiento de Tierra' },
  { nombre: 'Pedregullo', unidad: 'm3', tipo: 'material', rubro: 'Movimiento de Tierra' },
  { nombre: 'Operador maquina', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Movimiento de Tierra' },
  { nombre: 'Peon movimiento tierra', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Movimiento de Tierra' },

  // ============================================
  // ESTRUCTURA
  // ============================================
  { nombre: 'Hormigon elaborado H21', unidad: 'm3', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Hormigon elaborado H25', unidad: 'm3', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Hormigon elaborado H30', unidad: 'm3', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Acero ADN420 6mm', unidad: 'kg', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Acero ADN420 8mm', unidad: 'kg', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Acero ADN420 10mm', unidad: 'kg', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Acero ADN420 12mm', unidad: 'kg', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Alambre negro', unidad: 'kg', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Madera encofrado', unidad: 'm2', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Fenolico 18mm', unidad: 'm2', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Puntales metalicos', unidad: 'unidad', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Desmoldante', unidad: 'lt', tipo: 'material', rubro: 'Estructura' },
  { nombre: 'Oficial armador', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Estructura' },
  { nombre: 'Oficial encofrador', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Estructura' },
  { nombre: 'Peon estructura', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Estructura' },

  // ============================================
  // ALBANILERIA
  // ============================================
  { nombre: 'Ladrillo comun', unidad: 'unidad', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Ladrillo de campo', unidad: 'unidad', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Bloque ceramico 12cm', unidad: 'unidad', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Bloque ceramico 18cm', unidad: 'unidad', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Bloque hormigon 20cm', unidad: 'unidad', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Arena fina', unidad: 'm3', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Arena gruesa', unidad: 'm3', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Portland normal', unidad: 'kg', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Cal hidratada', unidad: 'kg', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Mezcla adhesiva', unidad: 'kg', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Hierro planchuela', unidad: 'kg', tipo: 'material', rubro: 'Albanileria' },
  { nombre: 'Oficial albanil', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Albanileria' },
  { nombre: 'Medio oficial albanil', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Albanileria' },
  { nombre: 'Peon albanileria', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Albanileria' },

  // ============================================
  // TECHOS
  // ============================================
  { nombre: 'Chapa galvanizada', unidad: 'm2', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Chapa trapezoidal color', unidad: 'm2', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Teja francesa', unidad: 'unidad', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Teja colonial', unidad: 'unidad', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Bovedilla ceramica', unidad: 'unidad', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Vigueta pretensada', unidad: 'ml', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Tirante pino 2x4', unidad: 'ml', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Tirante pino 2x6', unidad: 'ml', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Membrana asfaltica', unidad: 'm2', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Tornillos autoperforantes', unidad: 'unidad', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Cumbrera', unidad: 'ml', tipo: 'material', rubro: 'Techos' },
  { nombre: 'Oficial techador', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Techos' },
  { nombre: 'Peon techos', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Techos' },

  // ============================================
  // REVESTIMIENTOS
  // ============================================
  { nombre: 'Revoque grueso', unidad: 'm2', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Revoque fino', unidad: 'm2', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Azulejo 20x20', unidad: 'm2', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Ceramica pared', unidad: 'm2', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Porcellanato pared', unidad: 'm2', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Pastina', unidad: 'kg', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Pegamento ceramico', unidad: 'kg', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Enduido plastico', unidad: 'kg', tipo: 'material', rubro: 'Revestimientos' },
  { nombre: 'Oficial revestidor', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Revestimientos' },
  { nombre: 'Peon revestimientos', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Revestimientos' },

  // ============================================
  // PISOS
  // ============================================
  { nombre: 'Contrapiso', unidad: 'm2', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Carpeta niveladora', unidad: 'm2', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Ceramica piso 40x40', unidad: 'm2', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Ceramica piso 60x60', unidad: 'm2', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Porcellanato piso', unidad: 'm2', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Piso flotante', unidad: 'm2', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Zocalo ceramico', unidad: 'ml', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Pegamento piso', unidad: 'kg', tipo: 'material', rubro: 'Pisos' },
  { nombre: 'Oficial colocador pisos', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Pisos' },
  { nombre: 'Peon pisos', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Pisos' },

  // ============================================
  // ABERTURAS
  // ============================================
  { nombre: 'Puerta placa 70cm', unidad: 'unidad', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Puerta placa 80cm', unidad: 'unidad', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Puerta exterior madera', unidad: 'unidad', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Ventana aluminio corrediza', unidad: 'm2', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Ventana aluminio proyectante', unidad: 'm2', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Marco madera', unidad: 'ml', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Bisagras', unidad: 'unidad', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Cerradura', unidad: 'unidad', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Picaporte', unidad: 'unidad', tipo: 'material', rubro: 'Aberturas' },
  { nombre: 'Oficial carpintero', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Aberturas' },
  { nombre: 'Oficial herrero', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Aberturas' },

  // ============================================
  // INSTALACION SANITARIA
  // ============================================
  { nombre: 'Cano PVC 110mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Cano PVC 63mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Cano PVC 50mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Cano PVC 40mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Cano PPR agua fria', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Cano PPR agua caliente', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Accesorios PVC (codos, tees)', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Accesorios PPR', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Inodoro', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Lavatorio', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Bidet', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Ducha', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Pileta cocina', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Griferia', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Tanque agua 500lt', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Calefon', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Oficial sanitarista', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Instalacion Sanitaria' },
  { nombre: 'Peon sanitaria', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Instalacion Sanitaria' },

  // ============================================
  // INSTALACION ELECTRICA
  // ============================================
  { nombre: 'Cable unipolar 1.5mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Cable unipolar 2.5mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Cable unipolar 4mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Cable unipolar 6mm', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Cano corrugado 3/4', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Cano corrugado 1', unidad: 'ml', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Cajas rectangulares', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Cajas octogonales', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Tablero 6 modulos', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Tablero 12 modulos', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Termica 10A', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Termica 16A', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Termica 20A', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Disyuntor diferencial', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Toma corriente 10A', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Toma corriente 20A', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Interruptor simple', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Interruptor doble', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Plafon', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Spot embutido', unidad: 'unidad', tipo: 'material', rubro: 'Instalacion Electrica' },
  { nombre: 'Oficial electricista', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Instalacion Electrica' },
  { nombre: 'Peon electricista', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Instalacion Electrica' },

  // ============================================
  // CARPINTERIA
  // ============================================
  { nombre: 'Placard melamina', unidad: 'ml', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'Mesada cocina', unidad: 'ml', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'Bajo mesada', unidad: 'ml', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'Alacena', unidad: 'ml', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'Estantes', unidad: 'ml', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'Melamina 18mm', unidad: 'm2', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'MDF 18mm', unidad: 'm2', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'Herrajes carpinteria', unidad: 'unidad', tipo: 'material', rubro: 'Carpinteria' },
  { nombre: 'Carpintero', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Carpinteria' },
  { nombre: 'Ayudante carpintero', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Carpinteria' },

  // ============================================
  // HERRERIA
  // ============================================
  { nombre: 'Hierro angulo', unidad: 'kg', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Hierro plano', unidad: 'kg', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Hierro cuadrado', unidad: 'kg', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Hierro redondo', unidad: 'kg', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Cano estructural', unidad: 'kg', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Chapa negra', unidad: 'kg', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Electrodos', unidad: 'kg', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Disco de corte', unidad: 'unidad', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Antioxido', unidad: 'lt', tipo: 'material', rubro: 'Herreria' },
  { nombre: 'Oficial herrero', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Herreria' },
  { nombre: 'Ayudante herrero', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Herreria' },

  // ============================================
  // PINTURA
  // ============================================
  { nombre: 'Latex interior', unidad: 'lt', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Latex exterior', unidad: 'lt', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Esmalte sintetico', unidad: 'lt', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Barniz', unidad: 'lt', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Enduido interior', unidad: 'kg', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Sellador', unidad: 'lt', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Aguarras', unidad: 'lt', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Lija al agua', unidad: 'unidad', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Lija al seco', unidad: 'unidad', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Rodillo', unidad: 'unidad', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Pincel', unidad: 'unidad', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Cinta papel', unidad: 'unidad', tipo: 'material', rubro: 'Pintura' },
  { nombre: 'Oficial pintor', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Pintura' },
  { nombre: 'Ayudante pintor', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Pintura' },

  // ============================================
  // IMPERMEABILIZACION
  // ============================================
  { nombre: 'Membrana asfaltica 3mm', unidad: 'm2', tipo: 'material', rubro: 'Impermeabilizacion' },
  { nombre: 'Membrana asfaltica 4mm', unidad: 'm2', tipo: 'material', rubro: 'Impermeabilizacion' },
  { nombre: 'Membrana liquida', unidad: 'lt', tipo: 'material', rubro: 'Impermeabilizacion' },
  { nombre: 'Imprimacion asfaltica', unidad: 'lt', tipo: 'material', rubro: 'Impermeabilizacion' },
  { nombre: 'Hidrofugo', unidad: 'lt', tipo: 'material', rubro: 'Impermeabilizacion' },
  { nombre: 'Malla fibra vidrio', unidad: 'm2', tipo: 'material', rubro: 'Impermeabilizacion' },
  { nombre: 'Sellador poliuretanico', unidad: 'unidad', tipo: 'material', rubro: 'Impermeabilizacion' },
  { nombre: 'Oficial impermeabilizador', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Impermeabilizacion' },
  { nombre: 'Peon impermeabilizacion', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Impermeabilizacion' },

  // ============================================
  // VIDRIOS
  // ============================================
  { nombre: 'Vidrio float 4mm', unidad: 'm2', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'Vidrio float 6mm', unidad: 'm2', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'Vidrio laminado', unidad: 'm2', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'Vidrio templado', unidad: 'm2', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'DVH (doble vidriado)', unidad: 'm2', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'Espejo', unidad: 'm2', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'Silicona estructural', unidad: 'unidad', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'Burletes', unidad: 'ml', tipo: 'material', rubro: 'Vidrios' },
  { nombre: 'Vidriero', unidad: 'hr', tipo: 'mano_de_obra', rubro: 'Vidrios' },
]

/**
 * Obtiene los insumos predefinidos filtrados por rubro
 */
export function getInsumosPredefinidosPorRubro(rubroNombre: string): InsumoPredefinido[] {
  return INSUMOS_PREDEFINIDOS.filter(insumo => insumo.rubro === rubroNombre)
}

/**
 * Obtiene los rubros unicos que tienen insumos predefinidos
 */
export function getRubrosConInsumosPredefinidos(): string[] {
  return [...new Set(INSUMOS_PREDEFINIDOS.map(insumo => insumo.rubro))]
}

/**
 * Obtiene los insumos predefinidos agrupados por tipo (material/mano_de_obra)
 */
export function getInsumosPredefinidosAgrupados(rubroNombre: string): {
  materiales: InsumoPredefinido[]
  mano_de_obra: InsumoPredefinido[]
} {
  const insumosDelRubro = getInsumosPredefinidosPorRubro(rubroNombre)
  return {
    materiales: insumosDelRubro.filter(i => i.tipo === 'material'),
    mano_de_obra: insumosDelRubro.filter(i => i.tipo === 'mano_de_obra'),
  }
}
