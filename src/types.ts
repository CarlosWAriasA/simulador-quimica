/** Tipos compartidos de ThermoChip Lab. */

export type MaterialId = 'si' | 'ge' | 'gaas';
export type CoolingId = 'pasiva' | 'ventilador' | 'avanzada';
export type WorkloadId = 'reposo' | 'normal' | 'videojuegos' | 'intensiva' | 'personalizado';
export type DopantId = 'intrinseco' | 'fosforo' | 'boro';

/**
 * Naturaleza de un valor mostrado en la interfaz.
 * - publicado: dato tomado de literatura científica (con referencia).
 * - supuesto: parámetro elegido por el equipo para un diseño hipotético.
 * - calculado: resultado de una ecuación documentada aplicada a datos/supuestos.
 * - conceptual: representación visual o educativa, no cuantitativa.
 */
export type DataKind = 'publicado' | 'supuesto' | 'calculado' | 'conceptual';

/** Valor numérico con unidad, procedencia y referencias. */
export interface SourcedValue {
  value: number;
  unit: string;
  kind: DataKind;
  refs: string[];
  note?: string;
}

export interface SimParams {
  /** Carga de trabajo, 0–1. */
  load: number;
  ambientC: number;
  cooling: CoolingId;
  material: MaterialId;
  workload: WorkloadId;
  /** Protección térmica (reducción de frecuencia) activada. */
  throttling: boolean;
  /** Segundos simulados por segundo real. */
  speed: number;
}

export interface SimSample {
  /** Tiempo simulado [s]. */
  t: number;
  /** Temperatura media del chip [°C]. */
  T: number;
  /** Temperatura del punto caliente (núcleo más caliente) [°C]. */
  Thot: number;
  /** Potencia disipada por el chip [W]. */
  P: number;
  /** Carga [%]. */
  loadPct: number;
  ambientC: number;
  cooling: CoolingId;
  material: MaterialId;
}

export interface SimState {
  t: number;
  T: number;
  /** Incremento de temperatura de cada núcleo sobre la media [K]. */
  coreDelta: number[];
  Tmax: number;
  Tinitial: number;
  history: SimSample[];
  running: boolean;
  /** Segundos de tiempo real transcurridos con la simulación en marcha. */
  realElapsed: number;
}
