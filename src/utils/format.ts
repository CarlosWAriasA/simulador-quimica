const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export const superscript = (n: number | string): string =>
  String(n)
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('');

/** Número con coma decimal (es). */
export function fmt(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  // Separador de miles: espacio fino (SI/ISO 80000), para no confundirlo con decimales.
  return value.toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: true }).replace(/\./g, ' ');
}

/** Notación científica legible: 1,2 × 10¹⁰ */
export function fmtSci(value: number, digits = 1): string {
  if (!Number.isFinite(value) || value === 0) return value === 0 ? '0' : '—';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const mant = value / 10 ** exp;
  if (exp >= -2 && exp <= 3) return fmt(value, exp >= 2 ? 0 : digits + Math.max(0, -exp));
  return `${fmt(mant, digits)} × 10${superscript(exp)}`;
}

/** Tiempo en formato mm:ss o h:mm:ss. */
export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
