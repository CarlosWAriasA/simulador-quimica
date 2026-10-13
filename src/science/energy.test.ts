import { describe, expect, it } from 'vitest';
import { arrheniusFactor, compareCooling, energyKWh } from './energy';
import { absorptionWavelength, brusEnergy, yuDiameter } from './quantumDots';

describe('Energía y durabilidad', () => {
  it('kWh = W·h/1000', () => {
    expect(energyKWh(100, 10)).toBe(1);
  });

  it('Arrhenius: AF = 1 a la temperatura de referencia y crece con T', () => {
    expect(arrheniusFactor(55)).toBeCloseTo(1, 9);
    expect(arrheniusFactor(65)).toBeGreaterThan(1.8);
    expect(arrheniusFactor(65)).toBeLessThan(2.2);
  });

  it('la refrigeración avanzada no siempre consume menos energía', () => {
    const r = compareCooling({ load: 1, ambientC: 25, material: 'si', throttling: true, hours: 8, tariff: 1 });
    const fan = r.find((x) => x.cooling.id === 'ventilador')!;
    const adv = r.find((x) => x.cooling.id === 'avanzada')!;
    expect(adv.totalW).toBeGreaterThan(fan.totalW);
    expect(adv.steadyT).toBeLessThan(fan.steadyT);
  });
});

describe('Puntos cuánticos de CdSe', () => {
  it('Yu et al.: ~3 nm absorbe cerca de 550 nm', () => {
    expect(yuDiameter(550)).toBeGreaterThan(2.9);
    expect(yuDiameter(550)).toBeLessThan(3.1);
    expect(absorptionWavelength(yuDiameter(550))).toBeCloseTo(550, 3);
  });

  it('cristales más pequeños absorben a menor λ (más energía)', () => {
    expect(absorptionWavelength(2.5)).toBeLessThan(absorptionWavelength(5));
    expect(brusEnergy(1.5)).toBeGreaterThan(brusEnergy(3));
  });

  it('Brus tiende a Eg del sólido para radios grandes', () => {
    expect(brusEnergy(100)).toBeCloseTo(1.74, 1);
  });
});
