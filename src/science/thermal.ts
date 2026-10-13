import { COOLING, DIE, HOTSPOT, INTEGRATION_STEP_S, MAX_HISTORY, POWER, SAMPLE_INTERVAL_S, THERMAL_STATUS, THROTTLE } from '../data/thermalConfig';
import { MATERIALS } from '../data/materials';
import type { CoolingId, MaterialId, SimParams, SimSample, SimState } from '../types';

/**
 * Modelo térmico concentrado (lumped capacitance, Incropera et al., 2011):
 *
 *     C · dT/dt = P − (T − T_amb) / R
 *
 *  C  capacidad térmica efectiva [J/K]
 *  P  potencia disipada por el chip [W]
 *  R  resistencia térmica efectiva unión → ambiente [K/W]
 *  T  temperatura del chip [°C]
 *
 * Solución con P constante: T(t) = T∞ + (T₀ − T∞)·e^(−t/τ), con
 * T∞ = T_amb + P·R y τ = R·C.
 */

/** Resistencia de conducción a través del dado: R = t / (k·A)  [K/W]. */
export function dieResistance(material: MaterialId): number {
  const k = MATERIALS[material].thermalConductivity.value;
  return DIE.thicknessM / (k * DIE.areaM2);
}

/** Capacidad térmica del dado: C = ρ·c_p·V  [J/K]. */
export function dieCapacitance(material: MaterialId): number {
  const m = MATERIALS[material];
  const volumeM3 = DIE.areaM2 * DIE.thicknessM;
  const densityGPerM3 = m.density.value * 1e6;
  return densityGPerM3 * volumeM3 * m.specificHeat.value;
}

/** Resistencia térmica total del sistema [K/W]. */
export function totalResistance(cooling: CoolingId, material: MaterialId): number {
  return COOLING[cooling].rThermal + dieResistance(material);
}

/** Capacidad térmica total del sistema [J/K]. */
export function totalCapacitance(cooling: CoolingId, material: MaterialId): number {
  return COOLING[cooling].capacitance + dieCapacitance(material);
}

/** Constante de tiempo τ = R·C [s]. */
export function timeConstant(cooling: CoolingId, material: MaterialId): number {
  return totalResistance(cooling, material) * totalCapacitance(cooling, material);
}

/** Factor de reducción por protección térmica (1 = sin reducción). */
export function throttleFactor(T: number, enabled: boolean): number {
  if (!enabled || T <= THROTTLE.startC) return 1;
  const f = 1 - ((1 - THROTTLE.minFactor) * (T - THROTTLE.startC)) / THROTTLE.bandC;
  return Math.max(THROTTLE.minFactor, Math.min(1, f));
}

export interface PowerBreakdown {
  /** Potencia nominal según la carga [W]. */
  nominal: number;
  /** Potencia real tras la protección térmica [W]. */
  effective: number;
  factor: number;
  base: number;
  dynamic: number;
}

/**
 * Potencia del chip: P = P_reposo + (P_max − P_reposo)·u.
 * La parte dinámica crece con la actividad de los circuitos (P_din = α·C·V²·f,
 * Rabaey et al., 2003). La protección térmica reduce la parte dinámica.
 */
export function chipPower(load: number, T: number, throttling: boolean): PowerBreakdown {
  const u = Math.max(0, Math.min(1, load));
  const base = POWER.idleW;
  const dynamicNominal = (POWER.maxW - POWER.idleW) * u;
  const factor = throttleFactor(T, throttling);
  const dynamic = dynamicNominal * factor;
  return { nominal: base + dynamicNominal, effective: base + dynamic, factor, base, dynamic };
}

/** dT/dt = [P − (T − T_amb)/R] / C  [K/s]. */
export function temperatureRate(T: number, ambient: number, P: number, R: number, C: number): number {
  return (P - (T - ambient) / R) / C;
}

/** Derivada completa del sistema (incluye la dependencia P(T) del throttling). */
export function systemRate(T: number, params: Pick<SimParams, 'load' | 'ambientC' | 'cooling' | 'material' | 'throttling'>): number {
  const R = totalResistance(params.cooling, params.material);
  const C = totalCapacitance(params.cooling, params.material);
  const P = chipPower(params.load, T, params.throttling).effective;
  return temperatureRate(T, params.ambientC, P, R, C);
}

/** Paso de Runge–Kutta de 4.º orden. */
export function rk4(T: number, dt: number, f: (T: number) => number): number {
  const k1 = f(T);
  const k2 = f(T + (dt / 2) * k1);
  const k3 = f(T + (dt / 2) * k2);
  const k4 = f(T + dt * k3);
  return T + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
}

/** Solución analítica con P constante. */
export function analyticTemperature(T0: number, ambient: number, P: number, R: number, C: number, t: number): number {
  const Tinf = ambient + P * R;
  return Tinf + (T0 - Tinf) * Math.exp(-t / (R * C));
}

/**
 * Temperatura de equilibrio: resuelve P(T) = (T − T_amb)/R por bisección.
 * La función es monótona porque P(T) no aumenta con T.
 */
export function steadyStateTemperature(params: Pick<SimParams, 'load' | 'ambientC' | 'cooling' | 'material' | 'throttling'>): number {
  const R = totalResistance(params.cooling, params.material);
  const g = (T: number) => chipPower(params.load, T, params.throttling).effective - (T - params.ambientC) / R;
  let lo = params.ambientC;
  let hi = params.ambientC + POWER.maxW * R + 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Actividad de cada núcleo (0–1) para una carga dada. Los núcleos se activan
 * en un orden fijo intercalado para repartir el calor por el dado.
 */
export const CORE_ORDER = [0, 5, 3, 6, 1, 4, 2, 7];

export function coreActivities(load: number, cores = DIE.cores): number[] {
  const total = Math.max(0, Math.min(1, load)) * cores;
  const act = new Array<number>(cores).fill(0);
  CORE_ORDER.slice(0, cores).forEach((coreIdx, rank) => {
    act[coreIdx] = Math.max(0, Math.min(1, total - rank));
  });
  return act;
}

/** Incremento objetivo de cada núcleo sobre la media (conceptual) [K]. */
export function coreDeltaTargets(load: number, factor: number): number[] {
  const perCore = ((POWER.maxW - POWER.idleW) / DIE.cores) * factor;
  return coreActivities(load).map((a) => HOTSPOT.kKPerW * a * perCore);
}

export function thermalStatus(T: number) {
  return THERMAL_STATUS.find((s) => T < s.maxC) ?? THERMAL_STATUS[THERMAL_STATUS.length - 1];
}

export function createInitialState(params: SimParams, T0 = params.ambientC): SimState {
  return {
    t: 0,
    T: T0,
    coreDelta: new Array<number>(DIE.cores).fill(0),
    Tmax: T0,
    Tinitial: T0,
    history: [makeSample(0, T0, 0, params)],
    running: false,
    realElapsed: 0,
  };
}

function makeSample(t: number, T: number, hot: number, params: SimParams): SimSample {
  const P = chipPower(params.load, T, params.throttling).effective;
  return {
    t,
    T,
    Thot: T + hot,
    P,
    loadPct: Math.round(params.load * 100),
    ambientC: params.ambientC,
    cooling: params.cooling,
    material: params.material,
  };
}

/**
 * Avanza la simulación `dtSim` segundos simulados. Función pura: devuelve un
 * estado nuevo. Integra con RK4 en pasos de INTEGRATION_STEP_S.
 */
export function advance(state: SimState, params: SimParams, dtSim: number): SimState {
  let { t, T } = state;
  let coreDelta = state.coreDelta.slice();
  let Tmax = state.Tmax;
  let history = state.history;
  const f = (x: number) => systemRate(x, params);
  let remaining = dtSim;
  let newSamples: SimSample[] | null = null;

  while (remaining > 1e-9) {
    const dt = Math.min(INTEGRATION_STEP_S, remaining);
    T = rk4(T, dt, f);
    const factor = throttleFactor(T, params.throttling);
    const targets = coreDeltaTargets(params.load, factor);
    const a = 1 - Math.exp(-dt / HOTSPOT.tauS);
    coreDelta = coreDelta.map((d, i) => d + (targets[i] - d) * a);
    const prevT = t;
    t += dt;
    remaining -= dt;
    const hot = Math.max(...coreDelta);
    Tmax = Math.max(Tmax, T + hot);
    if (Math.floor(t / SAMPLE_INTERVAL_S + 1e-9) > Math.floor(prevT / SAMPLE_INTERVAL_S + 1e-9)) {
      (newSamples ??= []).push(makeSample(Math.round(t * 1000) / 1000, T, hot, params));
    }
  }

  if (newSamples) {
    history = history.concat(newSamples);
    if (history.length > MAX_HISTORY) history = history.slice(history.length - MAX_HISTORY);
  }

  return { ...state, t, T, coreDelta, Tmax, history };
}
