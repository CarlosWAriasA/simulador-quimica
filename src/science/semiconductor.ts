import { MATERIALS, type Material } from '../data/materials';
import type { MaterialId } from '../types';
import { K_B_EV, Q_E } from './constants';

/**
 * Física de semiconductores intrínsecos.
 *
 * Rango de validez general: 200 K ≤ T ≤ 600 K, material no degenerado.
 */

const mat = (m: MaterialId | Material): Material => (typeof m === 'string' ? MATERIALS[m] : m);

/**
 * Ecuación de Varshni (1967): Eg(T) = Eg(0) − α·T² / (T + β)
 * @param T temperatura absoluta [K]
 * @returns banda prohibida [eV]
 */
export function bandgapVarshni(material: MaterialId | Material, T: number): number {
  const { eg0, alpha, beta } = mat(material).varshni;
  return eg0 - (alpha * T * T) / (T + beta);
}

/**
 * Densidad efectiva de estados escalada con la temperatura:
 * N(T) = N(300 K)·(T/300)^(3/2)
 */
export function effectiveDensity(n300: number, T: number): number {
  return n300 * Math.pow(T / 300, 1.5);
}

/**
 * Concentración intrínseca de portadores:
 * nᵢ = √(Nc·Nv) · exp(−Eg / (2·k_B·T))   [cm⁻³]
 */
export function intrinsicConcentration(material: MaterialId | Material, T: number): number {
  const m = mat(material);
  const nc = effectiveDensity(m.nc300.value, T);
  const nv = effectiveDensity(m.nv300.value, T);
  const eg = bandgapVarshni(m, T);
  return Math.sqrt(nc * nv) * Math.exp(-eg / (2 * K_B_EV * T));
}

/**
 * Movilidad limitada por dispersión con la red (fonones):
 * μ(T) = μ(300 K)·(T/300)^(−γ)
 * Aproximación válida cerca de 300 K y para dopaje bajo.
 */
export function latticeMobility(mu300: number, gamma: number, T: number): number {
  return mu300 * Math.pow(T / 300, -gamma);
}

export function electronMobility(material: MaterialId | Material, T: number): number {
  const m = mat(material);
  return latticeMobility(m.muN300.value, m.muNExp, T);
}

export function holeMobility(material: MaterialId | Material, T: number): number {
  const m = mat(material);
  return latticeMobility(m.muP300.value, m.muPExp, T);
}

/**
 * Conductividad intrínseca: σ = q·nᵢ·(μn + μp)  [S/cm]
 */
export function intrinsicConductivity(material: MaterialId | Material, T: number): number {
  const ni = intrinsicConcentration(material, T);
  return Q_E * ni * (electronMobility(material, T) + holeMobility(material, T));
}

/** Factor de Boltzmann exp(−Eg/(2kT)): fracción relativa de excitación térmica. */
export function boltzmannFactor(eg: number, T: number): number {
  return Math.exp(-eg / (2 * K_B_EV * T));
}

/** Energía térmica característica k_B·T [eV]. */
export function thermalEnergy(T: number): number {
  return K_B_EV * T;
}

/**
 * Número de electrones a dibujar en la banda de conducción (REPRESENTACIÓN
 * CONCEPTUAL en escala logarítmica, no un conteo físico).
 */
export function conceptualCarrierCount(ni: number, max = 16): number {
  const n = Math.round((Math.log10(Math.max(ni, 1)) - 4) * 1.4);
  return Math.max(0, Math.min(max, n));
}
