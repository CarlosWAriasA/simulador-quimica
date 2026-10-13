/**
 * Tema de gráficas. Paleta categórica validada para superficie oscura
 * (contraste ≥ 3:1, separación para daltonismo) con el validador de dataviz.
 */
export const CHART = {
  grid: 'rgba(148,163,184,0.12)',
  axis: 'rgba(148,163,184,0.35)',
  text: '#94a3b8',
  textStrong: '#e2e8f0',
  chip: '#d95926',
  ambient: '#3987e5',
  power: '#c98500',
  limit: '#e66767',
  aqua: '#199e70',
};

export const tooltipStyle = {
  contentStyle: {
    background: 'rgba(10,19,41,0.96)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: '#e2e8f0',
    fontSize: 13,
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
  },
  labelStyle: { color: '#cbd5e1', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: '#e2e8f0', padding: 0 },
  cursor: { stroke: 'rgba(148,163,184,0.4)', strokeWidth: 1 },
};

/** Reduce una serie a como máximo `max` puntos (conservando el último). */
export function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  const out: T[] = [];
  for (let i = 0; i < max - 1; i++) out.push(arr[Math.floor(i * step)]);
  out.push(arr[arr.length - 1]);
  return out;
}
