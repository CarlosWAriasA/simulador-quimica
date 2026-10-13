import { COOLING_LIST, type CoolingConfig } from '../data/thermalConfig';
import type { MaterialId } from '../types';
import { K_B_EV, toKelvin } from './constants';
import { chipPower, steadyStateTemperature } from './thermal';

/**
 * Cálculos de energía y durabilidad para escenarios hipotéticos.
 * Los resultados son CALCULADOS a partir de los supuestos de thermalConfig.ts.
 */

export interface CoolingScenarioResult {
  cooling: CoolingConfig;
  /** Temperatura de equilibrio [°C]. */
  steadyT: number;
  /** Potencia del chip en equilibrio [W]. */
  chipW: number;
  /** Potencia del sistema de refrigeración [W]. */
  auxW: number;
  /** Potencia eléctrica total [W]. */
  totalW: number;
  /** Fracción del rendimiento nominal disponible (1 = sin throttling). */
  performance: number;
  /** Fracción de la energía que llega al chip. */
  chipShare: number;
  /** Energía en el período [kWh]. */
  energyKWh: number;
  /** Costo de la energía en el período (moneda de la tarifa). */
  cost: number;
  /** Factor de aceleración de envejecimiento relativo a la referencia. */
  agingFactor: number;
}

/** Energía [kWh] = P [W] · t [h] / 1000. */
export function energyKWh(powerW: number, hours: number): number {
  return (powerW * hours) / 1000;
}

/** Temperatura de referencia para el factor de envejecimiento [°C] (supuesto). */
export const AGING_REFERENCE_C = 55;
/** Energía de activación típica [eV] (supuesto común en JEP122). */
export const AGING_EA_EV = 0.7;

/**
 * Factor de aceleración de Arrhenius (JEDEC JEP122):
 * AF = exp[(Ea/k_B)·(1/T_ref − 1/T_op)]
 * AF > 1: el mecanismo de degradación avanza más rápido que a T_ref.
 */
export function arrheniusFactor(opC: number, refC = AGING_REFERENCE_C, ea = AGING_EA_EV): number {
  return Math.exp((ea / K_B_EV) * (1 / toKelvin(refC) - 1 / toKelvin(opC)));
}

export function compareCooling(opts: {
  load: number;
  ambientC: number;
  material: MaterialId;
  throttling: boolean;
  hours: number;
  tariff: number;
}): CoolingScenarioResult[] {
  return COOLING_LIST.map((cooling) => {
    const params = { ...opts, cooling: cooling.id };
    const steadyT = steadyStateTemperature(params);
    const pw = chipPower(opts.load, steadyT, opts.throttling);
    const nominalDyn = pw.nominal - pw.base;
    const performance = nominalDyn > 0 ? pw.dynamic / nominalDyn : 1;
    const totalW = pw.effective + cooling.auxPowerW;
    const e = energyKWh(totalW, opts.hours);
    return {
      cooling,
      steadyT,
      chipW: pw.effective,
      auxW: cooling.auxPowerW,
      totalW,
      performance,
      chipShare: pw.effective / totalW,
      energyKWh: e,
      cost: e * opts.tariff,
      agingFactor: arrheniusFactor(steadyT),
    };
  });
}
