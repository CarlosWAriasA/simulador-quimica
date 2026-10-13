import type { CoolingId, WorkloadId } from '../types';

/**
 * Parámetros del modelo térmico del chip virtual.
 *
 * TODOS los valores de este archivo son SUPUESTOS de un diseño hipotético
 * (procesador de escritorio genérico), elegidos para que el comportamiento
 * sea ilustrativo y del orden de magnitud correcto. No describen ningún
 * procesador comercial concreto.
 */

/** Potencia del chip (supuesto). P(u) = P_reposo + (P_max − P_reposo)·u */
export const POWER = {
  /** Potencia con carga 0 %: fugas + circuitos siempre activos [W]. */
  idleW: 8,
  /** Potencia con carga 100 % [W]. */
  maxW: 125,
};

/** Geometría del dado (die) de semiconductor (supuesto). */
export const DIE = {
  /** Área del dado [m²] (150 mm²). */
  areaM2: 150e-6,
  /** Espesor del dado [m] (0,5 mm). */
  thicknessM: 0.5e-3,
  /** Número de núcleos representados. */
  cores: 8,
};

export interface CoolingConfig {
  id: CoolingId;
  label: string;
  short: string;
  description: string;
  /** Resistencia térmica efectiva encapsulado → ambiente [K/W]. */
  rThermal: number;
  /** Capacidad térmica efectiva del conjunto (encapsulado + disipador) [J/K]. */
  capacitance: number;
  /** Potencia eléctrica que consume el propio sistema de refrigeración [W]. */
  auxPowerW: number;
  /** Velocidad visual del ventilador (vueltas por segundo real). */
  fanRps: number;
}

export const COOLING: Record<CoolingId, CoolingConfig> = {
  pasiva: {
    id: 'pasiva',
    label: 'Sin refrigeración activa',
    short: 'Pasiva',
    description: 'Solo un disipador metálico; el calor sale por convección natural.',
    rThermal: 1.2,
    capacitance: 150,
    auxPowerW: 0,
    fanRps: 0,
  },
  ventilador: {
    id: 'ventilador',
    label: 'Ventilador básico',
    short: 'Ventilador',
    description: 'Disipador de aletas con ventilador: convección forzada.',
    rThermal: 0.45,
    capacitance: 300,
    auxPowerW: 3,
    fanRps: 1.2,
  },
  avanzada: {
    id: 'avanzada',
    label: 'Refrigeración avanzada',
    short: 'Avanzada',
    description: 'Refrigeración líquida o torre grande: bomba y varios ventiladores.',
    rThermal: 0.22,
    capacitance: 600,
    auxPowerW: 12,
    fanRps: 2.4,
  },
};

export const COOLING_LIST: CoolingConfig[] = [COOLING.pasiva, COOLING.ventilador, COOLING.avanzada];

/**
 * Protección térmica (throttling): por encima de `startC` el chip reduce su
 * frecuencia y, con ella, su potencia. Modelo de control lineal (supuesto):
 * factor = 1 − (1 − minFactor)·(T − startC)/bandC, acotado a [minFactor, 1].
 */
export const THROTTLE = {
  startC: 95,
  bandC: 10,
  minFactor: 0.35,
};

/**
 * Puntos calientes (representación de la distribución espacial). Cada núcleo
 * activo se calienta sobre la media según ΔT = k·P_núcleo con un retardo τ.
 */
export const HOTSPOT = {
  kKPerW: 0.8,
  tauS: 3,
};

/** Umbrales del estado térmico [°C] (supuesto, típico de CPU de consumo). */
export const THERMAL_STATUS = [
  { maxC: 50, label: 'Óptimo', tone: 'cool' as const, description: 'Temperatura baja: amplio margen de operación.' },
  { maxC: 75, label: 'Normal', tone: 'ok' as const, description: 'Rango habitual de trabajo.' },
  { maxC: 90, label: 'Elevado', tone: 'warm' as const, description: 'Calor considerable; la refrigeración trabaja al máximo.' },
  { maxC: 100, label: 'Crítico', tone: 'hot' as const, description: 'Cerca del límite de la unión (Tj,máx ≈ 100 °C).' },
  { maxC: Infinity, label: 'Límite superado', tone: 'danger' as const, description: 'Por encima del límite: un chip real reduciría frecuencia o se apagaría.' },
];

/** Temperatura máxima de unión del diseño hipotético [°C]. */
export const TJ_MAX = 100;

export interface WorkloadPreset {
  id: Exclude<WorkloadId, 'personalizado'>;
  label: string;
  load: number;
  description: string;
}

/** Modos de simulación con carga predefinida (supuesto). */
export const WORKLOADS: WorkloadPreset[] = [
  { id: 'reposo', label: 'Reposo', load: 0.05, description: 'Escritorio sin tareas: casi todos los núcleos inactivos.' },
  { id: 'normal', label: 'Uso normal', load: 0.3, description: 'Navegación web, documentos, video.' },
  { id: 'videojuegos', label: 'Videojuegos', load: 0.7, description: 'Varios núcleos ocupados de forma sostenida.' },
  { id: 'intensiva', label: 'Carga intensiva', load: 1, description: 'Renderizado o compilación: todos los núcleos al 100 %.' },
];

export const AMBIENT_RANGE = { min: 15, max: 45, default: 25 };

/** Intervalo de muestreo del historial [s simulados]. */
export const SAMPLE_INTERVAL_S = 1;
/** Paso interno de integración [s simulados]. */
export const INTEGRATION_STEP_S = 0.05;
/** Máximo de muestras guardadas (1 h simulada). */
export const MAX_HISTORY = 3600;

export const SPEED_OPTIONS = [1, 5, 10, 20, 50];
export const DEFAULT_SPEED = 10;
