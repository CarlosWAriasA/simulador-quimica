/**
 * Contenido del módulo de nanomateriales y aplicaciones TIC.
 */

/** Escala de tamaños (valores de orden de magnitud). */
export const SIZE_SCALE = [
  { label: 'Enlace Si–Si', meters: 0.235e-9, kind: 'publicado' as const, note: 'Longitud del enlace covalente en el cristal de silicio.' },
  { label: 'Punto cuántico de CdSe', meters: 4e-9, kind: 'publicado' as const, note: 'Nanocristales típicos de 2 a 8 nm.' },
  { label: 'Virus', meters: 100e-9, kind: 'publicado' as const, note: 'Muchos virus miden entre 20 y 300 nm.' },
  { label: 'Bacteria', meters: 1e-6, kind: 'publicado' as const, note: 'Del orden de 1 µm.' },
  { label: 'Glóbulo rojo', meters: 7.5e-6, kind: 'publicado' as const, note: 'Diámetro de unos 7–8 µm.' },
  { label: 'Cabello humano (grosor)', meters: 80e-6, kind: 'publicado' as const, note: 'Aproximadamente 50–100 µm.' },
];

export interface Architecture {
  id: 'planar' | 'finfet' | 'gaa';
  name: string;
  era: string;
  gateSides: string;
  description: string;
  points: string[];
}

export const ARCHITECTURES: Architecture[] = [
  {
    id: 'planar',
    name: 'MOSFET planar',
    era: 'Dominante hasta ~2011',
    gateSides: 'La puerta controla el canal desde 1 lado',
    description: 'El canal es una franja plana en la superficie del silicio. Al reducir su longitud por debajo de ~20 nm, la puerta pierde control y aumentan las fugas.',
    points: ['Óxido de puerta sobre Si plano', 'Fugas crecientes al miniaturizar', 'Base histórica de la tecnología CMOS'],
  },
  {
    id: 'finfet',
    name: 'FinFET',
    era: 'Desde ~2011 (22 nm)',
    gateSides: 'La puerta envuelve la aleta por 3 lados',
    description: 'El canal se levanta como una aleta («fin») de silicio de pocos nanómetros de ancho. La puerta la rodea por tres lados y controla mejor la corriente.',
    points: ['Aletas de silicio de ancho nanométrico', 'Menos fugas que el planar', 'Usado en la mayoría de los chips de 22 a 3 nm'],
  },
  {
    id: 'gaa',
    name: 'Gate-all-around (nanohojas)',
    era: 'Desde ~2022 (3 nm y siguientes)',
    gateSides: 'La puerta rodea cada nanohoja por los 4 lados',
    description: 'Varias nanohojas de silicio apiladas, cada una rodeada completamente por la puerta. Es el máximo control electrostático alcanzado en producción.',
    points: ['Nanohojas apiladas de pocos nm de espesor', 'Control total del canal', 'Requiere depositar capas casi atómicas'],
  },
];

export interface TicApplication {
  id: string;
  title: string;
  materials: string;
  nano: string;
  chemistry: string;
  link?: { href: string; label: string };
}

export const TIC_APPLICATIONS: TicApplication[] = [
  {
    id: 'chips',
    title: 'Transistores y chips',
    materials: 'Si, SiGe, óxidos de alta constante dieléctrica (HfO₂), cobre',
    nano: 'Miles de millones de transistores con dimensiones críticas de pocos nanómetros en cada chip.',
    chemistry: 'Dopaje controlado, crecimiento de óxidos y depósito de capas atómicas definen las propiedades eléctricas.',
    link: { href: '#/simulador', label: 'Ver el chip virtual' },
  },
  {
    id: 'sensores',
    title: 'Sensores',
    materials: 'Si (MEMS), óxidos metálicos (SnO₂, ZnO), nanotubos de carbono',
    nano: 'La gran superficie de los nanomateriales aumenta la interacción con gases, luz o moléculas.',
    chemistry: 'La adsorción de moléculas en la superficie cambia la concentración de portadores y, con ella, la resistencia eléctrica.',
  },
  {
    id: 'moviles',
    title: 'Dispositivos móviles',
    materials: 'Si (procesador), GaAs y GaN (radiofrecuencia), puntos cuánticos (pantallas)',
    nano: 'Procesadores con transistores FinFET/GAA y pantallas con nanocristales que emiten colores puros.',
    chemistry: 'GaAs tiene alta movilidad electrónica, útil en amplificadores de alta frecuencia para 4G/5G.',
    link: { href: '#/comparador', label: 'Comparar Si y GaAs' },
  },
  {
    id: 'solar',
    title: 'Paneles solares',
    materials: 'Si cristalino, GaAs (espacio), perovskitas (investigación y tándem)',
    nano: 'Capas de perovskita de unos cientos de nanómetros absorben la mayor parte de la luz visible.',
    chemistry: 'La banda prohibida determina qué fotones se absorben; en perovskitas se ajusta cambiando el haluro (I, Br, Cl).',
    link: { href: '#/quimica', label: 'Ver perovskitas' },
  },
  {
    id: 'cuantica',
    title: 'Computación cuántica',
    materials: 'Si/SiGe y GaAs (puntos cuánticos), Si-28 isotópicamente purificado',
    nano: 'Un qubit de espín puede ser un único electrón atrapado en un punto cuántico de decenas de nanómetros.',
    chemistry: 'El Si-28 (sin espín nuclear) prolonga la coherencia de los qubits; la pureza química e isotópica es clave. Funcionan a temperaturas criogénicas.',
  },
];
