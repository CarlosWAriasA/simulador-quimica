import { describe, expect, it } from 'vitest';
import { K_B_EV } from '../science/constants';
import { bandgapVarshni } from '../science/semiconductor';
import { linearFit, percentError, toSignificant } from '../science/stats';
import { steadyStateTemperature, totalResistance } from '../science/thermal';
import { siliconCarriers } from '../science/doping';
import { MATERIALS } from '../data/materials';
import { UNKNOWN_SAMPLES, barResistance, hotProbeSign, sampleResistivity } from './models';
import { PRACTICES } from './practices';

describe('Regresión lineal', () => {
  it('recupera una recta exacta', () => {
    const f = linearFit([0, 1, 2, 3], [1, 3, 5, 7])!;
    expect(f.slope).toBeCloseTo(2, 12);
    expect(f.intercept).toBeCloseTo(1, 12);
    expect(f.r2).toBeCloseTo(1, 12);
  });
  it('requiere al menos dos x distintas', () => {
    expect(linearFit([1], [2])).toBeNull();
    expect(linearFit([1, 1], [2, 3])).toBeNull();
  });
  it('cifras significativas y error porcentual', () => {
    expect(toSignificant(123456, 3)).toBe(123000);
    expect(percentError(110, 100)).toBeCloseTo(10, 9);
  });
});

describe('Práctica 1: la pendiente T–P es la resistencia térmica', () => {
  it('con lecturas de equilibrio la pendiente coincide con R', () => {
    const loads = [0, 0.25, 0.5, 0.75, 1];
    const P = loads.map((u) => 8 + 117 * u);
    const T = loads.map((u) => steadyStateTemperature({ load: u, ambientC: 25, cooling: 'ventilador', material: 'si', throttling: false }));
    const f = linearFit(P, T)!;
    expect(f.slope).toBeCloseTo(totalResistance('ventilador', 'si'), 6);
    expect(f.intercept).toBeCloseTo(25, 6);
  });
});

describe('Práctica 3: Eg a partir de ln(G) vs 1/T', () => {
  for (const id of ['si', 'ge'] as const) {
    it(`${id}: el resultado se acerca más a Eg(0 K) que a Eg(300 K)`, () => {
      const Ts = [320, 360, 400, 440, 480];
      const x = Ts.map((T) => 1000 / T);
      const y = Ts.map((T) => Math.log(1 / barResistance(id, T)));
      const f = linearFit(x, y)!;
      const eg = -2 * K_B_EV * 1000 * f.slope;
      expect(f.r2).toBeGreaterThan(0.999);
      const eg0 = bandgapVarshni(id, 0);
      expect(Math.abs(eg - eg0)).toBeLessThan(Math.abs(eg - MATERIALS[id].eg300.value));
      expect(percentError(eg, eg0)).toBeLessThan(5);
    });
  }

  it('GaAs está fuera del rango del óhmetro a temperatura ambiente', () => {
    expect(barResistance('gaas', 300)).toBeGreaterThan(2e9);
    expect(barResistance('ge', 300)).toBeLessThan(2e9);
  });
});

describe('Práctica 4: muestras desconocidas', () => {
  it('la resistividad medida identifica una única concentración', () => {
    for (const s of UNKNOWN_SAMPLES) {
      const rho = sampleResistivity(s.id);
      const exact = siliconCarriers(s.dopant, s.N, 300).rho;
      expect(percentError(rho, exact)).toBeLessThan(1);
    }
  });
  it('punta caliente: (+) para tipo N, (−) para tipo P', () => {
    expect(hotProbeSign('X1')).toBe(1);
    expect(hotProbeSign('X2')).toBe(-1);
  });
  it('P-tipo es más resistivo que N-tipo con igual N (menor movilidad de huecos)', () => {
    expect(siliconCarriers('boro', 1e16, 300).rho).toBeGreaterThan(siliconCarriers('fosforo', 1e16, 300).rho);
  });
});

describe('Guías de prácticas', () => {
  it('cada pregunta tiene su respuesta correcta entre las opciones', () => {
    for (const p of PRACTICES) {
      for (const q of [p.hypothesis, ...p.questions]) {
        expect(q.options.some((o) => o.id === q.correct)).toBe(true);
      }
    }
  });
});
