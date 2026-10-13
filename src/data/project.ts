/**
 * Datos del proyecto universitario. Completa `team` con los nombres de los
 * integrantes y `professor` con el nombre de la docente.
 */
export const PROJECT = {
  course: 'Química General I',
  university: 'Universidad Iberoamericana (UNIBE)',
  program: 'Ingeniería en Tecnologías de la Información y la Comunicación (TIC)',
  title: 'Nanomateriales y semiconductores: el futuro de los dispositivos electrónicos',
  prototype: 'ThermoChip Lab',
  team: [] as string[],
  professor: '',
  generalObjective:
    'Analizar mediante una simulación interactiva la influencia de la temperatura y las propiedades de los semiconductores en el comportamiento de dispositivos electrónicos.',
  specificObjectives: [
    'Explicar la química de los semiconductores Si, Ge, GaAs y perovskitas: enlace, estructura cristalina y banda prohibida.',
    'Modelar el comportamiento térmico de un chip con una ecuación de balance de energía documentada.',
    'Representar cómo la temperatura modifica la concentración y la movilidad de los portadores de carga.',
    'Demostrar el efecto del dopaje tipo N (fósforo) y tipo P (boro) sobre el silicio.',
    'Relacionar los nanomateriales con aplicaciones en TIC: chips, sensores, móviles, paneles solares y computación cuántica.',
    'Evaluar la eficiencia energética, los costos y el impacto ambiental de la gestión térmica.',
  ],
};
