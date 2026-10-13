/**
 * Datos del módulo de sostenibilidad.
 */

/** Costos ESTIMADOS (USD, orden de magnitud, 2024–2025) de un prototipo físico hipotético. */
export const PHYSICAL_PROTOTYPE_COSTS = [
  { item: 'Placa con microcontrolador (tipo Arduino / ESP32)', min: 10, max: 25 },
  { item: 'Sensores de temperatura (2 termopares tipo K + módulos)', min: 15, max: 25 },
  { item: 'Resistencia de potencia como «chip» calefactor', min: 5, max: 10 },
  { item: 'Disipador de aluminio y ventilador de 12 V', min: 10, max: 20 },
  { item: 'Fuente de alimentación de 12 V', min: 10, max: 20 },
  { item: 'Cables, protoboard y pasta térmica', min: 10, max: 15 },
  { item: 'Muestras de obleas de Ge o GaAs (opcional)', min: 50, max: 300 },
];

export const DIGITAL_COSTS = [
  { item: 'Herramientas de desarrollo (React, Vite, TypeScript: software libre)', min: 0, max: 0 },
  { item: 'Computadora del equipo (ya disponible)', min: 0, max: 0 },
  { item: 'Publicación web estática (planes gratuitos)', min: 0, max: 0 },
  { item: 'Consumo eléctrico del desarrollo (~40 h × 60 W ≈ 2,4 kWh)', min: 0.3, max: 1 },
];

/** Global E-waste Monitor 2024 (ITU/UNITAR). */
export const EWASTE_FACTS = [
  { value: '62 Mt', label: 'residuos electrónicos generados en el mundo en 2022', kind: 'publicado' as const },
  { value: '22,3 %', label: 'recogido y reciclado formalmente de forma documentada', kind: 'publicado' as const },
  { value: '82 Mt', label: 'proyección de generación para 2030', kind: 'publicado' as const },
];

export const RECOVERY = [
  { material: 'Cobre, oro, plata, paladio', source: 'Placas de circuito, conectores', note: 'Recuperables por procesos pirometalúrgicos e hidrometalúrgicos.' },
  { material: 'Galio, germanio, indio', source: 'Chips de GaAs, fibra óptica, pantallas', note: 'Materias primas críticas; hoy se recuperan en proporciones muy bajas.' },
  { material: 'Silicio y plata', source: 'Paneles solares al final de su vida útil', note: 'Reciclaje de vidrio, aluminio y, cada vez más, silicio y plata.' },
  { material: 'Arsénico y plomo', source: 'GaAs, soldaduras antiguas, perovskitas', note: 'Tóxicos: requieren manejo controlado para evitar contaminación.' },
];

export const DEFAULT_TARIFF = 12;
