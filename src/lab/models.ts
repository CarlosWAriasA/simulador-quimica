import { siliconCarriers } from '../science/doping';
import { intrinsicConductivity } from '../science/semiconductor';
import { toSignificant } from '../science/stats';
import type { DopantId, MaterialId } from '../types';

/**
 * Modelos de los instrumentos virtuales de las prácticas.
 */

/** Barra de la práctica 3: L = 1 cm, sección 1 mm × 1 mm. */
export const BAR = { lengthCm: 1, areaCm2: 0.01 };
/** Rango máximo del óhmetro [Ω]: por encima muestra «OL». */
export const OHM_MAX = 2e9;

/** Resistencia de la barra intrínseca: R = L / (σ·A)  [Ω]. */
export function barResistance(m: MaterialId, T: number): number {
  return BAR.lengthCm / (intrinsicConductivity(m, T) * BAR.areaCm2);
}

/** Muestras «desconocidas» de la práctica 4 (fijas, no aleatorias). */
export const UNKNOWN_SAMPLES: Array<{ id: string; dopant: Exclude<DopantId, 'intrinseco'>; N: number }> = [
  { id: 'X1', dopant: 'fosforo', N: 3e15 },
  { id: 'X2', dopant: 'boro', N: 5e16 },
  { id: 'X3', dopant: 'fosforo', N: 1e17 },
];

export const ROOM_T_K = 300;

/** Lectura de la sonda de 4 puntas a 300 K (3 cifras significativas) [Ω·cm]. */
export function sampleResistivity(id: string): number {
  const s = UNKNOWN_SAMPLES.find((x) => x.id === id);
  if (!s) throw new Error(`Muestra desconocida: ${id}`);
  return toSignificant(siliconCarriers(s.dopant, s.N, ROOM_T_K).rho, 3);
}

/** Signo de la punta caliente: (+) electrones mayoritarios, (−) huecos. */
export function hotProbeSign(id: string): 1 | -1 {
  return UNKNOWN_SAMPLES.find((x) => x.id === id)?.dopant === 'fosforo' ? 1 : -1;
}
