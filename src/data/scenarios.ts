import type { SimParams } from '../types';

/**
 * Escenarios predefinidos del modo presentación (demostración de 3 a 5 minutos).
 */
export interface PresentationScenario {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  short: string;
  view: 'chip' | 'materials' | 'doping';
  /** Parámetros que se aplican al chip al entrar al escenario. */
  params?: Partial<SimParams>;
  /** Reinicia la simulación desde la temperatura ambiente. */
  reset?: boolean;
  observe: string[];
  chemistry: string;
  /** Duración sugerida en segundos. */
  seconds: number;
}

export const SCENARIOS: PresentationScenario[] = [
  {
    id: 'A',
    title: 'Chip en reposo',
    short: 'Reposo',
    view: 'chip',
    params: { load: 0.05, workload: 'reposo', cooling: 'ventilador', material: 'si', ambientC: 25, throttling: true, speed: 20 },
    reset: true,
    observe: ['Casi todos los núcleos están inactivos.', 'La temperatura se mantiene cerca del ambiente.', 'Colores azules: poco calor generado.'],
    chemistry: 'Con poca actividad, los electrones del silicio apenas reciben energía extra: la mayoría permanece en sus enlaces covalentes.',
    seconds: 40,
  },
  {
    id: 'B',
    title: 'Chip bajo carga intensiva',
    short: 'Carga intensiva',
    view: 'chip',
    params: { load: 1, workload: 'intensiva', cooling: 'ventilador', speed: 20 },
    observe: ['Los 8 núcleos se activan.', 'La potencia sube a 125 W y la temperatura aumenta de forma progresiva.', 'El color pasa de azul a amarillo y naranja.'],
    chemistry: 'Más conmutaciones por segundo = más calor por efecto Joule. Al calentarse, más electrones saltan la banda prohibida y aumentan las fugas.',
    seconds: 60,
  },
  {
    id: 'C',
    title: 'Efecto de la refrigeración',
    short: 'Refrigeración',
    view: 'chip',
    params: { load: 1, workload: 'intensiva', cooling: 'pasiva', throttling: true, speed: 20 },
    observe: ['Sin refrigeración activa el chip llega al límite y reduce su potencia.', 'Cambia a ventilador o avanzada y observa cómo se enfría.', 'Menor R → menor temperatura de equilibrio.'],
    chemistry: 'La refrigeración no cambia la química del chip: cambia la facilidad con que el calor sale (R). Así se mantienen los portadores térmicos bajo control.',
    seconds: 60,
  },
  {
    id: 'D',
    title: 'Comparación de semiconductores',
    short: 'Materiales',
    view: 'materials',
    observe: ['Ge tiene la banda prohibida más pequeña: miles de veces más portadores térmicos.', 'GaAs tiene la mayor Eg y la mayor movilidad electrónica.', 'Con el mismo diseño, la temperatura cambia poco: dominan potencia y refrigeración.'],
    chemistry: 'La energía de enlace y la estructura de cada material fijan su banda prohibida. Menor Eg ⇒ más electrones excitados térmicamente a la misma temperatura.',
    seconds: 60,
  },
  {
    id: 'E',
    title: 'Dopaje químico del silicio',
    short: 'Dopaje',
    view: 'doping',
    observe: ['Fósforo (5 e⁻): aporta un electrón libre → tipo N.', 'Boro (3 e⁻): deja un hueco → tipo P.', 'Una impureza por millón cambia la conductividad en órdenes de magnitud.'],
    chemistry: 'El dopaje sustituye átomos de Si en la red cristalina por impurezas controladas; no es una mezcla. Así se construyen las uniones de los transistores.',
    seconds: 60,
  },
];
