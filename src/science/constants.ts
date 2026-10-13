/** Constantes físicas (CODATA 2018, valores exactos o recomendados). */

/** Constante de Boltzmann [eV/K]. */
export const K_B_EV = 8.617333262e-5;
/** Carga elemental [C]. */
export const Q_E = 1.602176634e-19;
/** ħ²/(2·m₀) [eV·Å²]. */
export const HBAR2_OVER_2M0 = 3.80998212;
/** e²/(4π·ε₀) [eV·Å]. */
export const COULOMB_EV_A = 14.3996454;
/** h·c [eV·nm]. */
export const HC_EV_NM = 1239.84198;

export const ZERO_CELSIUS_K = 273.15;

export const toKelvin = (celsius: number): number => celsius + ZERO_CELSIUS_K;
export const toCelsius = (kelvin: number): number => kelvin - ZERO_CELSIUS_K;
