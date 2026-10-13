import type { DopantId } from '../types';
import { K_B_EV, Q_E } from './constants';
import { intrinsicConcentration, latticeMobility } from './semiconductor';
import { MATERIALS } from '../data/materials';

/**
 * Dopaje del silicio con fósforo (donador, tipo N) o boro (aceptor, tipo P).
 *
 * Supuestos (Streetman & Banerjee, 2015; Pierret, 1996):
 *  1. Ionización completa de los dopantes (válido aprox. por encima de ~150 K
 *     para N ≤ 10¹⁷ cm⁻³; se pierde en "congelamiento" a baja T).
 *  2. Semiconductor no degenerado (N ≲ 10¹⁸ cm⁻³ en Si; Nc ≈ 3,2·10¹⁹ cm⁻³).
 *  3. Ley de acción de masas: n·p = nᵢ².
 *  4. Neutralidad de carga: n + N_A = p + N_D.
 */

export const DOPANTS: Record<DopantId, {
  id: DopantId;
  label: string;
  short: string;
  element: string | null;
  symbol: string | null;
  valence: number | null;
  group: string | null;
  type: 'intrínseco' | 'N' | 'P';
  role: string;
  /** Energía de ionización en Si [meV] (Sze & Ng, 2007). */
  ionizationMeV: number | null;
  color: string;
}> = {
  intrinseco: {
    id: 'intrinseco',
    label: 'Silicio intrínseco (puro)',
    short: 'Intrínseco',
    element: null,
    symbol: null,
    valence: null,
    group: null,
    type: 'intrínseco',
    role: 'Sin impurezas: electrones y huecos solo se generan por excitación térmica, en pares (n = p = nᵢ).',
    ionizationMeV: null,
    color: '#94a3b8',
  },
  fosforo: {
    id: 'fosforo',
    label: 'Silicio dopado con fósforo (tipo N)',
    short: 'Tipo N (P)',
    element: 'Fósforo',
    symbol: 'P',
    valence: 5,
    group: 'Grupo 15',
    type: 'N',
    role: 'El P tiene 5 electrones de valencia: 4 forman enlaces con el Si y el quinto queda débilmente ligado → electrón donador.',
    ionizationMeV: 45,
    color: '#22d3ee',
  },
  boro: {
    id: 'boro',
    label: 'Silicio dopado con boro (tipo P)',
    short: 'Tipo P (B)',
    element: 'Boro',
    symbol: 'B',
    valence: 3,
    group: 'Grupo 13',
    type: 'P',
    role: 'El B tiene 3 electrones de valencia: le falta uno para completar los 4 enlaces → acepta un electrón y deja un hueco móvil.',
    ionizationMeV: 45,
    color: '#fb923c',
  },
};

/** Átomos de silicio por cm³ (densidad atómica, Sze & Ng). */
export const SI_ATOMIC_DENSITY = 5.0e22;

export const DOPING_RANGE = { minExp: 13, maxExp: 18 };
export const DOPING_T_RANGE_K = { min: 250, max: 600 };

export interface CarrierResult {
  ni: number;
  n: number;
  p: number;
  majority: 'electrones' | 'huecos' | 'ninguno';
  muN: number;
  muP: number;
  /** Conductividad [S/cm]. */
  sigma: number;
  /** Resistividad [Ω·cm]. */
  rho: number;
  /** Posición del nivel de Fermi respecto al intrínseco, E_F − E_i [eV]. */
  fermiShift: number;
  /** Átomos de Si por cada átomo dopante. */
  atomsPerDopant: number | null;
  /** nᵢ comparable a N: el material se vuelve intrínseco. */
  intrinsicRegime: boolean;
  warnings: string[];
}

/**
 * Movilidad de Caughey–Thomas para Si a 300 K, escalada con la temperatura
 * mediante el exponente de red (aproximación educativa):
 * μ(N, T) = [μmin + (μmax − μmin)/(1 + (N/Nref)^α)]·(T/300)^(−γ)
 */
const CT = {
  electron: { muMin: 92, muMax: 1360, nRef: 1.3e17, alpha: 0.91 },
  hole: { muMin: 47.7, muMax: 495, nRef: 6.3e16, alpha: 0.76 },
};

export function caugheyThomas(N: number, carrier: 'electron' | 'hole', T = 300): number {
  const p = CT[carrier];
  const mu300 = p.muMin + (p.muMax - p.muMin) / (1 + Math.pow(N / p.nRef, p.alpha));
  const gamma = carrier === 'electron' ? MATERIALS.si.muNExp : MATERIALS.si.muPExp;
  return latticeMobility(mu300, gamma, T);
}

/**
 * Concentraciones de portadores en equilibrio para Si dopado.
 * @param dopant tipo de dopante
 * @param N concentración de dopante [cm⁻³] (se ignora en el intrínseco)
 * @param T temperatura [K]
 */
export function siliconCarriers(dopant: DopantId, N: number, T: number): CarrierResult {
  const ni = intrinsicConcentration('si', T);
  const Nd = dopant === 'fosforo' ? N : 0;
  const Na = dopant === 'boro' ? N : 0;
  const net = Nd - Na;

  let n: number;
  let p: number;
  if (net >= 0) {
    n = net / 2 + Math.sqrt((net / 2) ** 2 + ni * ni);
    p = (ni * ni) / n;
  } else {
    p = -net / 2 + Math.sqrt((net / 2) ** 2 + ni * ni);
    n = (ni * ni) / p;
  }

  const Ntot = Nd + Na;
  const muN = caugheyThomas(Ntot, 'electron', T);
  const muP = caugheyThomas(Ntot, 'hole', T);
  const sigma = Q_E * (n * muN + p * muP);
  const fermiShift = K_B_EV * T * Math.log(n / ni);

  const warnings: string[] = [];
  if (Ntot > 1e18) {
    warnings.push('N > 10¹⁸ cm⁻³: el silicio empieza a degenerarse; las ecuaciones pierden precisión.');
  }
  if (T < DOPING_T_RANGE_K.min || T > DOPING_T_RANGE_K.max) {
    warnings.push('Temperatura fuera del rango validado del modelo (250–600 K).');
  }

  return {
    ni,
    n,
    p,
    majority: dopant === 'intrinseco' ? 'ninguno' : n > p ? 'electrones' : 'huecos',
    muN,
    muP,
    sigma,
    rho: 1 / sigma,
    fermiShift,
    atomsPerDopant: dopant === 'intrinseco' ? null : SI_ATOMIC_DENSITY / N,
    intrinsicRegime: dopant !== 'intrinseco' && ni > 0.1 * N,
    warnings,
  };
}
