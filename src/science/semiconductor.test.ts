import { describe, expect, it } from 'vitest';
import { bandgapVarshni, conceptualCarrierCount, electronMobility, intrinsicConcentration, intrinsicConductivity } from './semiconductor';
import { MATERIALS } from '../data/materials';

describe('Ecuación de Varshni', () => {
  it('reproduce Eg a 300 K publicada (±0,01 eV)', () => {
    for (const m of Object.values(MATERIALS)) {
      expect(Math.abs(bandgapVarshni(m.id, 300) - m.eg300.value)).toBeLessThan(0.01);
    }
  });

  it('a 0 K devuelve Eg(0)', () => {
    expect(bandgapVarshni('si', 0)).toBeCloseTo(1.17, 6);
  });

  it('Eg disminuye al aumentar la temperatura', () => {
    expect(bandgapVarshni('si', 400)).toBeLessThan(bandgapVarshni('si', 300));
    expect(bandgapVarshni('gaas', 400)).toBeLessThan(bandgapVarshni('gaas', 300));
  });
});

describe('Concentración intrínseca nᵢ(T)', () => {
  it('coincide con el valor publicado a 300 K dentro de un factor 2', () => {
    for (const m of Object.values(MATERIALS)) {
      const ratio = intrinsicConcentration(m.id, 300) / m.ni300.value;
      expect(ratio).toBeGreaterThan(0.5);
      expect(ratio).toBeLessThan(2);
    }
  });

  it('ordena Ge > Si > GaAs (por su banda prohibida)', () => {
    const ge = intrinsicConcentration('ge', 300);
    const si = intrinsicConcentration('si', 300);
    const gaas = intrinsicConcentration('gaas', 300);
    expect(ge).toBeGreaterThan(si);
    expect(si).toBeGreaterThan(gaas);
  });

  it('crece fuertemente con la temperatura', () => {
    expect(intrinsicConcentration('si', 400) / intrinsicConcentration('si', 300)).toBeGreaterThan(100);
  });
});

describe('Movilidad y conductividad', () => {
  it('la movilidad de red disminuye al calentar', () => {
    expect(electronMobility('si', 350)).toBeLessThan(electronMobility('si', 300));
    expect(electronMobility('si', 300)).toBeCloseTo(MATERIALS.si.muN300.value, 6);
  });

  it('la conductividad intrínseca aumenta con T (domina nᵢ)', () => {
    expect(intrinsicConductivity('si', 350)).toBeGreaterThan(intrinsicConductivity('si', 300));
  });

  it('el conteo conceptual está acotado', () => {
    expect(conceptualCarrierCount(1)).toBe(0);
    expect(conceptualCarrierCount(1e30)).toBe(16);
  });
});
