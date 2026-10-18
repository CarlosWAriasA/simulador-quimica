import type { PracticeDef, PracticeId } from './types';

/**
 * Guías de las prácticas del laboratorio virtual. Cada práctica sigue el
 * método experimental: hipótesis → experimento → datos → análisis → conclusión.
 */
export const PRACTICES: PracticeDef[] = [
  {
    id: 'p1',
    n: 1,
    title: 'Carga de trabajo y temperatura del chip',
    short: 'Carga y temperatura',
    minutes: 10,
    level: 'Básico',
    objective:
      'Medir la temperatura de equilibrio del chip a distintas cargas y obtener, a partir de tus propios datos, la resistencia térmica R del sistema de refrigeración.',
    concepts: ['Efecto Joule', 'Equilibrio térmico', 'Resistencia térmica', 'Regresión lineal'],
    instruments: ['Chip de prueba de silicio', 'Termómetro de la unión', 'Vatímetro', 'Ventilador básico'],
    hypothesis: {
      id: 'h',
      text: 'Si la potencia que disipa el chip se duplica, ¿qué ocurre con el aumento de temperatura sobre el ambiente (T − T_amb) en el equilibrio?',
      options: [
        { id: 'a', text: 'También se duplica' },
        { id: 'b', text: 'Se multiplica por cuatro' },
        { id: 'c', text: 'No cambia: la refrigeración lo compensa' },
        { id: 'd', text: 'Aumenta un poco, pero mucho menos del doble' },
      ],
      correct: 'a',
      explanation:
        'En el equilibrio el calor generado es igual al disipado: P = (T − T_amb)/R. Con R constante, T − T_amb es proporcional a P: si P se duplica, el aumento de temperatura también.',
    },
    procedure: [
      'Elige una carga en el banco (empieza por 0 %).',
      'Espera a que el indicador «Estable» se encienda: el chip alcanzó el equilibrio.',
      'Pulsa «Registrar medición» para anotar potencia y temperatura en la bitácora.',
      'Repite con al menos 5 cargas diferentes (por ejemplo 0, 25, 50, 75 y 100 %).',
      'Pasa a «Análisis» para graficar T frente a P y obtener R de la pendiente.',
    ],
    minRows: 4,
    columns: [
      { key: 'carga', label: 'Carga', unit: '%', format: 'int' },
      { key: 'P', label: 'Potencia P', unit: 'W', format: 'fixed1' },
      { key: 'T', label: 'Temperatura T', unit: '°C', format: 'fixed1' },
      { key: 'estable', label: '¿Estable?', format: 'text' },
    ],
    questions: [
      {
        id: 'q1',
        text: '¿De dónde proviene el calor que genera el chip?',
        options: [
          { id: 'a', text: 'De una reacción química de combustión en el silicio' },
          { id: 'b', text: 'De la energía eléctrica que se disipa al mover cargas por los transistores (efecto Joule)' },
          { id: 'c', text: 'Del ventilador, que calienta el aire' },
          { id: 'd', text: 'De la luz que absorbe el silicio' },
        ],
        correct: 'b',
        explanation: 'Casi toda la energía eléctrica que consume un procesador se transforma en calor al circular corriente y cargar/descargar los transistores.',
      },
      {
        id: 'q2',
        text: 'En tu gráfica, ¿qué representa el punto de corte con el eje vertical (P = 0)?',
        options: [
          { id: 'a', text: 'La temperatura máxima del chip' },
          { id: 'b', text: 'La resistencia térmica' },
          { id: 'c', text: 'Aproximadamente la temperatura ambiente' },
          { id: 'd', text: 'La banda prohibida del silicio' },
        ],
        correct: 'c',
        explanation: 'Si no se disipara potencia, el chip estaría a la temperatura del ambiente: T = T_amb + R·P con P = 0.',
      },
      {
        id: 'q3',
        text: '¿Por qué conviene esperar a que la lectura sea estable antes de registrarla?',
        options: [
          { id: 'a', text: 'Porque la ecuación P = (T − T_amb)/R sólo es válida en el equilibrio' },
          { id: 'b', text: 'Porque el termómetro tarda en encenderse' },
          { id: 'c', text: 'No hace falta: el resultado es el mismo' },
          { id: 'd', text: 'Para que el ventilador gire más rápido' },
        ],
        correct: 'a',
        explanation: 'Mientras el chip se calienta, parte del calor se acumula (C·dT/dt ≠ 0). Sólo en el equilibrio todo el calor generado sale por la refrigeración.',
      },
    ],
    refs: ['incropera', 'rabaey'],
  },
  {
    id: 'p2',
    n: 2,
    title: 'Comparación de sistemas de refrigeración',
    short: 'Refrigeración',
    minutes: 10,
    level: 'Básico',
    objective:
      'Medir la temperatura de equilibrio del chip a plena carga con tres sistemas de refrigeración, calcular la resistencia térmica de cada uno y evaluar su costo energético.',
    concepts: ['Resistencia térmica', 'Convección natural y forzada', 'Eficiencia energética'],
    instruments: ['Chip de prueba de silicio (100 % de carga, sin protección térmica)', 'Termómetro', 'Vatímetro', 'Disipador pasivo, ventilador y refrigeración líquida'],
    hypothesis: {
      id: 'h',
      text: '¿Qué sistema crees que mantendrá el chip más frío y cuál consumirá más energía eléctrica en total?',
      options: [
        { id: 'a', text: 'La refrigeración avanzada: más fría y también la que menos energía total consume' },
        { id: 'b', text: 'La refrigeración avanzada: más fría, pero la que más energía total consume' },
        { id: 'c', text: 'El disipador pasivo: más frío porque no mueve aire caliente' },
        { id: 'd', text: 'Los tres dejan el chip a la misma temperatura' },
      ],
      correct: 'b',
      explanation:
        'La refrigeración avanzada tiene la menor resistencia térmica, por eso logra la menor temperatura; pero su bomba y ventiladores consumen energía extra, así que el consumo total del sistema aumenta.',
    },
    procedure: [
      'La carga está fijada en 100 % y la protección térmica desactivada (chip de prueba).',
      'Selecciona un sistema de refrigeración y espera a que la lectura sea estable.',
      'Registra la medición. Si repites un sistema, se reemplaza su fila.',
      'Repite con los tres sistemas.',
      'En «Análisis» compara la temperatura, la resistencia térmica R = (T − T_amb)/P y la potencia total.',
    ],
    minRows: 3,
    columns: [
      { key: 'sistema', label: 'Sistema', format: 'text' },
      { key: 'P', label: 'P chip', unit: 'W', format: 'fixed1' },
      { key: 'T', label: 'T equilibrio', unit: '°C', format: 'fixed1' },
      { key: 'R', label: 'R = ΔT/P', unit: 'K/W', format: 'fixed3' },
      { key: 'aux', label: 'P refrigeración', unit: 'W', format: 'int' },
      { key: 'estable', label: '¿Estable?', format: 'text' },
    ],
    questions: [
      {
        id: 'q1',
        text: '¿Qué significa físicamente una resistencia térmica R menor?',
        options: [
          { id: 'a', text: 'Que el chip genera menos calor' },
          { id: 'b', text: 'Que el calor sale con más facilidad hacia el ambiente' },
          { id: 'c', text: 'Que el silicio conduce peor la electricidad' },
          { id: 'd', text: 'Que el chip funciona a menor voltaje' },
        ],
        correct: 'b',
        explanation: 'R mide cuántos kelvin aumenta la temperatura por cada vatio que hay que evacuar. Menor R → menos aumento de temperatura para la misma potencia.',
      },
      {
        id: 'q2',
        text: 'Sin refrigeración activa el chip superó los 150 °C. ¿Qué haría un procesador real?',
        options: [
          { id: 'a', text: 'Seguir igual: el silicio funde a 1414 °C' },
          { id: 'b', text: 'Reducir su frecuencia o apagarse para protegerse' },
          { id: 'c', text: 'Aumentar su frecuencia para terminar antes' },
          { id: 'd', text: 'Cambiar de silicio a germanio' },
        ],
        correct: 'b',
        explanation: 'Los procesadores tienen sensores y protección térmica (throttling). A alta temperatura aumentan las fugas y la degradación, mucho antes de fundirse.',
      },
      {
        id: 'q3',
        text: 'Desde la sostenibilidad, ¿cuál es la mejor estrategia?',
        options: [
          { id: 'a', text: 'Usar siempre la refrigeración más potente' },
          { id: 'b', text: 'No refrigerar para ahorrar energía' },
          { id: 'c', text: 'Elegir la refrigeración suficiente para la carga real, equilibrando temperatura, consumo y durabilidad' },
          { id: 'd', text: 'Refrigerar sólo cuando el chip esté apagado' },
        ],
        correct: 'c',
        explanation: 'La gestión térmica es un compromiso: menos temperatura alarga la vida útil, pero cada vatio de refrigeración también cuesta energía y dinero.',
      },
    ],
    refs: ['incropera', 'pop', 'jedec'],
  },
  {
    id: 'p3',
    n: 3,
    title: 'Determinación experimental de la banda prohibida',
    short: 'Banda prohibida',
    minutes: 15,
    level: 'Avanzado',
    objective:
      'Calentar una barra de semiconductor intrínseco, medir su resistencia eléctrica a varias temperaturas y obtener la banda prohibida Eg a partir de la pendiente de ln(G) frente a 1/T.',
    concepts: ['Banda prohibida', 'Excitación térmica de electrones', 'Gráfica de Arrhenius', 'Conductancia'],
    instruments: ['Barras intrínsecas de Si, Ge y GaAs (1 cm × 1 mm × 1 mm)', 'Horno con control de temperatura', 'Multímetro (óhmetro, rango máx. 2 GΩ)'],
    hypothesis: {
      id: 'h',
      text: 'Al calentar una barra de semiconductor puro, ¿qué le ocurre a su resistencia eléctrica?',
      options: [
        { id: 'a', text: 'Aumenta, como en los metales' },
        { id: 'b', text: 'Disminuye mucho, porque se liberan más electrones' },
        { id: 'c', text: 'No cambia' },
        { id: 'd', text: 'Primero aumenta y luego se vuelve infinita' },
      ],
      correct: 'b',
      explanation:
        'En un semiconductor intrínseco la concentración de portadores crece exponencialmente con T (nᵢ ∝ e^(−Eg/2kT)). Ese aumento domina sobre la ligera pérdida de movilidad, por lo que la resistencia cae.',
    },
    procedure: [
      'Elige una muestra (comienza con germanio: su resistencia es fácil de medir).',
      'Fija la temperatura del horno y espera a que alcance el valor (indicador «Estable»).',
      'Registra la lectura del multímetro.',
      'Repite al menos a 5 temperaturas entre 300 y 500 K.',
      'En «Análisis» grafica ln(G) frente a 1000/T: la pendiente m da Eg = −2·k_B·m.',
      'Opcional: repite con Si y GaAs. ¿Por qué el GaAs da «OL» a temperatura ambiente?',
    ],
    minRows: 4,
    columns: [
      { key: 'muestra', label: 'Muestra', format: 'text' },
      { key: 'T', label: 'T', unit: 'K', format: 'fixed1' },
      { key: 'R', label: 'Resistencia', unit: 'Ω', format: 'sci' },
      { key: 'invT', label: '1000/T', unit: 'K⁻¹', format: 'fixed3' },
      { key: 'lnG', label: 'ln(G / S)', format: 'fixed3' },
    ],
    questions: [
      {
        id: 'q1',
        text: '¿Por qué la gráfica ln(G) frente a 1/T es casi una recta?',
        options: [
          { id: 'a', text: 'Porque la conductancia depende linealmente de la temperatura' },
          { id: 'b', text: 'Porque G ∝ e^(−Eg/2kT); al tomar logaritmos queda ln G = cte − (Eg/2k)·(1/T)' },
          { id: 'c', text: 'Porque el horno calienta a velocidad constante' },
          { id: 'd', text: 'Es una coincidencia' },
        ],
        correct: 'b',
        explanation: 'El factor de Boltzmann domina la dependencia con T. Los factores T^3/2 y la movilidad cambian mucho más lentamente.',
      },
      {
        id: 'q2',
        text: 'Tu Eg medida sale algo mayor que el valor de tablas a 300 K. ¿Por qué?',
        options: [
          { id: 'a', text: 'Error del multímetro' },
          { id: 'b', text: 'Porque Eg disminuye al calentar (Varshni): la pendiente da un valor extrapolado cercano a Eg a 0 K, y además se ignoran T^3/2 y la movilidad' },
          { id: 'c', text: 'Porque la barra se dilata' },
          { id: 'd', text: 'Porque el horno no estaba encendido' },
        ],
        correct: 'b',
        explanation: 'Con Eg(T) ≈ Eg(0) − α′T, el término lineal se absorbe en la constante y la pendiente refleja Eg extrapolada a 0 K. Es una limitación conocida del método.',
      },
      {
        id: 'q3',
        text: '¿Qué material tiene más electrones libres a la misma temperatura y por qué?',
        options: [
          { id: 'a', text: 'GaAs, porque es un compuesto' },
          { id: 'b', text: 'Si, porque es el más usado' },
          { id: 'c', text: 'Ge, porque su banda prohibida es la más pequeña: sus enlaces se rompen con menos energía' },
          { id: 'd', text: 'Los tres tienen la misma cantidad' },
        ],
        correct: 'c',
        explanation: 'Menor Eg ⇒ exponente menos negativo ⇒ muchos más pares electrón-hueco. Por eso el Ge tiene más fugas en caliente.',
      },
    ],
    refs: ['sze', 'varshni', 'ioffe'],
  },
  {
    id: 'p4',
    n: 4,
    title: 'Identificación de una muestra dopada desconocida',
    short: 'Muestra desconocida',
    minutes: 12,
    level: 'Intermedio',
    objective:
      'Determinar si una oblea de silicio es tipo N o tipo P y estimar su concentración de dopante usando una punta caliente y una sonda de cuatro puntas.',
    concepts: ['Dopaje tipo N y P', 'Portadores mayoritarios', 'Resistividad', 'Efecto termoeléctrico'],
    instruments: ['Obleas de Si desconocidas X1, X2 y X3', 'Punta caliente + voltímetro', 'Sonda de cuatro puntas (resistividad)', 'Curva ρ–N del silicio a 300 K'],
    hypothesis: {
      id: 'h',
      text: 'Si una oblea de silicio tiene más resistividad que otra del mismo tipo, ¿qué puedes decir de su dopaje?',
      options: [
        { id: 'a', text: 'Tiene más átomos dopantes' },
        { id: 'b', text: 'Tiene menos átomos dopantes, por lo tanto menos portadores' },
        { id: 'c', text: 'Es silicio puro sin duda' },
        { id: 'd', text: 'La resistividad no depende del dopaje' },
      ],
      correct: 'b',
      explanation: 'ρ = 1/(q·n·μ): con menos dopante hay menos portadores mayoritarios y la resistividad es mayor.',
    },
    procedure: [
      'Coloca una muestra desconocida en el banco.',
      'Aplica la punta caliente y observa hacia dónde se desvía el voltímetro: (+) o (−).',
      'Mide la resistividad con la sonda de cuatro puntas.',
      'Registra la medición. Repite con las otras muestras.',
      'En «Análisis», usa la curva ρ–N para estimar el tipo y la concentración de cada muestra y comprueba tu respuesta.',
    ],
    minRows: 1,
    columns: [
      { key: 'muestra', label: 'Muestra', format: 'text' },
      { key: 'signo', label: 'Punta caliente', format: 'text' },
      { key: 'rho', label: 'Resistividad ρ', unit: 'Ω·cm', format: 'sci' },
    ],
    questions: [
      {
        id: 'q1',
        text: 'En la prueba de la punta caliente, una lectura positiva indica que la muestra es…',
        options: [
          { id: 'a', text: 'Tipo N: los electrones se alejan de la zona caliente y esta queda positiva' },
          { id: 'b', text: 'Tipo P: los huecos se acumulan en la punta caliente' },
          { id: 'c', text: 'Intrínseca' },
          { id: 'd', text: 'Un metal' },
        ],
        correct: 'a',
        explanation: 'Los portadores mayoritarios se difunden desde la zona caliente hacia la fría. Si son electrones, la zona caliente pierde carga negativa y queda positiva.',
      },
      {
        id: 'q2',
        text: '¿Qué elemento usarías para obtener silicio tipo P?',
        options: [
          { id: 'a', text: 'Fósforo (grupo 15)' },
          { id: 'b', text: 'Arsénico (grupo 15)' },
          { id: 'c', text: 'Boro (grupo 13)' },
          { id: 'd', text: 'Germanio (grupo 14)' },
        ],
        correct: 'c',
        explanation: 'El boro tiene 3 electrones de valencia: al sustituir un Si le falta un electrón para completar sus 4 enlaces, lo que crea un hueco (aceptor).',
      },
      {
        id: 'q3',
        text: 'Con la misma concentración, ¿por qué el Si tipo P tiene mayor resistividad que el tipo N?',
        options: [
          { id: 'a', text: 'Porque el boro es más pesado' },
          { id: 'b', text: 'Porque los huecos tienen menor movilidad que los electrones en el silicio' },
          { id: 'c', text: 'Porque tiene menos átomos dopantes' },
          { id: 'd', text: 'No es cierto: son iguales' },
        ],
        correct: 'b',
        explanation: 'En Si, μp ≈ 450 cm²/(V·s) frente a μn ≈ 1400 cm²/(V·s): con el mismo número de portadores, los huecos conducen menos.',
      },
    ],
    refs: ['streetman', 'sze', 'caughey'],
  },
];

export const PRACTICE_BY_ID: Record<PracticeId, PracticeDef> = Object.fromEntries(PRACTICES.map((p) => [p.id, p])) as Record<PracticeId, PracticeDef>;

export const isPracticeId = (s: string): s is PracticeId => s in PRACTICE_BY_ID;
