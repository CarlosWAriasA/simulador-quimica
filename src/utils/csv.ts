/** Convierte filas a CSV (separador ';' y coma decimal para Excel en español). */
export function toCsv(header: string[], rows: Array<Array<string | number>>): string {
  const cell = (v: string | number) => {
    const s = typeof v === 'number' ? String(v).replace('.', ',') : v;
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
}

/** Descarga un texto como archivo (BOM UTF-8 para que Excel lea los acentos). */
export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8'): void {
  const blob = new Blob(['﻿', content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
