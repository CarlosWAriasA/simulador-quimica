import { describe, expect, it } from 'vitest';
import { caugheyThomas, siliconCarriers } from './doping';

describe('Dopaje del silicio', () => {
  it('intrínseco: n = p = nᵢ', () => {
    const r = siliconCarriers('intrinseco', 0, 300);
    expect(r.n).toBeCloseTo(r.ni, -2);
    expect(r.p).toBeCloseTo(r.ni, -2);
    expect(r.majority).toBe('ninguno');
  });

  it('tipo N: n ≈ N_D y p = nᵢ²/n', () => {
    const N = 1e16;
    const r = siliconCarriers('fosforo', N, 300);
    expect(r.n / N).toBeCloseTo(1, 6);
    expect(r.n * r.p).toBeCloseTo(r.ni * r.ni, -10);
    expect(r.majority).toBe('electrones');
    expect(r.fermiShift).toBeGreaterThan(0);
  });

  it('tipo P: p ≈ N_A, mayoritarios huecos', () => {
    const r = siliconCarriers('boro', 1e15, 300);
    expect(r.p / 1e15).toBeCloseTo(1, 6);
    expect(r.majority).toBe('huecos');
    expect(r.fermiShift).toBeLessThan(0);
  });

  it('cumple la neutralidad de carga n + N_A = p + N_D', () => {
    const N = 3e14;
    const r = siliconCarriers('boro', N, 500);
    expect((r.n + N) / r.p).toBeCloseTo(1, 9);
  });

  it('a alta temperatura se vuelve intrínseco', () => {
    expect(siliconCarriers('fosforo', 1e13, 600).intrinsicRegime).toBe(true);
    expect(siliconCarriers('fosforo', 1e16, 300).intrinsicRegime).toBe(false);
  });

  it('en régimen extrínseco la conductividad disminuye al calentar (movilidad)', () => {
    const a = siliconCarriers('fosforo', 1e16, 300).sigma;
    const b = siliconCarriers('fosforo', 1e16, 400).sigma;
    expect(b).toBeLessThan(a);
  });

  it('resistividad de Si tipo N 10¹⁶ cm⁻³ ≈ 0,5 Ω·cm (curva de Irvin)', () => {
    const r = siliconCarriers('fosforo', 1e16, 300);
    expect(r.rho).toBeGreaterThan(0.4);
    expect(r.rho).toBeLessThan(0.7);
  });

  it('Caughey–Thomas: la movilidad baja con el dopaje', () => {
    expect(caugheyThomas(1e18, 'electron')).toBeLessThan(caugheyThomas(1e14, 'electron'));
  });

  it('advierte fuera del rango de validez', () => {
    expect(siliconCarriers('fosforo', 5e18, 300).warnings.length).toBeGreaterThan(0);
  });
});
