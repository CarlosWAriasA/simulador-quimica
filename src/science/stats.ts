/** Estadística básica para el análisis de datos de laboratorio. */

export interface LinearFit {
  slope: number;
  intercept: number;
  /** Coeficiente de determinación R². */
  r2: number;
  n: number;
}

/** Regresión lineal por mínimos cuadrados: y = slope·x + intercept. */
export function linearFit(xs: number[], ys: number[]): LinearFit | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
  return { slope, intercept, r2, n };
}

/** Diferencia porcentual relativa |medido − referencia| / referencia · 100. */
export function percentError(measured: number, reference: number): number {
  return (Math.abs(measured - reference) / Math.abs(reference)) * 100;
}

/** Redondea a `digits` cifras significativas (resolución de un instrumento). */
export function toSignificant(value: number, digits: number): number {
  if (value === 0 || !Number.isFinite(value)) return value;
  const p = Math.pow(10, digits - Math.ceil(Math.log10(Math.abs(value))));
  return Math.round(value * p) / p;
}
