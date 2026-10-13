import { describe, expect, it } from 'vitest';
import {
  advance,
  analyticTemperature,
  chipPower,
  coreActivities,
  createInitialState,
  dieResistance,
  rk4,
  steadyStateTemperature,
  throttleFactor,
  timeConstant,
  totalCapacitance,
  totalResistance,
} from './thermal';
import { POWER } from '../data/thermalConfig';
import type { SimParams } from '../types';

const base: SimParams = {
  load: 1,
  ambientC: 25,
  cooling: 'ventilador',
  material: 'si',
  workload: 'intensiva',
  throttling: false,
  speed: 10,
};

describe('Potencia del chip', () => {
  it('es lineal con la carga entre P_reposo y P_max', () => {
    expect(chipPower(0, 30, false).effective).toBe(POWER.idleW);
    expect(chipPower(1, 30, false).effective).toBe(POWER.maxW);
    expect(chipPower(0.5, 30, false).effective).toBeCloseTo((POWER.idleW + POWER.maxW) / 2, 9);
  });

  it('la protección térmica reduce la potencia sólo por encima del umbral', () => {
    expect(throttleFactor(80, true)).toBe(1);
    expect(throttleFactor(100, true)).toBeLessThan(1);
    expect(throttleFactor(200, true)).toBeGreaterThan(0);
    expect(throttleFactor(200, false)).toBe(1);
  });
});

describe('Modelo C·dT/dt = P − (T − T_amb)/R', () => {
  it('RK4 coincide con la solución analítica (P constante)', () => {
    const R = totalResistance('ventilador', 'si');
    const C = totalCapacitance('ventilador', 'si');
    const P = 100;
    let T = 25;
    const dt = 0.05;
    for (let i = 0; i < 2000; i++) T = rk4(T, dt, (x) => (P - (x - 25) / R) / C);
    expect(T).toBeCloseTo(analyticTemperature(25, 25, P, R, C, 2000 * dt), 6);
  });

  it('equilibrio sin throttling: T∞ = T_amb + P·R', () => {
    const R = totalResistance('ventilador', 'si');
    expect(steadyStateTemperature(base)).toBeCloseTo(25 + POWER.maxW * R, 6);
  });

  it('más refrigeración → menor temperatura de equilibrio', () => {
    const p = steadyStateTemperature({ ...base, cooling: 'pasiva' });
    const v = steadyStateTemperature({ ...base, cooling: 'ventilador' });
    const a = steadyStateTemperature({ ...base, cooling: 'avanzada' });
    expect(p).toBeGreaterThan(v);
    expect(v).toBeGreaterThan(a);
  });

  it('con throttling la temperatura queda acotada', () => {
    const T = steadyStateTemperature({ ...base, cooling: 'pasiva', throttling: true });
    expect(T).toBeLessThan(110);
    expect(T).toBeGreaterThan(95);
  });

  it('el material sólo cambia ligeramente la resistencia del dado', () => {
    expect(dieResistance('si')).toBeLessThan(dieResistance('ge'));
    expect(dieResistance('ge')).toBeLessThan(0.1);
  });

  it('la simulación calienta gradualmente y converge al equilibrio', () => {
    let s = createInitialState(base);
    s = advance(s, base, 10);
    expect(s.T).toBeGreaterThan(25);
    expect(s.T).toBeLessThan(steadyStateTemperature(base));
    s = advance(s, base, timeConstant('ventilador', 'si') * 10);
    expect(s.T).toBeCloseTo(steadyStateTemperature(base), 2);
  });

  it('enfría cuando la potencia baja', () => {
    let s = createInitialState(base, 80);
    s = advance(s, { ...base, load: 0 }, 30);
    expect(s.T).toBeLessThan(80);
  });

  it('registra una muestra por segundo simulado', () => {
    let s = createInitialState(base);
    s = advance(s, base, 5);
    expect(s.history.length).toBe(6);
  });

  it('activa núcleos de forma proporcional a la carga', () => {
    expect(coreActivities(0).reduce((a, b) => a + b, 0)).toBe(0);
    expect(coreActivities(0.5).reduce((a, b) => a + b, 0)).toBeCloseTo(4, 9);
    expect(coreActivities(1).every((a) => a === 1)).toBe(true);
  });
});
