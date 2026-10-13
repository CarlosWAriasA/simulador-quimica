/**
 * Referencias bibliográficas (formato APA 7). Cada dato publicado del
 * proyecto cita una o varias claves de este archivo.
 */
export interface Reference {
  id: string;
  apa: string;
  url?: string;
  /** Para qué se usa la fuente dentro de la aplicación. */
  usedFor: string;
}

export const REFERENCES: Reference[] = [
  {
    id: 'sze',
    apa: 'Sze, S. M., & Ng, K. K. (2007). Physics of semiconductor devices (3.ª ed.). Wiley.',
    usedFor: 'Bandas de energía, concentración intrínseca, dopaje, movilidad y propiedades a 300 K.',
  },
  {
    id: 'ioffe',
    apa: 'Ioffe Physico-Technical Institute. (s. f.). NSM Archive — Physical properties of semiconductors.',
    url: 'http://www.ioffe.ru/SVA/NSM/Semicond/',
    usedFor: 'Parámetros de Si, Ge y GaAs: Eg, Nc, Nv, movilidades, conductividad térmica y parámetros de Varshni.',
  },
  {
    id: 'varshni',
    apa: 'Varshni, Y. P. (1967). Temperature dependence of the energy gap in semiconductors. Physica, 34(1), 149–154.',
    url: 'https://doi.org/10.1016/0031-8914(67)90062-6',
    usedFor: 'Ecuación de Varshni para Eg(T).',
  },
  {
    id: 'streetman',
    apa: 'Streetman, B. G., & Banerjee, S. K. (2015). Solid state electronic devices (7.ª ed.). Pearson.',
    usedFor: 'Dopaje tipo N y P, ley de acción de masas y neutralidad de carga.',
  },
  {
    id: 'pierret',
    apa: 'Pierret, R. F. (1996). Semiconductor device fundamentals. Addison-Wesley.',
    usedFor: 'Rango de validez de las aproximaciones de portadores (no degeneración, ionización completa).',
  },
  {
    id: 'caughey',
    apa: 'Caughey, D. M., & Thomas, R. E. (1967). Carrier mobilities in silicon empirically related to doping and field. Proceedings of the IEEE, 55(12), 2192–2193.',
    url: 'https://doi.org/10.1109/PROC.1967.6123',
    usedFor: 'Movilidad del silicio en función de la concentración de dopaje.',
  },
  {
    id: 'incropera',
    apa: 'Bergman, T. L., Lavine, A. S., Incropera, F. P., & DeWitt, D. P. (2011). Fundamentals of heat and mass transfer (7.ª ed.). Wiley.',
    usedFor: 'Modelo de capacitancia concentrada C·dT/dt = P − (T − T∞)/R y resistencia de conducción t/(k·A).',
  },
  {
    id: 'rabaey',
    apa: 'Rabaey, J. M., Chandrakasan, A., & Nikolić, B. (2003). Digital integrated circuits: A design perspective (2.ª ed.). Prentice Hall.',
    usedFor: 'Potencia dinámica P = α·C·V²·f y potencia estática en circuitos CMOS.',
  },
  {
    id: 'pop',
    apa: 'Pop, E. (2010). Energy dissipation and transport in nanoscale devices. Nano Research, 3(3), 147–169.',
    url: 'https://doi.org/10.1007/s12274-010-1019-z',
    usedFor: 'Disipación de calor y gestión térmica en dispositivos nanométricos.',
  },
  {
    id: 'glassbrenner',
    apa: 'Glassbrenner, C. J., & Slack, G. A. (1964). Thermal conductivity of silicon and germanium from 3 °K to the melting point. Physical Review, 134(4A), A1058–A1069.',
    url: 'https://doi.org/10.1103/PhysRev.134.A1058',
    usedFor: 'Conductividad térmica de Si y Ge.',
  },
  {
    id: 'kittel',
    apa: 'Kittel, C. (2005). Introduction to solid state physics (8.ª ed.). Wiley.',
    usedFor: 'Estructuras cristalinas (diamante, blenda de zinc) y enlace covalente.',
  },
  {
    id: 'chang',
    apa: 'Chang, R., & Goldsby, K. A. (2013). Química (11.ª ed.). McGraw-Hill.',
    usedFor: 'Configuración electrónica, enlace covalente, semiconductores y teoría de bandas a nivel de química general.',
  },
  {
    id: 'brus',
    apa: 'Brus, L. E. (1984). Electron–electron and electron–hole interactions in small semiconductor crystallites: The size dependence of the lowest excited electronic state. The Journal of Chemical Physics, 80(9), 4403–4409.',
    url: 'https://doi.org/10.1063/1.447218',
    usedFor: 'Modelo de confinamiento cuántico en puntos cuánticos.',
  },
  {
    id: 'yu',
    apa: 'Yu, W. W., Qu, L., Guo, W., & Peng, X. (2003). Experimental determination of the extinction coefficient of CdTe, CdSe, and CdS nanocrystals. Chemistry of Materials, 15(14), 2854–2860.',
    url: 'https://doi.org/10.1021/cm034081k',
    usedFor: 'Relación empírica tamaño–longitud de onda de absorción de nanocristales de CdSe.',
  },
  {
    id: 'kojima',
    apa: 'Kojima, A., Teshima, K., Shirai, Y., & Miyasaka, T. (2009). Organometal halide perovskites as visible-light sensitizers for photovoltaic cells. Journal of the American Chemical Society, 131(17), 6050–6051.',
    url: 'https://doi.org/10.1021/ja809598r',
    usedFor: 'Primer uso de perovskitas de haluro en celdas solares.',
  },
  {
    id: 'green',
    apa: 'Green, M. A., Ho-Baillie, A., & Snaith, H. J. (2014). The emergence of perovskite solar cells. Nature Photonics, 8(7), 506–514.',
    url: 'https://doi.org/10.1038/nphoton.2014.134',
    usedFor: 'Química, banda prohibida ajustable y retos de estabilidad de las perovskitas.',
  },
  {
    id: 'pisoni',
    apa: 'Pisoni, A., Jaćimović, J., Barišić, O. S., Spina, M., Gaál, R., Forró, L., & Horváth, E. (2014). Ultra-low thermal conductivity in organic–inorganic hybrid perovskite CH₃NH₃PbI₃. The Journal of Physical Chemistry Letters, 5(14), 2488–2492.',
    url: 'https://doi.org/10.1021/jz5012109',
    usedFor: 'Conductividad térmica de MAPbI₃.',
  },
  {
    id: 'nrel',
    apa: 'National Renewable Energy Laboratory. (2025). Best research-cell efficiency chart.',
    url: 'https://www.nrel.gov/pv/cell-efficiency.html',
    usedFor: 'Eficiencias récord de celdas de perovskita y tándem perovskita/silicio.',
  },
  {
    id: 'irds',
    apa: 'IEEE. (2023). International Roadmap for Devices and Systems (IRDS): More Moore.',
    url: 'https://irds.ieee.org/',
    usedFor: 'Evolución de arquitecturas de transistores: planar, FinFET y gate-all-around (nanohojas).',
  },
  {
    id: 'zwanenburg',
    apa: 'Zwanenburg, F. A., Dzurak, A. S., Morello, A., Simmons, M. Y., Hollenberg, L. C. L., Klimeck, G., Rogge, S., Coppersmith, S. N., & Eriksson, M. A. (2013). Silicon quantum electronics. Reviews of Modern Physics, 85(3), 961–1019.',
    url: 'https://doi.org/10.1103/RevModPhys.85.961',
    usedFor: 'Qubits de espín en puntos cuánticos de silicio.',
  },
  {
    id: 'jedec',
    apa: 'JEDEC Solid State Technology Association. (2016). JEP122H: Failure mechanisms and models for semiconductor devices.',
    url: 'https://www.jedec.org/',
    usedFor: 'Modelo de Arrhenius para la aceleración del envejecimiento con la temperatura.',
  },
  {
    id: 'gem2024',
    apa: 'Baldé, C. P., Kuehr, R., Yamamoto, T., McDonald, R., D’Angelo, E., Althaf, S., … Wagner, M. (2024). Global e-waste monitor 2024. International Telecommunication Union (ITU) & United Nations Institute for Training and Research (UNITAR).',
    url: 'https://ewastemonitor.info/',
    usedFor: 'Datos globales de residuos electrónicos y tasas de reciclaje.',
  },
];

export const REF_INDEX: Record<string, number> = Object.fromEntries(
  REFERENCES.map((r, i) => [r.id, i + 1]),
);

export function refById(id: string): Reference | undefined {
  return REFERENCES.find((r) => r.id === id);
}
