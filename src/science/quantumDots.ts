import { COULOMB_EV_A, HBAR2_OVER_2M0, HC_EV_NM } from './constants';

/**
 * Puntos cuánticos de CdSe: efecto del tamaño en la energía de la luz.
 */

/** Parámetros de CdSe (Brus, 1984; valores de uso común). */
export const CDSE = {
  egBulk: 1.74,
  meEff: 0.13,
  mhEff: 0.45,
  epsilon: 10.6,
};

/**
 * Relación empírica de Yu et al. (2003) entre la longitud de onda del primer
 * pico de absorción excitónico λ [nm] y el diámetro D [nm] de nanocristales de CdSe:
 * D = 1,6122·10⁻⁹λ⁴ − 2,6575·10⁻⁶λ³ + 1,6242·10⁻³λ² − 0,4277λ + 41,57
 */
export function yuDiameter(lambdaNm: number): number {
  const l = lambdaNm;
  return 1.6122e-9 * l ** 4 - 2.6575e-6 * l ** 3 + 1.6242e-3 * l ** 2 - 0.4277 * l + 41.57;
}

/** Rango del ajuste de Yu et al. usado en la app. */
export const YU_RANGE = { minNm: 450, maxNm: 660, minD: 2.0, maxD: 8.0 };

/** Invierte la relación de Yu por bisección: λ de absorción [nm] para un diámetro D [nm]. */
export function absorptionWavelength(diameterNm: number): number {
  let lo = YU_RANGE.minNm;
  let hi = YU_RANGE.maxNm;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (yuDiameter(mid) < diameterNm) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Modelo de Brus (aproximación de masa efectiva):
 * E(R) = Eg + (ħ²π²/2R²)(1/mₑ* + 1/mₕ*) − 1,786·e²/(4πε₀·ε·R)
 * Conocido por sobrestimar E en cristales muy pequeños.
 * @param radiusNm radio [nm]
 */
export function brusEnergy(radiusNm: number, p = CDSE): number {
  const rA = radiusNm * 10;
  const confinement = ((HBAR2_OVER_2M0 * Math.PI ** 2) / (rA * rA)) * (1 / p.meEff + 1 / p.mhEff);
  const coulomb = (1.786 * COULOMB_EV_A) / (p.epsilon * rA);
  return p.egBulk + confinement - coulomb;
}

export const energyToWavelength = (eV: number): number => HC_EV_NM / eV;
export const wavelengthToEnergy = (nm: number): number => HC_EV_NM / nm;

/**
 * Color RGB aproximado de una longitud de onda visible (algoritmo de
 * D. Bruton). Solo para visualización.
 */
export function wavelengthToRgb(nm: number): string {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 780) {
    r = 1;
  }
  let factor = 1;
  if (nm >= 380 && nm < 420) factor = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700 && nm <= 780) factor = 0.3 + (0.7 * (780 - nm)) / 80;
  else if (nm < 380 || nm > 780) factor = 0;
  const c = (v: number) => Math.round(255 * Math.pow(v * factor, 0.8));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}
