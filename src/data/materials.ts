import type { MaterialId, SourcedValue } from '../types';

/**
 * Propiedades de los semiconductores a 300 K salvo indicación contraria.
 * Fuente principal: Ioffe NSM Archive y Sze & Ng (2007). Los valores son
 * representativos de material de alta pureza y pueden variar entre fuentes.
 */
export interface Material {
  id: MaterialId;
  name: string;
  formula: string;
  shortName: string;
  /** Color de identificación en gráficas. */
  color: string;
  composition: string;
  group: string;
  bonding: string;
  structure: string;
  gapType: 'directa' | 'indirecta';
  /** Banda prohibida a 300 K. */
  eg300: SourcedValue;
  /** Parámetros de Varshni: Eg(T) = Eg0 − αT²/(T + β). */
  varshni: { eg0: number; alpha: number; beta: number; refs: string[] };
  /** Densidades efectivas de estados a 300 K [cm⁻³]. */
  nc300: SourcedValue;
  nv300: SourcedValue;
  /** Concentración intrínseca publicada a 300 K (para verificación). */
  ni300: SourcedValue;
  /** Movilidades de baja concentración a 300 K [cm²/(V·s)]. */
  muN300: SourcedValue;
  muP300: SourcedValue;
  /**
   * Exponentes de la ley μ ∝ T^(−γ) (dispersión por la red), válidos de forma
   * aproximada cerca de 300 K en material poco dopado.
   */
  muNExp: number;
  muPExp: number;
  thermalConductivity: SourcedValue;
  density: SourcedValue;
  specificHeat: SourcedValue;
  latticeConstant: SourcedValue;
  dielectric: SourcedValue;
  meltingPoint: SourcedValue;
  breakdownField: SourcedValue;
  electronic: string[];
  applications: string[];
  advantages: string[];
  limitations: string[];
}

const pub = (value: number, unit: string, refs: string[], note?: string): SourcedValue => ({
  value,
  unit,
  kind: 'publicado',
  refs,
  note,
});

export const MATERIALS: Record<MaterialId, Material> = {
  si: {
    id: 'si',
    name: 'Silicio',
    formula: 'Si',
    shortName: 'Si',
    color: '#3987e5',
    composition: 'Elemento del grupo 14, Z = 14. Configuración [Ne] 3s² 3p².',
    group: 'Grupo 14 (IV)',
    bonding: 'Covalente puro: cada átomo forma 4 enlaces sp³ con sus vecinos (tetraédrico).',
    structure: 'Cúbica tipo diamante',
    gapType: 'indirecta',
    eg300: pub(1.12, 'eV', ['ioffe', 'sze']),
    varshni: { eg0: 1.17, alpha: 4.73e-4, beta: 636, refs: ['varshni', 'ioffe'] },
    nc300: pub(3.2e19, 'cm⁻³', ['ioffe']),
    nv300: pub(1.8e19, 'cm⁻³', ['ioffe']),
    ni300: pub(1.0e10, 'cm⁻³', ['ioffe', 'sze']),
    muN300: pub(1400, 'cm²/(V·s)', ['ioffe', 'sze']),
    muP300: pub(450, 'cm²/(V·s)', ['ioffe', 'sze']),
    muNExp: 2.4,
    muPExp: 2.2,
    thermalConductivity: pub(148, 'W/(m·K)', ['glassbrenner', 'ioffe']),
    density: pub(2.329, 'g/cm³', ['ioffe']),
    specificHeat: pub(0.7, 'J/(g·K)', ['ioffe']),
    latticeConstant: pub(5.431, 'Å', ['ioffe', 'kittel']),
    dielectric: pub(11.7, '—', ['ioffe']),
    meltingPoint: pub(1414, '°C', ['ioffe']),
    breakdownField: pub(3e5, 'V/cm', ['ioffe']),
    electronic: [
      'Banda prohibida indirecta: emite luz con muy baja eficiencia.',
      'Forma un óxido nativo estable (SiO₂), clave para fabricar transistores MOS.',
      'Concentración intrínseca baja a temperatura ambiente (~10¹⁰ cm⁻³).',
    ],
    applications: [
      'Microprocesadores y memorias (tecnología CMOS)',
      'Celdas solares cristalinas',
      'Sensores de imagen y MEMS',
      'Qubits de espín en puntos cuánticos de Si/SiGe',
    ],
    advantages: [
      'Muy abundante en la corteza terrestre (como SiO₂ y silicatos)',
      'Buena conductividad térmica',
      'Óxido nativo de alta calidad',
      'Industria de fabricación muy madura',
    ],
    limitations: [
      'Banda indirecta: poco útil para LED y láseres',
      'Movilidad electrónica moderada frente a GaAs',
      'Purificación (grado electrónico) intensiva en energía',
    ],
  },
  ge: {
    id: 'ge',
    name: 'Germanio',
    formula: 'Ge',
    shortName: 'Ge',
    color: '#d95926',
    composition: 'Elemento del grupo 14, Z = 32. Configuración [Ar] 3d¹⁰ 4s² 4p².',
    group: 'Grupo 14 (IV)',
    bonding: 'Covalente puro sp³, enlaces más largos y débiles que en el silicio.',
    structure: 'Cúbica tipo diamante',
    gapType: 'indirecta',
    eg300: pub(0.66, 'eV', ['ioffe', 'sze']),
    varshni: { eg0: 0.7437, alpha: 4.774e-4, beta: 235, refs: ['varshni', 'ioffe'] },
    nc300: pub(1.0e19, 'cm⁻³', ['ioffe']),
    nv300: pub(5.0e18, 'cm⁻³', ['ioffe']),
    ni300: pub(2.0e13, 'cm⁻³', ['ioffe', 'sze']),
    muN300: pub(3900, 'cm²/(V·s)', ['ioffe', 'sze']),
    muP300: pub(1900, 'cm²/(V·s)', ['ioffe', 'sze']),
    muNExp: 1.66,
    muPExp: 2.33,
    thermalConductivity: pub(58, 'W/(m·K)', ['glassbrenner', 'ioffe']),
    density: pub(5.323, 'g/cm³', ['ioffe']),
    specificHeat: pub(0.31, 'J/(g·K)', ['ioffe']),
    latticeConstant: pub(5.658, 'Å', ['ioffe', 'kittel']),
    dielectric: pub(16.2, '—', ['ioffe']),
    meltingPoint: pub(937, '°C', ['ioffe']),
    breakdownField: pub(1e5, 'V/cm', ['ioffe']),
    electronic: [
      'Banda prohibida pequeña: muchos más portadores generados térmicamente que en Si.',
      'Alta movilidad de huecos, útil en canales SiGe de transistores modernos.',
      'Su óxido (GeO₂) es soluble en agua e inestable, a diferencia del SiO₂.',
    ],
    applications: [
      'Primeros transistores (1947)',
      'Fotodetectores infrarrojos y fibra óptica',
      'Aleaciones SiGe en transistores de alta frecuencia',
      'Celdas solares multiunión (sustrato)',
    ],
    advantages: [
      'Alta movilidad de electrones y huecos',
      'Compatible con silicio en aleaciones SiGe',
      'Absorbe en el infrarrojo cercano',
    ],
    limitations: [
      'Corriente de fuga alta al calentarse (Eg pequeña)',
      'Conductividad térmica ~2,5 veces menor que el Si',
      'Escaso y más costoso que el silicio',
    ],
  },
  gaas: {
    id: 'gaas',
    name: 'Arseniuro de galio',
    formula: 'GaAs',
    shortName: 'GaAs',
    color: '#199e70',
    composition: 'Compuesto III–V: galio (grupo 13) + arsénico (grupo 15), proporción 1:1.',
    group: 'Compuesto III–V',
    bonding: 'Covalente sp³ con carácter parcialmente iónico (χ Ga = 1,81; χ As = 2,18).',
    structure: 'Blenda de zinc (zincblenda)',
    gapType: 'directa',
    eg300: pub(1.424, 'eV', ['ioffe', 'sze']),
    varshni: { eg0: 1.519, alpha: 5.405e-4, beta: 204, refs: ['varshni', 'ioffe'] },
    nc300: pub(4.7e17, 'cm⁻³', ['ioffe']),
    nv300: pub(9.0e18, 'cm⁻³', ['ioffe']),
    ni300: pub(2.1e6, 'cm⁻³', ['ioffe', 'sze']),
    muN300: pub(8500, 'cm²/(V·s)', ['ioffe', 'sze']),
    muP300: pub(400, 'cm²/(V·s)', ['ioffe', 'sze']),
    muNExp: 1.0,
    muPExp: 2.1,
    thermalConductivity: pub(55, 'W/(m·K)', ['ioffe']),
    density: pub(5.32, 'g/cm³', ['ioffe']),
    specificHeat: pub(0.33, 'J/(g·K)', ['ioffe']),
    latticeConstant: pub(5.653, 'Å', ['ioffe', 'kittel']),
    dielectric: pub(12.9, '—', ['ioffe']),
    meltingPoint: pub(1240, '°C', ['ioffe']),
    breakdownField: pub(4e5, 'V/cm', ['ioffe']),
    electronic: [
      'Banda prohibida directa: emite y absorbe luz con gran eficiencia.',
      'Movilidad electrónica ~6 veces mayor que la del Si: circuitos muy rápidos.',
      'Concentración intrínseca muy baja: puede fabricarse semiaislante.',
    ],
    applications: [
      'Amplificadores de radiofrecuencia en teléfonos móviles (5G)',
      'LED infrarrojos y diodos láser',
      'Celdas solares de alta eficiencia (satélites)',
      'Puntos cuánticos de GaAs para investigación en qubits',
    ],
    advantages: [
      'Alta movilidad electrónica',
      'Banda directa (optoelectrónica)',
      'Buena tolerancia a la radiación',
    ],
    limitations: [
      'Contiene arsénico (tóxico): manejo y reciclaje cuidadosos',
      'Obleas más caras y frágiles que las de Si',
      'Conductividad térmica ~2,7 veces menor que el Si',
      'Sin óxido nativo estable para transistores MOS',
    ],
  },
};

export const MATERIAL_LIST: Material[] = [MATERIALS.si, MATERIALS.ge, MATERIALS.gaas];

/**
 * Perovskita de haluro de plomo y metilamonio (MAPbI₃), incluida como
 * material educativo. No se usa en el simulador térmico del chip.
 */
export const PEROVSKITE = {
  name: 'Perovskita de haluro (MAPbI₃)',
  formula: 'CH₃NH₃PbI₃',
  general: 'ABX₃',
  color: '#c98500',
  structure:
    'Estructura tipo perovskita ABX₃: octaedros [PbI₆] que comparten vértices, con el catión orgánico CH₃NH₃⁺ en las cavidades.',
  bonding:
    'Enlaces Pb–I con fuerte carácter iónico; el catión orgánico interactúa mediante fuerzas electrostáticas y puentes de hidrógeno.',
  eg: { min: 1.55, max: 1.6, unit: 'eV', refs: ['green'] },
  egTunable:
    'Sustituyendo I⁻ por Br⁻ o Cl⁻ la banda prohibida puede ajustarse aproximadamente entre 1,5 y 2,3 eV.',
  thermalConductivity: { value: 0.5, unit: 'W/(m·K)', refs: ['pisoni'] },
  mobility: {
    min: 1,
    max: 100,
    unit: 'cm²/(V·s)',
    note: 'Valores muy dependientes del método de síntesis (películas delgadas vs. monocristales).',
  },
  efficiency: {
    single: 'más de 26 % (celdas de laboratorio de unión simple)',
    tandem: 'más de 33 % (tándem perovskita/silicio)',
    refs: ['nrel'],
  },
  advantages: [
    'Banda prohibida directa y ajustable con la composición',
    'Alta absorción de luz con capas de pocos cientos de nanómetros',
    'Fabricación en solución a baja temperatura',
  ],
  limitations: [
    'Se degrada con humedad, oxígeno, calor y luz UV',
    'Contiene plomo soluble: riesgo ambiental',
    'Estabilidad a largo plazo aún en investigación',
  ],
  temperatureNote:
    'A diferencia de Si, Ge y GaAs, en MAPbI₃ la banda prohibida aumenta ligeramente con la temperatura; la ecuación de Varshni no la describe.',
  refs: ['kojima', 'green', 'nrel', 'pisoni'],
};
