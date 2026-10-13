import { COOLING } from '../data/thermalConfig';
import { MATERIALS } from '../data/materials';
import { toKelvin } from '../science/constants';
import { bandgapVarshni, intrinsicConcentration, thermalEnergy } from '../science/semiconductor';
import type { SimParams } from '../types';
import { fmt, fmtSci } from '../utils/format';
import type { ExplainerLayer } from '../components/ui/ChemistryExplainer';

/**
 * Textos dinámicos de «¿Qué está ocurriendo químicamente?» para el simulador
 * térmico. Separan los tres niveles: material, dispositivo y chip completo.
 */
export function thermalExplanation(params: SimParams, T: number, rate: number, powerW: number, throttled: boolean): ExplainerLayer[] {
  const m = MATERIALS[params.material];
  const TK = toKelvin(T);
  const kT = thermalEnergy(TK) * 1000;
  const eg = bandgapVarshni(m.id, TK);
  const ratio = intrinsicConcentration(m.id, TK) / intrinsicConcentration(m.id, toKelvin(25));
  const tBand = T < 45 ? 'low' : T < 80 ? 'mid' : 'high';

  const material: ExplainerLayer = {
    level: 'material',
    key: `${m.id}-${tBand}`,
    text:
      `En el ${m.name.toLowerCase()} cada átomo comparte electrones en enlaces covalentes. A ${fmt(T, 0)} °C la energía térmica típica es k·T ≈ ${fmt(kT, 1)} meV, ` +
      `mucho menor que Eg ≈ ${fmt(eg, 2)} eV, pero algunos electrones reciben energía suficiente para romper un enlace y saltar a la banda de conducción, dejando un hueco. ` +
      (ratio > 2
        ? `Respecto a 25 °C hay unas ${fmtSci(ratio, 1)} veces más pares electrón-hueco intrínsecos.`
        : 'Cerca de la temperatura ambiente esta generación es pequeña.'),
  };

  const device: ExplainerLayer = {
    level: 'dispositivo',
    key: `${m.id}-${tBand}-dev`,
    text:
      tBand === 'high'
        ? `A alta temperatura crecen los portadores generados térmicamente, lo que aumenta las corrientes de fuga de los transistores${m.id === 'ge' ? ' (muy notable en Ge por su Eg pequeña)' : ''}. A la vez, las vibraciones de la red (fonones) dispersan más a los portadores y reducen su movilidad: el efecto neto depende del dopaje y del diseño.`
        : tBand === 'mid'
          ? 'En un transistor dopado la cantidad de portadores la fija sobre todo el dopaje; al calentar, la movilidad disminuye ligeramente por la vibración de los átomos. Los portadores intrínsecos aún son minoritarios.'
          : 'A baja temperatura los transistores funcionan con margen: pocas fugas por generación térmica y buena movilidad de los portadores.',
  };

  const coolingLabel = COOLING[params.cooling].label.toLowerCase();
  const trend =
    rate > 0.02
      ? 'Se genera más calor del que se disipa, así que la temperatura sube.'
      : rate < -0.02
        ? 'Se disipa más calor del que se genera, así que el chip se enfría.'
        : 'El calor generado y el disipado están equilibrados: la temperatura se mantiene.';

  const chip: ExplainerLayer = {
    level: 'chip',
    key: `${params.cooling}-${Math.sign(Math.round(rate * 50))}-${throttled}-${Math.round(params.load * 4)}`,
    text:
      `Con carga del ${Math.round(params.load * 100)} % los circuitos conmutan más veces por segundo y el chip disipa ≈ ${fmt(powerW, 0)} W como calor (efecto Joule). ` +
      `${trend} Con ${coolingLabel} (R = ${fmt(COOLING[params.cooling].rThermal, 2)} K/W) el calor fluye hacia un ambiente de ${fmt(params.ambientC, 0)} °C.` +
      (throttled ? ' La protección térmica está reduciendo la frecuencia para no superar el límite.' : ''),
  };

  return [material, device, chip];
}
