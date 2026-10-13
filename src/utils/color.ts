/**
 * Escala de color de temperatura (visualización): azul (frío) → cian →
 * amarillo → naranja → rojo → blanco incandescente.
 */
const STOPS: Array<[number, [number, number, number]]> = [
  [15, [30, 58, 138]],
  [30, [37, 99, 235]],
  [42, [34, 211, 238]],
  [57, [253, 224, 71]],
  [72, [251, 146, 60]],
  [87, [239, 68, 68]],
  [102, [190, 18, 60]],
  [125, [255, 228, 230]],
];

export const COLOR_SCALE_RANGE = { min: STOPS[0][0], max: STOPS[STOPS.length - 1][0] };

export function temperatureRgb(T: number): [number, number, number] {
  if (T <= STOPS[0][0]) return STOPS[0][1];
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    if (T <= t1) {
      const [t0, c0] = STOPS[i - 1];
      const f = (T - t0) / (t1 - t0);
      return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * f)) as [number, number, number];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export function temperatureColor(T: number, alpha = 1): string {
  const [r, g, b] = temperatureRgb(T);
  return alpha >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Variante para TEXTO sobre fondo oscuro: mezcla el color con blanco para
 * garantizar contraste legible también en los azules fríos.
 */
export function temperatureTextColor(T: number): string {
  const [r, g, b] = temperatureRgb(T);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.38);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Gradiente CSS de la escala completa (para leyendas). */
export function temperatureGradientCss(direction = 'to right'): string {
  const span = COLOR_SCALE_RANGE.max - COLOR_SCALE_RANGE.min;
  const parts = STOPS.map(([t, [r, g, b]]) => `rgb(${r},${g},${b}) ${(((t - COLOR_SCALE_RANGE.min) / span) * 100).toFixed(1)}%`);
  return `linear-gradient(${direction}, ${parts.join(', ')})`;
}
