import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';
import { fmt, fmtClock, fmtSci } from './format';

describe('Exportación CSV', () => {
  it('usa ; como separador y coma decimal', () => {
    expect(toCsv(['a', 'b'], [[1.5, 'x']])).toBe('a;b\r\n1,5;x');
  });

  it('escapa textos con separadores o comillas', () => {
    expect(toCsv(['a'], [['hola; "mundo"']])).toBe('a\r\n"hola; ""mundo"""');
  });
});

describe('Formato numérico', () => {
  it('notación científica legible', () => {
    expect(fmtSci(1.0e10)).toBe('1,0 × 10¹⁰');
    expect(fmtSci(2.1e-3, 1)).toBe('2,1 × 10⁻³');
  });

  it('separa miles con espacio fino, no con punto', () => {
    expect(fmt(1400, 0)).not.toContain('.');
  });

  it('reloj mm:ss y h:mm:ss', () => {
    expect(fmtClock(65)).toBe('01:05');
    expect(fmtClock(3725)).toBe('1:02:05');
  });
});
